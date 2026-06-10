// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title Yield Token (YT)
/// @notice ERC20 representing the right to future yield until maturity
/// @dev Minting and burning controlled by the minter (YieldVault)
contract YTToken is ERC20 {
    /// @notice The timestamp at which this YT token matures
    uint256 public immutable maturity;

    /// @notice Address that can mint/burn tokens (the YieldVault)
    address public immutable minter;

    /// @notice Emitted when new tokens are minted
    event TokenMinted(address indexed to, uint256 amount);

    /// @notice Emitted when tokens are burned
    event TokenBurned(address indexed from, uint256 amount);

    error OnlyMinter();
    error ZeroAddress();
    error ZeroAmount();
    error MaturityMustBeFuture();

    /// @notice Creates a new YT token
    /// @param _name Name of the token
    /// @param _symbol Symbol of the token
    /// @param _maturity Timestamp when the token matures
    /// @param _minter Address that can mint/burn tokens
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _maturity,
        address _minter
    ) ERC20(_name, _symbol) {
        if (_maturity <= block.timestamp) revert MaturityMustBeFuture();
        if (_minter == address(0)) revert ZeroAddress();
        maturity = _maturity;
        minter = _minter;
    }

    /// @notice Mints new tokens to a specified address
    /// @param to Address to receive the minted tokens
    /// @param amount Amount of tokens to mint
    function mint(address to, uint256 amount) external {
        if (msg.sender != minter) revert OnlyMinter();
        if (to == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();
        _mint(to, amount);
        emit TokenMinted(to, amount);
    }

    /// @notice Burns tokens from a specified address
    /// @param from Address to burn tokens from
    /// @param amount Amount of tokens to burn
    function burnFrom(address from, uint256 amount) external {
        if (msg.sender != minter) revert OnlyMinter();
        if (from == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();
        _burn(from, amount);
        emit TokenBurned(from, amount);
    }

    /// @notice Check if the token has matured
    function isMatured() external view returns (bool) {
        return block.timestamp >= maturity;
    }

    /// @notice Time remaining until maturity (0 if already matured)
    function timeToMaturity() external view returns (uint256) {
        if (block.timestamp >= maturity) return 0;
        return maturity - block.timestamp;
    }
}
