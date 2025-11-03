# Stratum Fi Keeper Bot

Automated offchain keeper bot for the Stratum Fi protocol. Periodically harvests yield from liquidity pools and processes it through the DebtManager to automatically repay user loans.

## Overview

The keeper bot monitors claimable yield from the `Harvester` contract and executes harvest transactions when:

1. Claimable yield exceeds the configured USD threshold (default: $10)
2. Gas price is below the maximum limit (default: 50 gwei)
3. The keeper wallet is authorized in the Harvester contract

### Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Keeper Bot Process                     │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────┐      ┌──────────────┐                  │
│  │   Config    │─────▶│   Logger     │                  │
│  │  (Pydantic) │      │ (Colorized)  │                  │
│  └─────────────┘      └──────────────┘                  │
│         │                                                 │
│         ▼                                                 │
│  ┌──────────────────────────────────────┐               │
│  │      ContractManager (Web3)          │               │
│  │  ┌────────────┬─────────────────┐   │               │
│  │  │ Harvester  │  DebtManager    │   │               │
│  │  │ StrategyBTC│  (read-only)    │   │               │
│  │  └────────────┴─────────────────┘   │               │
│  └──────────────────────────────────────┘               │
│         │                                                 │
│         ▼                                                 │
│  ┌──────────────────────────────────────┐               │
│  │       Main Harvest Loop              │               │
│  │  1. Check claimable yield            │               │
│  │  2. Validate gas price               │               │
│  │  3. Execute harvest() if thresholds  │               │
│  │  4. Update metrics                   │               │
│  │  5. Sleep interval                   │               │
│  └──────────────────────────────────────┘               │
│         │                                                 │
│         ▼                                                 │
│  ┌──────────────┬───────────────┐                        │
│  │ Prometheus   │  Health Check │                        │
│  │ Metrics      │  HTTP Server  │                        │
│  │ (port 8000)  │  (port 8080)  │                        │
│  └──────────────┴───────────────┘                        │
│                                                           │
└──────────────────────────────────────────────────────────┘
                        │
                        ▼
              ┌─────────────────────┐
              │   Mezo Testnet RPC  │
              │  Chain ID: 31611    │
              └─────────────────────┘
```

## Features

### Core Functionality

- ✅ **Automated Harvest Execution:** Calls `Harvester.harvest()` when yield thresholds are met
- ✅ **Gas Price Protection:** Skips harvest if gas exceeds configured maximum
- ✅ **Yield Threshold Filtering:** Only harvests when economically viable (avoids wasting gas on small yields)
- ✅ **Retry Logic:** Automatic retry with exponential backoff on transient failures
- ✅ **Dry Run Mode:** Test without sending real transactions

### Monitoring & Observability

- 📊 **Prometheus Metrics:** Export harvest stats, gas usage, yield collected, system health
- 🏥 **Health Check Endpoints:** `/health`, `/ready`, `/metrics` for orchestrator integration
- 📝 **Structured Logging:** Colorized console output + file logging with rotation
- 🔔 **Slack Alerts (Optional):** Notifications on successful harvests and critical errors

### Safety Features

- 🔐 **Authorization Check:** Verifies keeper wallet is authorized before attempting harvest
- ⛽ **Balance Monitoring:** Alerts when keeper wallet balance is low
- 🛡️ **Error Handling:** Graceful degradation on RPC failures, contract errors, network issues
- 🚦 **Graceful Shutdown:** SIGINT/SIGTERM handlers for clean process termination

---

## Installation

### Prerequisites

- Python 3.9 or higher
- pip or poetry
- Access to Mezo Testnet RPC
- Keeper wallet with BTC for gas (recommend 0.01+ BTC)
- Keeper wallet must be authorized in Harvester contract

### Setup

1. **Clone the repository:**

   ```bash
   cd /path/to/alchemix-on-bitcoin/offchain-keeper-bot
   ```

2. **Create virtual environment:**

   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment:**

   ```bash
   cp .env.example .env
   # Edit .env with your keeper private key and settings
   nano .env
   ```

5. **Create logs directory:**
   ```bash
   mkdir -p logs
   ```

---

## Configuration

Edit `.env` file with your settings:

### Required Settings

```env
# Keeper wallet private key (KEEP THIS SECRET!)
KEEPER_PRIVATE_KEY=0x1234567890abcdef...

# RPC endpoint (default: Mezo Testnet)
RPC_URL=https://rpc.test.mezo.org
```

### Optional Settings

```env
# Harvest frequency (seconds)
HARVEST_INTERVAL_SECONDS=3600  # Check every hour

# Only harvest if yield >= this USD value
MIN_YIELD_THRESHOLD_USD=10.0

# Skip harvest if gas > this price (in gwei)
MAX_GAS_PRICE_GWEI=50.0

# Enable test mode (no real transactions)
DRY_RUN=false

# Logging level
LOG_LEVEL=INFO  # DEBUG for verbose output
```

### Monitoring Settings

```env
# Prometheus metrics
ENABLE_PROMETHEUS=true
PROMETHEUS_PORT=8000

# Slack alerts (optional)
ENABLE_SLACK_ALERTS=false
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

---

## Usage

### Running the Bot

**Standard mode (production):**

```bash
python main.py
```

**Dry run mode (test without sending transactions):**

```bash
DRY_RUN=true python main.py
```

**With custom config:**

```bash
LOG_LEVEL=DEBUG HARVEST_INTERVAL_SECONDS=300 python main.py
```

### Running as a Service

**Using systemd (Linux):**

Create `/etc/systemd/system/stratum-keeper.service`:

```ini
[Unit]
Description=Stratum Fi Keeper Bot
After=network.target

[Service]
Type=simple
User=keeper
WorkingDirectory=/path/to/offchain-keeper-bot
Environment="PATH=/path/to/venv/bin"
ExecStart=/path/to/venv/bin/python main.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable stratum-keeper
sudo systemctl start stratum-keeper
sudo systemctl status stratum-keeper
```

View logs:

```bash
sudo journalctl -u stratum-keeper -f
```

**Using Docker:**

See `Dockerfile` for containerized deployment.

---

## Monitoring

### Prometheus Metrics

The bot exposes Prometheus metrics on port 8000 (configurable):

**Available Metrics:**

- `keeper_harvest_attempts_total{status}` - Total harvest attempts by status (success/failed/skipped)
- `keeper_harvest_yield_collected_usd_total` - Cumulative yield collected in USD
- `keeper_harvest_gas_used_total` - Total gas consumed
- `keeper_harvest_duration_seconds` - Histogram of harvest execution times
- `keeper_wallet_balance_btc` - Current keeper wallet balance
- `keeper_rpc_connection_status` - RPC connection health (1=connected, 0=disconnected)
- `keeper_last_successful_harvest_timestamp` - Unix timestamp of last successful harvest
- `keeper_claimable_yield_usd` - Current claimable yield in USD
- `keeper_gas_price_gwei` - Current gas price
- `keeper_errors_total{error_type}` - Error counts by type

**Scrape Configuration (prometheus.yml):**

```yaml
scrape_configs:
  - job_name: 'stratum_keeper'
    static_configs:
      - targets: ['localhost:8000']
    scrape_interval: 30s
```

### Health Check Endpoints

The bot also runs a health check HTTP server on port 8080 (separate from Prometheus):

- **GET /health** - Liveness probe (always returns 200 if process is running)
- **GET /ready** - Readiness probe (returns 200 if keeper is authorized and has balance)
- **GET /metrics** - JSON summary of key metrics

Example:

```bash
curl http://localhost:8080/health
# {"status": "healthy", "timestamp": "2024-11-03T12:34:56.789Z", "uptime_seconds": 3600}

curl http://localhost:8080/ready
# {"ready": true, "rpc_connected": true, "keeper_authorized": true, "keeper_balance_btc": 0.05}
```

### Slack Alerts

Enable Slack notifications for harvest events and critical errors:

1. Create a Slack Incoming Webhook: https://api.slack.com/messaging/webhooks
2. Set environment variables:
   ```env
   ENABLE_SLACK_ALERTS=true
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
   ```

**Alert Types:**

- ✅ Successful harvest (yield amount, transaction hash)
- ❌ Harvest failures (error details)
- ⚠️ Critical balance warnings (keeper wallet low on BTC)

---

## Authorization Setup

**IMPORTANT:** The keeper wallet must be authorized in the Harvester contract before it can execute harvests.

### On Testnet

1. **Connect as contract owner** (the wallet that deployed Harvester)
2. **Call `setKeeper(address)`:**

   ```typescript
   // Using Hardhat
   const harvester = await ethers.getContractAt(
     'Harvester',
     '0x5A296604269470c24290e383C2D34F41B2B375c0'
   );
   await harvester.setKeeper('YOUR_KEEPER_WALLET_ADDRESS');
   ```

3. **Verify authorization:**
   ```typescript
   const keeper = await harvester.keeper();
   console.log('Authorized keeper:', keeper);
   ```

### On Mainnet

Same process, but ensure:

- Keeper wallet has sufficient mainnet BTC for gas
- Use a hardware wallet or secure key management for keeper private key
- Test thoroughly on testnet first

---

## Troubleshooting

### Bot Not Harvesting

**Check 1: Is the keeper authorized?**

```bash
# Look for this in startup logs:
✅ Keeper wallet is authorized
```

If you see `⚠️ Keeper wallet is NOT authorized`, run `harvester.setKeeper(...)` as owner.

**Check 2: Is yield above threshold?**

```bash
# Look for logs like:
Yield below threshold ($5.23 < $10.00). Skipping harvest.
```

Lower `MIN_YIELD_THRESHOLD_USD` or wait for more yield to accumulate.

**Check 3: Is gas price too high?**

```bash
# Look for:
Gas price too high: 75.00 gwei (max: 50.00 gwei). Skipping harvest.
```

Increase `MAX_GAS_PRICE_GWEI` or wait for gas to drop.

**Check 4: Is there claimable yield?**

```bash
# Look for:
Claimable yield: 0.000000 token0, 0.000000 token1 (≈$0.00 USD)
```

If yield is zero, no trades have occurred in the pools yet.

### RPC Connection Issues

If you see `RPC connection lost`:

- Verify `RPC_URL` is correct
- Check network connectivity
- Try alternative RPC endpoints
- Increase retry attempts in code

### Transaction Failures

If harvests fail with contract errors:

- Check that `DebtManager` and `StrategyBTC` are set in Harvester
- Verify pool liquidity exists
- Check contract state on explorer

---

## Deployment Best Practices

### Security

1. **Dedicated Keeper Wallet:**

   - Use a separate wallet for keeper operations
   - Only fund with minimal BTC needed for gas (0.01-0.1 BTC)
   - Never use a wallet that holds user funds

2. **Private Key Management:**

   - Store private key in environment variable or secrets manager
   - Never commit `.env` to version control
   - Use AWS Secrets Manager / HashiCorp Vault in production

3. **Network Security:**
   - Run keeper on a trusted server with firewall rules
   - Limit Prometheus/health check ports to internal network only
   - Use HTTPS for Slack webhooks

### High Availability

1. **Monitor Uptime:**

   - Use `/ready` endpoint for Kubernetes liveness probes
   - Set up alerts if keeper is down for >5 minutes
   - Have a backup keeper ready to activate

2. **Automatic Restart:**

   - Use systemd `Restart=always` or Docker restart policies
   - Implement alerting on repeated restarts (indicates systemic issue)

3. **Gas Management:**
   - Monitor keeper wallet balance via Prometheus metric
   - Set up alerts when balance drops below 0.001 BTC
   - Automate refills or have manual refill procedures

### Performance Tuning

1. **Harvest Interval:**

   - Default: 3600s (1 hour)
   - For high-activity pools: 1800s (30 min)
   - For low-activity: 7200s (2 hours)
   - Balance between timely harvests and unnecessary checks

2. **Yield Threshold:**

   - Set based on gas costs: `MIN_YIELD_THRESHOLD_USD` should be >2x typical gas cost
   - Example: If harvest costs $3 in gas, set threshold to $10+

3. **Gas Price Limit:**
   - Monitor historical gas prices on Mezo
   - Set `MAX_GAS_PRICE_GWEI` to 90th percentile to avoid peak times
   - Can be dynamic if integrated with gas price APIs

---

## Monitoring Dashboard Example

If using Grafana with Prometheus, create a dashboard with:

**Panels:**

1. **Harvest Success Rate** - Ratio of successful to total attempts
2. **Yield Collected Over Time** - Cumulative USD harvested
3. **Gas Consumption** - Total gas used, average per harvest
4. **Keeper Balance** - Line graph showing wallet balance trend
5. **RPC Health** - Binary indicator (green=connected, red=disconnected)
6. **Time Since Last Harvest** - Alert if >24 hours
7. **Claimable Yield** - Current yield waiting to be harvested

**Alerts:**

- Keeper balance < 0.001 BTC
- No successful harvest in 24 hours
- RPC disconnected for >5 minutes
- Error rate spike (>10 errors in 1 hour)

---

## Development

### Running Tests

```bash
# Unit tests (TODO: implement)
pytest tests/

# Integration test with testnet
DRY_RUN=true python keeper.py
```

### Adding New Features

1. **Custom Harvest Conditions:**

   - Edit `check_and_harvest()` in `keeper.py`
   - Add new threshold checks (e.g., time-based, debt-based)

2. **Additional Metrics:**

   - Define in `metrics.py`
   - Record in `keeper.py` or `contracts.py`

3. **Multi-Chain Support:**
   - Extend `config.py` to support multiple networks
   - Initialize multiple `ContractManager` instances
   - Run separate threads per chain

### Code Structure

```
offchain-keeper-bot/
├── config.py           # Configuration management (Pydantic)
├── logger.py           # Logging setup (colorlog)
├── metrics.py          # Prometheus metrics definitions
├── contracts.py        # Web3 contract interactions
├── keeper.py           # Main bot logic and harvest loop
├── health_check.py     # HTTP health check server
├── requirements.txt    # Python dependencies
├── .env.example        # Example environment configuration
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

---

## Example Output

```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║        Stratum Fi - Automated Yield Harvester             ║
║        Keeper Bot v1.0.0                                  ║
║                                                           ║
║        Built for Mezo Bitcoin L2                          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

2024-11-03 14:32:10 | INFO     | keeper | Keeper wallet: 0xABCD...1234
2024-11-03 14:32:10 | INFO     | keeper | Connected to chain ID: 31611
2024-11-03 14:32:10 | INFO     | keeper | Contract instances initialized
2024-11-03 14:32:10 | INFO     | keeper | ============================================================
2024-11-03 14:32:10 | INFO     | keeper | Stratum Fi Keeper Bot - Starting Up
2024-11-03 14:32:10 | INFO     | keeper | ============================================================
2024-11-03 14:32:10 | INFO     | keeper | Harvest Interval: 3600s
2024-11-03 14:32:10 | INFO     | keeper | Min Yield Threshold: $10.0 USD
2024-11-03 14:32:10 | INFO     | keeper | Max Gas Price: 50.0 gwei
2024-11-03 14:32:10 | INFO     | keeper | Dry Run Mode: False
2024-11-03 14:32:10 | INFO     | keeper | Prometheus Enabled: True
2024-11-03 14:32:10 | INFO     | keeper | Harvester: 0x5A296604269470c24290e383C2D34F41B2B375c0
2024-11-03 14:32:10 | INFO     | keeper | DebtManager: 0xAf909A1C824B827fdd17EAbb84c350a90491e887
2024-11-03 14:32:10 | INFO     | keeper | StrategyBTC: 0x3fffA39983C77933aB74E708B4475995E9540E4F
2024-11-03 14:32:10 | INFO     | keeper | Keeper Wallet: 0xABCD...1234
2024-11-03 14:32:10 | INFO     | keeper | ✅ Keeper wallet is authorized
2024-11-03 14:32:10 | INFO     | keeper | Keeper Balance: 0.025000 BTC
2024-11-03 14:32:10 | INFO     | keeper | ============================================================
2024-11-03 14:32:10 | INFO     | keeper.metrics | Prometheus metrics server started on port 8000
2024-11-03 14:32:10 | INFO     | keeper | 🚀 Keeper bot started. Press Ctrl+C to stop.
2024-11-03 14:32:10 | INFO     | keeper | 🔍 Checking harvest conditions... (Cycle #1)
2024-11-03 14:32:11 | INFO     | keeper | Claimable yield: 0.000523 token0, 0.000481 token1 (≈$1.00 USD)
2024-11-03 14:32:11 | INFO     | keeper | Yield below threshold ($1.00 < $10.00). Skipping harvest.
2024-11-03 14:32:11 | INFO     | keeper | ⏳ Sleeping for 3600s until next check...

... (1 hour later) ...

2024-11-03 15:32:11 | INFO     | keeper | 🔍 Checking harvest conditions... (Cycle #2)
2024-11-03 15:32:12 | INFO     | keeper | Claimable yield: 0.005234 token0, 0.004812 token1 (≈$10.05 USD)
2024-11-03 15:32:12 | INFO     | keeper | 💰 Yield threshold met! Executing harvest ($10.05 USD, gas: 12.34 gwei)
2024-11-03 15:32:15 | INFO     | keeper | Harvest transaction sent: 0x08cc6727...
2024-11-03 15:32:25 | INFO     | keeper | ✅ Harvest successful! TX: 0x08cc6727... (took 13.45s)
2024-11-03 15:32:25 | INFO     | keeper | View transaction: https://explorer.test.mezo.org/tx/0x08cc6727cf07567527241033a18f04349899cfbe5c0a426ccc4fdbb7d0052c69
2024-11-03 15:32:25 | INFO     | keeper | 📊 Protocol Stats - Total BTC: 48.1523, Total Debt: 48152.29 bMUSD
2024-11-03 15:32:25 | INFO     | keeper | ⏳ Sleeping for 3600s until next check...
```

---

## FAQ

### Q: How often should I run harvest?

**A:** It depends on pool activity and yield accumulation rate. For Mezo Testnet with moderate activity, **every 1-6 hours** is reasonable. Too frequent wastes gas; too infrequent delays debt repayment.

### Q: What if the keeper bot crashes?

**A:** Users can still harvest manually via the frontend or by calling `harvester.harvest()` directly. The keeper is a convenience, not a critical dependency. Set up systemd or Docker restarts to auto-recover.

### Q: Can I run multiple keepers?

**A:** Yes, but only one keeper address can be authorized in the Harvester contract at a time. If multiple keepers try to harvest simultaneously, only the first transaction will succeed; others will revert. For redundancy, use a hot-standby pattern with a monitoring script that switches authorization if primary fails.

### Q: How much does each harvest cost?

**A:** Gas costs on Mezo Testnet are low (~0.0001-0.001 BTC per harvest). On mainnet, monitor gas prices and set `MAX_GAS_PRICE_GWEI` accordingly. The `MIN_YIELD_THRESHOLD_USD` should always exceed 2-3x the expected gas cost to remain profitable.

### Q: What happens if harvest fails mid-transaction?

**A:** The `harvest()` function has `nonReentrant` protection and will revert if any step fails. Yield remains claimable, and the keeper will retry on the next cycle. Failures are logged and tracked in metrics.

### Q: Can I harvest specific pools instead of all at once?

**A:** The current `Harvester.harvest()` implementation claims from all pools and processes all yield. To customize, you'd need to modify the smart contract or deploy a custom harvester. This bot calls the standard `harvest()` function.

---

## Roadmap

- [ ] Add unit tests with pytest
- [ ] Implement dynamic gas price strategy (EIP-1559 support)
- [ ] Integrate Pyth oracle for accurate USD yield estimation
- [ ] Multi-chain support (mainnet + testnet simultaneously)
- [ ] Web dashboard for keeper management
- [ ] Telegram bot integration for mobile alerts
- [ ] Automated keeper balance top-up via bridge
- [ ] Historical harvest analytics and reporting

---

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

---

## License

MIT License - see LICENSE file for details

---

## Support

For issues or questions:

- GitHub Issues: [Link to repo]
- Discord: [Link to Stratum Fi community]
- Email: team@stratumfi.xyz

---

**Built with ❤️ for the Stratum Fi protocol on Mezo Bitcoin L2**
