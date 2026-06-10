// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";

import {ArbitrageRouter} from "../../src/reactive/ArbitrageRouter.sol";
import {ReactiveDeploymentLib} from "./ReactiveDeploymentLib.sol";

/// @notice Deploy ArbitrageRouter on the origin chain (Unichain Sepolia)
contract DeployArbitrageRouterScript is Script {
    /// @dev Unichain Sepolia callback proxy — https://dev.reactive.network/origins-and-destinations
    address internal constant UNICHAIN_CALLBACK_PROXY = 0x9299472A6399Fd1027ebF067571Eb3e3D7837FC4;

    function run() external {
        ReactiveDeploymentLib.OriginAddresses memory origin = ReactiveDeploymentLib.readOriginAddresses();
        require(origin.chainId == block.chainid, "DeployArbitrageRouter: wrong chain");

        vm.startBroadcast();
        ArbitrageRouter router = new ArbitrageRouter(UNICHAIN_CALLBACK_PROXY);
        vm.stopBroadcast();

        console2.log("=== ArbitrageRouter deployed ===");
        console2.log("chainId:", block.chainid);
        console2.log("callbackProxy:", UNICHAIN_CALLBACK_PROXY);
        console2.log("arbitrageRouter:", address(router));
        console2.log("Update deployments/mochi.json reactive.arbitrageRouter via deploy-reactive.sh");
    }
}
