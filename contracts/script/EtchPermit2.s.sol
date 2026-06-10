// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script} from "forge-std/Script.sol";
import {Deployers} from "test/utils/Deployers.sol";

/// @notice Pre-etch Permit2 on local Anvil (run without --broadcast before Deploy.s.sol)
contract EtchPermit2Script is Script, Deployers {
    function _etch(address target, bytes memory bytecode) internal override {
        if (block.chainid == 31337) {
            vm.rpc("anvil_setCode", string.concat('["', vm.toString(target), '",', '"', vm.toString(bytecode), '"]'));
        } else {
            revert("EtchPermit2Script: local only");
        }
    }

    function run() external {
        deployPermit2();
    }
}
