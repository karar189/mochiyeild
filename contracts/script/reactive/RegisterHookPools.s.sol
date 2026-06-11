// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {stdJson} from "forge-std/StdJson.sol";

import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";

import {MochiYieldHook} from "../../src/hook/MochiYieldHook.sol";
import {ReactiveDeploymentLib} from "./ReactiveDeploymentLib.sol";

/// @notice Register PT/YT pools on the deployed hook (needed if deploy partially failed)
contract RegisterHookPoolsScript is Script {
    using stdJson for string;

    uint24 internal constant LP_FEE = 3000;
    int24 internal constant TICK_SPACING = 60;

    function run() external {
        ReactiveDeploymentLib.OriginAddresses memory origin = ReactiveDeploymentLib.readOriginAddresses();
        require(origin.chainId == block.chainid, "RegisterHookPools: wrong chain");

        string memory json = vm.readFile(ReactiveDeploymentLib.DEPLOYMENT_PATH);
        uint256 maturity = json.readUint(".maturity");

        MochiYieldHook hook = MochiYieldHook(payable(origin.hook));
        PoolKey memory ptPoolKey = _poolKey(origin.ptToken, origin.weth, origin.hook);
        PoolKey memory ytPoolKey = _poolKey(origin.ytToken, origin.weth, origin.hook);

        address underlying = json.readAddress(".addresses.underlying");

        vm.startBroadcast();

        if (!hook.isPoolRegistered(ptPoolKey.toId())) {
            hook.registerPool(ptPoolKey, true, origin.ptToken, origin.ytToken, maturity, underlying);
            console2.log("Registered PT pool");
        }

        if (!hook.isPoolRegistered(ytPoolKey.toId())) {
            hook.registerPool(ytPoolKey, false, origin.ptToken, origin.ytToken, maturity, underlying);
            console2.log("Registered YT pool");
        }

        vm.stopBroadcast();
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
