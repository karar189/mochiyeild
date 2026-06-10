// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Vm} from "forge-std/Vm.sol";
import {stdJson} from "forge-std/StdJson.sol";

/// @notice Reads and updates deployments/mochi.json for Reactive integration
library ReactiveDeploymentLib {
    using stdJson for string;

    Vm private constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    string internal constant DEPLOYMENT_PATH = "deployments/mochi.json";

    struct OriginAddresses {
        uint256 chainId;
        address hook;
        address swapRouter;
        address weth;
        address ptToken;
        address ytToken;
    }

    struct ReactiveAddresses {
        address callbackProxy;
        address arbitrageRouter;
        address keeper;
        uint256 lasnaChainId;
    }

    function readOriginAddresses() internal view returns (OriginAddresses memory addrs) {
        string memory json = vm.readFile(DEPLOYMENT_PATH);
        addrs.chainId = json.readUint(".chainId");
        addrs.hook = json.readAddress(".addresses.hook");
        addrs.swapRouter = json.readAddress(".addresses.swapRouter");
        addrs.weth = json.readAddress(".addresses.weth");
        addrs.ptToken = json.readAddress(".addresses.ptToken");
        addrs.ytToken = json.readAddress(".addresses.ytToken");
    }

    function readArbitrageRouter() internal view returns (address router) {
        string memory json = vm.readFile(DEPLOYMENT_PATH);
        return json.readAddress(".reactive.arbitrageRouter");
    }

    function writeArbitrageRouter(address router, address callbackProxy) internal {
        string memory json = vm.readFile(DEPLOYMENT_PATH);
        string memory reactive;
        reactive = reactive.serialize("callbackProxy", callbackProxy);
        reactive = reactive.serialize("arbitrageRouter", router);
        reactive = reactive.serialize("lasnaChainId", uint256(5318007));
        json = json.serialize("reactive", reactive);
        vm.writeFile(DEPLOYMENT_PATH, json);
    }

    function writeKeeper(address keeper) internal {
        string memory json = vm.readFile(DEPLOYMENT_PATH);
        address callbackProxy = json.readAddress(".reactive.callbackProxy");
        address router = json.readAddress(".reactive.arbitrageRouter");
        uint256 lasnaChainId = json.readUint(".reactive.lasnaChainId");
        string memory reactive;
        reactive = reactive.serialize("callbackProxy", callbackProxy);
        reactive = reactive.serialize("arbitrageRouter", router);
        reactive = reactive.serialize("lasnaChainId", lasnaChainId);
        reactive = reactive.serialize("keeper", keeper);
        json = json.serialize("reactive", reactive);
        vm.writeFile(DEPLOYMENT_PATH, json);
    }
}
