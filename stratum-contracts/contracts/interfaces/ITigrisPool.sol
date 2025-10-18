// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title ITigrisPool
 * @notice Interface for Tigris DEX Liquidity Pool
 * @dev Aerodrome-style AMM pool
 * Pools:
 * - MUSD/BTC: 0x52e604c44417233b6CcEDDDc0d640A405Caacefb (Mainnet)
 * - MUSD/mUSDC: 0xEd812AEc0Fecc8fD882Ac3eccC43f3aA80A6c356 (Mainnet)
 */
interface ITigrisPool {
    /**
     * @notice Get the reserves of the pool
     * @return reserve0 The reserve of token0
     * @return reserve1 The reserve of token1
     * @return blockTimestampLast The timestamp of the last block
     */
    function getReserves()
        external
        view
        returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);

    /**
     * @notice Get token0 address
     */
    function token0() external view returns (address);

    /**
     * @notice Get token1 address
     */
    function token1() external view returns (address);

    /**
     * @notice Get the total supply of LP tokens
     */
    function totalSupply() external view returns (uint256);

    /**
     * @notice Get the LP token balance of an account
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @notice Claim accumulated fees for an LP position
     * @return claimed0 Amount of token0 claimed
     * @return claimed1 Amount of token1 claimed
     */
    function claimFees() external returns (uint256 claimed0, uint256 claimed1);

    /**
     * @notice Get claimable fees for an account
     * @param account The address to check
     * @return claimable0 Claimable amount of token0
     * @return claimable1 Claimable amount of token1
     */
    function claimable(
        address account
    ) external view returns (uint256 claimable0, uint256 claimable1);
}

