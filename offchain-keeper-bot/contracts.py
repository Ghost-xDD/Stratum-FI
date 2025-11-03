"""
Smart contract interaction layer for Stratum Fi Keeper Bot
Handles Web3 connection and contract method calls
"""

import json
from pathlib import Path
from typing import Dict, Tuple, Optional
from web3 import Web3
from web3.contract import Contract
from web3.exceptions import ContractLogicError
from eth_account import Account
import logging

logger = logging.getLogger("keeper.contracts")


class ContractManager:
    """Manages Web3 connection and smart contract interactions"""

    def __init__(
        self,
        rpc_url: str,
        chain_id: int,
        private_key: str,
        harvester_address: str,
        debt_manager_address: str,
        strategy_btc_address: str,
    ):
        """
        Initialize contract manager

        Args:
            rpc_url: RPC endpoint URL
            chain_id: Network chain ID
            private_key: Keeper wallet private key
            harvester_address: Harvester contract address
            debt_manager_address: DebtManager contract address
            strategy_btc_address: StrategyBTC contract address
        """
        self.rpc_url = rpc_url
        self.chain_id = chain_id
        self.private_key = private_key

        # Initialize Web3
        self.w3 = Web3(Web3.HTTPProvider(rpc_url))
        if not self.w3.is_connected():
            raise ConnectionError(f"Failed to connect to RPC: {rpc_url}")

        # Setup account
        self.account = Account.from_key(private_key)
        self.address = self.account.address

        logger.info(f"Keeper wallet: {self.address}")
        logger.info(f"Connected to chain ID: {self.w3.eth.chain_id}")

        # Load contract ABIs
        self.harvester_abi = self._load_abi("Harvester")
        self.debt_manager_abi = self._load_abi("DebtManager")
        self.strategy_btc_abi = self._load_abi("StrategyBTC")

        # Initialize contracts
        self.harvester = self.w3.eth.contract(
            address=Web3.to_checksum_address(harvester_address),
            abi=self.harvester_abi,
        )
        self.debt_manager = self.w3.eth.contract(
            address=Web3.to_checksum_address(debt_manager_address),
            abi=self.debt_manager_abi,
        )
        self.strategy_btc = self.w3.eth.contract(
            address=Web3.to_checksum_address(strategy_btc_address),
            abi=self.strategy_btc_abi,
        )

        logger.info("Contract instances initialized")

    def _load_abi(self, contract_name: str) -> list:
        """
        Load ABI from frontend abi directory

        Args:
            contract_name: Name of contract (e.g., 'Harvester')

        Returns:
            Contract ABI as list
        """
        # Look for ABI in frontend/stratum-fi/abi/
        abi_path = (
            Path(__file__).parent.parent
            / "frontend"
            / "stratum-fi"
            / "abi"
            / f"{contract_name}.json"
        )

        if not abi_path.exists():
            raise FileNotFoundError(f"ABI not found: {abi_path}")

        with open(abi_path, "r") as f:
            abi_data = json.load(f)
            return abi_data["abi"]

    def is_connected(self) -> bool:
        """Check if Web3 is connected"""
        try:
            self.w3.eth.block_number
            return True
        except Exception:
            return False

    def get_keeper_balance(self) -> float:
        """
        Get keeper wallet BTC balance

        Returns:
            Balance in BTC (as float)
        """
        try:
            balance_wei = self.w3.eth.get_balance(self.address)
            return float(self.w3.from_wei(balance_wei, "ether"))
        except Exception as e:
            logger.error(f"Failed to get keeper balance: {e}")
            return 0.0

    def get_gas_price(self) -> float:
        """
        Get current gas price in gwei

        Returns:
            Gas price in gwei
        """
        try:
            gas_price_wei = self.w3.eth.gas_price
            return float(self.w3.from_wei(gas_price_wei, "gwei"))
        except Exception as e:
            logger.error(f"Failed to get gas price: {e}")
            return 0.0

    def get_claimable_yield(self) -> Tuple[float, float]:
        """
        Query claimable yield from Harvester contract

        Returns:
            Tuple of (claimable0, claimable1) in ETH units
        """
        try:
            result = self.harvester.functions.getClaimableYield().call()
            claimable0 = float(self.w3.from_wei(result[0], "ether"))
            claimable1 = float(self.w3.from_wei(result[1], "ether"))
            logger.debug(f"Claimable yield: {claimable0} token0, {claimable1} token1")
            return claimable0, claimable1
        except ContractLogicError as e:
            logger.warning(f"Contract logic error querying yield: {e}")
            return 0.0, 0.0
        except Exception as e:
            logger.error(f"Failed to get claimable yield: {e}")
            return 0.0, 0.0

    def estimate_yield_usd(self, claimable0: float, claimable1: float) -> float:
        """
        Estimate total yield in USD
        Simplified: assumes both tokens are USD-pegged stablecoins

        Args:
            claimable0: Amount of token0
            claimable1: Amount of token1

        Returns:
            Total yield in USD
        """
        # TODO: Integrate real price oracle (Pyth) for accurate USD conversion
        # For now, assume 1:1 USD peg for MUSD tokens
        return claimable0 + claimable1

    def execute_harvest(self, dry_run: bool = False) -> Optional[str]:
        """
        Execute harvest transaction

        Args:
            dry_run: If True, simulate without sending transaction

        Returns:
            Transaction hash if successful, None otherwise
        """
        try:
            # Build transaction
            nonce = self.w3.eth.get_transaction_count(self.address)
            gas_price = self.w3.eth.gas_price

            # Estimate gas
            try:
                gas_estimate = self.harvester.functions.harvest().estimate_gas(
                    {"from": self.address}
                )
                gas_limit = int(gas_estimate * 1.2)  # Add 20% buffer
            except Exception as e:
                logger.warning(f"Gas estimation failed, using default: {e}")
                gas_limit = 500_000  # Fallback

            tx = self.harvester.functions.harvest().build_transaction(
                {
                    "from": self.address,
                    "nonce": nonce,
                    "gas": gas_limit,
                    "gasPrice": gas_price,
                    "chainId": self.chain_id,
                }
            )

            if dry_run:
                logger.info(
                    f"[DRY RUN] Would send harvest transaction with gas: {gas_limit}"
                )
                return None

            # Sign and send transaction
            signed_tx = self.w3.eth.account.sign_transaction(tx, self.private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
            tx_hash_hex = tx_hash.hex()

            logger.info(f"Harvest transaction sent: {tx_hash_hex}")

            # Wait for receipt
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=180)

            if receipt["status"] == 1:
                logger.info(
                    f"Harvest successful! Gas used: {receipt['gasUsed']}"
                )
                return tx_hash_hex
            else:
                logger.error("Harvest transaction reverted")
                return None

        except ContractLogicError as e:
            logger.error(f"Contract logic error during harvest: {e}")
            return None
        except Exception as e:
            logger.error(f"Failed to execute harvest: {e}")
            return None

    def get_total_debt(self) -> float:
        """
        Get total protocol debt from DebtManager

        Returns:
            Total debt in ETH units
        """
        try:
            total_debt = self.debt_manager.functions.totalDebt().call()
            return float(self.w3.from_wei(total_debt, "ether"))
        except Exception as e:
            logger.error(f"Failed to get total debt: {e}")
            return 0.0

    def get_total_btc_deposited(self) -> float:
        """
        Get total BTC deposited from StrategyBTC

        Returns:
            Total BTC in ETH units
        """
        try:
            total_btc = self.strategy_btc.functions.totalBTCDeposited().call()
            return float(self.w3.from_wei(total_btc, "ether"))
        except Exception as e:
            logger.error(f"Failed to get total BTC deposited: {e}")
            return 0.0

    def check_keeper_authorization(self) -> bool:
        """
        Verify that the keeper address is authorized in Harvester contract

        Returns:
            True if authorized, False otherwise
        """
        try:
            authorized_keeper = self.harvester.functions.keeper().call()
            is_authorized = (
                authorized_keeper.lower() == self.address.lower()
            )
            if not is_authorized:
                logger.warning(
                    f"Keeper not authorized! Contract expects: {authorized_keeper}, "
                    f"but wallet is: {self.address}"
                )
            return is_authorized
        except Exception as e:
            logger.error(f"Failed to check keeper authorization: {e}")
            return False

    def get_contract_info(self) -> Dict[str, str]:
        """
        Get summary of contract addresses and configuration

        Returns:
            Dictionary of contract info
        """
        return {
            "harvester": self.harvester.address,
            "debt_manager": self.debt_manager.address,
            "strategy_btc": self.strategy_btc.address,
            "keeper_wallet": self.address,
            "rpc_url": self.rpc_url,
            "chain_id": str(self.chain_id),
        }

