"""
Unit tests for configuration management
"""

import pytest
from pydantic import ValidationError
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from config import KeeperConfig


def test_config_validates_private_key():
    """Test that private key validation works"""
    # Valid key
    valid_key = "0x" + "a" * 64
    config_dict = {
        "keeper_private_key": valid_key,
    }
    config = KeeperConfig(**config_dict)
    assert config.keeper_private_key == valid_key

    # Invalid: missing 0x prefix
    with pytest.raises(ValidationError):
        KeeperConfig(keeper_private_key="a" * 64)

    # Invalid: wrong length
    with pytest.raises(ValidationError):
        KeeperConfig(keeper_private_key="0xshort")


def test_config_validates_log_level():
    """Test that log level validation works"""
    valid_key = "0x" + "a" * 64

    # Valid levels
    for level in ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]:
        config = KeeperConfig(keeper_private_key=valid_key, log_level=level)
        assert config.log_level == level

    # Case insensitive
    config = KeeperConfig(keeper_private_key=valid_key, log_level="info")
    assert config.log_level == "INFO"

    # Invalid level
    with pytest.raises(ValidationError):
        KeeperConfig(keeper_private_key=valid_key, log_level="INVALID")


def test_config_defaults():
    """Test that default values are set correctly"""
    valid_key = "0x" + "a" * 64
    config = KeeperConfig(keeper_private_key=valid_key)

    assert config.rpc_url == "https://rpc.test.mezo.org"
    assert config.chain_id == 31611
    assert config.harvest_interval_seconds == 3600
    assert config.min_yield_threshold_usd == 10.0
    assert config.enable_prometheus is True
    assert config.dry_run is False


def test_config_slack_validation():
    """Test Slack webhook validation when alerts are enabled"""
    valid_key = "0x" + "a" * 64

    # Should fail if alerts enabled but no webhook
    with pytest.raises(ValidationError):
        KeeperConfig(
            keeper_private_key=valid_key,
            enable_slack_alerts=True,
            slack_webhook_url=None,
        )

    # Should pass if webhook provided
    config = KeeperConfig(
        keeper_private_key=valid_key,
        enable_slack_alerts=True,
        slack_webhook_url="https://hooks.slack.com/services/test",
    )
    assert config.slack_webhook_url is not None

