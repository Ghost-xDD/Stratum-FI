"""
Logging configuration for Stratum Fi Keeper Bot
Provides structured, colorized console output and file logging
"""

import logging
import sys
from pathlib import Path
from typing import Optional

import colorlog


def setup_logger(
    name: str = "keeper",
    level: str = "INFO",
    log_file: Optional[str] = None,
) -> logging.Logger:
    """
    Configure and return a logger instance with both console and file handlers

    Args:
        name: Logger name
        level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_file: Optional path to log file

    Returns:
        Configured logger instance
    """
    logger = logging.getLogger(name)
    logger.setLevel(getattr(logging, level.upper()))
    logger.handlers.clear()  # Remove any existing handlers

    # Console handler with colors
    console_handler = colorlog.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.DEBUG)

    console_formatter = colorlog.ColoredFormatter(
        "%(log_color)s%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
        log_colors={
            "DEBUG": "cyan",
            "INFO": "green",
            "WARNING": "yellow",
            "ERROR": "red",
            "CRITICAL": "red,bg_white",
        },
        secondary_log_colors={},
        style="%",
    )
    console_handler.setFormatter(console_formatter)
    logger.addHandler(console_handler)

    # File handler (if log_file provided)
    if log_file:
        log_path = Path(log_file)
        log_path.parent.mkdir(parents=True, exist_ok=True)

        file_handler = logging.FileHandler(log_file, mode="a")
        file_handler.setLevel(logging.DEBUG)

        file_formatter = logging.Formatter(
            "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
        file_handler.setFormatter(file_formatter)
        logger.addHandler(file_handler)

    return logger


class LoggerAdapter(logging.LoggerAdapter):
    """
    Custom logger adapter that adds contextual information to log messages
    """

    def process(self, msg, kwargs):
        """Add context from self.extra to log message"""
        if self.extra:
            context_str = " | ".join(f"{k}={v}" for k, v in self.extra.items())
            return f"{msg} | {context_str}", kwargs
        return msg, kwargs


def get_contextual_logger(
    base_logger: logging.Logger, **context
) -> LoggerAdapter:
    """
    Create a logger adapter with additional context

    Args:
        base_logger: Base logger instance
        **context: Key-value pairs to include in all log messages

    Returns:
        LoggerAdapter with context
    """
    return LoggerAdapter(base_logger, context)

