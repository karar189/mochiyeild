// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title Mock Wrapped Staked ETH (wstETH)
/// @notice A mock ERC20 for testing that simulates wstETH behavior
/// @dev Includes stEthPerToken() to simulate exchange rate growth
contract MockWstETH is ERC20 {
    /// @notice Exchange rate of wstETH to stETH (1e18 = 1:1)
    /// @dev Increases over time to simulate staking rewards
    uint256 public stEthPerTokenRate = 1e18;

    /// @notice Owner who can mint and adjust rates
    address public owner;

    event YieldAccrued(uint256 oldRate, uint256 newRate, uint256 yieldBps);
    event Minted(address indexed to, uint256 amount);

    error OnlyOwner();

    constructor() ERC20("Mock Wrapped Staked ETH", "wstETH") {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }

    /// @notice Mint tokens to any address (for testing)
    /// @param to Recipient address
    /// @param amount Amount to mint
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
        emit Minted(to, amount);
    }

    /// @notice Simulate yield accrual by increasing the exchange rate
    /// @param yieldBps Yield in basis points (100 = 1%)
    function accrueYield(uint256 yieldBps) external onlyOwner {
        uint256 oldRate = stEthPerTokenRate;
        stEthPerTokenRate = (stEthPerTokenRate * (10000 + yieldBps)) / 10000;
        emit YieldAccrued(oldRate, stEthPerTokenRate, yieldBps);
    }

    /// @notice Set the exchange rate directly (for testing edge cases)
    /// @param newRate New exchange rate (1e18 scale)
    function setStEthPerToken(uint256 newRate) external onlyOwner {
        uint256 oldRate = stEthPerTokenRate;
        stEthPerTokenRate = newRate;
        emit YieldAccrued(oldRate, newRate, 0);
    }

    /// @notice Get the current stETH per wstETH token
    /// @return Exchange rate in 1e18 scale
    function stEthPerToken() external view returns (uint256) {
        return stEthPerTokenRate;
    }

    /// @notice Get the wstETH per stETH (inverse rate)
    /// @return Inverse exchange rate in 1e18 scale
    function tokensPerStEth() external view returns (uint256) {
        return (1e18 * 1e18) / stEthPerTokenRate;
    }

    /// @notice Calculate how much stETH a given wstETH amount is worth
    /// @param wstETHAmount Amount of wstETH
    /// @return stETH equivalent
    function getStETHByWstETH(uint256 wstETHAmount) external view returns (uint256) {
        return (wstETHAmount * stEthPerTokenRate) / 1e18;
    }

    /// @notice Calculate how much wstETH is needed for a given stETH amount
    /// @param stETHAmount Amount of stETH
    /// @return wstETH equivalent
    function getWstETHByStETH(uint256 stETHAmount) external view returns (uint256) {
        return (stETHAmount * 1e18) / stEthPerTokenRate;
    }
}
