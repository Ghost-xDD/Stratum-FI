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

/**
 * Hook to approve tokens for TurboLoop
 */
export function useApproveTurbo() {
  const { writeContractAsync } = useWriteContract();

  const approve = async (tokenAddress: string, amount: string = 'max') => {
    const approvalAmount =
      amount === 'max'
        ? BigInt(
            '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
          )
        : parseEther(amount);

    return await writeContractAsync({
      address: tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [CONTRACT_ADDRESSES.TurboLoopReal, approvalAmount],
    });
  };

  return { approve };
}

/**
 * Hook to execute Turbo Loop
 */
export function useExecuteTurboLoop() {
  const {
    writeContractAsync,
    data: hash,
    isPending,
    error,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const executeTurbo = async (bmusdAmount: string, musdAmount: string) => {
    return await writeContractAsync({
      address: CONTRACT_ADDRESSES.TurboLoopReal as `0x${string}`,
      abi: [
        {
          inputs: [
            { name: 'bmusdAmount', type: 'uint256' },
            { name: 'musdAmount', type: 'uint256' },
          ],
          name: 'loop',
          outputs: [{ name: '', type: 'uint256' }],
          stateMutability: 'nonpayable',
          type: 'function',
        },
      ] as const,
      functionName: 'loop',
      args: [parseEther(bmusdAmount), parseEther(musdAmount)],
    });
  };

  return {
    executeTurbo,
    hash,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
  };
}
