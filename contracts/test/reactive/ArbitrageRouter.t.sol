// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {ArbitrageRouter} from "../../src/reactive/ArbitrageRouter.sol";

contract ArbitrageRouterTest is Test {
    ArbitrageRouter router;
    address reactiveSender = makeAddr("reactive-callback");

    function setUp() public {
        vm.prank(reactiveSender);
        router = new ArbitrageRouter(reactiveSender);
    }

    function test_RestoreParity_EmitsWhenDriftHigh() public {
        uint256 ptPrice = 1.06e18;
        uint256 ytPrice = 0.03e18;
        uint256 underlyingPrice = 1e18;

        vm.expectEmit(true, true, true, true);
        emit ArbitrageRouter.ParityRestored(ptPrice, ytPrice, underlyingPrice, 900, true);

        vm.prank(reactiveSender);
        router.restoreParity(reactiveSender, ptPrice, ytPrice, underlyingPrice, true);

        assertEq(router.restoreCount(), 1);
        assertEq(router.lastDriftBps(), 900);
    }

    function test_RestoreParity_RevertsWhenDriftLow() public {
        vm.expectRevert(
            abi.encodeWithSelector(ArbitrageRouter.DriftBelowThreshold.selector, uint256(200), uint256(500))
        );

        vm.prank(reactiveSender);
        router.restoreParity(reactiveSender, 0.97e18, 0.01e18, 1e18, false);
    }
}
