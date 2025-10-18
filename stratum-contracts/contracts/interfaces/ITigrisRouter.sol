// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title ITigrisRouter
 * @notice Interface for Tigris DEX Router
 * @dev Based on Mezo Pools documentation: https://mezo.org/docs/developers/features/mezo-pools
 * Router Address: 0x16A76d3cd3C1e3CE843C6680d6B37E9116b5C706 (Mainnet)
 */
interface ITigrisRouter {
    /**
     * @notice Swap exact tokens for tokens
     * @param amountIn The amount of input tokens to send
     * @param amountOutMin The minimum amount of output tokens that must be received
     * @param path An array of token addresses representing the swap path
     * @param to Recipient of the output tokens
     * @param deadline Unix timestamp after which the transaction will revert
     * @return amounts The amounts of tokens received at each step of the swap
     */
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);

    /**
     * @notice Add liquidity to a pool
     * @param tokenA The address of the first token
     * @param tokenB The address of the second token
     * @param stable Whether this is a stable pair (constant sum) or volatile (constant product)
     * @param amountADesired The amount of tokenA to add as liquidity
     * @param amountBDesired The amount of tokenB to add as liquidity
     * @param amountAMin The minimum amount of tokenA to add
     * @param amountBMin The minimum amount of tokenB to add
     * @param to Recipient of the liquidity tokens
     * @param deadline Unix timestamp after which the transaction will revert
     * @return amountA The amount of tokenA added
     * @return amountB The amount of tokenB added
     * @return liquidity The amount of liquidity tokens minted
     */
    function addLiquidity(
        address tokenA,
        address tokenB,
        bool stable,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    ) external returns (uint256 amountA, uint256 amountB, uint256 liquidity);

    /**
     * @notice Remove liquidity from a pool
     * @param tokenA The address of the first token
     * @param tokenB The address of the second token
     * @param liquidity The amount of liquidity tokens to remove
     * @param amountAMin The minimum amount of tokenA to receive
     * @param amountBMin The minimum amount of tokenB to receive
     * @param to Recipient of the underlying tokens
     * @param deadline Unix timestamp after which the transaction will revert
     * @return amountA The amount of tokenA received
     * @return amountB The amount of tokenB received
     */
    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint256 liquidity,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    ) external returns (uint256 amountA, uint256 amountB);

    /**
     * @notice Get reserves for a token pair
     * @param tokenA The address of the first token
     * @param tokenB The address of the second token
     * @return reserveA The reserve of tokenA
     * @return reserveB The reserve of tokenB
     */
    function getReserves(
        address tokenA,
        address tokenB
    ) external view returns (uint256 reserveA, uint256 reserveB);
}

