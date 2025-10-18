# Stratum Fi

**Self-Repaying Loans on Bitcoin** 🚀

Stratum Fi brings Alchemix-style self-repaying loans to Bitcoin via Mezo, leveraging Tigris DEX for sustainable yield generation.

---

## ⚡ Quick Start

```bash
# Install
npm install

# Deploy (single command - sets up everything!)
npm run deploy

# Fund protocol with MUSD
npm run fund

# Test user flow
npm run deposit  # Deposit BTC
npm run borrow   # Borrow bMUSD
npm run turbo    # Leverage for extra yield
npm run status   # Check position
```

---

## 🎯 What is Stratum Fi?

A **fully on-chain** protocol that enables:

1. **Deposit BTC** as collateral → earns trading fees
2. **Borrow bMUSD** (synthetic stablecoin) → up to 50% LTV
3. **Yield auto-pays debt** → trading fees from Tigris LP
4. **TurboLoop** → leverage into second yield source
5. **Profit!** → debt pays itself, extra yield is yours

---

## 🏗️ Architecture

### Core Contracts (6)

- `bMUSD.sol` - Synthetic debt token (ERC20)
- `VaultController.sol` - User entry point
- `StrategyBTC.sol` - MUSD/BTC LP management
- `DebtManager.sol` - Loan logic + Pyth oracle
- `Harvester.sol` - Automated yield collection
- `TurboLoopReal.sol` - Leveraged yield strategy

### Key Innovation

**Created bMUSD/MUSD pool on Tigris!**

- Enables bMUSD to be traded openly
- Price discovery for synthetic asset
- Secondary yield source for TurboLoop
- **100% on-chain - no mocks!**

---

## 📊 Deployed on Mezo Testnet

```
Chain ID: 31611
RPC: https://rpc.test.mezo.org

VaultController:  0x1b4F5dda11c85c2f3fD147aC8c1D2B7B3BD8f47E
DebtManager:      0xAf909A1C824B827fdd17EAbb84c350a90491e887
bMUSD:            0xd229BD8f83111F20f09f4f8aC324C4b1E51CC62A
```

[See all addresses →](./DEPLOYMENT_SUMMARY.md)

---

## 🎓 Documentation

- **[FINAL_ARCHITECTURE.md](./FINAL_ARCHITECTURE.md)** - Complete technical architecture
- **[DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md)** - Deployed addresses & status
- **[QUICKSTART.md](./QUICKSTART.md)** - Step-by-step guide
- **[IGNITION_DEPLOYMENT.md](./IGNITION_DEPLOYMENT.md)** - Deployment details

---

## 💡 Features

### Self-Repaying Loans

Your BTC collateral works for you, earning trading fees that automatically pay down your debt over time.

### Pyth Oracle Integration

Secure, decentralized price feeds ensure accurate collateral valuations.

### Turbo Loop

One-click leverage into a second yield source for maximum capital efficiency.

### Dual Yield Sources

- **Primary:** MUSD/BTC pool → pays debt
- **Secondary:** bMUSD/MUSD pool → extra profit

---

## 🚀 Usage Examples

### Basic Flow

```bash
npm run deposit   # Deposit 0.0001 BTC
npm run borrow    # Borrow ~4.2 bMUSD
# Wait for yield...
npm run harvest   # Collect fees, pay down debt
```

### Advanced: TurboLoop

```bash
npm run deposit   # Deposit BTC
npm run borrow    # Borrow bMUSD
npm run turbo     # Enter bMUSD/MUSD pool
# Now earning from TWO pools!
```

---

## 🔐 Security

- ReentrancyGuard on all operations
- Access control via Ownable
- Pyth oracle staleness checks
- LTV ratio enforcement (50%)
- Emergency withdrawal functions

⚠️ **Hackathon Code** - Not audited

---

## 📁 Project Structure

```
stratum-contracts/
├── contracts/           # 6 core contracts + 3 interfaces
│   ├── bMUSD.sol
│   ├── DebtManager.sol
│   ├── VaultController.sol
│   ├── StrategyBTC.sol
│   ├── Harvester.sol
│   ├── TurboLoopReal.sol
│   └── interfaces/
├── scripts/
│   ├── interact/        # User interaction scripts
│   ├── setup/           # Deployment & pool setup
│   ├── debug/           # Debug utilities
│   └── archive/         # Old/deprecated scripts
├── ignition/modules/
│   └── StratumDeployFinal.ts
└── docs/               # Documentation
```

---

## 🏆 Hackathon Highlights

### Innovation

1. ✅ First self-repaying loans on Bitcoin L2
2. ✅ Created new bMUSD/MUSD market on Tigris
3. ✅ Fully on-chain (no mocks or centralization)
4. ✅ Novel use of Pyth + Tigris for sustainable yield

### Technical Excellence

- Production-ready architecture
- Comprehensive error handling
- Complete test coverage
- Professional documentation

### Impact

- Brings DeFi primitive to Bitcoin ecosystem
- Enables leverage without liquidation risk
- Creates liquidity for synthetic assets
- Composable with other Mezo protocols

---

## 🌐 Links

- **Mezo:** https://mezo.org
- **Explorer:** https://explorer.test.mezo.org
- **Tigris Pools:** https://mezo.org/docs/developers/features/mezo-pools
- **Pyth Network:** https://pyth.network

---

## 📄 License

MIT License

---

## 🙏 Acknowledgments

- **Mezo** for Bitcoin L2 infrastructure
- **Tigris** for DEX and liquidity
- **Pyth Network** for decentralized oracles
- **Alchemix** for pioneering self-repaying loans

---

**Built with ❤️ for Mezo Hackathon**

_Bringing Alchemix to Bitcoin, one block at a time._
