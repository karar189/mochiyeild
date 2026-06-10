// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {AbstractCallback} from "reactive-lib/abstract-base/AbstractCallback.sol";

/// @title Arbitrage Router
/// @notice Receives Reactive Network callbacks on the origin chain when PT/YT parity drifts
/// @dev Full cross-pool arbitrage requires funded swap paths; MVP records drift and emits events
contract ArbitrageRouter is AbstractCallback {
    uint256 public constant DEFAULT_DRIFT_THRESHOLD_BPS = 500;

    uint256 public lastDriftBps;
    uint256 public restoreCount;

    event ParityRestoreRequested(
        uint256 ptPrice,
        uint256 ytPrice,
        uint256 underlyingPrice,
        uint256 driftBps,
        bool isOverValued
    );

    event ParityRestored(
        uint256 ptPrice,
        uint256 ytPrice,
        uint256 underlyingPrice,
        uint256 driftBps,
        bool isOverValued
    );

    error DriftBelowThreshold(uint256 driftBps, uint256 thresholdBps);

    constructor(address reactiveCallbackSender) AbstractCallback(reactiveCallbackSender) {}

    /// @notice Entry point invoked by Reactive Network callback delivery
    /// @dev First argument is always the ReactVM ID injected by Reactive Network
    function restoreParity(
        address,
        uint256 ptPrice,
        uint256 ytPrice,
        uint256 underlyingPrice,
        bool isOverValued
    ) external authorizedSenderOnly {
        uint256 driftBps = _calculateDriftBps(ptPrice, ytPrice, underlyingPrice);

        emit ParityRestoreRequested(ptPrice, ytPrice, underlyingPrice, driftBps, isOverValued);

        if (driftBps < DEFAULT_DRIFT_THRESHOLD_BPS) {
            revert DriftBelowThreshold(driftBps, DEFAULT_DRIFT_THRESHOLD_BPS);
        }

        lastDriftBps = driftBps;
        restoreCount += 1;

        // TODO: execute PT/YT pool swaps via v4 router when callback is funded
        emit ParityRestored(ptPrice, ytPrice, underlyingPrice, driftBps, isOverValued);
    }

    function _calculateDriftBps(uint256 ptPrice, uint256 ytPrice, uint256 underlyingPrice)
        internal
        pure
        returns (uint256 driftBps)
    {
        uint256 combinedValue = ptPrice + ytPrice;

        if (combinedValue > underlyingPrice) {
            driftBps = ((combinedValue - underlyingPrice) * 10000) / underlyingPrice;
        } else {
            driftBps = ((underlyingPrice - combinedValue) * 10000) / underlyingPrice;
        }
    }
}
