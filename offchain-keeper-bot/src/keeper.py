"""
Stratum Fi Keeper Bot - Main harvester logic
Periodically checks claimable yield and executes harvest when thresholds are met
"""

import time
import signal
import sys
from datetime import datetime
from typing import Optional

from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
)
import requests

from config import get_config
from logger import setup_logger, get_contextual_logger
from contracts import ContractManager
from metrics import metrics
from health_check import HealthCheckServer


class KeeperBot:
    """
    Automated keeper bot for Stratum Fi yield harvesting
    """

    def __init__(self):
        """Initialize keeper bot with configuration"""
        self.config = get_config()
        self.logger = setup_logger(
            name="keeper",
            level=self.config.log_level,
            log_file=self.config.log_file,
        )
        self.running = False
        self.harvest_count = 0
        self.last_harvest_time: Optional[datetime] = None
        self.start_time = datetime.now()

        # Initialize metrics server
        if self.config.enable_prometheus:
            metrics.start_server(self.config.prometheus_port)

        # Initialize health check server
        self.health_server = HealthCheckServer(self, port=8080)
        self.health_server.start()

        # Initialize contract manager
        try:
            self.contracts = ContractManager(
                rpc_url=self.config.rpc_url,
                chain_id=self.config.chain_id,
                private_key=self.config.keeper_private_key,
                harvester_address=self.config.harvester_address,
                debt_manager_address=self.config.debt_manager_address,
                strategy_btc_address=self.config.strategy_btc_address,
            )
            metrics.update_rpc_status(True)
        except Exception as e:
            self.logger.error(f"Failed to initialize contract manager: {e}")
            metrics.update_rpc_status(False)
            metrics.record_error("initialization_failed")
            raise

        self.logger.info("Keeper bot initialized successfully")
        self._log_startup_info()

    def _log_startup_info(self):
        """Log startup configuration and contract info"""
        self.logger.info("=" * 60)
        self.logger.info("Stratum Fi Keeper Bot - Starting Up")
        self.logger.info("=" * 60)

        # Config summary
        self.logger.info(f"Harvest Interval: {self.config.harvest_interval_seconds}s")
        self.logger.info(
            f"Min Yield Threshold: ${self.config.min_yield_threshold_usd} USD"
        )
        self.logger.info(f"Max Gas Price: {self.config.max_gas_price_gwei} gwei")
        self.logger.info(f"Dry Run Mode: {self.config.dry_run}")
        self.logger.info(f"Prometheus Enabled: {self.config.enable_prometheus}")

        # Contract info
        contract_info = self.contracts.get_contract_info()
        self.logger.info(f"Harvester: {contract_info['harvester']}")
        self.logger.info(f"DebtManager: {contract_info['debt_manager']}")
        self.logger.info(f"StrategyBTC: {contract_info['strategy_btc']}")
        self.logger.info(f"Keeper Wallet: {contract_info['keeper_wallet']}")

        # Check authorization
        is_authorized = self.contracts.check_keeper_authorization()
        if is_authorized:
            self.logger.info("✅ Keeper wallet is authorized")
        else:
            self.logger.warning("⚠️  Keeper wallet is NOT authorized in Harvester contract!")
            self.logger.warning(
                "Please run: harvester.setKeeper(keeperAddress) as contract owner"
            )

        # Check balance
        balance = self.contracts.get_keeper_balance()
        self.logger.info(f"Keeper Balance: {balance:.6f} BTC")
        metrics.update_keeper_balance(balance)

        if balance < 0.001:
            self.logger.warning(
                "⚠️  Low keeper balance! Ensure wallet has sufficient BTC for gas"
            )

        self.logger.info("=" * 60)

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type(requests.exceptions.RequestException),
    )
    def check_and_harvest(self) -> bool:
        """
        Check claimable yield and execute harvest if thresholds are met

        Returns:
            True if harvest was executed, False otherwise
        """
        cycle_logger = get_contextual_logger(
            self.logger, cycle=self.harvest_count + 1
        )

        try:
            # Check RPC connection
            if not self.contracts.is_connected():
                cycle_logger.error("RPC connection lost")
                metrics.update_rpc_status(False)
                metrics.record_error("rpc_disconnected")
                return False

            metrics.update_rpc_status(True)

            # Check gas price
            gas_price = self.contracts.get_gas_price()
            metrics.update_gas_price(gas_price)

            if gas_price > self.config.max_gas_price_gwei:
                cycle_logger.warning(
                    f"Gas price too high: {gas_price:.2f} gwei "
                    f"(max: {self.config.max_gas_price_gwei} gwei). Skipping harvest."
                )
                metrics.record_harvest_attempt("skipped_high_gas")
                return False

            # Get claimable yield
            claimable0, claimable1 = self.contracts.get_claimable_yield()
            total_yield_usd = self.contracts.estimate_yield_usd(
                claimable0, claimable1
            )
            metrics.update_claimable_yield(total_yield_usd)

            cycle_logger.info(
                f"Claimable yield: {claimable0:.6f} token0, {claimable1:.6f} token1 "
                f"(≈${total_yield_usd:.2f} USD)"
            )

            # Check if yield meets threshold
            if total_yield_usd < self.config.min_yield_threshold_usd:
                cycle_logger.info(
                    f"Yield below threshold (${total_yield_usd:.2f} < "
                    f"${self.config.min_yield_threshold_usd}). Skipping harvest."
                )
                metrics.record_harvest_attempt("skipped_low_yield")
                return False

            # Execute harvest
            cycle_logger.info(
                f"💰 Yield threshold met! Executing harvest "
                f"(${total_yield_usd:.2f} USD, gas: {gas_price:.2f} gwei)"
            )

            start_time = time.time()
            tx_hash = self.contracts.execute_harvest(dry_run=self.config.dry_run)
            duration = time.time() - start_time

            if tx_hash:
                self.harvest_count += 1
                self.last_harvest_time = datetime.now()

                metrics.record_harvest_attempt("success")
                metrics.record_yield_collected(total_yield_usd)
                metrics.record_harvest_duration(duration)
                metrics.update_last_harvest_timestamp(time.time())

                cycle_logger.info(
                    f"✅ Harvest successful! TX: {tx_hash[:10]}... "
                    f"(took {duration:.2f}s)"
                )
                cycle_logger.info(
                    f"View transaction: {self.config.explorer_url}/tx/{tx_hash}"
                )

                # Send alert if configured
                self._send_success_alert(total_yield_usd, tx_hash)

                # Update protocol stats
                self._log_protocol_stats()

                return True
            else:
                cycle_logger.error("Harvest transaction failed")
                metrics.record_harvest_attempt("failed")
                metrics.record_error("harvest_tx_failed")
                self._send_error_alert("Harvest transaction failed")
                return False

        except Exception as e:
            cycle_logger.error(f"Error during harvest cycle: {e}", exc_info=True)
            metrics.record_harvest_attempt("error")
            metrics.record_error("harvest_exception")
            self._send_error_alert(f"Harvest exception: {str(e)}")
            return False

    def _log_protocol_stats(self):
        """Log current protocol statistics after successful harvest"""
        try:
            total_debt = self.contracts.get_total_debt()
            total_btc = self.contracts.get_total_btc_deposited()
            self.logger.info(
                f"📊 Protocol Stats - Total BTC: {total_btc:.4f}, "
                f"Total Debt: {total_debt:.2f} bMUSD"
            )
        except Exception as e:
            self.logger.warning(f"Failed to fetch protocol stats: {e}")

    def _send_success_alert(self, yield_usd: float, tx_hash: str):
        """Send Slack alert on successful harvest"""
        if not self.config.enable_slack_alerts or not self.config.slack_webhook_url:
            return

        try:
            message = {
                "text": f"🌾 Harvest Successful!",
                "blocks": [
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": (
                                f"*Stratum Fi Keeper Bot - Harvest Complete*\n\n"
                                f"• Yield Collected: `${yield_usd:.2f} USD`\n"
                                f"• Transaction: <{self.config.explorer_url}/tx/{tx_hash}|{tx_hash[:10]}...>\n"
                                f"• Timestamp: {datetime.now().isoformat()}"
                            ),
                        },
                    }
                ],
            }
            requests.post(
                self.config.slack_webhook_url, json=message, timeout=5
            )
        except Exception as e:
            self.logger.warning(f"Failed to send Slack alert: {e}")

    def _send_error_alert(self, error_msg: str):
        """Send Slack alert on error"""
        if not self.config.enable_slack_alerts or not self.config.slack_webhook_url:
            return

        try:
            message = {
                "text": f"⚠️ Keeper Bot Error: {error_msg}",
                "blocks": [
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": (
                                f"*Stratum Fi Keeper Bot - Error*\n\n"
                                f"• Error: `{error_msg}`\n"
                                f"• Timestamp: {datetime.now().isoformat()}"
                            ),
                        },
                    }
                ],
            }
            requests.post(
                self.config.slack_webhook_url, json=message, timeout=5
            )
        except Exception as e:
            self.logger.warning(f"Failed to send error alert: {e}")

    def run(self):
        """
        Main keeper loop - run continuously until interrupted
        """
        self.running = True
        self.logger.info("🚀 Keeper bot started. Press Ctrl+C to stop.")

        # Setup signal handlers for graceful shutdown
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)

        while self.running:
            try:
                self.logger.info(
                    f"🔍 Checking harvest conditions... "
                    f"(Cycle #{self.harvest_count + 1})"
                )

                # Execute harvest check
                self.check_and_harvest()

                # Update keeper balance
                balance = self.contracts.get_keeper_balance()
                metrics.update_keeper_balance(balance)

                if balance < 0.0001:
                    self.logger.critical(
                        f"⚠️  CRITICAL: Keeper balance very low ({balance:.6f} BTC). "
                        "Please fund the wallet!"
                    )
                    self._send_error_alert(
                        f"Critical: Keeper balance low ({balance:.6f} BTC)"
                    )

                # Sleep until next cycle
                self.logger.info(
                    f"⏳ Sleeping for {self.config.harvest_interval_seconds}s "
                    f"until next check..."
                )
                time.sleep(self.config.harvest_interval_seconds)

            except KeyboardInterrupt:
                self.logger.info("Keyboard interrupt received. Shutting down...")
                break
            except Exception as e:
                self.logger.error(
                    f"Unexpected error in main loop: {e}", exc_info=True
                )
                metrics.record_error("main_loop_exception")
                # Sleep briefly before retrying
                time.sleep(30)

        self._shutdown()

    def _signal_handler(self, signum, frame):
        """Handle shutdown signals gracefully"""
        self.logger.info(f"Received signal {signum}. Shutting down gracefully...")
        self.running = False

    def _shutdown(self):
        """Cleanup and shutdown"""
        self.logger.info("=" * 60)
        self.logger.info("Keeper Bot Shutdown Summary")
        self.logger.info("=" * 60)
        self.logger.info(f"Total Harvests Executed: {self.harvest_count}")
        if self.last_harvest_time:
            self.logger.info(f"Last Harvest: {self.last_harvest_time.isoformat()}")
        else:
            self.logger.info("Last Harvest: Never")
        self.logger.info("=" * 60)
        
        # Stop health check server
        if hasattr(self, 'health_server'):
            self.health_server.stop()
        
        self.logger.info("Keeper bot stopped. Goodbye! 👋")
        sys.exit(0)


def main():
    """Entry point for keeper bot"""
    print(
        """
    ╔═══════════════════════════════════════════════════════════╗
    ║                                                           ║
    ║        Stratum Fi - Automated Yield Harvester             ║
    ║        Keeper Bot v1.0.0                                  ║
    ║                                                           ║
    ║        Built for Mezo Bitcoin L2                          ║
    ║                                                           ║
    ╚═══════════════════════════════════════════════════════════╝
    """
    )

    try:
        bot = KeeperBot()
        bot.run()
    except Exception as e:
        print(f"❌ Fatal error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()

