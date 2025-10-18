// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title bMUSD
 * @notice Synthetic debt token representing borrowed MUSD
 * @dev ERC20 token with restricted minting/burning to DebtManager
 */
contract bMUSD is ERC20, Ownable {
    /// @notice The DebtManager contract address (authorized to mint/burn)
    address public debtManager;

    /// @notice Emitted when the debt manager is updated
    event DebtManagerUpdated(address indexed oldManager, address indexed newManager);

    /**
     * @notice Constructor
     */
    constructor() ERC20("Bitcoin MUSD", "bMUSD") {}

    /**
     * @notice Set the debt manager address
     * @param _debtManager The address of the DebtManager contract
     */
    function setDebtManager(address _debtManager) external onlyOwner {
        require(_debtManager != address(0), "Invalid debt manager");
        emit DebtManagerUpdated(debtManager, _debtManager);
        debtManager = _debtManager;
    }

    /**
     * @notice Mint bMUSD tokens
     * @param to The recipient address
     * @param amount The amount to mint
     */
    function mint(address to, uint256 amount) external {
        require(msg.sender == debtManager, "Only debt manager can mint");
        _mint(to, amount);
    }

    /**
     * @notice Burn bMUSD tokens
     * @param from The address to burn from
     * @param amount The amount to burn
     */
    function burn(address from, uint256 amount) external {
        require(msg.sender == debtManager, "Only debt manager can burn");
        _burn(from, amount);
    }
}

