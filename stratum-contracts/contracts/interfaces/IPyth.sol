// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title IPyth
 * @notice Interface for Pyth Network Oracle
 * @dev Simplified interface for price feeds
 */
interface IPyth {
    struct Price {
        int64 price;
        uint64 conf;
        int32 expo;
        uint256 publishTime;
    }

    struct PriceFeed {
        bytes32 id;
        Price price;
        Price emaPrice;
    }

    /**
     * @notice Get the price feed for a given price ID
     * @param id The price feed ID
     * @return priceFeed The price feed data
     */
    function getPriceUnsafe(bytes32 id) external view returns (Price memory);

    /**
     * @notice Get the latest price, ensuring it's recent enough
     * @param id The price feed ID
     * @param age Maximum age of the price in seconds
     * @return price The price data
     */
    function getPriceNoOlderThan(
        bytes32 id,
        uint256 age
    ) external view returns (Price memory);

    /**
     * @notice Update price feeds with new data
     * @param updateData The price update data from Pyth
     */
    function updatePriceFeeds(bytes[] calldata updateData) external payable;

    /**
     * @notice Get the fee required to update price feeds
     * @param updateData The price update data
     * @return feeAmount The fee in wei
     */
    function getUpdateFee(
        bytes[] calldata updateData
    ) external view returns (uint256 feeAmount);
}

