# Stratum Fi - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies

```bash
cd stratum-contracts
npm install
```

### Step 2: Set Up Environment

Create a `.env` file in the root directory:

```bash
PRIVATE_KEY=your_private_key_here
```

### Step 3: Compile Contracts

```bash
npm run compile
```

You should see:

```
✅ Compiled 16 Solidity files successfully
```

### Step 4: Update Token Addresses

Before deploying, update the token addresses in `ignition/modules/StratumDeploy.ts`:

```typescript
const MEZO_TESTNET_CONFIG = {
  // ... existing addresses ...
  BTC: '0x...', // ⚠️ Update if needed
  MUSD: '0x...', // ⚠️ Update if needed
  MUSDC: '0x...', // ⚠️ Update if needed
  PYTH_ORACLE: '0x...', // ⚠️ Update if needed
};
```

### Step 5: Deploy to Mezo Testnet (using Ignition) ⭐

```bash
npm run deploy:stratum:testnet
```

**Why Ignition?**

- ✅ Resumable deployments (can recover from failures)
- ✅ Better state management
- ✅ Production-ready approach

See [IGNITION_DEPLOYMENT.md](./IGNITION_DEPLOYMENT.md) for details.

You'll see output like:

```
🚀 Starting Stratum Fi deployment...

Network: Mezo Testnet
Chain ID: 7701

Deployer address: 0x...
Deployer balance: 1.234 ETH

📝 Deploying bMUSD...
✅ bMUSD deployed at: 0x...

📝 Deploying DebtManager...
✅ DebtManager deployed at: 0x...

[... more deployment logs ...]

✅ Deployment complete!
```

### Step 6: Fund the Protocol with MUSD

**This is critical!** The protocol needs MUSD reserves:

1. Go to [mezo.org](https://mezo.org) and mint MUSD
2. Transfer MUSD to `StrategyBTC` contract
3. Transfer MUSD to `MockTigrisSwap` contract

```javascript
// Example funding amounts
StrategyBTC: 10 MUSD per expected 0.0001 BTC deposit
MockTigrisSwap: 100 MUSD for Turbo Loop users
```

### Step 7: Test the Protocol

#### As a User

```javascript
const { ethers } = require('hardhat');

async function main() {
  const [user] = await ethers.getSigners();

  // Get contract instances
  const vaultController = await ethers.getContractAt(
    'VaultController',
    VAULT_ADDRESS
  );
  const debtManager = await ethers.getContractAt(
    'DebtManager',
    DEBT_MANAGER_ADDRESS
  );
  const btc = await ethers.getContractAt('IERC20', BTC_ADDRESS);

  // 1. Deposit BTC
  await btc.approve(vaultController.address, ethers.parseEther('1'));
  await vaultController.deposit(ethers.parseEther('1'));
  console.log('✅ Deposited 1 BTC');

  // 2. Check borrowing capacity
  const [maxBorrow, currentDebt, available] =
    await debtManager.getBorrowingCapacity(user.address);
  console.log(`Max borrow: ${ethers.formatEther(maxBorrow)} bMUSD`);

  // 3. Borrow bMUSD
  await debtManager.borrow(ethers.parseEther('50000')); // Borrow $50k
  console.log('✅ Borrowed 50,000 bMUSD');
}

main();
```

#### As a Keeper

```javascript
async function harvest() {
  const harvester = await ethers.getContractAt('Harvester', HARVESTER_ADDRESS);

  // Check claimable yield
  const [claimable0, claimable1] = await harvester.getClaimableYield();
  console.log(`Claimable: ${claimable0} / ${claimable1}`);

  // Harvest if profitable
  if (claimable0 > 0 || claimable1 > 0) {
    await harvester.harvest();
    console.log('✅ Harvested yield');
  }
}

// Run every hour
setInterval(harvest, 3600000);
```

## 📊 Contract Overview

| Contract        | Purpose              | User Interaction |
| --------------- | -------------------- | ---------------- |
| VaultController | Deposit/withdraw BTC | ✅ Direct        |
| DebtManager     | Borrow/repay bMUSD   | ✅ Direct        |
| TurboLoop       | Leveraged yield      | ✅ Direct        |
| StrategyBTC     | LP management        | ❌ Internal      |
| Harvester       | Yield collection     | ⚠️ Keeper only   |
| MockTigrisSwap  | bMUSD→MUSD swap      | ❌ Internal      |

## 🔍 Verify Deployment

Check that all contracts are properly connected:

```javascript
const debtManager = await ethers.getContractAt(
  'DebtManager',
  DEBT_MANAGER_ADDRESS
);
const strategyAddress = await debtManager.strategy();
console.log('Strategy connected:', strategyAddress);

const vaultController = await ethers.getContractAt(
  'VaultController',
  VAULT_ADDRESS
);
const vaultStrategy = await vaultController.strategy();
console.log('Vault strategy:', vaultStrategy);

// They should match!
console.log('Connected:', strategyAddress === vaultStrategy);
```

## ⚠️ Common Issues

### Issue: "Insufficient MUSD reserve"

**Solution**: Fund StrategyBTC with more MUSD

### Issue: "Exceeds LTV ratio"

**Solution**: Borrow less or deposit more BTC (max 50% LTV)

### Issue: "Only debt manager can mint"

**Solution**: Ensure DebtManager is set in bMUSD contract

### Issue: "Strategy not set"

**Solution**: Run the deployment script completely (sets all relationships)

## 📚 Next Steps

1. ✅ Deploy contracts
2. ✅ Fund with MUSD
3. ✅ Test basic flow
4. 🔄 Set up keeper bot
5. 🔄 Monitor LP positions
6. 🔄 Track yield generation

## 🆘 Need Help?

- Check the main [README_STRATUM.md](./README_STRATUM.md)
- Review contract code in `contracts/`
- Examine deployment script in `scripts/deploy-stratum.ts`

---

**Built for Mezo Hackathon** 🏆
