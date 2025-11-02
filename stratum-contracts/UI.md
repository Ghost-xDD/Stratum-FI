# Stratum Fi - Frontend Architecture & Implementation Guide

## 📋 Executive Summary

Build a modern, intuitive frontend for Stratum Fi - a self-repaying loan protocol on Mezo (Bitcoin L2). The UI should make complex DeFi operations feel simple while showcasing the innovative dual-yield mechanism.

---

## 🎯 Core User Flows

### Flow 1: Basic Self-Repaying Loan (Primary)

```
Landing Page
  ↓
Connect Wallet (Mezo network)
  ↓
Dashboard (shows: 0 BTC deposited, $0 borrowed)
  ↓
"Deposit BTC" → Modal
  - Input: BTC amount
  - Shows: "Your BTC will earn trading fees automatically"
  - Button: "Deposit & Earn"
  ↓
Transaction confirms
  ↓
Dashboard updates (shows BTC in MUSD/BTC LP, earning APR)
  ↓
"Borrow" Button appears
  ↓
"Borrow bMUSD" → Modal
  - Shows: Max borrowable (50% LTV)
  - Slider: 0% - 100% of max
  - Real-time calculation of:
    * Amount to borrow
    * Interest rate (0% - yield pays it!)
    * Estimated time to repay
  - Button: "Borrow bMUSD"
  ↓
Transaction confirms
  ↓
Dashboard shows:
  - Active loan
  - Collateral earning yield
  - Projected debt reduction timeline
  - Real-time yield accrual
```

### Flow 2: Turbo Loop (Advanced)

```
Dashboard (with existing loan)
  ↓
"Turbo" Tab (badge: "Advanced")
  ↓
Turbo Loop Interface
  - Explainer: "Leverage your position for 2x yield"
  - Visual diagram showing:
    * Primary yield → pays debt
    * Secondary yield → your profit

  ⚠️ Prerequisites Check:
  ┌─────────────────────────────┐
  │ You need:                   │
  │ ✓ bMUSD (from borrowing)    │
  │ ✓ MUSD (1:1 ratio)          │
  │                             │
  │ Your balances:              │
  │ bMUSD: 1.06                 │
  │ MUSD: 1,858.97              │
  └─────────────────────────────┘

  If missing MUSD:
  → Show button: "Get MUSD" (links to mezo.org or swap)

  - Input: bMUSD amount to loop
  - Input: MUSD to pair (must match 1:1)
  - Shows expected LP tokens
  - Button: "Activate Turbo Mode" (disabled if missing MUSD)
  ↓
Confirmation Modal
  - Summary: "You're providing X bMUSD + X MUSD"
  - Expected: "~X LP tokens in bMUSD/MUSD pool"
  - Outcome: "Earn ~8.3% APR on top of primary yield"
  - Gas estimate
  ↓
Transaction confirms
  ↓
Dashboard shows BOTH yield sources
  - Chart comparing yields (side by side)
  - Separate tracking for each pool
  - Combined APR display
```

---

## 🎨 UI/UX Design Requirements

### Design System

**Color Palette:**

```
Primary: Bitcoin Orange (#F7931A)
Secondary: Mezo Teal (#02807D)
Success: Green (#10B981)
Warning: Amber (#F59E0B)
Error: Red (#EF4444)
Background: Dark (#0F172A)
Surface: Dark Gray (#1E293B)
Text: White (#F8FAFC)
Muted: Gray (#94A3B8)
```

**Typography:**

```
Headings: Inter Bold, 24-48px
Body: Inter Regular, 14-16px
Numbers: JetBrains Mono (monospace), 16-32px
```

**Components:**

- Glassmorphism cards for stats
- Neon glow effects for active positions
- Smooth animations (Framer Motion)
- Loading states with skeleton screens
- Toast notifications (success/error)

---

## 📱 Page Structure

### 1. Landing Page

```
┌─────────────────────────────────────────┐
│  Header                                 │
│  [Logo] Stratum Fi    [Connect Wallet]  │
├─────────────────────────────────────────┤
│                                         │
│  Hero Section                           │
│  ┌───────────────────────────────────┐  │
│  │  Make Your Bitcoin Work For You   │  │
│  │                                   │  │
│  │  Self-Repaying Loans on Bitcoin   │  │
│  │  Powered by Mezo                  │  │
│  │                                   │  │
│  │  [Get Started →]                  │  │
│  └───────────────────────────────────┘  │
│                                         │
│  Features Grid (3 columns)              │
│  ┌──────┐  ┌──────┐  ┌──────┐          │
│  │ Auto │  │ Zero │  │  2x  │          │
│  │Repay │  │Liq.  │  │Yield │          │
│  └──────┘  └──────┘  └──────┘          │
│                                         │
│  How It Works (4 steps with icons)      │
│  1→ Deposit  2→ Borrow  3→ Earn  4→ Profit │
│                                         │
│  Stats Ticker                           │
│  TVL: $X  |  Active Loans: X  | Avg APR: X% │
│                                         │
│  Footer                                 │
└─────────────────────────────────────────┘
```

### 2. Dashboard (Main App)

```
┌─────────────────────────────────────────────────────────┐
│  Top Bar                                                │
│  [Logo] [Deposit|Borrow|Turbo|Harvest] [0x31..2308] [$] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Your Position Summary                                  │
│  ┌───────────┬───────────┬───────────┬───────────┐     │
│  │ Collateral│   Debt    │ LTV Ratio │   Yield   │     │
│  │  0.0011   │   48.0    │   90%     │  $0.05/day│     │
│  │    BTC    │   bMUSD   │  [████░]  │           │     │
│  └───────────┴───────────┴───────────┴───────────┘     │
│                                                         │
│  Main Action Cards (2 columns)                          │
│  ┌─────────────────────┬─────────────────────┐         │
│  │  Primary Yield      │  Secondary Yield    │         │
│  │  MUSD/BTC Pool      │  bMUSD/MUSD Pool    │         │
│  │                     │                     │         │
│  │  Deposited: 0.0011  │  LP Tokens: 15.06   │         │
│  │  LP Value: $11.55   │  LP Value: $15.06   │         │
│  │  APR: 12.5%         │  APR: 8.3%          │         │
│  │  Fees Earned: $0.03 │  Fees Earned: $0.02 │         │
│  │                     │                     │         │
│  │  [Claim Fees]       │  [Claim Fees]       │         │
│  └─────────────────────┴─────────────────────┘         │
│                                                         │
│  Debt Repayment Timeline                                │
│  ┌─────────────────────────────────────────────┐       │
│  │  Current: $48  →  Est. Paid Off: 180 days  │       │
│  │  [████████░░░░░░░░░░░░] 35% repaid          │       │
│  │                                             │       │
│  │  Day 30:  $40  |  Day 60: $32  |  Day 90: $24│       │
│  └─────────────────────────────────────────────┘       │
│                                                         │
│  Recent Transactions                                    │
│  • Borrowed 42.7 bMUSD - 5 mins ago                    │
│  • Deposited 0.001 BTC - 10 mins ago                   │
│  • Harvested $0.05 yield - 1 hour ago                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 3. Deposit Modal

```
┌───────────────────────────────────┐
│  Deposit BTC                      │
├───────────────────────────────────┤
│                                   │
│  Amount                           │
│  ┌───────────────────────────┐   │
│  │  [___________] BTC        │   │
│  │  ≈ $10.55 USD             │   │
│  └───────────────────────────┘   │
│                                   │
│  Balance: 0.059 BTC  [Max]        │
│                                   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                   │
│  What Happens:                    │
│  ✓ Your BTC enters MUSD/BTC pool  │
│  ✓ Starts earning trading fees    │
│  ✓ Fees auto-pay your debt        │
│  ✓ You can borrow up to 50% LTV   │
│                                   │
│  Expected Annual Yield: ~12.5%    │
│                                   │
│  [Cancel]  [Deposit BTC →]        │
│                                   │
└───────────────────────────────────┘
```

### 4. Borrow Modal

```
┌───────────────────────────────────────┐
│  Borrow bMUSD                         │
├───────────────────────────────────────┤
│                                       │
│  How much do you want to borrow?      │
│                                       │
│  [────────●────────────] 80%          │
│   0%    Max: $5.25    100%            │
│                                       │
│  ┌─────────────────────────────┐     │
│  │  [_________] bMUSD          │     │
│  │  ≈ 4.20 bMUSD               │     │
│  └─────────────────────────────┘     │
│                                       │
│  Loan Terms                           │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  Interest Rate:    0%                 │
│  (Yield pays it!)                     │
│                                       │
│  LTV Ratio:        80%                │
│  Liquidation Risk: None               │
│                                       │
│  Estimated Payoff Time:               │
│  90-180 days (based on current APR)   │
│                                       │
│  Your collateral earns ~12.5% APR     │
│  Debt grows at 0%                     │
│  = Automatic repayment!               │
│                                       │
│  [Cancel]  [Borrow bMUSD →]           │
│                                       │
└───────────────────────────────────────┘
```

### 5. Turbo Loop Modal

```
┌─────────────────────────────────────────────┐
│  🚀 Turbo Mode - Advanced Leverage          │
├─────────────────────────────────────────────┤
│                                             │
│  ⚡ Multiply Your Yield                     │
│                                             │
│  Visual Flow Diagram:                       │
│  ┌────────────────────────────────────┐    │
│  │  Your BTC                          │    │
│  │    ↓                               │    │
│  │  MUSD/BTC Pool ──→ Pays your debt  │    │
│  │    +                               │    │
│  │  bMUSD/MUSD Pool ──→ Extra profit! │    │
│  └────────────────────────────────────┘    │
│                                             │
│  ⚠️ YOU NEED MUSD!                          │
│  Turbo Loop requires you to provide MUSD   │
│  to pair with your bMUSD (1:1 ratio)       │
│                                             │
│  ┌─────────────────────────────────┐       │
│  │ Your MUSD: 1,858.97             │       │
│  │ ✅ Sufficient for Turbo         │       │
│  │                                 │       │
│  │ Don't have MUSD?                │       │
│  │ [Get MUSD →] mezo.org           │       │
│  └─────────────────────────────────┘       │
│                                             │
│  Input Your Amounts:                        │
│  ┌─────────────────────────────────┐       │
│  │ bMUSD: [________] bMUSD         │       │
│  │ Available: 1.06 bMUSD     [Max] │       │
│  └─────────────────────────────────┘       │
│                                             │
│  ┌─────────────────────────────────┐       │
│  │ MUSD:  [________] MUSD          │       │
│  │ (Must match bMUSD 1:1)          │       │
│  │ Balance: 1,858 MUSD       [Max] │       │
│  │ ↑ Auto-fills to match bMUSD     │       │
│  └─────────────────────────────────┘       │
│                                             │
│  What Happens:                              │
│  1. You provide: bMUSD + MUSD              │
│  2. Added to bMUSD/MUSD pool on Tigris     │
│  3. You receive: LP tokens                 │
│  4. Earn: ~8.3% APR in trading fees        │
│                                             │
│  Expected Returns:                          │
│  • LP Tokens: ~2.12                        │
│  • APR: ~8.3%                              │
│  • Daily Earnings: ~$0.02                  │
│  • This is EXTRA yield (debt still repaid) │
│                                             │
│  [Cancel]  [Activate Turbo Mode 🚀]        │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🛠️ Technical Stack

### Frontend Framework

```typescript
Framework: Next.js 14 (App Router)
Language: TypeScript
Styling: Tailwind CSS + shadcn/ui
Animations: Framer Motion
Charts: Recharts or Chart.js
State: Zustand or Context API
```

### Web3 Integration

```typescript
Wallet: RainbowKit or wagmi
Provider: ethers.js v6
Network: Mezo (Chain ID: 31611)
RPC: https://rpc.test.mezo.org

Contract Interaction:
- Import ABIs from compiled contracts
- Use typechain for type-safe contract calls
- Handle transaction states (pending/success/error)
```

### Real-Time Data

```typescript
Polling Strategy:
- User position: Every 10 seconds
- Claimable yield: Every 30 seconds
- Pool APRs: Every 60 seconds
- Protocol stats: Every 60 seconds

Optional: Mezo block listener for instant updates
```

---

## 📊 Key Components to Build

### 1. WalletConnect Component

```typescript
Features:
- Detect if on Mezo network
- Auto-switch if on wrong network
- Show address (truncated) and balance
- Disconnect button
- Avatar/identicon

States:
- Not connected: "Connect Wallet"
- Wrong network: "Switch to Mezo"
- Connected: "0x31..2308 | 0.059 BTC"
```

### 2. Position Card Component

```typescript
Props:
- collateralBTC: BigNumber
- debtBMUSD: BigNumber
- ltvRatio: number (0-100)
- maxBorrow: BigNumber
- yieldAPR: number

Display:
- Large numbers with proper decimals
- Color-coded LTV (green <50%, yellow 50-80%, red >80%)
- Progress bar for LTV
- Tooltip explaining each metric
```

### 3. Yield Tracker Component

```typescript
Features:
- Real-time yield accumulation counter
- Separate tracking for:
  * MUSD/BTC pool yield
  * bMUSD/MUSD pool yield (if in Turbo)
- Visual representation (pie chart or dual bars)
- "Harvest" button when claimable > threshold

Animation:
- Numbers count up smoothly
- Sparkle effect on new yield
```

### 4. Debt Timeline Visualization

```typescript
Features:
- Line chart showing debt over time
- Projection based on current APR
- Markers for milestones (25%, 50%, 75%, 100% repaid)
- Toggle: Optimistic / Conservative / Current APR

Data Points:
- Current debt
- Debt in 30/60/90 days
- Estimated full repayment date
- Total yield earned so far
```

### 5. Transaction Modal Component

```typescript
States:
1. Input - User enters amounts
2. Review - Show summary + gas estimate
3. Signing - "Waiting for signature..."
4. Pending - "Transaction pending..." (with explorer link)
5. Success - "Success!" (confetti animation)
6. Error - "Transaction failed" (with reason)

Features:
- Progress indicator
- Ability to cancel during input/review
- Auto-close on success (3 seconds)
- Retry button on error
```

---

## 🔗 Smart Contract Integration

### Contract Addresses (Testnet)

```typescript
const CONTRACTS = {
  VaultController: '0x1b4F5dda11c85c2f3fD147aC8c1D2B7B3BD8f47E',
  DebtManager: '0xAf909A1C824B827fdd17EAbb84c350a90491e887',
  StrategyBTC: '0x3fffA39983C77933aB74E708B4475995E9540E4F',
  Harvester: '0x5A296604269470c24290e383C2D34F41B2B375c0',
  bMUSD: '0xd229BD8f83111F20f09f4f8aC324C4b1E51CC62A',
  TurboLoop: '0xFD53D03c17F2872cf2193005d0F8Ded7d46490DF',

  // Pools
  MUSD_BTC_POOL: '0xd16A5Df82120ED8D626a1a15232bFcE2366d6AA9',
  BMUSD_MUSD_POOL: '0xBE911Dc9f7634406547D1453e97E631AA954b89a',
};
```

### Key Functions to Call

**Read Functions (No gas):**

```typescript
// Get user position
VaultController.balanceOf(address) → BTC deposited
DebtManager.userDebt(address) → bMUSD borrowed
DebtManager.getBorrowingCapacity(address) → (max, current, available)
TurboLoop.getSecondaryLP(address) → LP tokens
Harvester.getClaimableYield() → (token0, token1)

// Get pool data
StrategyBTC.getClaimableYield() → (claimable0, claimable1)
TigrisPool.getReserves() → (reserve0, reserve1, timestamp)
```

**Write Functions (Require transactions):**

```typescript
// User actions - Basic Flow
BTC.approve(VaultController, amount) → Approval
VaultController.deposit(amount) → Deposit BTC
DebtManager.borrow(amount) → Borrow bMUSD

// User actions - Turbo Loop (requires MUSD!)
bMUSD.approve(TurboLoop, amount) → Approve bMUSD
MUSD.approve(TurboLoop, amount) → Approve MUSD (⚠️ user must have!)
TurboLoop.loop(bmusdAmount, musdAmount) → Enter bMUSD/MUSD LP

// Keeper actions
Harvester.harvest() → Collect yield (anyone can call)
```

### Error Handling

```typescript
Common Errors to Handle:
- "Insufficient MUSD reserve" → Show "Protocol needs funding"
- "Exceeds LTV ratio" → Show "Reduce borrow amount"
- "No collateral" → Redirect to deposit
- "User rejected transaction" → Friendly message
- Network errors → Retry button

Display user-friendly messages:
❌ "Exceeds LTV ratio"
✅ "You can only borrow up to $5.25 with current collateral"
```

---

## 📈 Data Calculations

### APR Calculation

```typescript
// From pool data
const calculateAPR = (fees24h, tvl) => {
  const dailyRate = fees24h / tvl;
  const apr = dailyRate * 365 * 100;
  return apr.toFixed(2);
};

// Estimated from Tigris pool volume
// Or use historical data if available
```

### Debt Repayment Projection

```typescript
const projectDebtRepayment = (
  currentDebt: number,
  collateralValue: number,
  currentAPR: number
) => {
  const dailyYield = (collateralValue * currentAPR) / 365 / 100;
  const daysToRepay = currentDebt / dailyYield;

  const timeline = [];
  let remainingDebt = currentDebt;

  for (let day = 0; day <= daysToRepay; day += 30) {
    remainingDebt -= dailyYield * 30;
    timeline.push({
      day,
      debt: Math.max(0, remainingDebt),
    });
  }

  return {
    daysToRepay: Math.ceil(daysToRepay),
    timeline,
  };
};
```

### LTV Color Coding

```typescript
const getLTVColor = (ltv: number) => {
  if (ltv < 50) return 'text-green-500'; // Safe
  if (ltv < 80) return 'text-yellow-500'; // Warning
  return 'text-red-500'; // Danger
};

const getLTVStatus = (ltv: number) => {
  if (ltv < 50) return 'Healthy';
  if (ltv < 80) return 'Moderate';
  return 'High Risk';
};
```

---

## 🎬 Animations & Micro-interactions

### Loading States

```
Skeleton screens for:
- Position cards (shimmer effect)
- Charts (pulse animation)
- Transaction history (fade in)
```

### Success Animations

```
- Confetti on successful borrow
- Checkmark animation on deposit
- Sparkle on yield claim
- Progress bar fill animation
```

### Hover Effects

```
- Cards lift slightly (transform: translateY(-4px))
- Buttons glow on hover
- Tooltips appear smoothly
- Stats highlight on hover
```

### Number Animations

```typescript
// Use react-countup or similar
<CountUp
  start={0}
  end={currentDebt}
  duration={1.5}
  decimals={2}
  suffix=" bMUSD"
/>
```

---

## 📱 Responsive Design

### Breakpoints

```
Mobile: < 640px (stack everything)
Tablet: 640-1024px (2-column layout)
Desktop: > 1024px (full 3-column dashboard)
```

### Mobile Optimizations

```
- Bottom navigation bar
- Swipeable cards
- Simplified stats (show essentials only)
- Collapsible sections
- One-tap actions
```

---

## 🔔 Notifications System

### Toast Notifications

```typescript
Types:
1. Transaction submitted → Info (blue)
2. Transaction pending → Info with spinner
3. Transaction success → Success (green) with confetti
4. Transaction failed → Error (red) with retry
5. Yield available → Success with "Harvest" CTA
6. Low collateral → Warning

Position:
- Top-right on desktop
- Bottom on mobile
- Auto-dismiss after 5 seconds (except errors)
```

### In-App Alerts

```
Dashboard Banner:
- "Harvest $0.15 in yield now!" (when claimable > $0.10)
- "LTV above 80% - consider reducing debt" (when risky)
- "Welcome! Deposit BTC to get started" (new users)
```

---

## 🧩 Reusable Components Library

### StatCard

```typescript
<StatCard
  label="Collateral"
  value="0.0011 BTC"
  usdValue="$11.55"
  change="+2.3%"
  trend="up"
/>
```

### TokenInput

```typescript
<TokenInput
  token="BTC"
  balance={userBalance}
  value={inputValue}
  onChange={setValue}
  onMax={() => setValue(userBalance)}
  usdValue={calculateUSD(inputValue)}
/>
```

### ProgressBar

```typescript
<ProgressBar
  value={ltvRatio}
  max={100}
  colorStops={[
    { at: 50, color: 'green' },
    { at: 80, color: 'yellow' },
    { at: 100, color: 'red' },
  ]}
/>
```

### TransactionButton

```typescript
<TransactionButton
  onClick={handleDeposit}
  disabled={!amount || amount > balance}
  loading={isPending}
  success={isSuccess}
>
  Deposit BTC
</TransactionButton>

States:
- Default: "Deposit BTC"
- Loading: "Depositing..." (spinner)
- Success: "Deposited!" (checkmark, then reset)
```

---

## 🎯 User Education & Onboarding

### First-Time User Experience

```
1. Landing → Animated explainer video (30 seconds)
2. Connect Wallet → Tooltip: "We'll guide you through"
3. Dashboard → Guided tour (highlight each section)
4. Deposit → Modal with clear explanation
5. Success → Celebration + "What's next?"
```

### Tooltips & Help

```
Every metric should have a tooltip:
- Hover on "LTV" → "Loan-to-Value ratio. Higher = more risky"
- Hover on "APR" → "Annual Percentage Rate from trading fees"
- Hover on "Turbo" → "Leverage for 2x yield sources"

Help icon (?) on complex features:
- Opens detailed explainer
- Link to docs
- Video tutorials
```

### Empty States

```
No collateral:
  ┌─────────────────────────────┐
  │  📦 No Deposits Yet          │
  │                             │
  │  Deposit BTC to get started │
  │  and start earning yield!   │
  │                             │
  │  [Deposit BTC →]            │
  └─────────────────────────────┘

No debt:
  ┌─────────────────────────────┐
  │  💰 Ready to Borrow         │
  │                             │
  │  You can borrow up to       │
  │  $5.25 against your BTC     │
  │                             │
  │  [Borrow Now →]             │
  └─────────────────────────────┘
```

---

## 🔒 Security & Best Practices

### Transaction Confirmation

```
Before any transaction:
1. Show summary of what will happen
2. Display gas estimate
3. Require explicit confirmation
4. Show transaction hash immediately
5. Link to block explorer
```

### Input Validation

```typescript
Validations:
- Amount > 0
- Amount <= balance
- Amount doesn't exceed limits
- Slippage warnings for large amounts
- Debt doesn't exceed LTV

Show errors inline:
❌ "Amount exceeds balance" (red text under input)
❌ "This would put you at 95% LTV" (warning)
```

### Data Freshness

```
Visual indicators:
- "Updated 5s ago" (green)
- "Updated 2m ago" (yellow)
- "Updating..." (spinner)
- Manual refresh button
```

---

## 📊 Dashboard Metrics to Display

### User Metrics

```
Primary:
- Total Collateral (BTC + USD value)
- Total Debt (bMUSD + USD value)
- LTV Ratio (percentage + bar)
- Net Position (Collateral - Debt in USD)

Secondary:
- Total Yield Earned (all-time)
- Debt Repaid (all-time)
- Current APR (weighted average)
- Projected Payoff Date
```

### Protocol Metrics

```
Global Stats (top of page):
- Total Value Locked (TVL)
- Total Debt Outstanding
- Number of Active Loans
- Average APR
- Total Yield Distributed
```

### Pool Metrics (Each Pool)

```
MUSD/BTC Pool:
- Your LP Tokens
- Your Share of Pool (%)
- Claimable Fees
- Pool APR
- Pool TVL
- 24h Volume

bMUSD/MUSD Pool:
- (Same structure)
```

---

## 🎨 Visual Design Guidelines

### Card Design

```css
.position-card {
  background: linear-gradient(
    135deg,
    rgba(15, 23, 42, 0.9),
    rgba(30, 41, 59, 0.9)
  );
  backdrop-filter: blur(10px);
  border: 1px solid rgba(248, 250, 252, 0.1);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 24px;
}

.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 24px 70px rgba(247, 147, 26, 0.2);
  border-color: rgba(247, 147, 26, 0.3);
  transition: all 0.3s ease;
}
```

### Typography Scale

```
Hero: 48px, Bold
H1: 32px, Bold
H2: 24px, Semibold
H3: 20px, Semibold
Body: 16px, Regular
Small: 14px, Regular
Tiny: 12px, Medium
```

### Spacing System

```
xs: 4px
sm: 8px
md: 16px
lg: 24px
xl: 32px
2xl: 48px
```

---

## 📡 API/Data Layer

### Contract Hooks

```typescript
// useUserPosition.ts
export const useUserPosition = (address: string) => {
  const [position, setPosition] = useState({
    collateral: 0n,
    debt: 0n,
    ltv: 0,
    maxBorrow: 0n,
    available: 0n,
  });

  useEffect(() => {
    const fetchPosition = async () => {
      const vault = new ethers.Contract(
        CONTRACTS.VaultController,
        ABI,
        provider
      );
      const debtMgr = new ethers.Contract(CONTRACTS.DebtManager, ABI, provider);

      const collateral = await vault.balanceOf(address);
      const debt = await debtMgr.userDebt(address);
      const [max, current, avail] = await debtMgr.getBorrowingCapacity(address);

      setPosition({
        collateral,
        debt,
        ltv: max > 0 ? Number((current * 10000n) / max) / 100 : 0,
        maxBorrow: max,
        available: avail,
      });
    };

    fetchPosition();
    const interval = setInterval(fetchPosition, 10000); // Poll every 10s

    return () => clearInterval(interval);
  }, [address]);

  return position;
};
```

### Transaction Hook

```typescript
// useTransaction.ts
export const useTransaction = () => {
  const [status, setStatus] = useState<
    'idle' | 'signing' | 'pending' | 'success' | 'error'
  >('idle');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const execute = async (contractCall: () => Promise<any>) => {
    try {
      setStatus('signing');
      const tx = await contractCall();

      setTxHash(tx.hash);
      setStatus('pending');

      await tx.wait();
      setStatus('success');

      toast.success('Transaction successful!');
    } catch (err: any) {
      setStatus('error');
      setError(err.message);
      toast.error('Transaction failed');
    }
  };

  return { status, txHash, error, execute };
};
```

---

## 🎯 Advanced Features

### 1. Yield Simulator

```
Interactive tool:
- Slider: BTC amount to deposit
- Shows: Projected earnings over time
- Chart: Debt reduction timeline
- Comparison: With/without Turbo mode
```

### 2. Position Health Monitor

```
Real-time alerts:
- LTV approaching 90%: Yellow warning
- LTV above 95%: Red alert
- Suggested actions: "Add collateral" or "Repay debt"
```

### 3. Historical Performance

```
Charts showing:
- Yield earned over time (line chart)
- Debt reduction progress (area chart)
- LTV history (line with color zones)
- APR fluctuations (line chart)

Time ranges: 7D, 30D, 90D, All
```

### 4. Leaderboard (Gamification)

```
Show top users by:
- Most yield earned
- Largest position
- Longest time in protocol
- Most turbo loops executed

Anonymous: "0x31..2308" or ENS if available
```

---

## 🔍 Analytics & Tracking

### Events to Track

```typescript
// User actions
trackEvent('deposit', { amount, txHash });
trackEvent('borrow', { amount, ltv, txHash });
trackEvent('turbo_loop', { bmusdAmount, musdAmount, txHash });
trackEvent('harvest', { yieldClaimed, txHash });

// Engagement
trackEvent('page_view', { page });
trackEvent('wallet_connected', { address: truncated });
trackEvent('modal_opened', { modal: 'deposit' });

// Performance
trackEvent('transaction_time', { action, duration });
trackEvent('error_occurred', { action, error });
```

### Useful Metrics

```
- Time to first deposit
- Conversion rate (connect → deposit)
- Average position size
- Turbo mode adoption rate
- Harvest frequency
```

---

## 🎨 Example Component Code

### Position Summary Card

```typescript
'use client';

import { useUserPosition } from '@/hooks/useUserPosition';
import { formatEther, formatUSD } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export function PositionSummaryCard({ address }: { address: string }) {
  const position = useUserPosition(address);
  const btcPrice = useBTCPrice(); // From Pyth oracle

  if (!position) return <Skeleton className="h-48" />;

  const collateralUSD = Number(formatEther(position.collateral)) * btcPrice;
  const ltvColor =
    position.ltv < 50
      ? 'text-green-500'
      : position.ltv < 80
      ? 'text-yellow-500'
      : 'text-red-500';

  return (
    <div className="position-card">
      <h3 className="text-lg font-semibold mb-4">Your Position</h3>

      <div className="grid grid-cols-4 gap-4">
        <div>
          <p className="text-sm text-gray-400">Collateral</p>
          <p className="text-2xl font-bold">
            {formatEther(position.collateral)} BTC
          </p>
          <p className="text-sm text-gray-400">${formatUSD(collateralUSD)}</p>
        </div>

        <div>
          <p className="text-sm text-gray-400">Debt</p>
          <p className="text-2xl font-bold">
            {formatEther(position.debt)} bMUSD
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-400">LTV Ratio</p>
          <p className={`text-2xl font-bold ${ltvColor}`}>
            {position.ltv.toFixed(1)}%
          </p>
          <div className="w-full bg-gray-700 h-2 rounded-full mt-2">
            <div
              className={`h-full rounded-full ${ltvColor.replace(
                'text',
                'bg'
              )}`}
              style={{ width: `${position.ltv}%` }}
            />
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-400">Can Borrow</p>
          <p className="text-2xl font-bold">
            {formatEther(position.available)} bMUSD
          </p>
        </div>
      </div>
    </div>
  );
}
```

---

## 🚀 Deployment & Hosting

### Recommended Stack

```
Hosting: Vercel (instant deploys)
Domain: stratum.fi or similar
CDN: Cloudflare
Analytics: Plausible or Fathom (privacy-focused)
```

### Environment Variables

```
NEXT_PUBLIC_MEZO_RPC_URL=https://rpc.test.mezo.org
NEXT_PUBLIC_CHAIN_ID=31611
NEXT_PUBLIC_VAULT_CONTROLLER=0x1b4F5dda...
NEXT_PUBLIC_DEBT_MANAGER=0xAf909A1C...
// ... other contract addresses
```

---

## 📋 Development Roadmap

### Phase 1: MVP (Week 1)

- [x] Project setup (Next.js + Tailwind)
- [ ] Wallet connection
- [ ] Basic dashboard
- [ ] Deposit flow
- [ ] Borrow flow
- [ ] Position display

### Phase 2: Core Features (Week 2)

- [ ] Turbo Loop integration
- [ ] Yield tracking
- [ ] Harvest function
- [ ] Transaction history
- [ ] Real-time updates

### Phase 3: Polish (Week 3)

- [ ] Animations
- [ ] Charts & visualizations
- [ ] Mobile responsive
- [ ] Error handling
- [ ] Loading states
- [ ] Toast notifications

### Phase 4: Advanced (Week 4)

- [ ] Yield simulator
- [ ] Debt timeline projection
- [ ] Analytics dashboard
- [ ] Leaderboard
- [ ] Documentation pages

---

## 🎓 Key Pages Structure

```
/
├── page.tsx (Landing)
├── app/
│   ├── dashboard/
│   │   └── page.tsx (Main dashboard)
│   ├── deposit/
│   │   └── page.tsx (Deposit flow)
│   ├── borrow/
│   │   └── page.tsx (Borrow flow)
│   ├── turbo/
│   │   └── page.tsx (Turbo loop)
│   ├── portfolio/
│   │   └── page.tsx (Detailed position)
│   └── docs/
│       └── page.tsx (Documentation)
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   ├── position/
│   │   ├── PositionCard.tsx
│   │   ├── YieldTracker.tsx
│   │   └── DebtTimeline.tsx
│   ├── modals/
│   │   ├── DepositModal.tsx
│   │   ├── BorrowModal.tsx
│   │   └── TurboModal.tsx
│   └── ui/ (shadcn components)
│
├── hooks/
│   ├── useUserPosition.ts
│   ├── useTransaction.ts
│   ├── useYieldData.ts
│   └── usePriceOracle.ts
│
├── lib/
│   ├── contracts.ts (ABIs & addresses)
│   ├── utils.ts (formatting, calculations)
│   └── constants.ts
│
└── public/
    ├── logo.svg
    └── animations/
```

---

## 💡 Pro Tips for Implementation

### 1. Start Simple

Build in this order:

1. Wallet connection
2. Read-only dashboard (display position)
3. Single transaction (deposit)
4. Add more transactions
5. Add polish

### 2. Use TypeScript Strictly

```typescript
// Define types for all contract data
type UserPosition = {
  collateral: bigint;
  debt: bigint;
  ltv: number;
  maxBorrow: bigint;
  available: bigint;
};

// Type-safe contract calls
const deposit = async (amount: bigint): Promise<TransactionReceipt> => {
  // ...
};
```

### 3. Handle BigNumber Properly

```typescript
// NEVER use number for token amounts
// ALWAYS use bigint

// Good ✅
const amount = ethers.parseEther('0.001'); // bigint
const formatted = ethers.formatEther(amount); // string

// Bad ❌
const amount = 0.001; // number (precision issues!)
```

### 4. Optimize Performance

```
- Lazy load heavy components
- Memoize expensive calculations
- Debounce input handlers
- Cache contract calls
- Use React.memo for static components
```

### 5. Mobile-First Design

```
- Design for mobile first
- Scale up for desktop
- Test on real devices
- Optimize touch targets (min 44px)
- Reduce animations on mobile
```

---

## 🎬 Sample User Journey (Aligned with Scripts)

```
Alice visits stratum.fi
  ↓ Sees clear value prop: "Self-Repaying Loans on Bitcoin"
Clicks "Get Started"
  ↓ Connects MetaMask
Prompted to switch to Mezo (Chain ID: 31611)
  ↓ Confirms network switch
Sees dashboard (empty state)
  ↓ Banner: "Deposit BTC to get started"

━━━ STEP 1: DEPOSIT (npm run deposit) ━━━
Clicks "Deposit BTC"
  ↓ Modal opens with explanation
Enters 0.0001 BTC
  Shows: "Your BTC will earn ~12.5% APR in MUSD/BTC pool"
  Shows: "You can borrow up to $5.25 (50% LTV)"
Clicks "Deposit & Earn"
  ↓ Signs BTC approval
  ↓ Signs deposit transaction
Transaction pending (shows spinner + explorer link)
  ↓ Confirms on-chain
Success! Confetti animation 🎉
  ↓ Dashboard updates in real-time
Shows: "💎 Collateral: 0.0001 BTC ($10.51)"
Shows: "🎯 You can borrow up to $5.25"

━━━ STEP 2: BORROW (npm run borrow) ━━━
Clicks "Borrow bMUSD" button
  ↓ Modal opens
Slider to choose amount (0% - 100% of max)
  ↓ Drags to 80%
Shows: "4.2 bMUSD ≈ $4.20"
Shows: "LTV: 80% (Healthy)"
Shows projection: "Debt free in ~120 days at current APR"
Clicks "Borrow bMUSD"
  ↓ Signs transaction
Transaction confirms
  ↓ Success! Now has 4.2 bMUSD in wallet
Dashboard updates:
  Shows: "💸 Debt: 4.2 bMUSD (80% LTV)"
  Shows: "🌾 Yield accruing: $0.03/day"

━━━ STEP 3: TURBO (npm run turbo) - OPTIONAL ━━━
Notices "Turbo Mode" badge (pulsing glow)
  ↓ Curious, clicks it
Modal explains: "Earn from a SECOND yield source!"
  Shows diagram: Primary yield → debt | Turbo yield → profit

⚠️ Checks requirements:
  ✓ bMUSD: Has 4.2 bMUSD
  ❌ MUSD: Needs MUSD to pair (1:1)

Sees banner: "You need MUSD for Turbo Mode"
  ↓ Clicks "Get MUSD" button
Redirected to mezo.org
  ↓ Mints 100 MUSD (deposits BTC)
Returns to Stratum Fi

Now requirements met:
  ✓ bMUSD: 4.2 bMUSD
  ✓ MUSD: 100 MUSD

Enters Turbo amounts:
  bMUSD: 1.0 (leaves 3.2 for safety)
  MUSD: 1.0 (auto-filled to match)

Shows: "Expected: 1.0 LP tokens earning ~8.3% APR"
Clicks "Activate Turbo Mode 🚀"
  ↓ Step 1/3: Borrows 1.0 more bMUSD (signs)
  ↓ Step 2/3: Approves bMUSD (signs)
  ↓ Step 3/3: Approves MUSD (signs)
  ↓ Executes TurboLoop (signs)
All transactions batch confirm
  ↓ Success! Confetti 🎊

Dashboard NOW shows TWO yield sources:
┌───────────────────┬───────────────────┐
│ Primary (MUSD/BTC)│ Turbo (bMUSD/MUSD)│
│ APR: 12.5%        │ APR: 8.3%         │
│ Pays debt ✓       │ Your profit ✓     │
│ $0.03/day         │ $0.02/day         │
└───────────────────┴───────────────────┘

Total Daily Earnings: $0.05
Debt Repayment: $0.03/day
Your Profit: $0.02/day

━━━ ONGOING: AUTOMATIC REPAYMENT ━━━
Day 1:  Debt $5.25 → Yield $0.03
Day 7:  Debt $5.04 → Yield $0.21
Day 30: Debt $4.35 → Yield $0.90
  ↓ Checks weekly
Watches debt decrease on timeline chart
Sees extra MUSD accumulating from Turbo
  ↓ Day 120
Debt fully paid! 🎉
Still has LP tokens earning yield
  ↓ Becomes long-term user!
Tells friends about Stratum Fi
```

---

## 📖 Copy & Messaging

### Headlines

```
Landing Page:
"Your Bitcoin, Working For You"
"Borrow Today, Let Yield Repay Tomorrow"
"The Smart Way to Leverage Bitcoin"

Dashboard:
"Your Self-Repaying Position"
"Earning While You Borrow"
"Debt Paying Itself Down"

Turbo Mode:
"Double Your Yield"
"Maximize Your Bitcoin's Potential"
"Advanced Leverage Strategy"
```

### Explanations (Keep Simple)

```
What is Stratum Fi?
"Deposit Bitcoin. Borrow stablecoins. Your deposit earns yield that automatically repays your loan. No liquidations. No manual payments."

How does it work?
"Your BTC becomes liquidity on Tigris DEX, earning trading fees. Those fees pay down your debt automatically. Over time, your debt goes to zero and you keep all the profit."

What is Turbo Mode?
"Provide both bMUSD (your borrowed debt) and MUSD to create a second liquidity position. Earn extra yield on top of your primary yield. Your debt still gets repaid, but now you're earning additional profit!"

Where do I get MUSD?
"You can mint MUSD on mezo.org by depositing BTC, or swap for it on Tigris DEX. You need MUSD to activate Turbo Mode (1:1 ratio with bMUSD)."
```

---

## ✅ Testing Checklist

### Functionality

- [ ] Wallet connects on Mezo
- [ ] Network switching works
- [ ] Deposit transaction succeeds
- [ ] Borrow transaction succeeds
- [ ] TurboLoop transaction succeeds
- [ ] Harvest transaction succeeds
- [ ] All data displays correctly
- [ ] Real-time updates work
- [ ] Error states handle gracefully

### UI/UX

- [ ] Responsive on mobile/tablet/desktop
- [ ] Animations smooth (60fps)
- [ ] Loading states clear
- [ ] Tooltips helpful
- [ ] Empty states guide users
- [ ] Errors are actionable
- [ ] Success states celebrate
- [ ] Navigation intuitive

### Performance

- [ ] First load < 3 seconds
- [ ] Subsequent loads instant
- [ ] No layout shift
- [ ] Images optimized
- [ ] Code split properly
- [ ] Lighthouse score > 90

---

## 🏆 Success Metrics

A great frontend should:

- ✅ Convert 50%+ of wallet connections to deposits
- ✅ Average time to first deposit < 2 minutes
- ✅ 20%+ of users try Turbo mode
- ✅ Zero confusion-related support tickets
- ✅ Users describe it as "intuitive" and "beautiful"

---

## 📞 Resources for Frontend Dev

### Design Inspiration

- Alchemix.fi (original self-repaying loans)
- Aave.com (clean DeFi UI)
- Uniswap.org (simple swap interface)
- Mezo.org (brand consistency)

### Code Examples

- RainbowKit examples (wallet connect)
- wagmi examples (contract hooks)
- shadcn/ui components (UI components)
- Recharts examples (data visualization)

### Contract ABIs

Located in: `./typechain-types/` after compilation

---

**Build something beautiful. Make DeFi accessible. Impress the judges.** 🚀

---

End of Frontend Guide
