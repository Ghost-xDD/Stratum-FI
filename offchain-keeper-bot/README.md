# Stratum Fi Keeper Bot

Automated offchain keeper bot for harvesting yield and processing debt repayments on the Stratum Fi protocol.

## Overview

The keeper bot periodically monitors claimable yield from liquidity pools and executes harvest transactions when economically viable, automatically applying yields toward user debt repayment.

### Key Features

- ✅ Automated harvest execution with configurable thresholds
- ✅ Gas price protection and economic viability checks
- ✅ Prometheus metrics and health check endpoints
- ✅ Slack alerts for critical events
- ✅ Graceful error handling and retry logic
- ✅ Docker and systemd deployment support

## Quick Start

```bash
# Setup
make install
make config
# Edit .env with your KEEPER_PRIVATE_KEY

# Run
make run
```

Or manually:

```bash
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # Edit with your config
python main.py
```

See [`docs/QUICKSTART.md`](docs/QUICKSTART.md) for detailed setup instructions.

## Documentation

- **[Quick Start Guide](docs/QUICKSTART.md)** - Get running in 5 minutes
- **[Full Documentation](docs/README.md)** - Architecture, deployment, monitoring, troubleshooting

## Project Structure

```
offchain-keeper-bot/
├── src/                    # Source code
│   ├── __init__.py
│   ├── config.py          # Configuration management
│   ├── contracts.py       # Web3 contract interactions
│   ├── health_check.py    # Health check HTTP server
│   ├── keeper.py          # Main harvest orchestrator
│   ├── logger.py          # Logging setup
│   └── metrics.py         # Prometheus metrics
├── scripts/               # Deployment scripts
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── prometheus.yml
├── docs/                  # Documentation
│   ├── README.md         # Full reference
│   └── QUICKSTART.md     # Quick setup guide
├── tests/                 # Unit tests (TODO)
├── main.py               # Entry point
├── requirements.txt      # Python dependencies
├── .env.example          # Environment template
└── .gitignore

```

## Usage

**Local Development:**

```bash
python main.py
```

**Docker:**

```bash
cd scripts
docker-compose up -d
docker-compose logs -f keeper
```

**Dry Run (Testing):**

```bash
DRY_RUN=true python main.py
```

## Monitoring

- **Prometheus Metrics:** `http://localhost:8000/metrics`
- **Health Check:** `http://localhost:8080/health`
- **Readiness:** `http://localhost:8080/ready`

## Requirements

- Python 3.9+
- Authorized keeper wallet in Harvester contract
- Funded wallet with testnet BTC for gas
- Access to Mezo Testnet RPC

## License

MIT

---

**Built for Stratum Fi on Mezo Bitcoin L2** 🌾
