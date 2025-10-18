// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title VaultController
 * @notice Main user-facing contract for deposits and withdrawals
 * @dev Abstracts the complexity of the underlying LP strategy
 */
contract VaultController is Ownable, ReentrancyGuard {
    /// @notice BTC token
    IERC20 public immutable btc;

    /// @notice Strategy contract
    IStrategyBTC public strategy;

    /// @notice Debt manager contract
    IDebtManager public debtManager;

    /// @notice User deposit tracking
    mapping(address => uint256) public userDeposits;

    /// @notice Total deposits
    uint256 public totalDeposits;

    /// @notice Emitted when user deposits BTC
    event Deposited(address indexed user, uint256 amount);

    /// @notice Emitted when user withdraws BTC
    event Withdrawn(address indexed user, uint256 amount);

    /// @notice Emitted when strategy is set
    event StrategySet(address indexed strategy);

    /// @notice Emitted when debt manager is set
    event DebtManagerSet(address indexed debtManager);

    /**
     * @notice Constructor
     * @param _btc BTC token address
     */
    constructor(address _btc) {
        require(_btc != address(0), "Invalid BTC address");
        btc = IERC20(_btc);
    }

    /**
     * @notice Set strategy contract
     * @param _strategy Strategy address
     */
    function setStrategy(address _strategy) external onlyOwner {
        require(_strategy != address(0), "Invalid strategy");
        strategy = IStrategyBTC(_strategy);
        
        // Approve strategy to spend BTC
        btc.approve(_strategy, type(uint256).max);
        
        emit StrategySet(_strategy);
    }

    /**
     * @notice Set debt manager contract
     * @param _debtManager Debt manager address
     */
    function setDebtManager(address _debtManager) external onlyOwner {
        require(_debtManager != address(0), "Invalid debt manager");
        debtManager = IDebtManager(_debtManager);
        emit DebtManagerSet(_debtManager);
    }

    /**
     * @notice Deposit BTC as collateral
     * @param amount The amount of BTC to deposit
     */
    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        require(address(strategy) != address(0), "Strategy not set");

        // Transfer BTC from user
        btc.transferFrom(msg.sender, address(this), amount);

        // Invest through strategy
        strategy.invest(amount, msg.sender);

        // Track deposit
        userDeposits[msg.sender] += amount;
        totalDeposits += amount;

        emit Deposited(msg.sender, amount);
    }

    /**
     * @notice Withdraw BTC collateral
     * @param amount The amount of BTC to withdraw
     */
    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        require(userDeposits[msg.sender] >= amount, "Insufficient deposit");
        require(address(strategy) != address(0), "Strategy not set");

        // Check user has no debt (or debt is fully covered)
        if (address(debtManager) != address(0)) {
            uint256 userDebt = debtManager.userDebt(msg.sender);
            require(userDebt == 0, "Must repay debt first");
        }

        // Withdraw from strategy
        strategy.withdraw(amount, msg.sender);

        // Update tracking
        userDeposits[msg.sender] -= amount;
        totalDeposits -= amount;

        // Transfer BTC to user
        btc.transfer(msg.sender, amount);

        emit Withdrawn(msg.sender, amount);
    }

    /**
     * @notice Get user's deposited balance
     * @param user The user address
     * @return The user's BTC deposit
     */
    function balanceOf(address user) external view returns (uint256) {
        return userDeposits[user];
    }
}

/**
 * @notice Interface for StrategyBTC
 */
interface IStrategyBTC {
    function invest(uint256 amount, address user) external;
    function withdraw(uint256 amount, address user) external;
    function balanceOf(address user) external view returns (uint256);
}

/**
 * @notice Interface for DebtManager
 */
interface IDebtManager {
    function userDebt(address user) external view returns (uint256);
}

