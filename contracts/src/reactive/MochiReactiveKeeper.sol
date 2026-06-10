// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {AbstractReactive} from "reactive-lib/abstract-base/AbstractReactive.sol";
import {IReactive} from "reactive-lib/interfaces/IReactive.sol";

/// @title Mochi Reactive Keeper
/// @notice Subscribes to MochiYieldHook parity drift events and triggers origin-chain callbacks
/// @dev Deploy to Reactive Network (Lasna testnet 5318007 or mainnet 1597)
contract MochiReactiveKeeper is AbstractReactive {
    /// @dev keccak256("ParityDriftDetected(uint256,uint256,uint256,uint256,bool)")
    uint256 public constant PARITY_DRIFT_TOPIC_0 =
        0x08c20bfcdf19e2a3f94554fe0c417f6f75676c55f66e4eeffa09ec02908355de;

    uint256 public immutable originChainId;
    address public immutable mochiHook;
    address public immutable arbitrageRouter;
    uint256 public immutable driftThresholdBps;
    uint64 public callbackGasLimit;

    event ParityCallbackTriggered(uint256 driftBps, bool isOverValued);

    constructor(
        uint256 originChainId_,
        address mochiHook_,
        address arbitrageRouter_,
        uint256 driftThresholdBps_,
        uint64 callbackGasLimit_
    ) payable {
        originChainId = originChainId_;
        mochiHook = mochiHook_;
        arbitrageRouter = arbitrageRouter_;
        driftThresholdBps = driftThresholdBps_;
        callbackGasLimit = callbackGasLimit_;

        service.subscribe(
            originChainId,
            mochiHook,
            PARITY_DRIFT_TOPIC_0,
            REACTIVE_IGNORE,
            REACTIVE_IGNORE,
            REACTIVE_IGNORE
        );
    }

    function react(IReactive.LogRecord calldata log) external vmOnly {
        if (log.topic_0 != PARITY_DRIFT_TOPIC_0) return;

        (uint256 ptPrice, uint256 ytPrice, uint256 underlyingPrice, uint256 driftBps, bool isOverValued) =
            abi.decode(log.data, (uint256, uint256, uint256, uint256, bool));

        if (driftBps < driftThresholdBps) return;

        emit ParityCallbackTriggered(driftBps, isOverValued);

        bytes memory payload = abi.encodeWithSignature(
            "restoreParity(address,uint256,uint256,uint256,bool)",
            address(0),
            ptPrice,
            ytPrice,
            underlyingPrice,
            isOverValued
        );

        emit Callback(originChainId, arbitrageRouter, callbackGasLimit, payload);
    }
}
