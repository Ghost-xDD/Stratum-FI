# Stratum Fi - Self-Repaying Loans on Bitcoin

**Bringing Alchemix-style self-repaying loans to Bitcoin via Mezo**

## 🎯 Overview

Stratum Fi is a decentralized finance protocol that enables users to take loans against their BTC collateral that automatically repay themselves over time through yield generation. Built on [Mezo](https://mezo.org), the protocol leverages Tigris DEX liquidity pools to generate trading fee yield.

### Key Features

- 💰 **Self-Repaying Loans**: Deposit BTC, borrow bMUSD, and watch your debt pay itself down
- 🚀 **Turbo Loop**: Leverage your position with one-click looping into secondary yield sources
- 🔒 **Secure Oracle Integration**: Pyth Network price feeds ensure accurate collateral valuations
- ⚡ **Automated Yield Harvesting**: Set-and-forget yield collection and debt repayment
- 🏦 **Non-Custodial**: You always maintain control of your collateral

## 🏗️ Architecture

### Core Contracts

1. **bMUSD.sol** - Synthetic debt token (ERC20)

   - Represents borrowed debt against BTC collateral
   - Only mintable/burnable by DebtManager

2. **VaultController.sol** - User-facing entry point

   - Handles BTC deposits and withdrawals
   - Abstracts LP strategy complexity

3. **StrategyBTC.sol** - Collateral management

   - Pairs user BTC with protocol MUSD
   - Provides liquidity to Tigris MUSD/BTC pool
   - Claims trading fees as yield

4. **DebtManager.sol** - Loan management

   - Issues loans based on Pyth oracle prices
   - Enforces 50% LTV ratio
   - Processes yield to pay down debt

5. **Harvester.sol** - Automated yield collection

   - Claims fees from LP positions
   - Converts to MUSD and sends to DebtManager
   - Callable by keeper bots

6. **TurboLoop.sol** - Leveraged yield strategy

   - Atomically borrows and loops into secondary LP
   - Enters MUSD/mUSDC pool for additional yield

7. **MockTigrisSwap.sol** - bMUSD→MUSD swap simulation
   - Hackathon-specific solution (Tigris factory is permissioned)
   - Pre-funded with MUSD by protocol

## 🔄 User Flows

### Standard Self-Repaying Loan

```
1. User deposits 1 BTC → VaultController
2. VaultController sends BTC → StrategyBTC
3. StrategyBTC pairs BTC with protocol MUSD → Tigris MUSD/BTC pool
4. User borrows 0.5 BTC worth of bMUSD from DebtManager
5. Keeper calls Harvester.harvest() periodically
6. Trading fees claimed → converted to MUSD → pays down debt
7. Over time, debt reduces to zero automatically
```

### Turbo Loop (Leveraged Yield)

```
1. User deposits BTC and borrows bMUSD (standard flow)
2. User calls TurboLoop.loop(borrowAmount)
3. TurboLoop atomically:
   - Borrows more bMUSD
   - Swaps bMUSD → MUSD (via MockSwap)
   - Swaps half MUSD → mUSDC
   - Provides MUSD/mUSDC liquidity
4. User now earns yield from TWO sources:
   - MUSD/BTC pool (pays down debt)
   - MUSD/mUSDC pool (extra profit)
```

## 📦 Deployment

### Prerequisites

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your PRIVATE_KEY to .env
```

### Deploy to Mezo (using Hardhat Ignition) ⭐

**Recommended approach** - Uses Hardhat Ignition for resumable, production-ready deployments:

```bash
# Deploy to Mezo Testnet
npm run deploy:stratum:testnet

# Deploy to Mezo Mainnet (with automatic verification)
npm run deploy:stratum:mainnet
```

**Benefits:**

- ✅ Resumable if deployment fails
- ✅ State tracking and management
- ✅ Automatic contract verification
- ✅ Production-ready

See [IGNITION_DEPLOYMENT.md](./IGNITION_DEPLOYMENT.md) for complete guide.

### Alternative: Legacy Script Deployment

For custom deployment logic or testing:

```bash
# Deploy to Mezo Testnet
npm run deploy:stratum:testnet:legacy

# Deploy to Mezo Mainnet
npm run deploy:stratum:mainnet:legacy
```

### Post-Deployment Setup

⚠️ **Critical**: The protocol requires manual funding before use:

1. **Mint MUSD** at [mezo.org](https://mezo.org)

2. **Fund StrategyBTC** with MUSD:

   ```solidity
   // Transfer MUSD to StrategyBTC address
   // Amount depends on expected BTC deposits (1:1 ratio based on pool)
   ```

3. **Fund MockTigrisSwap** with MUSD:

   ```solidity
   // Transfer MUSD to MockTigrisSwap address
   // Amount depends on expected Turbo Loop usage
   ```

4. **(Optional) Set Keeper**:
   ```solidity
   Harvester.setKeeper(KEEPER_BOT_ADDRESS);
   ```

## 🔧 Contract Addresses

### Mezo Mainnet

| Contract        | Address                                      |
| --------------- | -------------------------------------------- |
| Router          | `0x16A76d3cd3C1e3CE843C6680d6B37E9116b5C706` |
| MUSD/BTC Pool   | `0x52e604c44417233b6CcEDDDc0d640A405Caacefb` |
| MUSD/mUSDC Pool | `0xEd812AEc0Fecc8fD882Ac3eccC43f3aA80A6c356` |

### Mezo Testnet

| Contract        | Address                                      |
| --------------- | -------------------------------------------- |
| Router          | `0x9a1ff7FE3a0F69959A3fBa1F1e5ee18e1A9CD7E9` |
| MUSD/BTC Pool   | `0xd16A5Df82120ED8D626a1a15232bFcE2366d6AA9` |
| MUSD/mUSDC Pool | `0x525F049A4494dA0a6c87E3C4df55f9929765Dc3e` |

## 💡 Usage Examples

### For Users

```solidity
// 1. Deposit BTC
IERC20(BTC).approve(vaultController, amount);
VaultController.deposit(1 ether); // 1 BTC

// 2. Borrow bMUSD
DebtManager.borrow(50000 * 1e18); // Borrow $50k worth

// 3. (Optional) Turbo Loop
bMUSD.approve(turboLoop, borrowAmount);
TurboLoop.loop(borrowAmount);
```

### For Keepers

```javascript
// Periodically call harvest (e.g., every hour)
const harvester = await ethers.getContractAt('Harvester', HARVESTER_ADDRESS);

// Check if there's claimable yield
const [claimable0, claimable1] = await harvester.getClaimableYield();

if (claimable0 > 0 || claimable1 > 0) {
  await harvester.harvest();
}
```

## 🔒 Security Considerations

### Audits

⚠️ **This is hackathon code** - Not audited, use at your own risk

### Known Limitations

1. **Mock Swap**: bMUSD→MUSD uses a mock contract (Tigris factory is permissioned)
2. **Impermanent Loss**: LP positions subject to IL (not tracked in this version)
3. **Socialized Yield**: Yield pays down oldest debt first (simplified model)
4. **Manual Funding**: Protocol requires pre-funding with MUSD
5. **No Liquidations**: Current version doesn't handle undercollateralized positions

## 📚 References

- [Mezo Documentation](https://mezo.org/docs/developers/)
- [Mezo Pools (Tigris)](https://mezo.org/docs/developers/features/mezo-pools)
- [Pyth Network](https://pyth.network/)
- [Alchemix Finance](https://alchemix.fi/) (inspiration)

## 🛠️ Development

### Compile Contracts

```bash
npx hardhat compile
```

### Run Tests

```bash
npx hardhat test
```

### Type Checking

```bash
npx tsc --noEmit
```

## 🤝 Contributing

This is a hackathon project. For production use:

1. Complete security audits
2. Implement liquidation mechanisms
3. Replace mock swap with real AMM integration
4. Add governance for parameter updates
5. Implement yield distribution strategies

## 📄 License

MIT License

## 🙏 Acknowledgments

- **Mezo** for the Bitcoin L2 infrastructure
- **Alchemix** for pioneering self-repaying loans
- **Pyth Network** for decentralized oracles
- **OpenZeppelin** for battle-tested smart contracts

---

Built with ❤️ for the Mezo Hackathon
