# Stratum Fi - Final Architecture

## 🎯 Production System (Fully On-Chain)

Stratum Fi is a **100% on-chain** self-repaying loan protocol on Mezo.

---

## 📦 Smart Contracts (6 Core Contracts)

### 1. **bMUSD.sol** - Synthetic Debt Token

- ERC20 token representing borrowed debt
- Tradeable on Tigris DEX (bMUSD/MUSD pool)
- Only mintable by DebtManager

### 2. **VaultController.sol** - User Entry Point

- Deposits BTC collateral
- Withdrawals (after debt repaid)
- Abstracts LP strategy complexity

### 3. **StrategyBTC.sol** - Primary Yield Source

- Pairs user BTC with protocol MUSD
- Provides liquidity to **Tigris MUSD/BTC pool**
- Earns trading fees → pays down debt
- Claims and distributes yield

### 4. **DebtManager.sol** - Loan Management

- Issues bMUSD loans against collateral
- **Pyth Network oracle** for BTC pricing
- 50% LTV ratio enforcement
- Processes yield for debt repayment

### 5. **Harvester.sol** - Automated Yield Collection

- Claims fees from MUSD/BTC LP position
- Converts all fees to MUSD
- Sends to DebtManager for debt repayment
- Keeper bot compatible

### 6. **TurboLoopReal.sol** - Leveraged Yield Strategy

- Takes borrowed bMUSD + user's MUSD
- Adds to **Tigris bMUSD/MUSD pool** (created by us!)
- Secondary yield source for users
- Claims additional fees
- **Fully on-chain - no mocks!**

### Interfaces (3)

- **IPyth.sol** - Pyth Network oracle
- **ITigrisRouter.sol** - Tigris DEX router
- **ITigrisPool.sol** - Tigris LP pool

---

## 🔄 User Flows

### Standard Self-Repaying Loan

```
1. User deposits 0.0001 BTC
   ↓ VaultController
   ↓ StrategyBTC
   → Tigris: 0.0001 BTC + 1.05 MUSD = LP position

2. User borrows ~4.2 bMUSD (80% LTV)
   ↓ DebtManager checks Pyth oracle
   ↓ Verifies collateral value
   → Mints bMUSD to user

3. Keeper calls harvest() periodically
   ↓ Harvester claims LP fees
   ↓ Converts fees to MUSD
   → DebtManager applies to debt

4. Debt automatically reduces over time!
```

### Turbo Loop (Leveraged Yield)

```
1. User has BTC deposited, bMUSD borrowed

2. User calls turboLoop.loop(bMUSD, MUSD)
   ↓ Transfers bMUSD + MUSD from user
   → Tigris: Adds to bMUSD/MUSD pool
   → Receives LP tokens

3. User now earns from TWO pools:
   - MUSD/BTC pool → pays down debt
   - bMUSD/MUSD pool → extra yield!
```

---

## 🏗️ Key Innovation: bMUSD/MUSD Pool

### Why It's Special

1. **Market Creation** - We created a new Tigris pool for bMUSD trading
2. **Price Discovery** - Enables open market for synthetic debt
3. **Liquidity** - Users can trade bMUSD ↔ MUSD freely
4. **Yield Generation** - Trading fees become additional income
5. **Fully Decentralized** - No trusted intermediaries

### Pool Details

- **Type:** Stable pair (bMUSD pegged to MUSD)
- **Address:** `0xBE911Dc9f7634406547D1453e97E631AA954b89a`
- **Curve:** Constant-sum (stable swap)
- **Fees:** Accrue to LP holders
- **Network:** Mezo Testnet (Chain ID: 31611)

---

## 📊 Deployed Addresses (Mezo Testnet)

```
VaultController:   0x1b4F5dda11c85c2f3fD147aC8c1D2B7B3BD8f47E
DebtManager:       0xAf909A1C824B827fdd17EAbb84c350a90491e887
StrategyBTC:       0x3fffA39983C77933aB74E708B4475995E9540E4F
Harvester:         0x5A296604269470c24290e383C2D34F41B2B375c0
bMUSD:             0xd229BD8f83111F20f09f4f8aC324C4b1E51CC62A
TurboLoopReal:     0xFD53D03c17F2872cf2193005d0F8Ded7d46490DF

Tigris Pools Used:
- MUSD/BTC:        0xd16A5Df82120ED8D626a1a15232bFcE2366d6AA9
- bMUSD/MUSD:      0xBE911Dc9f7634406547D1453e97E631AA954b89a ⭐ Created by us!
```

---

## 🚀 Usage

### Deploy

```bash
npm run deploy          # Deploy to testnet + create pool
npm run deploy:mainnet  # Deploy to mainnet with verification
```

### Setup

```bash
npm run fund            # Fund protocol with MUSD (required once)
npm run setup:pool      # Create and configure bMUSD/MUSD pool
npm run setup:liquidity # Bootstrap pools with liquidity
```

### User Actions

```bash
npm run deposit         # Deposit BTC as collateral
npm run borrow          # Borrow bMUSD
npm run turbo           # Execute leveraged yield strategy
npm run status          # Check your position
```

### Keeper Operations

```bash
npm run harvest         # Collect yield and pay down debt
```

---

## 🔒 Security Features

- ✅ ReentrancyGuard on all state-changing functions
- ✅ Access control (Ownable)
- ✅ Pyth oracle with staleness checks (1 hour max)
- ✅ LTV ratio enforcement (50%)
- ✅ Input validation on all functions
- ✅ Emergency withdrawal functions

---

## 💡 Technical Highlights

### 1. Real Tigris Integration

- Uses actual Tigris factory to create pools
- Interacts with real router for all operations
- No mock contracts in production

### 2. Oracle Integration

- Pyth Network for decentralized price feeds
- BTC/USD price feed with staleness protection
- Graceful handling of testnet update frequency

### 3. Yield Optimization

- Primary yield: MUSD/BTC volatile trading fees
- Secondary yield: bMUSD/MUSD stable trading fees
- Automated harvesting and debt repayment

### 4. Composability

- bMUSD is tradeable ERC20
- Can be used in other DeFi protocols
- LP tokens are standard (stakeable, transferable)

---

## 📈 Comparison: Before vs After

| Aspect             | Original Plan          | Final Implementation    |
| ------------------ | ---------------------- | ----------------------- |
| bMUSD → MUSD swap  | MockTigrisSwap         | ❌ Not needed!          |
| Secondary pool     | MUSD/mUSDC             | ✅ bMUSD/MUSD (better!) |
| Mock contracts     | 2 (MockSwap, MockPool) | ✅ 0 (fully on-chain)   |
| Tigris integration | Partial (mocked)       | ✅ Complete (real)      |
| Market creation    | No                     | ✅ Yes (bMUSD/MUSD)     |

---

## 🎓 For Judges

### Innovation Points

1. **First Self-Repaying Loans on Bitcoin L2**

   - Adapts Alchemix model to Mezo
   - Novel use of Tigris DEX for yield

2. **Created New Market**

   - bMUSD/MUSD pool enables trading
   - Price discovery for synthetic asset
   - Composable with other protocols

3. **Fully Decentralized**

   - No mock contracts
   - No centralized components
   - All operations on-chain

4. **Production Ready**
   - Clean architecture
   - Proper oracle integration
   - Security best practices

### Testnet Challenges Overcome

- ✅ Found correct Tigris router signature (`stable` parameter)
- ✅ Discovered pool creation is permissionless
- ✅ Created workaround for empty mUSDC pool
- ✅ Optimized for testnet oracle update frequency

---

## 📚 File Structure

```
stratum-contracts/
├── contracts/                      # Smart Contracts
│   ├── bMUSD.sol                  # Synthetic debt token
│   ├── DebtManager.sol            # Loan management
│   ├── VaultController.sol        # User interface
│   ├── StrategyBTC.sol            # Primary yield strategy
│   ├── Harvester.sol              # Yield collection
│   ├── TurboLoopReal.sol          # Leveraged yield
│   └── interfaces/                # External interfaces
│       ├── IPyth.sol
│       ├── ITigrisRouter.sol
│       └── ITigrisPool.sol
│
├── scripts/
│   ├── interact/                  # User interaction scripts
│   │   ├── admin-fund-protocol.ts
│   │   ├── 01-deposit-btc.ts
│   │   ├── 02-borrow-bmusd.ts
│   │   ├── 03-turbo-loop-real.ts
│   │   ├── 04-harvest-yield.ts
│   │   └── 05-check-status.ts
│   ├── setup/                     # Deployment setup
│   │   ├── post-deploy-setup.ts
│   │   ├── add-liquidity.ts
│   │   └── bootstrap-bmusd-pool.ts
│   ├── debug/                     # Debug utilities
│   └── archive/                   # Old/deprecated scripts
│
├── ignition/modules/
│   └── StratumDeployFinal.ts      # Production deployment
│
└── docs/                          # Documentation
    ├── README_STRATUM.md
    ├── QUICKSTART.md
    ├── FINAL_ARCHITECTURE.md
    └── DEPLOYMENT_SUMMARY.md
```

---

## 🏆 Hackathon Deliverables

✅ **6 production-ready smart contracts**
✅ **Fully on-chain implementation**
✅ **Created new bMUSD/MUSD market on Tigris**
✅ **Complete user interaction scripts**
✅ **Pyth oracle integration**
✅ **Automated yield harvesting**
✅ **Leveraged yield strategy working**
✅ **Comprehensive documentation**

**No mocks. No shortcuts. Fully decentralized.** 🚀

---

Built with ❤️ for Mezo Hackathon
