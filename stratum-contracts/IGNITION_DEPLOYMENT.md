# Stratum Fi - Hardhat Ignition Deployment Guide

## 🎯 Why Hardhat Ignition?

Hardhat Ignition provides a **declarative, resumable deployment system** that's superior to traditional deployment scripts for production systems.

### Key Benefits

1. **Resumable Deployments** 🔄

   - If deployment fails midway, Ignition can resume from where it stopped
   - No need to redeploy already deployed contracts
   - Saves gas and time

2. **State Management** 💾

   - Tracks deployment state in `.ignition/deployments/`
   - Easy to see what's deployed and what's pending
   - Version controlled deployment history

3. **Modularity** 🧩

   - Can compose multiple modules
   - Reuse deployment logic across networks
   - Test deployments locally before mainnet

4. **Verification** ✅

   - Built-in contract verification support
   - Automatically verifies on Etherscan/block explorers
   - Pass `--verify` flag for automatic verification

5. **Dependencies** 🔗
   - Explicit dependency management between contracts
   - Ensures correct deployment order
   - Clear visualization of contract relationships

---

## 🚀 Quick Start

### Deploy to Mezo Testnet

```bash
npm run deploy:stratum:testnet
```

This will:

1. Deploy all 7 contracts in correct order
2. Set up all contract relationships
3. Save deployment state to `.ignition/deployments/chain-7701/`
4. Create deployment artifacts

### Deploy to Mezo Mainnet (with Verification)

```bash
npm run deploy:stratum:mainnet
```

This will:

1. Deploy to mainnet (chain-1729)
2. Verify all contracts on block explorer
3. Save production deployment state

---

## 📋 Deployment Process

### What Ignition Does Automatically

#### Phase 1: Core Tokens

```
1. Deploy bMUSD
2. Deploy DebtManager (depends on: bMUSD, Pyth, price feed)
```

#### Phase 2: Strategy & Vault

```
3. Deploy StrategyBTC (depends on: BTC, MUSD, Tigris Router, Pool)
4. Deploy VaultController (depends on: BTC)
```

#### Phase 3: Yield & Loop

```
5. Deploy Harvester (depends on: Tigris Router, MUSD, BTC)
6. Deploy MockTigrisSwap (depends on: bMUSD, MUSD)
7. Deploy TurboLoop (depends on: bMUSD, MUSD, mUSDC, Tigris Router)
```

#### Phase 4: Setup Relationships

```
8. bMUSD.setDebtManager(debtManager)
9. DebtManager.setStrategy(strategy)
10. StrategyBTC.setVaultController(vaultController)
11. StrategyBTC.setHarvester(harvester)
12. VaultController.setStrategy(strategy)
13. VaultController.setDebtManager(debtManager)
14. Harvester.setStrategy(strategy)
15. Harvester.setDebtManager(debtManager)
16. TurboLoop.setDebtManager(debtManager)
17. TurboLoop.setMockSwap(mockSwap)
```

---

## 🔍 Deployment Status

### Check Deployment Status

```bash
# See what's been deployed
ls -la .ignition/deployments/

# For testnet (chain-7701)
cat .ignition/deployments/chain-7701/deployed_addresses.json

# For mainnet (chain-1729)
cat .ignition/deployments/chain-1729/deployed_addresses.json
```

### Visualize Deployment

```bash
# Generate deployment visualization
npx hardhat ignition visualize ignition/modules/StratumDeploy.ts
```

---

## 🛠️ Advanced Usage

### Resume Failed Deployment

If deployment fails (e.g., network issues), simply run the same command again:

```bash
npm run deploy:stratum:testnet
```

Ignition will:

- ✅ Skip already deployed contracts
- 🔄 Resume from the failed point
- 💾 Maintain consistent state

### Deploy with Custom Parameters

Create a `parameters.json` file:

```json
{
  "StratumFi": {
    "config": {
      "BTC": "0x...",
      "MUSD": "0x...",
      "MUSDC": "0x...",
      "PYTH_ORACLE": "0x...",
      "TIGRIS_ROUTER": "0x...",
      "MUSD_BTC_POOL": "0x...",
      "MUSD_MUSDC_POOL": "0x...",
      "BTC_PRICE_FEED_ID": "0x..."
    }
  }
}
```

Then deploy with parameters:

```bash
npx hardhat ignition deploy ignition/modules/StratumDeploy.ts \
  --network mezo-testnet \
  --parameters parameters.json
```

### Verify Contracts After Deployment

If you didn't use `--verify` during deployment:

```bash
npx hardhat ignition verify chain-7701
```

---

## 📊 Compare: Ignition vs Traditional Script

| Feature          | Ignition ✅            | Traditional Script   |
| ---------------- | ---------------------- | -------------------- |
| Resumable        | ✅ Yes                 | ❌ No - start over   |
| State Tracking   | ✅ Automatic           | ❌ Manual            |
| Verification     | ✅ Built-in            | ⚠️ Separate step     |
| Modularity       | ✅ Composable          | ❌ Monolithic        |
| Error Recovery   | ✅ Resume from failure | ❌ Redeploy all      |
| Dependency Mgmt  | ✅ Explicit            | ⚠️ Implicit          |
| Production Ready | ✅ Yes                 | ⚠️ Requires care     |
| Testing          | ✅ Can test modules    | ⚠️ Run entire script |

---

## 🐛 Troubleshooting

### Issue: "Module not found"

**Solution**: Make sure you compiled contracts first

```bash
npm run compile
```

### Issue: "Deployment failed at step X"

**Solution**: Check the error, fix it, then run the same command again. Ignition will resume from step X.

### Issue: "Invalid network configuration"

**Solution**: Ensure token addresses are set in `ignition/modules/StratumDeploy.ts`

### Issue: "Transaction underpriced"

**Solution**: Increase gas price in `hardhat.config.ts` for the network

---

## 📁 Deployment Artifacts

After successful deployment, you'll find:

```
.ignition/
└── deployments/
    ├── chain-7701/              # Testnet
    │   ├── deployed_addresses.json    # Contract addresses
    │   ├── journal.jsonl             # Deployment log
    │   └── artifacts/                # Contract artifacts
    └── chain-1729/              # Mainnet
        ├── deployed_addresses.json
        ├── journal.jsonl
        └── artifacts/
```

### Example `deployed_addresses.json`:

```json
{
  "StratumFi#bMUSD": "0x1234...",
  "StratumFi#DebtManager": "0x5678...",
  "StratumFi#StrategyBTC": "0x9abc...",
  "StratumFi#VaultController": "0xdef0...",
  "StratumFi#Harvester": "0x1111...",
  "StratumFi#MockTigrisSwap": "0x2222...",
  "StratumFi#TurboLoop": "0x3333..."
}
```

---

## 🔄 Upgrade Strategy

Hardhat Ignition makes it easy to upgrade or add new contracts:

### Add a New Contract

1. Update `ignition/modules/StratumDeploy.ts`
2. Add new contract deployment
3. Run deployment again - only new contract will deploy

### Deploy New Version

```bash
# Create new module version
ignition/modules/StratumDeployV2.ts

# Deploy v2 (won't redeploy v1 contracts)
npx hardhat ignition deploy ignition/modules/StratumDeployV2.ts --network mezo-testnet
```

---

## 🎓 Best Practices

### 1. Always Test Locally First

```bash
# Start local node
npx hardhat node

# Deploy to local node
npx hardhat ignition deploy ignition/modules/StratumDeploy.ts --network localhost
```

### 2. Use Different Modules for Different Networks

```typescript
// ignition/modules/StratumDeploy.testnet.ts
// ignition/modules/StratumDeploy.mainnet.ts
```

### 3. Version Control Deployment State

```bash
# Commit deployment artifacts
git add .ignition/deployments/
git commit -m "Deploy Stratum Fi to testnet"
```

### 4. Keep Legacy Script for Reference

We've kept the original script as `deploy-stratum.ts` for reference:

```bash
npm run deploy:stratum:testnet:legacy
```

---

## 📚 Further Reading

- [Hardhat Ignition Docs](https://hardhat.org/ignition/docs/getting-started)
- [Deployment Guide](https://hardhat.org/ignition/docs/guides/deploy)
- [Advanced Features](https://hardhat.org/ignition/docs/guides/advanced)

---

## ✅ Summary

**Use Ignition for:**

- ✅ Production deployments
- ✅ Complex multi-contract systems
- ✅ When you need resumability
- ✅ When you need verification

**Use Legacy Script for:**

- ⚠️ Quick prototypes
- ⚠️ Custom deployment logic
- ⚠️ Testing specific scenarios

**For Stratum Fi, Ignition is the recommended approach!** 🎯

---

Built with ❤️ for professional deployment workflows
