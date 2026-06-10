// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {YieldVault} from "../../src/vault/YieldVault.sol";
import {PTToken} from "../../src/tokens/PTToken.sol";
import {YTToken} from "../../src/tokens/YTToken.sol";
import {MockWstETH} from "../../src/mocks/MockWstETH.sol";

contract YieldVaultTest is Test {
    YieldVault vault;
    PTToken ptToken;
    YTToken ytToken;
    MockWstETH mockWstETH;

    address user = address(0x1);
    uint256 maturity;

    function setUp() public {
        maturity = block.timestamp + 30 days;

        // Deploy mock underlying
        mockWstETH = new MockWstETH();

        // We need to deploy vault first to get its address for minter
        // But vault needs tokens... so we deploy tokens with vault address
        // This is a chicken-egg problem, so we use a deterministic approach

        // First compute vault address
        address vaultAddress = computeCreateAddress(address(this), vm.getNonce(address(this)) + 2);

        // Deploy tokens with vault as minter
        ptToken = new PTToken("PT wstETH", "PT-wstETH", maturity, vaultAddress);
        ytToken = new YTToken("YT wstETH", "YT-wstETH", maturity, vaultAddress);

        // Deploy vault
        vault = new YieldVault(address(mockWstETH), address(ptToken), address(ytToken));

        // Verify addresses match
        assertEq(address(vault), vaultAddress, "Vault address mismatch");

        // Mint some underlying to user
        mockWstETH.mint(user, 1000e18);
    }

    function test_Constructor() public view {
        assertEq(address(vault.underlying()), address(mockWstETH));
        assertEq(address(vault.ptToken()), address(ptToken));
        assertEq(address(vault.ytToken()), address(ytToken));
        assertEq(vault.maturity(), maturity);
    }

    function test_Deposit() public {
        uint256 depositAmount = 100e18;

        vm.startPrank(user);
        mockWstETH.approve(address(vault), depositAmount);
        (uint256 ptAmount, uint256 ytAmount) = vault.deposit(depositAmount);
        vm.stopPrank();

        // Check PT and YT minted
        assertEq(ptAmount, depositAmount);
        assertEq(ytAmount, depositAmount);
        assertEq(ptToken.balanceOf(user), depositAmount);
        assertEq(ytToken.balanceOf(user), depositAmount);

        // Check underlying transferred
        assertEq(mockWstETH.balanceOf(address(vault)), depositAmount);
        assertEq(vault.totalDeposited(), depositAmount);
    }

    function test_Deposit_RevertZeroAmount() public {
        vm.prank(user);
        vm.expectRevert(YieldVault.ZeroAmount.selector);
        vault.deposit(0);
    }

    function test_Deposit_RevertAfterMaturity() public {
        vm.warp(maturity);

        vm.startPrank(user);
        mockWstETH.approve(address(vault), 100e18);
        vm.expectRevert(YieldVault.MaturityAlreadyPassed.selector);
        vault.deposit(100e18);
        vm.stopPrank();
    }

    function test_Redeem() public {
        uint256 depositAmount = 100e18;

        // Deposit first
        vm.startPrank(user);
        mockWstETH.approve(address(vault), depositAmount);
        vault.deposit(depositAmount);
        vm.stopPrank();

        // Fast forward to maturity
        vm.warp(maturity);

        // Redeem PT
        uint256 redeemAmount = 50e18;
        vm.prank(user);
        uint256 underlyingReturned = vault.redeem(redeemAmount);

        assertEq(underlyingReturned, redeemAmount);
        assertEq(ptToken.balanceOf(user), depositAmount - redeemAmount);
        assertEq(mockWstETH.balanceOf(user), 1000e18 - depositAmount + redeemAmount);
    }

    function test_Redeem_RevertBeforeMaturity() public {
        uint256 depositAmount = 100e18;

        vm.startPrank(user);
        mockWstETH.approve(address(vault), depositAmount);
        vault.deposit(depositAmount);

        vm.expectRevert(YieldVault.MaturityNotReached.selector);
        vault.redeem(50e18);
        vm.stopPrank();
    }

    function test_Redeem_RevertZeroAmount() public {
        vm.warp(maturity);

        vm.prank(user);
        vm.expectRevert(YieldVault.ZeroAmount.selector);
        vault.redeem(0);
    }

    function test_MultipleDeposits() public {
        vm.startPrank(user);
        mockWstETH.approve(address(vault), 300e18);

        vault.deposit(100e18);
        assertEq(vault.totalDeposited(), 100e18);

        vault.deposit(100e18);
        assertEq(vault.totalDeposited(), 200e18);

        vault.deposit(100e18);
        assertEq(vault.totalDeposited(), 300e18);

        assertEq(ptToken.balanceOf(user), 300e18);
        assertEq(ytToken.balanceOf(user), 300e18);
        vm.stopPrank();
    }

    function test_TimeToMaturity() public {
        assertEq(vault.timeToMaturity(), 30 days);

        vm.warp(block.timestamp + 10 days);
        assertEq(vault.timeToMaturity(), 20 days);

        vm.warp(maturity);
        assertEq(vault.timeToMaturity(), 0);
    }

    function test_IsMatured() public {
        assertFalse(vault.isMatured());

        vm.warp(maturity);
        assertTrue(vault.isMatured());
    }

    function test_TotalUnderlying() public {
        uint256 depositAmount = 100e18;

        vm.startPrank(user);
        mockWstETH.approve(address(vault), depositAmount);
        vault.deposit(depositAmount);
        vm.stopPrank();

        assertEq(vault.totalUnderlying(), depositAmount);
    }
}
