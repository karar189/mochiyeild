// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {BaseHook} from "@openzeppelin/uniswap-hooks/src/base/BaseHook.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {IPoolManager, SwapParams} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "@uniswap/v4-core/src/types/PoolId.sol";
import {BalanceDelta} from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import {BeforeSwapDelta, BeforeSwapDeltaLibrary} from "@uniswap/v4-core/src/types/BeforeSwapDelta.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {StateLibrary} from "@uniswap/v4-core/src/libraries/StateLibrary.sol";
import {TickMath} from "@uniswap/v4-core/src/libraries/TickMath.sol";

/// @title Mochi Yield Hook
/// @notice Time-aware fixed income hook for PT/YT markets on Uniswap v4
/// @dev Implements implied rate enforcement, maturity fee decay, and parity oracle
contract MochiYieldHook is BaseHook {
    using PoolIdLibrary for PoolKey;
    using StateLibrary for IPoolManager;

    // ═══════════════════════════════════════════════════════════
    // CONSTANTS
    // ═══════════════════════════════════════════════════════════

    /// @notice Minimum allowed implied APY (0%)
    int256 public constant MIN_IMPLIED_APY = 0;

    /// @notice Maximum allowed implied APY (100% = 10000 bps)
    int256 public constant MAX_IMPLIED_APY = 10000;

    /// @notice Base fee in basis points (0.30%)
    uint256 public constant BASE_FEE_BPS = 30;

    /// @notice Minimum fee near maturity (0.05%)
    uint256 public constant MIN_FEE_BPS = 5;

    /// @notice Maximum fee far from maturity (1.00%)
    uint256 public constant MAX_FEE_BPS = 100;

    /// @notice Parity drift threshold for alerts (5% = 500 bps)
    uint256 public constant PARITY_DRIFT_THRESHOLD = 500;

    /// @notice Time threshold for max fee (90 days)
    uint256 public constant MAX_FEE_TIME = 90 days;

    /// @notice Time threshold for min fee (7 days)
    uint256 public constant MIN_FEE_TIME = 7 days;

    // ═══════════════════════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════════════════════

    /// @notice Configuration for each registered pool
    struct PoolConfig {
        bool isPTPool;          // true = PT/WETH, false = YT/WETH
        address ptToken;        // PT token address
        address ytToken;        // YT token address
        uint256 maturity;       // Maturity timestamp
        address underlying;     // Underlying asset (wstETH)
        bool isRegistered;      // Whether pool is registered
    }

    /// @notice Pool configurations by PoolId
    mapping(PoolId => PoolConfig) public poolConfigs;

    /// @notice Last recorded PT price (1e18 scale, in WETH terms)
    uint256 public lastPTPrice;

    /// @notice Last recorded YT price (1e18 scale, in WETH terms)
    uint256 public lastYTPrice;

    /// @notice Last calculated implied APY (basis points, can be negative)
    int256 public lastImpliedAPY;

    /// @notice Last parity drift (basis points)
    uint256 public lastParityDrift;

    /// @notice Underlying price assumption (1e18 = 1 ETH per underlying)
    uint256 public underlyingPrice = 1e18;

    // ═══════════════════════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════════════════════

    /// @notice Emitted when implied rate is updated
    event ImpliedRateUpdated(
        uint256 indexed maturity,
        int256 impliedAPY,
        uint256 ptPrice,
        uint256 timeToMaturity
    );

    /// @notice Emitted when fee is adjusted based on maturity
    event FeeAdjustedForMaturity(
        PoolId indexed poolId,
        uint256 timeToMaturity,
        uint256 newFeeBps
    );

    /// @notice Emitted when parity drift is detected
    event ParityDriftDetected(
        uint256 ptPrice,
        uint256 ytPrice,
        uint256 underlyingPrice,
        uint256 driftBps,
        bool isOverValued
    );

    /// @notice Emitted when a swap is rejected due to negative yield
    event SwapRejectedNegativeYield(
        PoolId indexed poolId,
        address indexed swapper,
        int256 impliedAPY
    );

    error ImpliedRateOutOfBounds(int256 impliedAPY);

    /// @notice Emitted when market stress is detected
    event MarketStressDetected(
        uint256 timestamp,
        string reason
    );

    /// @notice Emitted when a pool is registered
    event PoolRegistered(
        PoolId indexed poolId,
        bool isPTPool,
        uint256 maturity
    );

    // ═══════════════════════════════════════════════════════════
    // ERRORS
    // ═══════════════════════════════════════════════════════════

    error PoolNotRegistered();
    error PoolAlreadyRegistered();
    error InvalidMaturity();

    // ═══════════════════════════════════════════════════════════
    // CONSTRUCTOR
    // ═══════════════════════════════════════════════════════════

    constructor(IPoolManager _poolManager) BaseHook(_poolManager) {}

    // ═══════════════════════════════════════════════════════════
    // HOOK PERMISSIONS
    // ═══════════════════════════════════════════════════════════

    function getHookPermissions() public pure override returns (Hooks.Permissions memory) {
        return Hooks.Permissions({
            beforeInitialize: false,
            afterInitialize: false,
            beforeAddLiquidity: false,
            afterAddLiquidity: false,
            beforeRemoveLiquidity: false,
            afterRemoveLiquidity: false,
            beforeSwap: true,           // Fee calculation
            afterSwap: true,            // Update state, emit events
            beforeDonate: false,
            afterDonate: false,
            beforeSwapReturnDelta: false,
            afterSwapReturnDelta: false,
            afterAddLiquidityReturnDelta: false,
            afterRemoveLiquidityReturnDelta: false
        });
    }

    // ═══════════════════════════════════════════════════════════
    // POOL REGISTRATION
    // ═══════════════════════════════════════════════════════════

    /// @notice Register a pool with the hook
    /// @param key The pool key
    /// @param isPTPool Whether this is a PT pool (vs YT pool)
    /// @param ptToken PT token address
    /// @param ytToken YT token address
    /// @param maturity Maturity timestamp
    /// @param _underlying Underlying asset address
    function registerPool(
        PoolKey calldata key,
        bool isPTPool,
        address ptToken,
        address ytToken,
        uint256 maturity,
        address _underlying
    ) external {
        PoolId poolId = key.toId();
        if (poolConfigs[poolId].isRegistered) revert PoolAlreadyRegistered();
        if (maturity <= block.timestamp) revert InvalidMaturity();

        poolConfigs[poolId] = PoolConfig({
            isPTPool: isPTPool,
            ptToken: ptToken,
            ytToken: ytToken,
            maturity: maturity,
            underlying: _underlying,
            isRegistered: true
        });

        emit PoolRegistered(poolId, isPTPool, maturity);
    }

    // ═══════════════════════════════════════════════════════════
    // LAYER 1: IMPLIED RATE SENTINEL
    // ═══════════════════════════════════════════════════════════

    /// @notice Revert if implied APY is outside allowed bounds
    function _enforceImpliedRateBounds(uint256 ptPrice, uint256 timeToMaturity) internal pure {
        int256 impliedAPY = calculateImpliedAPY(ptPrice, timeToMaturity);
        if (impliedAPY < MIN_IMPLIED_APY || impliedAPY > MAX_IMPLIED_APY) {
            revert ImpliedRateOutOfBounds(impliedAPY);
        }
    }

    /// @notice Calculate implied APY from PT price and time to maturity
    /// @param ptPrice PT price in underlying terms (1e18 scale)
    /// @param timeToMaturity Seconds until maturity
    /// @return impliedAPY Implied APY in basis points (can be negative)
    function calculateImpliedAPY(
        uint256 ptPrice,
        uint256 timeToMaturity
    ) public pure returns (int256 impliedAPY) {
        if (timeToMaturity == 0) return 0;

        // PT trades at discount to underlying
        // impliedAPY = (1 - ptPrice) / ptPrice * (365 days / timeToMaturity) * 10000
        
        if (ptPrice >= 1e18) {
            // PT at or above par = negative yield
            uint256 premium = ptPrice - 1e18;
            uint256 annualizedPremium = (premium * 365 days * 10000) / (ptPrice * timeToMaturity);
            return -int256(annualizedPremium);
        } else {
            // Normal case: PT below par = positive yield
            uint256 discount = 1e18 - ptPrice;
            uint256 annualizedDiscount = (discount * 365 days * 10000) / (ptPrice * timeToMaturity);
            return int256(annualizedDiscount);
        }
    }

    // ═══════════════════════════════════════════════════════════
    // LAYER 2: MATURITY FEE DECAY
    // ═══════════════════════════════════════════════════════════

    /// @notice Calculate dynamic fee based on time to maturity
    /// @param timeToMaturity Seconds until maturity
    /// @return feeBps Fee in basis points
    function calculateFeeForMaturity(
        uint256 timeToMaturity
    ) public pure returns (uint256 feeBps) {
        // Far from maturity (>90 days): MAX_FEE (1%)
        if (timeToMaturity >= MAX_FEE_TIME) {
            return MAX_FEE_BPS;
        }

        // Near maturity (<7 days): MIN_FEE (0.05%)
        if (timeToMaturity <= MIN_FEE_TIME) {
            return MIN_FEE_BPS;
        }

        // Linear interpolation between
        // fee = MAX - (MAX - MIN) * (90 days - timeToMaturity) / (90 days - 7 days)
        uint256 range = MAX_FEE_BPS - MIN_FEE_BPS;
        uint256 timeRange = MAX_FEE_TIME - MIN_FEE_TIME;
        uint256 timeFromMax = MAX_FEE_TIME - timeToMaturity;
        
        feeBps = MAX_FEE_BPS - (range * timeFromMax / timeRange);
    }

    // ═══════════════════════════════════════════════════════════
    // LAYER 3: PARITY ORACLE
    // ═══════════════════════════════════════════════════════════

    /// @notice Update parity state and emit alerts if needed
    /// @param ptPrice PT price (1e18)
    /// @param ytPrice YT price (1e18)
    /// @param _underlyingPrice Underlying price (1e18)
    function _updateParityState(
        uint256 ptPrice,
        uint256 ytPrice,
        uint256 _underlyingPrice
    ) internal {
        lastPTPrice = ptPrice;
        lastYTPrice = ytPrice;

        // PT + YT should equal underlying
        uint256 combinedValue = ptPrice + ytPrice;

        uint256 driftBps;
        bool isOverValued;

        if (combinedValue > _underlyingPrice) {
            driftBps = ((combinedValue - _underlyingPrice) * 10000) / _underlyingPrice;
            isOverValued = true;
        } else {
            driftBps = ((_underlyingPrice - combinedValue) * 10000) / _underlyingPrice;
            isOverValued = false;
        }

        lastParityDrift = driftBps;

        if (driftBps > PARITY_DRIFT_THRESHOLD) {
            emit ParityDriftDetected(
                ptPrice,
                ytPrice,
                _underlyingPrice,
                driftBps,
                isOverValued
            );
        }
    }

    // ═══════════════════════════════════════════════════════════
    // HOOK ENTRY POINTS
    // ═══════════════════════════════════════════════════════════

    function _beforeSwap(
        address,
        PoolKey calldata key,
        SwapParams calldata params,
        bytes calldata
    ) internal override returns (bytes4, BeforeSwapDelta, uint24) {
        PoolId poolId = key.toId();
        PoolConfig memory config = poolConfigs[poolId];

        // If pool not registered, use default behavior
        if (!config.isRegistered) {
            return (BaseHook.beforeSwap.selector, BeforeSwapDeltaLibrary.ZERO_DELTA, 0);
        }

        // Calculate time to maturity
        uint256 timeToMaturity = config.maturity > block.timestamp
            ? config.maturity - block.timestamp
            : 0;

        if (config.isPTPool && timeToMaturity > 0) {
            (uint160 sqrtPriceX96,,,) = poolManager.getSlot0(poolId);
            uint256 currentPrice = _sqrtPriceToPrice(sqrtPriceX96);

            // Block swaps when the pool is already outside fixed-income bounds
            _enforceImpliedRateBounds(currentPrice, timeToMaturity);

            // PT buys (!zeroForOne) push PT price up — reject if limit price breaches bounds
            if (!params.zeroForOne) {
                uint256 limitPrice = _sqrtPriceToPrice(params.sqrtPriceLimitX96);
                _enforceImpliedRateBounds(limitPrice, timeToMaturity);
            }
        }

        // Calculate dynamic fee based on maturity
        uint256 feeBps = calculateFeeForMaturity(timeToMaturity);

        emit FeeAdjustedForMaturity(poolId, timeToMaturity, feeBps);

        // Convert bps to v4 fee format (bps * 100) and set override flag
        uint24 dynamicFee = uint24(feeBps * 100);
        
        // Set the override flag (0x800000) to use dynamic fee
        return (
            BaseHook.beforeSwap.selector,
            BeforeSwapDeltaLibrary.ZERO_DELTA,
            dynamicFee | 0x800000
        );
    }

    function _afterSwap(
        address sender,
        PoolKey calldata key,
        SwapParams calldata,
        BalanceDelta,
        bytes calldata
    ) internal override returns (bytes4, int128) {
        PoolId poolId = key.toId();
        PoolConfig memory config = poolConfigs[poolId];

        // If pool not registered, skip
        if (!config.isRegistered) {
            return (BaseHook.afterSwap.selector, 0);
        }

        // Get current pool price from sqrtPriceX96
        (uint160 sqrtPriceX96,,,) = poolManager.getSlot0(poolId);
        uint256 currentPrice = _sqrtPriceToPrice(sqrtPriceX96);

        uint256 timeToMaturity = config.maturity > block.timestamp
            ? config.maturity - block.timestamp
            : 0;

        if (config.isPTPool) {
            // Update implied rate from PT price
            int256 impliedAPY = calculateImpliedAPY(currentPrice, timeToMaturity);
            lastImpliedAPY = impliedAPY;
            lastPTPrice = currentPrice;

            // Check for negative yield (market stress) — post-swap observability
            if (impliedAPY < MIN_IMPLIED_APY) {
                emit SwapRejectedNegativeYield(poolId, sender, impliedAPY);
                emit MarketStressDetected(block.timestamp, "Negative implied yield");
            }

            // Check for extremely high yield (potential manipulation)
            if (impliedAPY > MAX_IMPLIED_APY) {
                emit MarketStressDetected(block.timestamp, "Implied APY exceeds maximum");
            }

            emit ImpliedRateUpdated(
                config.maturity,
                impliedAPY,
                currentPrice,
                timeToMaturity
            );
        } else {
            // YT pool - just update price
            lastYTPrice = currentPrice;
        }

        // Update parity state (cross-pool monitoring)
        _updateParityState(lastPTPrice, lastYTPrice, underlyingPrice);

        return (BaseHook.afterSwap.selector, 0);
    }

    // ═══════════════════════════════════════════════════════════
    // HELPER FUNCTIONS
    // ═══════════════════════════════════════════════════════════

    /// @notice Convert sqrtPriceX96 to price (1e18 scale)
    /// @param sqrtPriceX96 The sqrt price from the pool
    /// @return price Price in 1e18 scale
    function _sqrtPriceToPrice(uint160 sqrtPriceX96) internal pure returns (uint256 price) {
        // price = (sqrtPriceX96 / 2^96)^2
        // = sqrtPriceX96^2 / 2^192
        // Scale to 1e18
        uint256 sqrtPrice = uint256(sqrtPriceX96);
        price = (sqrtPrice * sqrtPrice * 1e18) >> 192;
    }

    /// @notice Set underlying price (for testing/oracle integration)
    /// @param _price New underlying price (1e18 scale)
    function setUnderlyingPrice(uint256 _price) external {
        underlyingPrice = _price;
    }

    // ═══════════════════════════════════════════════════════════
    // VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════════

    /// @notice Get current market state
    function getMarketState() external view returns (
        uint256 ptPrice,
        uint256 ytPrice,
        int256 impliedAPY,
        uint256 parityDrift
    ) {
        return (lastPTPrice, lastYTPrice, lastImpliedAPY, lastParityDrift);
    }

    /// @notice Get pool config
    function getPoolConfig(PoolId poolId) external view returns (PoolConfig memory) {
        return poolConfigs[poolId];
    }

    /// @notice Check if pool is registered
    function isPoolRegistered(PoolId poolId) external view returns (bool) {
        return poolConfigs[poolId].isRegistered;
    }
}
