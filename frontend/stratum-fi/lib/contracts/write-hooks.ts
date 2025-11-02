/**
 * Write hooks for contract transactions
 */

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { CONTRACT_ADDRESSES, TOKEN_ADDRESSES } from './addresses';
import { VAULT_CONTROLLER_ABI, DEBT_MANAGER_ABI, ERC20_ABI } from './abis';

/**
 * Hook to approve BTC spending
 */
export function useApproveBTC() {
  const {
    writeContractAsync,
    data: hash,
    isPending,
    error,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const approve = async (amount: string) => {
    return await writeContractAsync({
      address: TOKEN_ADDRESSES.BTC as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [CONTRACT_ADDRESSES.VaultController, parseEther(amount)],
    });
  };

  return {
    approve,
    hash,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
  };
}

/**
 * Hook to deposit BTC to VaultController
 */
export function useDepositBTC() {
  const {
    writeContractAsync,
    data: hash,
    isPending,
    error,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const deposit = async (amount: string) => {
    return await writeContractAsync({
      address: CONTRACT_ADDRESSES.VaultController as `0x${string}`,
      abi: VAULT_CONTROLLER_ABI,
      functionName: 'deposit',
      args: [parseEther(amount)],
    });
  };

  return {
    deposit,
    hash,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
  };
}

/**
 * Hook to borrow bMUSD from DebtManager
 */
export function useBorrowBMUSD() {
  const {
    writeContractAsync,
    data: hash,
    isPending,
    error,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const borrow = async (amount: string) => {
    return await writeContractAsync({
      address: CONTRACT_ADDRESSES.DebtManager as `0x${string}`,
      abi: DEBT_MANAGER_ABI,
      functionName: 'borrow',
      args: [parseEther(amount)],
    });
  };

  return {
    borrow,
    hash,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
  };
}
