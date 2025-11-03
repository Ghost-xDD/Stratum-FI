"""
Configuration management for Stratum Fi Keeper Bot
Uses pydantic-settings for type-safe environment variable loading
"""

from typing import Optional
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class KeeperConfig(BaseSettings):
    """Keeper bot configuration loaded from environment variables"""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Network Configuration
    rpc_url: str = Field(
        default="https://rpc.test.mezo.org",
        description="Mezo RPC endpoint URL",
    )
    chain_id: int = Field(default=31611, description="Mezo Testnet Chain ID")
    explorer_url: str = Field(
        default="https://explorer.test.mezo.org",
        description="Block explorer URL",
    )

    # Keeper Wallet
    keeper_private_key: str = Field(
        ..., description="Private key for keeper wallet (must start with 0x)"
    )

    # Contract Addresses
    harvester_address: str = Field(
        default="0x5A296604269470c24290e383C2D34F41B2B375c0",
        description="Harvester contract address",
    )
    debt_manager_address: str = Field(
        default="0xAf909A1C824B827fdd17EAbb84c350a90491e887",
        description="DebtManager contract address",
    )
    strategy_btc_address: str = Field(
        default="0x3fffA39983C77933aB74E708B4475995E9540E4F",
        description="StrategyBTC contract address",
    )

    # Harvest Configuration
    harvest_interval_seconds: int = Field(
        default=3600, description="Time between harvest checks (seconds)", ge=60
    )
    min_yield_threshold_usd: float = Field(
        default=10.0, description="Minimum yield in USD to trigger harvest", ge=0
    )
    max_gas_price_gwei: float = Field(
        default=50.0, description="Maximum gas price in gwei", ge=0
    )
    dry_run: bool = Field(
        default=False, description="If true, simulate transactions without sending"
    )

    # Monitoring
    enable_prometheus: bool = Field(
        default=True, description="Enable Prometheus metrics endpoint"
    )
    prometheus_port: int = Field(
        default=8000, description="Prometheus metrics server port", ge=1024, le=65535
    )
    enable_slack_alerts: bool = Field(
        default=False, description="Enable Slack webhook alerts"
    )
    slack_webhook_url: Optional[str] = Field(
        default=None, description="Slack webhook URL for alerts"
    )

    # Logging
    log_level: str = Field(
        default="INFO",
        description="Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)",
    )
    log_file: str = Field(
        default="logs/keeper.log", description="Log file path"
    )

    @field_validator("keeper_private_key")
    @classmethod
    def validate_private_key(cls, v: str) -> str:
        """Ensure private key starts with 0x"""
        if not v.startswith("0x"):
            raise ValueError("Private key must start with 0x")
        if len(v) != 66:  # 0x + 64 hex chars
            raise ValueError("Private key must be 66 characters (0x + 64 hex)")
        return v

    @field_validator("log_level")
    @classmethod
    def validate_log_level(cls, v: str) -> str:
        """Ensure log level is valid"""
        valid_levels = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
        v_upper = v.upper()
        if v_upper not in valid_levels:
            raise ValueError(f"Log level must be one of: {', '.join(valid_levels)}")
        return v_upper

    @field_validator("slack_webhook_url")
    @classmethod
    def validate_slack_url(cls, v: Optional[str], info) -> Optional[str]:
        """Validate Slack webhook URL if alerts are enabled"""
        if info.data.get("enable_slack_alerts") and not v:
            raise ValueError("Slack webhook URL required when alerts are enabled")
        return v


# Singleton config instance
_config: Optional[KeeperConfig] = None


def get_config() -> KeeperConfig:
    """Get or create the global configuration instance"""
    global _config
    if _config is None:
        _config = KeeperConfig()
    return _config


def reload_config() -> KeeperConfig:
    """Force reload configuration from environment"""
    global _config
    _config = KeeperConfig()
    return _config

