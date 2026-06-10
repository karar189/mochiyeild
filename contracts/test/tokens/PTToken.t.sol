// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {PTToken} from "../../src/tokens/PTToken.sol";

contract PTTokenTest is Test {
    PTToken ptToken;
    
    address minter = address(0x1);
    address user = address(0x2);
    uint256 maturity;

    function setUp() public {
        maturity = block.timestamp + 30 days;
        ptToken = new PTToken("PT wstETH", "PT-wstETH", maturity, minter);
    }

    function test_Constructor() public view {
        assertEq(ptToken.name(), "PT wstETH");
        assertEq(ptToken.symbol(), "PT-wstETH");
        assertEq(ptToken.maturity(), maturity);
        assertEq(ptToken.minter(), minter);
    }

    function test_Mint() public {
        vm.prank(minter);
        ptToken.mint(user, 100e18);
        
        assertEq(ptToken.balanceOf(user), 100e18);
    }

    function test_Mint_RevertNotMinter() public {
        vm.prank(user);
        vm.expectRevert(PTToken.OnlyMinter.selector);
        ptToken.mint(user, 100e18);
    }

    function test_Mint_RevertZeroAddress() public {
        vm.prank(minter);
        vm.expectRevert(PTToken.ZeroAddress.selector);
        ptToken.mint(address(0), 100e18);
    }

    function test_Mint_RevertZeroAmount() public {
        vm.prank(minter);
        vm.expectRevert(PTToken.ZeroAmount.selector);
        ptToken.mint(user, 0);
    }

    function test_BurnFrom() public {
        vm.prank(minter);
        ptToken.mint(user, 100e18);
        
        vm.prank(minter);
        ptToken.burnFrom(user, 50e18);
        
        assertEq(ptToken.balanceOf(user), 50e18);
    }

    function test_BurnFrom_RevertNotMinter() public {
        vm.prank(minter);
        ptToken.mint(user, 100e18);
        
        vm.prank(user);
        vm.expectRevert(PTToken.OnlyMinter.selector);
        ptToken.burnFrom(user, 50e18);
    }

    function test_IsMatured() public {
        assertFalse(ptToken.isMatured());
        
        vm.warp(maturity);
        assertTrue(ptToken.isMatured());
    }

    function test_TimeToMaturity() public {
        assertEq(ptToken.timeToMaturity(), 30 days);
        
        vm.warp(block.timestamp + 10 days);
        assertEq(ptToken.timeToMaturity(), 20 days);
        
        vm.warp(maturity);
        assertEq(ptToken.timeToMaturity(), 0);
    }

    function test_Constructor_RevertPastMaturity() public {
        vm.expectRevert(PTToken.MaturityMustBeFuture.selector);
        new PTToken("PT", "PT", block.timestamp - 1, minter);
    }

    function test_Constructor_RevertZeroMinter() public {
        vm.expectRevert(PTToken.ZeroAddress.selector);
        new PTToken("PT", "PT", maturity, address(0));
    }
}
