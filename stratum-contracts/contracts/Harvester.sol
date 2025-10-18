// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/ITigrisRouter.sol";

/**
 * @title Harvester
 * @notice Automated yield collection and distribution
 * @dev Collects trading fees from LP positions and sends to DebtManager
 */
contract Harvester is Ownable, ReentrancyGuard {
    /// @notice Strategy contract
    address public strategy;

    /// @notice Debt manager contract
    address public debtManager;

    /// @notice Tigris router for swaps
    ITigrisRouter public tigrisRouter;

    /// @notice MUSD token
    IERC20 public musd;

    /// @notice BTC token
    IERC20 public btc;

    /// @notice Keeper bot address (authorized to call harvest)
    address public keeper;

    /// @notice Emitted when harvest is executed
    event Harvested(uint256 musdAmount, uint256 btcAmount, uint256 totalValue);

    /// @notice Emitted when strategy is set
    event StrategySet(address indexed strategy);

    /// @notice Emitted when debt manager is set
    event DebtManagerSet(address indexed debtManager);

    /// @notice Emitted when keeper is set
    event KeeperSet(address indexed keeper);

    /**
     * @notice Constructor
     * @param _tigrisRouter Tigris router address
     * @param _musd MUSD token address
     * @param _btc BTC token address
     */
    constructor(
        address _tigrisRouter,
        address _musd,
        address _btc
    ) {
        require(_tigrisRouter != address(0), "Invalid router");
        require(_musd != address(0), "Invalid MUSD");
        require(_btc != address(0), "Invalid BTC");

        tigrisRouter = ITigrisRouter(_tigrisRouter);
        musd = IERC20(_musd);
        btc = IERC20(_btc);

        // Approve router
        btc.approve(_tigrisRouter, type(uint256).max);
        musd.approve(_tigrisRouter, type(uint256).max);
    }

    /**
     * @notice Set strategy contract
     * @param _strategy Strategy address
     */
    function setStrategy(address _strategy) external onlyOwner {
        require(_strategy != address(0), "Invalid strategy");
        strategy = _strategy;
        emit StrategySet(_strategy);
    }

    /**
     * @notice Set debt manager contract
     * @param _debtManager Debt manager address
     */
    function setDebtManager(address _debtManager) external onlyOwner {
        require(_debtManager != address(0), "Invalid debt manager");
        debtManager = _debtManager;
        
        // Approve debt manager to spend MUSD
        musd.approve(_debtManager, type(uint256).max);
        
        emit DebtManagerSet(_debtManager);
    }

    /**
     * @notice Set keeper address
     * @param _keeper Keeper address
     */
    function setKeeper(address _keeper) external onlyOwner {
        require(_keeper != address(0), "Invalid keeper");
        keeper = _keeper;
        emit KeeperSet(_keeper);
    }

    /**
     * @notice Harvest yield from strategy
     * @dev Can be called by keeper or owner
     */
    function harvest() external nonReentrant {
        require(
            msg.sender == keeper || msg.sender == owner(),
            "Only keeper or owner"
        );
        require(strategy != address(0), "Strategy not set");
        require(debtManager != address(0), "Debt manager not set");

        // Claim yield from strategy
        (uint256 claimed0, uint256 claimed1) = IStrategyBTC(strategy).claimYield();

        // Determine which token is which
        uint256 musdAmount = 0;
        uint256 btcAmount = 0;

        // Check balances to determine what we received
        uint256 musdBalance = musd.balanceOf(address(this));
        uint256 btcBalance = btc.balanceOf(address(this));

        if (musdBalance > 0) {
            musdAmount = musdBalance;
        }
        if (btcBalance > 0) {
            btcAmount = btcBalance;
        }

        // Convert BTC to MUSD if we have any
        if (btcAmount > 0) {
            address[] memory path = new address[](2);
            path[0] = address(btc);
            path[1] = address(musd);

            uint256[] memory amounts = tigrisRouter.swapExactTokensForTokens(
                btcAmount,
                0, // Accept any amount (for simplicity)
                path,
                address(this),
                block.timestamp + 300
            );

            musdAmount += amounts[1];
        }

        // Send MUSD to debt manager to pay down debt
        if (musdAmount > 0) {
            IDebtManager(debtManager).processYield(musdAmount);
        }

        emit Harvested(musdAmount, btcAmount, musdAmount);
    }

    /**
     * @notice Get claimable yield from strategy
     * @return claimable0 Claimable amount of token0
     * @return claimable1 Claimable amount of token1
     */
    function getClaimableYield() external view returns (uint256 claimable0, uint256 claimable1) {
        if (strategy == address(0)) {
            return (0, 0);
        }
        return IStrategyBTC(strategy).getClaimableYield();
    }
}

/**
 * @notice Interface for StrategyBTC
 */
interface IStrategyBTC {
    function claimYield() external returns (uint256 claimed0, uint256 claimed1);
    function getClaimableYield() external view returns (uint256, uint256);
}

/**
 * @notice Interface for DebtManager
 */
interface IDebtManager {
    function processYield(uint256 yieldAmount) external;
}

