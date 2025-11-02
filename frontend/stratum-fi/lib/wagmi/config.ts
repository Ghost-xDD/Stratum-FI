import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { defineChain } from 'viem';

// Define Mezo Testnet chain
export const mezoTestnet = defineChain({
  id: 31611,
  name: 'Mezo Testnet',
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
});

export const config = getDefaultConfig({
  appName: 'Stratum Fi',
  projectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
  chains: [mezoTestnet],
  ssr: true,
});
