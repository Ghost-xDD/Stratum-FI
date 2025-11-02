// Contract addresses (Testnet)
export const CONTRACTS = {
  VaultController: '0x1b4F5dda11c85c2f3fD147aC8c1D2B7B3BD8f47E',
  DebtManager: '0xAf909A1C824B827fdd17EAbb84c350a90491e887',
  StrategyBTC: '0x3fffA39983C77933aB74E708B4475995E9540E4F',
  Harvester: '0x5A296604269470c24290e383C2D34F41B2B375c0',
  bMUSD: '0xd229BD8f83111F20f09f4f8aC324C4b1E51CC62A',
  TurboLoop: '0xFD53D03c17F2872cf2193005d0F8Ded7d46490DF',

  // Pools
  MUSD_BTC_POOL: '0xd16A5Df82120ED8D626a1a15232bFcE2366d6AA9',
  BMUSD_MUSD_POOL: '0xBE911Dc9f7634406547D1453e97E631AA954b89a',
} as const;

// Chain configuration
export const CHAIN_CONFIG = {
  chainId: 31611,
  name: 'Mezo Testnet',
  rpcUrl: 'https://rpc.test.mezo.org',
} as const;

// UI Constants
export const MAX_LTV = 50; // 50% max loan-to-value ratio
export const LIQUIDATION_LTV = 90; // 90% liquidation threshold
export const DEFAULT_SLIPPAGE = 0.5; // 0.5% default slippage

// Mock data for UI development
export const MOCK_DATA = {
  userPosition: {
    collateral: 0.0011,
    collateralUSD: 105.55,
    debt: 48.0,
    ltv: 45.5,
    maxBorrow: 52.77,
    available: 4.77,
  },
  yields: {
    primaryAPR: 12.5,
    secondaryAPR: 8.3,
    primaryEarned: 0.03,
    secondaryEarned: 0.02,
    claimable: 0.05,
  },
  pools: {
    musdBtc: {
      tvl: 1250000,
      volume24h: 125000,
      apr: 12.5,
      userLPTokens: 11.55,
      userShare: 0.0009,
    },
    bmusdMusd: {
      tvl: 850000,
      volume24h: 85000,
      apr: 8.3,
      userLPTokens: 15.06,
      userShare: 0.0018,
    },
  },
  protocol: {
    totalTVL: 2100000,
    totalDebt: 425000,
    activeLoans: 127,
    avgAPR: 10.4,
    totalYieldDistributed: 12500,
  },
  btcPrice: 95959,
} as const;

// Animation variants for Framer Motion
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.4 },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  transition: { duration: 0.3 },
};

export const slideInFromRight = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -100 },
  transition: { duration: 0.4, ease: 'easeInOut' },
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};
