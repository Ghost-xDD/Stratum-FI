# Keeper Bot Quickstart Guide

Get the Stratum Fi keeper bot running in under 5 minutes.

## Prerequisites Checklist

- [ ] Python 3.9+ installed
- [ ] Keeper wallet created with private key
- [ ] Keeper wallet funded with 0.01+ BTC on Mezo Testnet
- [ ] Keeper wallet authorized in Harvester contract (see below)

---

## Step 1: Authorize Keeper Wallet

**Before running the bot**, you must authorize your keeper wallet in the Harvester contract.

### Option A: Using Hardhat Script

```bash
cd ../stratum-contracts

# Create script: scripts/authorize-keeper.ts
npx hardhat run scripts/authorize-keeper.ts --network mezoTestnet
```

Script content:

```typescript
import { ethers } from 'hardhat';

async function main() {
  const harvesterAddress = '0x5A296604269470c24290e383C2D34F41B2B375c0';
  const keeperAddress = 'YOUR_KEEPER_WALLET_ADDRESS'; // From .env

  const harvester = await ethers.getContractAt('Harvester', harvesterAddress);

  console.log('Setting keeper address...');
  const tx = await harvester.setKeeper(keeperAddress);
  await tx.wait();

  console.log('✅ Keeper authorized!');
  console.log(`Keeper: ${await harvester.keeper()}`);
}

main().catch(console.error);
```

### Option B: Using Etherscan/Explorer UI

1. Go to [https://explorer.test.mezo.org/address/0x5A296604269470c24290e383C2D34F41B2B375c0#writeContract](https://explorer.test.mezo.org/address/0x5A296604269470c24290e383C2D34F41B2B375c0#writeContract)
2. Connect wallet (must be contract owner)
3. Call `setKeeper(address _keeper)` with your keeper wallet address
4. Confirm transaction

---

## Step 2: Install & Configure

```bash
# Navigate to keeper bot directory
cd offchain-keeper-bot

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env

# Edit configuration (IMPORTANT: Add your private key!)
nano .env
```

**Minimal `.env` setup:**

```env
KEEPER_PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
MIN_YIELD_THRESHOLD_USD=5.0
HARVEST_INTERVAL_SECONDS=1800
DRY_RUN=false
```

---

## Step 3: Run the Bot

```bash
# Create logs directory
mkdir -p logs

# Start keeper bot
python keeper.py
```

You should see:

```
╔═══════════════════════════════════════════════════════════╗
║        Stratum Fi - Automated Yield Harvester             ║
╚═══════════════════════════════════════════════════════════╝

2024-11-03 14:32:10 | INFO | ✅ Keeper wallet is authorized
2024-11-03 14:32:10 | INFO | Keeper Balance: 0.025000 BTC
2024-11-03 14:32:10 | INFO | 🚀 Keeper bot started.
```

---

## Step 4: Verify It's Working

**Check 1: Monitor logs**

```bash
tail -f logs/keeper.log
```

**Check 2: Query health endpoint**

```bash
curl http://localhost:8080/health
# Should return: {"status": "healthy", ...}
```

**Check 3: View Prometheus metrics**

```bash
curl http://localhost:8000/metrics
# Should return Prometheus format metrics
```

**Check 4: Wait for first harvest**

- Watch logs for "Claimable yield" messages
- If yield < threshold, you'll see "Skipping harvest"
- If yield >= threshold, you'll see "💰 Yield threshold met! Executing harvest"
- Transaction hash will be logged with explorer link

---

## Stopping the Bot

Press **Ctrl+C** or send SIGTERM:

```bash
# Graceful shutdown
kill -TERM $(pgrep -f keeper.py)
```

The bot will log a shutdown summary:

```
Keeper Bot Shutdown Summary
Total Harvests Executed: 3
Last Harvest: 2024-11-03T15:32:25
```

---

## Docker Quickstart

**Build and run with Docker Compose:**

```bash
# Build image
docker-compose build

# Start keeper (and optional Prometheus/Grafana)
docker-compose up -d

# View logs
docker-compose logs -f keeper

# Stop
docker-compose down
```

**Access monitoring:**

- Keeper metrics: http://localhost:8000/metrics
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001 (admin/admin)

---

## Troubleshooting

### "Keeper wallet is NOT authorized"

➡️ Run `harvester.setKeeper(keeperAddress)` as contract owner (see Step 1)

### "Failed to connect to RPC"

➡️ Verify `RPC_URL` in `.env` is correct and reachable:

```bash
curl https://rpc.test.mezo.org -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

### "Yield below threshold"

➡️ Normal behavior. Wait for more trading activity in pools, or lower `MIN_YIELD_THRESHOLD_USD`.

### "Low keeper balance"

➡️ Fund your keeper wallet with more testnet BTC. Get from faucet or bridge.

### "Gas price too high"

➡️ Increase `MAX_GAS_PRICE_GWEI` or wait for gas to drop. Monitor Mezo gas prices on explorer.

---

## Next Steps

1. **Monitor for 24 hours** to ensure stable operation
2. **Set up alerts** via Slack or Prometheus Alertmanager
3. **Review metrics** to optimize `HARVEST_INTERVAL_SECONDS` and `MIN_YIELD_THRESHOLD_USD`
4. **Plan for mainnet** - use hardware wallet or MPC for keeper key management

---

**You're all set! The keeper bot will now automatically harvest yields and process debt repayments for Stratum Fi users. 🌾**
