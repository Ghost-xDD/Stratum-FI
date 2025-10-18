// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/ITigrisRouter.sol";
import "./interfaces/ITigrisPool.sol";

/**
 * @title StrategyBTC
 * @notice Manages BTC collateral by providing liquidity to Tigris MUSD/BTC pool
 * @dev Pairs user BTC with protocol-owned MUSD to earn trading fees
 */
contract StrategyBTC is Ownable, ReentrancyGuard {
    /// @notice BTC token address
    IERC20 public immutable btc;

    /// @notice MUSD token address
    IERC20 public immutable musd;

    /// @notice Tigris Router
    ITigrisRouter public immutable tigrisRouter;

    /// @notice Tigris MUSD/BTC Pool
    ITigrisPool public immutable musdBtcPool;

    /// @notice Vault Controller address
    address public vaultController;

    /// @notice Harvester address
    address public harvester;

    /// @notice User collateral tracking (in BTC)
    mapping(address => uint256) public userCollateral;

    /// @notice Total BTC deposited
    uint256 public totalBTCDeposited;

    /// @notice LP tokens owned by this contract
    uint256 public totalLPTokens;

    /// @notice Emitted when BTC is invested into LP
    event Invested(address indexed user, uint256 btcAmount, uint256 musdAmount, uint256 lpTokens);

    /// @notice Emitted when yield is claimed
    event YieldClaimed(uint256 token0Amount, uint256 token1Amount);

    /// @notice Emitted when vault controller is set
    event VaultControllerSet(address indexed controller);

    /// @notice Emitted when harvester is set
    event HarvesterSet(address indexed harvester);

    /**
     * @notice Constructor
     * @param _btc BTC token address
     * @param _musd MUSD token address
     * @param _tigrisRouter Tigris Router address
     * @param _musdBtcPool MUSD/BTC Pool address
     */
    constructor(
        address _btc,
        address _musd,
        address _tigrisRouter,
        address _musdBtcPool
    ) {
        require(_btc != address(0), "Invalid BTC address");
        require(_musd != address(0), "Invalid MUSD address");
        require(_tigrisRouter != address(0), "Invalid router");
        require(_musdBtcPool != address(0), "Invalid pool");

        btc = IERC20(_btc);
        musd = IERC20(_musd);
        tigrisRouter = ITigrisRouter(_tigrisRouter);
        musdBtcPool = ITigrisPool(_musdBtcPool);

        // Approve router to spend tokens
        btc.approve(_tigrisRouter, type(uint256).max);
        musd.approve(_tigrisRouter, type(uint256).max);
    }

    /**
     * @notice Set vault controller
     * @param _vaultController The vault controller address
     */
    function setVaultController(address _vaultController) external onlyOwner {
        require(_vaultController != address(0), "Invalid controller");
        vaultController = _vaultController;
        emit VaultControllerSet(_vaultController);
    }

    /**
     * @notice Set harvester
     * @param _harvester The harvester address
     */
    function setHarvester(address _harvester) external onlyOwner {
        require(_harvester != address(0), "Invalid harvester");
        harvester = _harvester;
        emit HarvesterSet(_harvester);
    }

    /**
     * @notice Invest BTC by pairing with MUSD in Tigris pool
     * @param amount The amount of BTC to invest
     * @param user The user who owns this collateral
     */
    function invest(uint256 amount, address user) external nonReentrant {
        require(msg.sender == vaultController, "Only vault controller");
        require(amount > 0, "Amount must be > 0");

        // Transfer BTC from vault controller
        btc.transferFrom(msg.sender, address(this), amount);

        // Calculate MUSD needed (get ratio from pool reserves)
        (uint112 reserve0, uint112 reserve1, ) = musdBtcPool.getReserves();
        address token0 = musdBtcPool.token0();
        
        uint256 musdAmount;
        if (token0 == address(musd)) {
            // token0 is MUSD, token1 is BTC
            musdAmount = (amount * uint256(reserve0)) / uint256(reserve1);
        } else {
            // token0 is BTC, token1 is MUSD
            musdAmount = (amount * uint256(reserve1)) / uint256(reserve0);
        }

        // Ensure we have enough MUSD
        require(musd.balanceOf(address(this)) >= musdAmount, "Insufficient MUSD reserve");

        // Add liquidity
        (uint256 amountA, uint256 amountB, uint256 liquidity) = tigrisRouter.addLiquidity(
            address(btc),
            address(musd),
            false, // volatile pair (BTC/MUSD)
            amount,
            musdAmount,
            (amount * 95) / 100, // 5% slippage
            (musdAmount * 95) / 100,
            address(this),
            block.timestamp + 300
        );

        // Track user collateral
        userCollateral[user] += amountA; // Track BTC amount
        totalBTCDeposited += amountA;
        totalLPTokens += liquidity;

        emit Invested(user, amountA, amountB, liquidity);
    }

    /**
     * @notice Claim accumulated trading fees
     * @dev Called by Harvester
     * @return claimed0 Amount of token0 claimed
     * @return claimed1 Amount of token1 claimed
     */
    function claimYield() external nonReentrant returns (uint256 claimed0, uint256 claimed1) {
        require(msg.sender == harvester || msg.sender == owner(), "Only harvester");

        // Claim fees from pool
        (claimed0, claimed1) = musdBtcPool.claimFees();

        // Transfer claimed fees to harvester
        if (claimed0 > 0) {
            address token0 = musdBtcPool.token0();
            IERC20(token0).transfer(harvester, claimed0);
        }
        if (claimed1 > 0) {
            address token1 = musdBtcPool.token1();
            IERC20(token1).transfer(harvester, claimed1);
        }

        emit YieldClaimed(claimed0, claimed1);
    }

    /**
     * @notice Get user's collateral value in BTC
     * @param user The user address
     * @return The user's BTC collateral
     */
    function balanceOf(address user) external view returns (uint256) {
        return userCollateral[user];
    }

    /**
     * @notice Get claimable yield
     * @return claimable0 Claimable amount of token0
     * @return claimable1 Claimable amount of token1
     */
    function getClaimableYield() external view returns (uint256 claimable0, uint256 claimable1) {
        return musdBtcPool.claimable(address(this));
    }

    /**
     * @notice Withdraw collateral (after debt is repaid)
     * @param amount The amount of BTC to withdraw
     * @param user The user withdrawing
     */
    function withdraw(uint256 amount, address user) external nonReentrant {
        require(msg.sender == vaultController, "Only vault controller");
        require(userCollateral[user] >= amount, "Insufficient collateral");

        // Calculate LP tokens to remove
        uint256 lpToRemove = (amount * totalLPTokens) / totalBTCDeposited;

        // Remove liquidity
        (uint256 btcAmount, uint256 musdAmount) = tigrisRouter.removeLiquidity(
            address(btc),
            address(musd),
            lpToRemove,
            (amount * 95) / 100,
            0, // We keep the MUSD
            address(this),
            block.timestamp + 300
        );

        // Update tracking
        userCollateral[user] -= btcAmount;
        totalBTCDeposited -= btcAmount;
        totalLPTokens -= lpToRemove;

        // Transfer BTC to vault controller (which will send to user)
        btc.transfer(vaultController, btcAmount);
    }

    /**
     * @notice Emergency withdrawal by owner
     * @param token The token to withdraw
     * @param amount The amount to withdraw
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(owner(), amount);
    }

    /**
     * @notice Fund the strategy with MUSD
     * @dev Protocol owner must pre-fund this contract with MUSD
     * @param amount The amount of MUSD to fund
     */
    function fundWithMUSD(uint256 amount) external {
        musd.transferFrom(msg.sender, address(this), amount);
    }
}

