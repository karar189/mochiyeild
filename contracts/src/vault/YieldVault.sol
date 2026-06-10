// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {PTToken} from "../tokens/PTToken.sol";
import {YTToken} from "../tokens/YTToken.sol";

/// @title Mochi Yield Vault
/// @notice Accepts underlying assets and mints PT + YT tokens
/// @dev Holds underlying until maturity when PT can be redeemed
contract YieldVault is ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @notice The underlying yield-bearing asset (e.g., wstETH)
    IERC20 public immutable underlying;

    /// @notice Principal Token for this vault
    PTToken public immutable ptToken;

    /// @notice Yield Token for this vault
    YTToken public immutable ytToken;

    /// @notice Maturity timestamp
    uint256 public immutable maturity;

    /// @notice Total underlying deposited
    uint256 public totalDeposited;

    // ═══════════════════════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════════════════════

    event Deposited(
        address indexed user,
        uint256 underlyingAmount,
        uint256 ptMinted,
        uint256 ytMinted
    );

    event Redeemed(
        address indexed user,
        uint256 ptBurned,
        uint256 underlyingReturned
    );

    // ═══════════════════════════════════════════════════════════
    // ERRORS
    // ═══════════════════════════════════════════════════════════

    error ZeroAmount();
    error MaturityNotReached();
    error MaturityAlreadyPassed();
    error InsufficientBalance();

    // ═══════════════════════════════════════════════════════════
    // CONSTRUCTOR
    // ═══════════════════════════════════════════════════════════

    /// @notice Creates a new YieldVault
    /// @param _underlying Address of the underlying asset (wstETH)
    /// @param _ptToken Address of the PT token
    /// @param _ytToken Address of the YT token
    constructor(
        address _underlying,
        address _ptToken,
        address _ytToken
    ) {
        underlying = IERC20(_underlying);
        ptToken = PTToken(_ptToken);
        ytToken = YTToken(_ytToken);
        maturity = ptToken.maturity();
    }

    // ═══════════════════════════════════════════════════════════
    // DEPOSIT
    // ═══════════════════════════════════════════════════════════

    /// @notice Deposit underlying and receive PT + YT
    /// @param amount Amount of underlying to deposit
    /// @return ptAmount Amount of PT minted
    /// @return ytAmount Amount of YT minted
    function deposit(uint256 amount) external nonReentrant returns (uint256 ptAmount, uint256 ytAmount) {
        if (amount == 0) revert ZeroAmount();
        if (block.timestamp >= maturity) revert MaturityAlreadyPassed();

        // Transfer underlying from user
        underlying.safeTransferFrom(msg.sender, address(this), amount);

        // Mint PT and YT 1:1 with underlying
        // In production, this would account for exchange rates
        ptAmount = amount;
        ytAmount = amount;

        ptToken.mint(msg.sender, ptAmount);
        ytToken.mint(msg.sender, ytAmount);

        totalDeposited += amount;

        emit Deposited(msg.sender, amount, ptAmount, ytAmount);
    }

    // ═══════════════════════════════════════════════════════════
    // REDEEM
    // ═══════════════════════════════════════════════════════════

    /// @notice Redeem PT for underlying after maturity
    /// @param ptAmount Amount of PT to redeem
    /// @return underlyingAmount Amount of underlying returned
    function redeem(uint256 ptAmount) external nonReentrant returns (uint256 underlyingAmount) {
        if (ptAmount == 0) revert ZeroAmount();
        if (block.timestamp < maturity) revert MaturityNotReached();

        // Burn PT from user
        ptToken.burnFrom(msg.sender, ptAmount);

        // Return underlying 1:1
        // In production, this would be the principal portion
        underlyingAmount = ptAmount;

        if (underlying.balanceOf(address(this)) < underlyingAmount) {
            revert InsufficientBalance();
        }

        underlying.safeTransfer(msg.sender, underlyingAmount);

        emit Redeemed(msg.sender, ptAmount, underlyingAmount);
    }

    // ═══════════════════════════════════════════════════════════
    // VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════════

    /// @notice Get total underlying held by vault
    function totalUnderlying() external view returns (uint256) {
        return underlying.balanceOf(address(this));
    }

    /// @notice Check if maturity has been reached
    function isMatured() external view returns (bool) {
        return block.timestamp >= maturity;
    }

    /// @notice Time remaining until maturity
    function timeToMaturity() external view returns (uint256) {
        if (block.timestamp >= maturity) return 0;
        return maturity - block.timestamp;
    }

    /// @notice Get maturity timestamp
    function getMaturity() external view returns (uint256) {
        return maturity;
    }
}
