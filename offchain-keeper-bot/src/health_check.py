"""
Health check endpoint for monitoring keeper bot liveness
Can be used by orchestrators (Docker, K8s) to verify bot health
"""

import json
from http.server import BaseHTTPRequestHandler, HTTPServer
from datetime import datetime
import threading
import logging

logger = logging.getLogger("keeper.health")


class HealthCheckHandler(BaseHTTPRequestHandler):
    """HTTP handler for health check endpoint"""

    keeper_bot = None  # Will be set by HealthCheckServer

    def do_GET(self):
        """Handle GET requests"""
        if self.path == "/health" or self.path == "/healthz":
            self._handle_health()
        elif self.path == "/ready":
            self._handle_readiness()
        elif self.path == "/metrics":
            self._handle_metrics()
        else:
            self.send_response(404)
            self.end_headers()

    def _handle_health(self):
        """Liveness check - is the bot process running?"""
        status = {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "uptime_seconds": (
                (datetime.now() - self.keeper_bot.start_time).total_seconds()
                if hasattr(self.keeper_bot, "start_time")
                else 0
            ),
        }

        self.send_response(200)
        self.send_header("Content-type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(status).encode())

    def _handle_readiness(self):
        """Readiness check - is the bot ready to harvest?"""
        try:
            is_connected = self.keeper_bot.contracts.is_connected()
            is_authorized = self.keeper_bot.contracts.check_keeper_authorization()
            balance = self.keeper_bot.contracts.get_keeper_balance()

            is_ready = is_connected and is_authorized and balance > 0.0001

            status = {
                "ready": is_ready,
                "rpc_connected": is_connected,
                "keeper_authorized": is_authorized,
                "keeper_balance_btc": balance,
                "timestamp": datetime.utcnow().isoformat(),
            }

            response_code = 200 if is_ready else 503

            self.send_response(response_code)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(status).encode())

        except Exception as e:
            logger.error(f"Readiness check failed: {e}")
            self.send_response(500)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            self.wfile.write(
                json.dumps({"ready": False, "error": str(e)}).encode()
            )

    def _handle_metrics(self):
        """Return basic metrics in JSON format"""
        try:
            metrics_data = {
                "harvests_executed": self.keeper_bot.harvest_count,
                "last_harvest": (
                    self.keeper_bot.last_harvest_time.isoformat()
                    if self.keeper_bot.last_harvest_time
                    else None
                ),
                "keeper_balance_btc": self.keeper_bot.contracts.get_keeper_balance(),
                "rpc_connected": self.keeper_bot.contracts.is_connected(),
                "timestamp": datetime.utcnow().isoformat(),
            }

            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(metrics_data).encode())

        except Exception as e:
            logger.error(f"Metrics endpoint failed: {e}")
            self.send_response(500)
            self.end_headers()

    def log_message(self, format, *args):
        """Override to use our logger instead of printing to stderr"""
        logger.debug(f"{self.address_string()} - {format % args}")


class HealthCheckServer:
    """HTTP server for health checks running in background thread"""

    def __init__(self, keeper_bot, port: int = 8080):
        """
        Initialize health check server

        Args:
            keeper_bot: Reference to KeeperBot instance
            port: HTTP server port
        """
        self.keeper_bot = keeper_bot
        self.port = port
        self.server = None
        self.thread = None

        # Set keeper bot reference in handler
        HealthCheckHandler.keeper_bot = keeper_bot

    def start(self):
        """Start health check server in background thread"""
        self.server = HTTPServer(("0.0.0.0", self.port), HealthCheckHandler)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        logger.info(f"Health check server started on port {self.port}")
        logger.info(f"  - Liveness:  http://0.0.0.0:{self.port}/health")
        logger.info(f"  - Readiness: http://0.0.0.0:{self.port}/ready")
        logger.info(f"  - Metrics:   http://0.0.0.0:{self.port}/metrics")

    def stop(self):
        """Stop health check server"""
        if self.server:
            self.server.shutdown()
            logger.info("Health check server stopped")

