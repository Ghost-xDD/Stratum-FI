/**
 * Deployed Contract Addresses on Mezo Testnet (Chain ID: 31611)
 * Source: stratum-contracts/ignition/deployments/chain-31611/deployed_addresses.json
 */

export const CONTRACT_ADDRESSES = {
  VaultController: '0x1b4F5dda11c85c2f3fD147aC8c1D2B7B3BD8f47E',
  DebtManager: '0xAf909A1C824B827fdd17EAbb84c350a90491e887',
  StrategyBTC: '0x3fffA39983C77933aB74E708B4475995E9540E4F',
  TurboLoopReal: '0xFD53D03c17F2872cf2193005d0F8Ded7d46490DF',
  Harvester: '0x5A296604269470c24290e383C2D34F41B2B375c0',
  bMUSD: '0xd229BD8f83111F20f09f4f8aC324C4b1E51CC62A',
  bMUSDMUSDPool: '0xBE911Dc9f7634406547D1453e97E631AA954b89a',
} as const;

// Mezo testnet tokens
export const TOKEN_ADDRESSES = {
  BTC: '0x7b7C000000000000000000000000000000000000', // Mezo native BTC
  MUSD: '0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503', // Tigris MUSD
} as const;

export const MEZO_TESTNET = {
  id: 31611,
  name: 'Mezo Testnet',
  network: 'mezo-testnet',
  nativeCurrency: {
    name: 'Bitcoin',
    symbol: 'BTC',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://rpc.test.mezo.org'] },
    public: { http: ['https://rpc.test.mezo.org'] },
  },
  blockExplorers: {
    default: {
      name: 'Mezo Explorer',
      url: 'https://explorer.testnet.mezo.org',
    },
  },
  testnet: true,
} as const;
