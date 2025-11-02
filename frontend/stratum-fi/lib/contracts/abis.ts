// Contract ABIs
import VaultControllerABI from '@/abi/VaultController.json';
import DebtManagerABI from '@/abi/DebtManager.json';
import StrategyBTCABI from '@/abi/StrategyBTC.json';
import TurboLoopRealABI from '@/abi/TurboLoopReal.json';
import HarvesterABI from '@/abi/Harvester.json';
import bMUSDABI from '@/abi/bMUSD.json';

// Export ABIs
export const VAULT_CONTROLLER_ABI = VaultControllerABI.abi;
export const DEBT_MANAGER_ABI = DebtManagerABI.abi;
export const STRATEGY_BTC_ABI = StrategyBTCABI.abi;
export const TURBO_LOOP_REAL_ABI = TurboLoopRealABI.abi;
export const HARVESTER_ABI = HarvesterABI.abi;
export const BMUSD_ABI = bMUSDABI.abi;

// ERC20 ABI (minimal, for BTC token) - JSON ABI format for wagmi/viem
export const ERC20_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;
