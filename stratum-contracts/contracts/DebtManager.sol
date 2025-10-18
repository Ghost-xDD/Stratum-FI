// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/IPyth.sol";
import "./bMUSD.sol";

/**
 * @title DebtManager
 * @notice Manages loans, minting, and burning of bMUSD with Pyth oracle integration
 * @dev Core protocol contract for debt management
 */
contract DebtManager is Ownable, ReentrancyGuard {
    /// @notice The bMUSD synthetic token
    bMUSD public immutable bmusd;

    /// @notice The Strategy contract managing collateral
    address public strategy;

    /// @notice Pyth oracle contract
    IPyth public pythOracle;

    /// @notice BTC price feed ID from Pyth
    bytes32 public btcPriceFeedId;

    /// @notice Maximum allowed price age (1 hour for testnet)
    uint256 public constant MAX_PRICE_AGE = 3600;

    /// @notice Loan-to-Value ratio (50% = 5000 basis points)
    uint256 public ltvRatio = 5000;

    /// @notice Basis points denominator (100% = 10000)
    uint256 public constant BASIS_POINTS = 10000;

    /// @notice User debt mapping
    mapping(address => uint256) public userDebt;

    /// @notice Total system debt
    uint256 public totalDebt;

    /// @notice Emitted when a user borrows
    event Borrowed(address indexed user, uint256 amount, uint256 totalDebt);

    /// @notice Emitted when debt is repaid
    event Repaid(address indexed user, uint256 amount, uint256 remainingDebt);

    /// @notice Emitted when yield is processed
    event YieldProcessed(uint256 amount, uint256 totalDebtReduction);

    /// @notice Emitted when strategy is updated
    event StrategyUpdated(address indexed oldStrategy, address indexed newStrategy);

    /// @notice Emitted when LTV ratio is updated
    event LTVRatioUpdated(uint256 oldRatio, uint256 newRatio);

    /**
     * @notice Constructor
     * @param _bmusd The bMUSD token address
     * @param _pythOracle The Pyth oracle address
     * @param _btcPriceFeedId The BTC price feed ID
     */
    constructor(
        address _bmusd,
        address _pythOracle,
        bytes32 _btcPriceFeedId
    ) {
        require(_bmusd != address(0), "Invalid bMUSD address");
        require(_pythOracle != address(0), "Invalid oracle address");
        
        bmusd = bMUSD(_bmusd);
        pythOracle = IPyth(_pythOracle);
        btcPriceFeedId = _btcPriceFeedId;
    }

    /**
     * @notice Set the strategy contract
     * @param _strategy The strategy contract address
     */
    function setStrategy(address _strategy) external onlyOwner {
        require(_strategy != address(0), "Invalid strategy");
        emit StrategyUpdated(strategy, _strategy);
        strategy = _strategy;
    }

    /**
     * @notice Update LTV ratio
     * @param _newLtvRatio The new LTV ratio in basis points
     */
    function setLTVRatio(uint256 _newLtvRatio) external onlyOwner {
        require(_newLtvRatio > 0 && _newLtvRatio < BASIS_POINTS, "Invalid LTV");
        emit LTVRatioUpdated(ltvRatio, _newLtvRatio);
        ltvRatio = _newLtvRatio;
    }

    /**
     * @notice Borrow bMUSD against collateral
     * @param amount The amount of bMUSD to borrow
     */
    function borrow(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        require(strategy != address(0), "Strategy not set");

        // Get BTC price from Pyth oracle
        IPyth.Price memory btcPrice = pythOracle.getPriceNoOlderThan(
            btcPriceFeedId,
            MAX_PRICE_AGE
        );
        require(btcPrice.price > 0, "Invalid BTC price");

        // Get user's collateral value in BTC from strategy
        uint256 collateralBTC = IStrategy(strategy).balanceOf(msg.sender);
        require(collateralBTC > 0, "No collateral");

        // Convert BTC price to uint256 (Pyth price has negative exponent)
        uint256 btcPriceUSD = uint256(uint64(btcPrice.price));
        uint256 priceExponent = uint256(int256(-btcPrice.expo));
        
        // Calculate collateral value in USD
        uint256 collateralValueUSD = (collateralBTC * btcPriceUSD) / (10 ** priceExponent);

        // Calculate maximum borrowable amount (LTV ratio)
        uint256 maxBorrow = (collateralValueUSD * ltvRatio) / BASIS_POINTS;

        // Check if new debt would exceed LTV
        uint256 newDebt = userDebt[msg.sender] + amount;
        require(newDebt <= maxBorrow, "Exceeds LTV ratio");

        // Update debt
        userDebt[msg.sender] = newDebt;
        totalDebt += amount;

        // Mint bMUSD to user
        bmusd.mint(msg.sender, amount);

        emit Borrowed(msg.sender, amount, newDebt);
    }

    /**
     * @notice Repay debt manually
     * @param amount The amount of bMUSD to repay
     */
    function repay(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        require(userDebt[msg.sender] >= amount, "Exceeds debt");

        // Update debt
        userDebt[msg.sender] -= amount;
        totalDebt -= amount;

        // Burn bMUSD from user
        bmusd.burn(msg.sender, amount);

        emit Repaid(msg.sender, amount, userDebt[msg.sender]);
    }

    /**
     * @notice Process yield to pay down debt
     * @dev Called by Harvester contract
     * @param yieldAmount The amount of yield collected (in MUSD equivalent)
     */
    function processYield(uint256 yieldAmount) external {
        require(msg.sender == strategy || msg.sender == owner(), "Unauthorized");
        require(yieldAmount > 0, "Yield must be > 0");

        // For simplicity, apply yield to reduce total debt proportionally
        // In production, this could implement more sophisticated strategies
        uint256 debtReduction = yieldAmount > totalDebt ? totalDebt : yieldAmount;
        
        if (debtReduction > 0) {
            totalDebt -= debtReduction;
            emit YieldProcessed(yieldAmount, debtReduction);
        }
    }

    /**
     * @notice Get user's borrowing capacity
     * @param user The user address
     * @return maxBorrow The maximum amount the user can borrow
     * @return currentDebt The user's current debt
     * @return available The available borrowing capacity
     */
    function getBorrowingCapacity(
        address user
    ) external view returns (uint256 maxBorrow, uint256 currentDebt, uint256 available) {
        if (strategy == address(0)) {
            return (0, userDebt[user], 0);
        }

        // Get BTC price
        IPyth.Price memory btcPrice = pythOracle.getPriceUnsafe(btcPriceFeedId);
        if (btcPrice.price <= 0) {
            return (0, userDebt[user], 0);
        }

        // Get collateral
        uint256 collateralBTC = IStrategy(strategy).balanceOf(user);
        
        // Calculate USD value
        uint256 btcPriceUSD = uint256(uint64(btcPrice.price));
        uint256 priceExponent = uint256(int256(-btcPrice.expo));
        uint256 collateralValueUSD = (collateralBTC * btcPriceUSD) / (10 ** priceExponent);

        // Calculate max borrow
        maxBorrow = (collateralValueUSD * ltvRatio) / BASIS_POINTS;
        currentDebt = userDebt[user];
        available = maxBorrow > currentDebt ? maxBorrow - currentDebt : 0;
    }
}

/**
 * @notice Interface for Strategy contract
 */
interface IStrategy {
    function balanceOf(address user) external view returns (uint256);
}

