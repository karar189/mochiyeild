// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {stdJson} from "forge-std/StdJson.sol";
import {IERC20} from "forge-std/interfaces/IERC20.sol";

import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {IPositionManager} from "@uniswap/v4-periphery/src/interfaces/IPositionManager.sol";
import {IPermit2} from "permit2/src/interfaces/IPermit2.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "@uniswap/v4-core/src/types/PoolId.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {TickMath} from "@uniswap/v4-core/src/libraries/TickMath.sol";
import {StateLibrary} from "@uniswap/v4-core/src/libraries/StateLibrary.sol";
import {LiquidityAmounts} from "@uniswap/v4-core/test/utils/LiquidityAmounts.sol";
import {Constants} from "@uniswap/v4-core/test/utils/Constants.sol";
import {Actions} from "@uniswap/v4-periphery/src/libraries/Actions.sol";

import {IUniswapV4Router04} from "hookmate/interfaces/router/IUniswapV4Router04.sol";
import {AddressConstants} from "hookmate/constants/AddressConstants.sol";

import {MochiYieldHook} from "../../src/hook/MochiYieldHook.sol";
import {ReactiveDeploymentLib} from "./ReactiveDeploymentLib.sol";

/// @notice Force ParityDriftDetected on origin chain to test Reactive live E2E
/// @dev Uses YT pool swaps — PT pool enforces implied-rate bounds at ~1:1 price
contract TriggerParityDriftScript is Script {
    using PoolIdLibrary for PoolKey;
    using StateLibrary for IPoolManager;
    using stdJson for string;

    uint24 internal constant LP_FEE = 3000;
    int24 internal constant TICK_SPACING = 60;
    /// @dev Tiny swap to minimize price impact; YT pool has no PT rate bounds
    uint256 internal constant SWAP_AMOUNT = 0.001e18;
    uint256 internal constant DRIFT_UNDERLYING = 0.5e18;

    function run() external {
        ReactiveDeploymentLib.OriginAddresses memory origin = ReactiveDeploymentLib.readOriginAddresses();
        require(origin.chainId == block.chainid, "TriggerParityDrift: wrong chain");

        string memory json = vm.readFile(ReactiveDeploymentLib.DEPLOYMENT_PATH);
        address positionManagerAddr = json.readAddress(".addresses.positionManager");
        address permit2Addr = json.readAddress(".addresses.permit2");

        MochiYieldHook hook = MochiYieldHook(payable(origin.hook));
        IUniswapV4Router04 router = IUniswapV4Router04(payable(origin.swapRouter));
        IPoolManager poolManager = IPoolManager(AddressConstants.getPoolManagerAddress(block.chainid));
        IPositionManager positionManager = IPositionManager(positionManagerAddr);
        IPermit2 permit2 = IPermit2(permit2Addr);

        PoolKey memory ytPoolKey = _poolKey(origin.ytToken, origin.weth, origin.hook);

        vm.startBroadcast();

        if (!_poolInitialized(poolManager, ytPoolKey)) {
            console2.log("Initializing YT pool + liquidity");
            _initPoolAndAddLiquidity(positionManager, permit2, ytPoolKey, 500e18, 500e18);
        }

        // Lower underlying reference so PT + YT exceeds threshold (PT may be 0 until PT pool is tradable)
        hook.setUnderlyingPrice(DRIFT_UNDERLYING);

        // YT swap updates lastYTPrice and runs parity check — no implied-rate guard on YT pool
        _swapWethForToken(router, ytPoolKey, origin.weth, SWAP_AMOUNT);

        vm.stopBroadcast();

        (uint256 ptPrice, uint256 ytPrice,, uint256 drift) = hook.getMarketState();
        console2.log("=== Parity drift triggered ===");
        console2.log("ptPrice:", ptPrice);
        console2.log("ytPrice:", ytPrice);
        console2.log("underlyingPrice:", hook.underlyingPrice());
        console2.log("lastParityDriftBps:", drift);
        console2.log("Check hook ParityDriftDetected -> Lasna keeper -> ArbitrageRouter callback");
    }

    function _poolInitialized(IPoolManager poolManager, PoolKey memory poolKey) internal view returns (bool) {
        (uint160 sqrtPriceX96,,,) = poolManager.getSlot0(poolKey.toId());
        return sqrtPriceX96 != 0;
    }

    function _initPoolAndAddLiquidity(
        IPositionManager positionManager,
        IPermit2 permit2,
        PoolKey memory poolKey,
        uint256 amount0,
        uint256 amount1
    ) internal {
        bytes memory hookData = Constants.ZERO_BYTES;
        uint160 startingPrice = Constants.SQRT_PRICE_1_1;

        int24 currentTick = TickMath.getTickAtSqrtPrice(startingPrice);
        int24 tickLower = (currentTick - 750 * TICK_SPACING) / TICK_SPACING * TICK_SPACING;
        int24 tickUpper = (currentTick + 750 * TICK_SPACING) / TICK_SPACING * TICK_SPACING;

        uint128 liquidity = LiquidityAmounts.getLiquidityForAmounts(
            startingPrice,
            TickMath.getSqrtPriceAtTick(tickLower),
            TickMath.getSqrtPriceAtTick(tickUpper),
            amount0,
            amount1
        );

        bytes memory actions = abi.encodePacked(
            uint8(Actions.MINT_POSITION), uint8(Actions.SETTLE_PAIR), uint8(Actions.SWEEP), uint8(Actions.SWEEP)
        );

        bytes[] memory mintParams = new bytes[](4);
        mintParams[0] = abi.encode(
            poolKey, tickLower, tickUpper, liquidity, amount0 + 1, amount1 + 1, msg.sender, hookData
        );
        mintParams[1] = abi.encode(poolKey.currency0, poolKey.currency1);
        mintParams[2] = abi.encode(poolKey.currency0, msg.sender);
        mintParams[3] = abi.encode(poolKey.currency1, msg.sender);

        _approveForLiquidity(permit2, positionManager, poolKey);

        bytes[] memory params = new bytes[](2);
        params[0] = abi.encodeWithSelector(positionManager.initializePool.selector, poolKey, startingPrice, hookData);
        params[1] = abi.encodeWithSelector(
            positionManager.modifyLiquidities.selector, abi.encode(actions, mintParams), block.timestamp + 3600
        );

        positionManager.multicall(params);
    }

    function _approveForLiquidity(IPermit2 permit2, IPositionManager positionManager, PoolKey memory poolKey)
        internal
    {
        address token0 = Currency.unwrap(poolKey.currency0);
        address token1 = Currency.unwrap(poolKey.currency1);

        if (token0 != address(0)) {
            IERC20(token0).approve(address(permit2), type(uint256).max);
            permit2.approve(token0, address(positionManager), type(uint160).max, type(uint48).max);
        }
        if (token1 != address(0)) {
            IERC20(token1).approve(address(permit2), type(uint256).max);
            permit2.approve(token1, address(positionManager), type(uint160).max, type(uint48).max);
        }
    }

    /// @dev YT/PT are currency0; WETH is currency1 — buy token with WETH via zeroForOne=false
    function _swapWethForToken(
        IUniswapV4Router04 router,
        PoolKey memory poolKey,
        address weth,
        uint256 amountIn
    ) internal {
        IERC20(weth).approve(address(router), type(uint256).max);
        router.swapExactTokensForTokens({
            amountIn: amountIn,
            amountOutMin: 0,
            zeroForOne: false,
            poolKey: poolKey,
            hookData: bytes(""),
            receiver: msg.sender,
            deadline: block.timestamp + 600
        });
    }

    function _poolKey(address tokenA, address tokenB, address hookAddr) internal pure returns (PoolKey memory key) {
        if (tokenA > tokenB) (tokenA, tokenB) = (tokenB, tokenA);
        key = PoolKey({
            currency0: Currency.wrap(tokenA),
            currency1: Currency.wrap(tokenB),
            fee: LP_FEE,
            tickSpacing: TICK_SPACING,
            hooks: IHooks(hookAddr)
        });
    }
}
