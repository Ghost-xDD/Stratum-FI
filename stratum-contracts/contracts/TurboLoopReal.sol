// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/ITigrisRouter.sol";
import "./interfaces/ITigrisPool.sol";

/**
 * @title TurboLoopReal
 * @notice Fully on-chain Turbo Loop using real Tigris pools
 * @dev Uses bMUSD/MUSD pool for secondary yield (no mocks!)
 */
contract TurboLoopReal is Ownable, ReentrancyGuard {
    /// @notice Tigris router
    ITigrisRouter public tigrisRouter;

    /// @notice bMUSD/MUSD pool
    ITigrisPool public bmusdMusdPool;
    
    /// @notice Tigris factory
    address public factory;

    /// @notice bMUSD token
    IERC20 public bmusd;

    /// @notice MUSD token
    IERC20 public musd;

    /// @notice Tracking user secondary LP positions
    mapping(address => uint256) public userSecondaryLP;

    /// @notice Emitted when loop is executed
    event LoopExecuted(
        address indexed user,
        uint256 borrowAmount,
        uint256 musdAmount,
        uint256 lpTokens
    );

    /// @notice Emitted when pool is set
    event PoolSet(address indexed pool);

    /**
     * @notice Constructor
     * @param _bmusd bMUSD token address
     * @param _musd MUSD token address
     * @param _tigrisRouter Tigris router address
     * @param _factory Tigris factory address
     */
    constructor(
        address _bmusd,
        address _musd,
        address _tigrisRouter,
        address _factory
    ) {
        require(_bmusd != address(0), "Invalid bMUSD");
        require(_musd != address(0), "Invalid MUSD");
        require(_tigrisRouter != address(0), "Invalid router");
        require(_factory != address(0), "Invalid factory");

        bmusd = IERC20(_bmusd);
        musd = IERC20(_musd);
        tigrisRouter = ITigrisRouter(_tigrisRouter);
        factory = _factory;

        // Approve router for both tokens
        bmusd.approve(_tigrisRouter, type(uint256).max);
        musd.approve(_tigrisRouter, type(uint256).max);
    }
    
    /**
     * @notice Set pool address (call after creating pool on factory)
     * @param _pool The bMUSD/MUSD pool address
     */
    function setPool(address _pool) external onlyOwner {
        require(_pool != address(0), "Invalid pool");
        bmusdMusdPool = ITigrisPool(_pool);
        emit PoolSet(_pool);
    }

    /**
     * @notice Execute the turbo loop strategy
     * @param bmusdAmount Amount of bMUSD to loop (user must have borrowed and approved)
     * @param musdAmount Amount of MUSD to pair with (user must provide)
     */
    function loop(uint256 bmusdAmount, uint256 musdAmount) external nonReentrant {
        require(bmusdAmount > 0, "bMUSD amount must be > 0");
        require(musdAmount > 0, "MUSD amount must be > 0");

        // Step 1: Transfer tokens from user
        bmusd.transferFrom(msg.sender, address(this), bmusdAmount);
        musd.transferFrom(msg.sender, address(this), musdAmount);

        // Step 2: Add liquidity to bMUSD/MUSD pool on Tigris
        // This is a stablecoin pair (bMUSD pegged to MUSD)
        (uint256 amountA, uint256 amountB, uint256 liquidity) = tigrisRouter.addLiquidity(
            address(bmusd),
            address(musd),
            true, // stable pair (both should be 1:1)
            bmusdAmount,
            musdAmount,
            (bmusdAmount * 95) / 100, // 5% slippage
            (musdAmount * 95) / 100,
            address(this), // LP tokens to contract
            block.timestamp + 300
        );

        // Track user's secondary LP position
        userSecondaryLP[msg.sender] += liquidity;

        // Return any unused tokens to user
        if (bmusdAmount > amountA) {
            bmusd.transfer(msg.sender, bmusdAmount - amountA);
        }
        if (musdAmount > amountB) {
            musd.transfer(msg.sender, musdAmount - amountB);
        }

        emit LoopExecuted(msg.sender, bmusdAmount, musdAmount, liquidity);
    }

    /**
     * @notice Claim fees from secondary pool
     * @return claimed0 Amount of token0 fees
     * @return claimed1 Amount of token1 fees
     */
    function claimSecondaryFees() external nonReentrant returns (uint256 claimed0, uint256 claimed1) {
        require(userSecondaryLP[msg.sender] > 0, "No LP position");
        
        // Claim fees from pool
        (claimed0, claimed1) = bmusdMusdPool.claimFees();
        
        // Transfer to user
        if (claimed0 > 0) {
            address token0 = bmusdMusdPool.token0();
            IERC20(token0).transfer(msg.sender, claimed0);
        }
        if (claimed1 > 0) {
            address token1 = bmusdMusdPool.token1();
            IERC20(token1).transfer(msg.sender, claimed1);
        }
    }

    /**
     * @notice Get user's secondary LP balance
     * @param user The user address
     * @return The LP token balance
     */
    function getSecondaryLP(address user) external view returns (uint256) {
        return userSecondaryLP[user];
    }
    
    /**
     * @notice Get claimable fees from secondary pool
     * @return claimable0 Claimable token0
     * @return claimable1 Claimable token1
     */
    function getClaimableSecondaryFees() external view returns (uint256 claimable0, uint256 claimable1) {
        return bmusdMusdPool.claimable(address(this));
    }
}

