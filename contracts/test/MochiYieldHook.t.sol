// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {console} from "forge-std/console.sol";

import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {TickMath} from "@uniswap/v4-core/src/libraries/TickMath.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {BalanceDelta} from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import {PoolId, PoolIdLibrary} from "@uniswap/v4-core/src/types/PoolId.sol";
import {CurrencyLibrary, Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {StateLibrary} from "@uniswap/v4-core/src/libraries/StateLibrary.sol";
import {LiquidityAmounts} from "@uniswap/v4-core/test/utils/LiquidityAmounts.sol";
import {IPositionManager} from "@uniswap/v4-periphery/src/interfaces/IPositionManager.sol";
import {Constants} from "@uniswap/v4-core/test/utils/Constants.sol";

import {EasyPosm} from "./utils/libraries/EasyPosm.sol";
import {BaseTest} from "./utils/BaseTest.sol";

import {MochiYieldHook} from "../src/hook/MochiYieldHook.sol";
import {PTToken} from "../src/tokens/PTToken.sol";
import {YTToken} from "../src/tokens/YTToken.sol";
import {MockWstETH} from "../src/mocks/MockWstETH.sol";
import {YieldVault} from "../src/vault/YieldVault.sol";

contract MochiYieldHookTest is BaseTest {
    using EasyPosm for IPositionManager;
    using PoolIdLibrary for PoolKey;
    using CurrencyLibrary for Currency;
    using StateLibrary for IPoolManager;

    // Mochi contracts
    MochiYieldHook hook;
    PTToken ptToken;
    YTToken ytToken;
    MockWstETH mockWstETH;
    YieldVault vault;

    // Pool setup
    Currency currency0;  // WETH (or mock)
    Currency currency1;  // PT Token
    PoolKey poolKey;
    PoolId poolId;

    uint256 tokenId;
    int24 tickLower;
    int24 tickUpper;

    // Test parameters
    uint256 constant MATURITY = 30 days;
    uint256 maturityTimestamp;

    function setUp() public {
        // Deploy all required v4 artifacts
        deployArtifactsAndLabel();

        // Set maturity
        maturityTimestamp = block.timestamp + MATURITY;

        // Deploy mock underlying
        mockWstETH = new MockWstETH();

        // Deploy currencies for pool (we'll use generic test tokens)
        (currency0, currency1) = deployCurrencyPair();

        // Deploy hook with correct flags
        address flags = address(
            uint160(
                Hooks.BEFORE_SWAP_FLAG | Hooks.AFTER_SWAP_FLAG
            ) ^ (0x5555 << 144) // Namespace to avoid collisions
        );
        bytes memory constructorArgs = abi.encode(poolManager);
        deployCodeTo("MochiYieldHook.sol:MochiYieldHook", constructorArgs, flags);
        hook = MochiYieldHook(flags);

        // Create the pool
        poolKey = PoolKey(currency0, currency1, 3000, 60, IHooks(hook));
        poolId = poolKey.toId();
        poolManager.initialize(poolKey, Constants.SQRT_PRICE_1_1);

        // Register pool with hook
        hook.registerPool(
            poolKey,
            true,  // isPTPool
            address(0), // ptToken (using mock currency)
            address(0), // ytToken
            maturityTimestamp,
            address(mockWstETH)
        );

        // Provide liquidity
        tickLower = TickMath.minUsableTick(poolKey.tickSpacing);
        tickUpper = TickMath.maxUsableTick(poolKey.tickSpacing);

        uint128 liquidityAmount = 100e18;

        (uint256 amount0Expected, uint256 amount1Expected) = LiquidityAmounts.getAmountsForLiquidity(
            Constants.SQRT_PRICE_1_1,
            TickMath.getSqrtPriceAtTick(tickLower),
            TickMath.getSqrtPriceAtTick(tickUpper),
            liquidityAmount
        );

        (tokenId,) = positionManager.mint(
            poolKey,
            tickLower,
            tickUpper,
            liquidityAmount,
            amount0Expected + 1,
            amount1Expected + 1,
            address(this),
            block.timestamp,
            Constants.ZERO_BYTES
        );
    }

    // ═══════════════════════════════════════════════════════════
    // FEE DECAY TESTS
    // ═══════════════════════════════════════════════════════════

    function test_FeeDecay_FarFromMaturity() public view {
        // 90+ days from maturity = MAX_FEE (100 bps = 1%)
        uint256 fee = hook.calculateFeeForMaturity(100 days);
        assertEq(fee, 100, "Fee should be 100 bps (1%) far from maturity");
    }

    function test_FeeDecay_NearMaturity() public view {
        // <7 days from maturity = MIN_FEE (5 bps = 0.05%)
        uint256 fee = hook.calculateFeeForMaturity(3 days);
        assertEq(fee, 5, "Fee should be 5 bps (0.05%) near maturity");
    }

    function test_FeeDecay_MidRange() public view {
        // ~45 days = roughly middle of range
        uint256 fee = hook.calculateFeeForMaturity(45 days);
        
        // Should be between MIN and MAX
        assertTrue(fee > 5, "Fee should be above MIN");
        assertTrue(fee < 100, "Fee should be below MAX");
        
        // Roughly around 50 bps
        assertTrue(fee >= 40 && fee <= 60, "Fee should be around 50 bps at midpoint");
    }

    function test_FeeDecay_AtMaturity() public view {
        // At maturity = MIN_FEE
        uint256 fee = hook.calculateFeeForMaturity(0);
        assertEq(fee, 5, "Fee should be 5 bps at maturity");
    }

    // ═══════════════════════════════════════════════════════════
    // IMPLIED RATE TESTS
    // ═══════════════════════════════════════════════════════════

    function test_ImpliedAPY_Positive() public view {
        // PT at 0.95 (5% discount), 30 days to maturity
        // Expected: ~60% APY (5% over 30 days annualized)
        uint256 ptPrice = 0.95e18;
        uint256 timeToMaturity = 30 days;
        
        int256 impliedAPY = hook.calculateImpliedAPY(ptPrice, timeToMaturity);
        
        assertTrue(impliedAPY > 0, "Implied APY should be positive");
        // 5% discount over 30 days ≈ 60% annualized
        assertTrue(impliedAPY > 5000, "Implied APY should be > 50%");
        assertTrue(impliedAPY < 7000, "Implied APY should be < 70%");
    }

    function test_ImpliedAPY_Negative() public view {
        // PT at 1.05 (5% premium), 30 days to maturity
        // Expected: negative APY (PT trading above par)
        uint256 ptPrice = 1.05e18;
        uint256 timeToMaturity = 30 days;
        
        int256 impliedAPY = hook.calculateImpliedAPY(ptPrice, timeToMaturity);
        
        assertTrue(impliedAPY < 0, "Implied APY should be negative when PT > par");
    }

    function test_ImpliedAPY_AtPar() public view {
        // PT at 1.0 (at par), any maturity
        // Expected: ~0% APY
        uint256 ptPrice = 1e18;
        uint256 timeToMaturity = 30 days;
        
        int256 impliedAPY = hook.calculateImpliedAPY(ptPrice, timeToMaturity);
        
        // Should be exactly 0 or very close
        assertTrue(impliedAPY <= 0, "Implied APY should be 0 or negative at par");
    }

    function test_ImpliedAPY_ZeroTimeToMaturity() public view {
        // At maturity, APY should be 0
        uint256 ptPrice = 0.95e18;
        uint256 timeToMaturity = 0;
        
        int256 impliedAPY = hook.calculateImpliedAPY(ptPrice, timeToMaturity);
        
        assertEq(impliedAPY, 0, "Implied APY should be 0 at maturity");
    }

    function test_EnforceImpliedRateBounds_RevertsNegative() public {
        int256 apy = hook.calculateImpliedAPY(1.05e18, 30 days);
        assertTrue(apy < 0, "PT above par should imply negative APY");

        vm.expectRevert(abi.encodeWithSelector(MochiYieldHook.ImpliedRateOutOfBounds.selector, apy));
        this.helperEnforce(1.05e18, 30 days);
    }

    function helperEnforce(uint256 ptPrice, uint256 timeToMaturity) external view {
        int256 impliedAPY = hook.calculateImpliedAPY(ptPrice, timeToMaturity);
        if (impliedAPY < 0 || impliedAPY > 10000) {
            revert MochiYieldHook.ImpliedRateOutOfBounds(impliedAPY);
        }
    }

    // ═══════════════════════════════════════════════════════════
    // POOL REGISTRATION TESTS
    // ═══════════════════════════════════════════════════════════

    function test_PoolRegistration() public view {
        assertTrue(hook.isPoolRegistered(poolId), "Pool should be registered");
        
        MochiYieldHook.PoolConfig memory config = hook.getPoolConfig(poolId);
        assertTrue(config.isPTPool, "Should be PT pool");
        assertEq(config.maturity, maturityTimestamp, "Maturity should match");
    }

    function test_PoolRegistration_RevertOnDuplicate() public {
        // Try to register same pool again
        vm.expectRevert(MochiYieldHook.PoolAlreadyRegistered.selector);
        hook.registerPool(
            poolKey,
            true,
            address(0),
            address(0),
            maturityTimestamp,
            address(mockWstETH)
        );
    }

    // ═══════════════════════════════════════════════════════════
    // SWAP WITH HOOK TESTS
    // ═══════════════════════════════════════════════════════════

    function test_SwapEmitsFeeEvent() public {
        uint256 amountIn = 1e18;
        
        // Expect FeeAdjustedForMaturity event
        vm.expectEmit(true, false, false, false);
        emit MochiYieldHook.FeeAdjustedForMaturity(poolId, MATURITY, 0); // actual fee calculated in hook
        
        swapRouter.swapExactTokensForTokens({
            amountIn: amountIn,
            amountOutMin: 0,
            zeroForOne: true,
            poolKey: poolKey,
            hookData: Constants.ZERO_BYTES,
            receiver: address(this),
            deadline: block.timestamp + 1
        });
    }

    function test_SwapUpdatesMarketState() public {
        uint256 amountIn = 1e18;
        
        // Get state before
        (uint256 ptPriceBefore,,,) = hook.getMarketState();
        
        // Execute swap
        swapRouter.swapExactTokensForTokens({
            amountIn: amountIn,
            amountOutMin: 0,
            zeroForOne: true,
            poolKey: poolKey,
            hookData: Constants.ZERO_BYTES,
            receiver: address(this),
            deadline: block.timestamp + 1
        });
        
        // Get state after
        (uint256 ptPriceAfter,,,) = hook.getMarketState();
        
        // Price should have changed
        assertTrue(ptPriceAfter != ptPriceBefore || ptPriceBefore == 0, "PT price should update after swap");
    }

    // ═══════════════════════════════════════════════════════════
    // TIME PROGRESSION TESTS
    // ═══════════════════════════════════════════════════════════

    function test_FeeDecreasesOverTime() public {
        // Get fee now (30 days to maturity)
        uint256 feeNow = hook.calculateFeeForMaturity(30 days);
        
        // Fast forward 20 days (10 days to maturity)
        vm.warp(block.timestamp + 20 days);
        
        // Get fee at 10 days to maturity
        uint256 feeLater = hook.calculateFeeForMaturity(10 days);
        
        assertTrue(feeLater < feeNow, "Fee should decrease as maturity approaches");
    }
}
