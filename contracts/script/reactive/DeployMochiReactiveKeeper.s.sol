// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";

import {MochiReactiveKeeper} from "../../src/reactive/MochiReactiveKeeper.sol";
import {ReactiveDeploymentLib} from "./ReactiveDeploymentLib.sol";

/// @notice Deploy MochiReactiveKeeper on Reactive Lasna (5318007)
contract DeployMochiReactiveKeeperScript is Script {
    uint256 internal constant LASNA_CHAIN_ID = 5318007;
    uint256 internal constant DEFAULT_DRIFT_THRESHOLD_BPS = 500;
    uint64 internal constant DEFAULT_CALLBACK_GAS_LIMIT = 500_000;

    function run() external {
        require(block.chainid == LASNA_CHAIN_ID, "DeployMochiReactiveKeeper: must deploy on Lasna (5318007)");

        ReactiveDeploymentLib.OriginAddresses memory origin = ReactiveDeploymentLib.readOriginAddresses();
        address arbitrageRouter = ReactiveDeploymentLib.readArbitrageRouter();
        require(arbitrageRouter != address(0), "DeployMochiReactiveKeeper: deploy ArbitrageRouter first");

        uint256 prepaidReact = vm.envOr("REACTIVE_PREPAID_WEI", uint256(0.01 ether));

        vm.startBroadcast();
        MochiReactiveKeeper keeper = new MochiReactiveKeeper{value: prepaidReact}(
            origin.chainId,
            origin.hook,
            arbitrageRouter,
            DEFAULT_DRIFT_THRESHOLD_BPS,
            DEFAULT_CALLBACK_GAS_LIMIT
        );
        vm.stopBroadcast();

        console2.log("=== MochiReactiveKeeper deployed ===");
        console2.log("lasnaChainId:", LASNA_CHAIN_ID);
        console2.log("originChainId:", origin.chainId);
        console2.log("mochiHook:", origin.hook);
        console2.log("arbitrageRouter:", arbitrageRouter);
        console2.log("keeper:", address(keeper));
        console2.log("prepaidReact:", prepaidReact);
        console2.log("Update deployments/mochi.json reactive.keeper via deploy-reactive.sh");
    }
}
