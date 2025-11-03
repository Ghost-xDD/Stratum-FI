"""
Prometheus metrics for Stratum Fi Keeper Bot
Tracks harvest operations, gas usage, yield collected, and system health
"""

from prometheus_client import Counter, Gauge, Histogram, start_http_server
import logging

logger = logging.getLogger("keeper.metrics")


# Harvest Metrics
harvest_attempts_total = Counter(
    "keeper_harvest_attempts_total",
    "Total number of harvest attempts",
    ["status"],  # status: success, failed, skipped
)

harvest_yield_collected_usd = Counter(
    "keeper_harvest_yield_collected_usd_total",
    "Total yield collected in USD equivalent",
)

harvest_gas_used_total = Counter(
    "keeper_harvest_gas_used_total",
    "Total gas consumed by harvest transactions",
)

harvest_duration_seconds = Histogram(
    "keeper_harvest_duration_seconds",
    "Time taken to execute harvest operation",
    buckets=[1, 5, 10, 30, 60, 120, 300],
)

# System Health Metrics
keeper_balance_btc = Gauge(
    "keeper_wallet_balance_btc",
    "Keeper wallet BTC balance",
)

rpc_connection_status = Gauge(
    "keeper_rpc_connection_status",
    "RPC connection status (1=connected, 0=disconnected)",
)

last_successful_harvest_timestamp = Gauge(
    "keeper_last_successful_harvest_timestamp",
    "Unix timestamp of last successful harvest",
)

claimable_yield_usd = Gauge(
    "keeper_claimable_yield_usd",
    "Current claimable yield in USD",
)

gas_price_gwei = Gauge(
    "keeper_gas_price_gwei",
    "Current gas price in gwei",
)

# Error Tracking
errors_total = Counter(
    "keeper_errors_total",
    "Total errors encountered",
    ["error_type"],
)


class MetricsCollector:
    """Wrapper class for metrics operations"""

    def __init__(self, port: int = 8000):
        self.port = port
        self.server_started = False

    def start_server(self):
        """Start Prometheus HTTP server"""
        if not self.server_started:
            try:
                start_http_server(self.port)
                self.server_started = True
                logger.info(f"Prometheus metrics server started on port {self.port}")
            except OSError as e:
                logger.warning(f"Failed to start metrics server: {e}")

    @staticmethod
    def record_harvest_attempt(status: str):
        """Record a harvest attempt with status"""
        harvest_attempts_total.labels(status=status).inc()

    @staticmethod
    def record_yield_collected(amount_usd: float):
        """Record yield collected in USD"""
        harvest_yield_collected_usd.inc(amount_usd)

    @staticmethod
    def record_gas_used(gas_amount: int):
        """Record gas consumed"""
        harvest_gas_used_total.inc(gas_amount)

    @staticmethod
    def record_harvest_duration(duration_seconds: float):
        """Record harvest operation duration"""
        harvest_duration_seconds.observe(duration_seconds)

    @staticmethod
    def update_keeper_balance(balance_btc: float):
        """Update keeper wallet balance gauge"""
        keeper_balance_btc.set(balance_btc)

    @staticmethod
    def update_rpc_status(is_connected: bool):
        """Update RPC connection status"""
        rpc_connection_status.set(1 if is_connected else 0)

    @staticmethod
    def update_last_harvest_timestamp(timestamp: float):
        """Update last successful harvest timestamp"""
        last_successful_harvest_timestamp.set(timestamp)

    @staticmethod
    def update_claimable_yield(amount_usd: float):
        """Update current claimable yield"""
        claimable_yield_usd.set(amount_usd)

    @staticmethod
    def update_gas_price(price_gwei: float):
        """Update current gas price"""
        gas_price_gwei.set(price_gwei)

    @staticmethod
    def record_error(error_type: str):
        """Record an error occurrence"""
        errors_total.labels(error_type=error_type).inc()


# Global metrics instance
metrics = MetricsCollector()

