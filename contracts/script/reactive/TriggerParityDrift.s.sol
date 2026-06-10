// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {IERC20} from "forge-std/interfaces/IERC20.sol";

import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";

import {IUniswapV4Router04} from "hookmate/interfaces/router/IUniswapV4Router04.sol";

import {MochiYieldHook} from "../../src/hook/MochiYieldHook.sol";
import {ReactiveDeploymentLib} from "./ReactiveDeploymentLib.sol";

/// @notice Force ParityDriftDetected on origin chain to test Reactive live E2E
contract TriggerParityDriftScript is Script {
    uint24 internal constant LP_FEE = 3000;
    int24 internal constant TICK_SPACING = 60;

    function run() external {
        ReactiveDeploymentLib.OriginAddresses memory origin = ReactiveDeploymentLib.readOriginAddresses();
        require(origin.chainId == block.chainid, "TriggerParityDrift: wrong chain");

        MochiYieldHook hook = MochiYieldHook(payable(origin.hook));
        IUniswapV4Router04 router = IUniswapV4Router04(payable(origin.swapRouter));

        PoolKey memory ptPoolKey = _poolKey(origin.ptToken, origin.weth, origin.hook);
        PoolKey memory ytPoolKey = _poolKey(origin.ytToken, origin.weth, origin.hook);

        vm.startBroadcast();

        _ensurePricesInitialized(hook, router, ptPoolKey, ytPoolKey, origin);

        // Artificially lower underlying reference so PT + YT exceeds threshold
        hook.setUnderlyingPrice(0.5e18);

        // Any swap re-runs parity check with the new underlying
        _swap(router, ptPoolKey, origin.weth, 0.1e18, true);

        vm.stopBroadcast();

        (,,, uint256 drift) = hook.getMarketState();
        console2.log("=== Parity drift triggered ===");
        console2.log("lastParityDriftBps:", drift);
        console2.log("Check hook ParityDriftDetected -> Lasna keeper -> ArbitrageRouter callback");
    }

    function _ensurePricesInitialized(
        MochiYieldHook hook,
        IUniswapV4Router04 router,
        PoolKey memory ptPoolKey,
        PoolKey memory ytPoolKey,
        ReactiveDeploymentLib.OriginAddresses memory origin
    ) internal {
        (uint256 ptPrice, uint256 ytPrice,,) = hook.getMarketState();
        if (ptPrice == 0) {
            _swap(router, ptPoolKey, origin.weth, 0.01e18, true);
        }
        if (ytPrice == 0) {
            _swap(router, ytPoolKey, origin.weth, 0.01e18, true);
        }
    }

    function _swap(
        IUniswapV4Router04 router,
        PoolKey memory poolKey,
        address tokenIn,
        uint256 amountIn,
        bool zeroForOne
    ) internal {
        IERC20(tokenIn).approve(address(router), amountIn);
        router.swapExactTokensForTokens({
            amountIn: amountIn,
            amountOutMin: 0,
            zeroForOne: zeroForOne,
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
