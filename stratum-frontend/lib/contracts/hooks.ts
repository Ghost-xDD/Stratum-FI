/**
 * React hooks for reading contract data
 * Maps directly to contract functions from 05-check-status.ts
 */

import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, TOKEN_ADDRESSES, MEZO_TESTNET } from './addresses';
import {
  VAULT_CONTROLLER_ABI,
  DEBT_MANAGER_ABI,
  STRATEGY_BTC_ABI,
  TURBO_LOOP_REAL_ABI,
  HARVESTER_ABI,
  ERC20_ABI,
} from './abis';

// Types
export interface UserPosition {
  collateralBTC: string; // From vaultController.balanceOf()
  debt: string; // From debtManager.userDebt()
  maxBorrow: string; // From debtManager.getBorrowingCapacity()[0]
  available: string; // From debtManager.getBorrowingCapacity()[2]
  ltv: number; // Calculated from debt/maxBorrow
}

export interface TurboPosition {
  secondaryLP: string; // From turboLoop.getSecondaryLP()
}

export interface YieldData {
  claimable0: string; // From harvester.getClaimableYield()[0]
  claimable1: string; // From harvester.getClaimableYield()[1]
  totalUSD: number; // Converted to USD
}

export interface ProtocolStats {
  totalBTC: string; // From strategy.totalBTCDeposited()
  totalDebt: string; // From debtManager.totalDebt()
}

// Create provider (read-only)
function getProvider() {
  return new ethers.JsonRpcProvider(MEZO_TESTNET.rpcUrls.default.http[0]);
}

/**
 * Hook to read user's position data
 * Mirrors: 05-check-status.ts lines 47-66
 */
export function useUserPosition(userAddress?: string) {
  const [position, setPosition] = useState<UserPosition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !userAddress) {
      setLoading(false);
      return;
    }

    async function fetchPosition() {
      try {
        setLoading(true);
        const provider = getProvider();

        // Initialize contracts
        const vaultController = new ethers.Contract(
          CONTRACT_ADDRESSES.VaultController,
          VAULT_CONTROLLER_ABI,
          provider
        );

        const debtManager = new ethers.Contract(
          CONTRACT_ADDRESSES.DebtManager,
          DEBT_MANAGER_ABI,
          provider
        );

        // Fetch data (parallel for speed)
        const [collateral, userDebt, borrowingCapacity] = await Promise.all([
          vaultController.balanceOf(userAddress), // Line 48
          debtManager.userDebt(userAddress), // Line 53
          debtManager.getBorrowingCapacity(userAddress), // Line 54-55
        ]);

        const [maxBorrow, , available] = borrowingCapacity;

        // Calculate LTV (line 63-65)
        let ltv = 0;
        if (maxBorrow > BigInt(0)) {
          ltv = Number((userDebt * BigInt(10000)) / maxBorrow) / 100;
        }

        setPosition({
          collateralBTC: ethers.formatEther(collateral),
          debt: ethers.formatEther(userDebt),
          maxBorrow: ethers.formatEther(maxBorrow),
          available: ethers.formatEther(available),
          ltv,
        });
      } catch (err) {
        console.error('Error fetching position:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchPosition();
  }, [mounted, userAddress]);

  return { position, loading, error };
}

/**
 * Hook to read turbo position
 * Mirrors: 05-check-status.ts lines 68-71
 */
export function useTurboPosition(userAddress?: string) {
  const [position, setPosition] = useState<TurboPosition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !userAddress) {
      setLoading(false);
      return;
    }

    async function fetchTurboPosition() {
      try {
        setLoading(true);
        const provider = getProvider();

        const turboLoop = new ethers.Contract(
          CONTRACT_ADDRESSES.TurboLoopReal,
          TURBO_LOOP_REAL_ABI,
          provider
        );

        // Line 69
        const secondaryLP = await turboLoop.getSecondaryLP(userAddress);

        setPosition({
          secondaryLP: ethers.formatEther(secondaryLP),
        });
      } catch (err) {
        console.error('Error fetching turbo position:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchTurboPosition();
  }, [mounted, userAddress]);

  return { position, loading, error };
}

/**
 * Hook to read claimable yield
 * Mirrors: 05-check-status.ts lines 73-81
 */
export function useClaimableYield() {
  const [yieldData, setYieldData] = useState<YieldData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    async function fetchYield() {
      try {
        setLoading(true);
        const provider = getProvider();

        const harvester = new ethers.Contract(
          CONTRACT_ADDRESSES.Harvester,
          HARVESTER_ABI,
          provider
        );

        // Line 76 - Try to get claimable yield
        const result = await harvester.getClaimableYield();
        const claimable0 = result[0];
        const claimable1 = result[1];

        const total0 = parseFloat(ethers.formatEther(claimable0));
        const total1 = parseFloat(ethers.formatEther(claimable1));

        setYieldData({
          claimable0: ethers.formatEther(claimable0),
          claimable1: ethers.formatEther(claimable1),
          totalUSD: total0 + total1, // Simplified: assumes 1:1 USD pegged tokens
        });
      } catch (err) {
        console.error('Error fetching claimable yield:', err);
        // Line 79-80: Not yet available (no trades in pool yet)
        setYieldData({
          claimable0: '0',
          claimable1: '0',
          totalUSD: 0,
        });
      } finally {
        setLoading(false);
      }
    }

    fetchYield();
  }, [mounted]);

  return { yieldData, loading };
}

/**
 * Hook to read protocol statistics
 * Mirrors: 05-check-status.ts lines 83-89
 */
export function useProtocolStats() {
  const [stats, setStats] = useState<ProtocolStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    async function fetchStats() {
      try {
        setLoading(true);
        const provider = getProvider();

        const debtManager = new ethers.Contract(
          CONTRACT_ADDRESSES.DebtManager,
          DEBT_MANAGER_ABI,
          provider
        );

        const strategy = new ethers.Contract(
          CONTRACT_ADDRESSES.StrategyBTC,
          STRATEGY_BTC_ABI,
          provider
        );

        // Lines 84-85
        const [totalDebt, totalBTCDeposited] = await Promise.all([
          debtManager.totalDebt(),
          strategy.totalBTCDeposited(),
        ]);

        setStats({
          totalBTC: ethers.formatEther(totalBTCDeposited),
          totalDebt: ethers.formatEther(totalDebt),
        });
      } catch (err) {
        console.error('Error fetching protocol stats:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [mounted]);

  return { stats, loading, error };
}

/**
 * Hook to read user's BTC balance
 */
export function useBTCBalance(userAddress?: string) {
  const [balance, setBalance] = useState<string>('0');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !userAddress) {
      setLoading(false);
      return;
    }

    async function fetchBalance() {
      try {
        setLoading(true);
        const provider = getProvider();

        const btcToken = new ethers.Contract(
          TOKEN_ADDRESSES.BTC,
          ERC20_ABI,
          provider
        );

        const bal = await btcToken.balanceOf(userAddress);
        setBalance(ethers.formatEther(bal));
      } catch (err) {
        console.error('Error fetching BTC balance:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchBalance();
  }, [mounted, userAddress]);

  return { balance, loading, error };
}

/**
 * Hook to read user's MUSD balance
 */
export function useMUSDBalance(userAddress?: string) {
  const [balance, setBalance] = useState<string>('0');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !userAddress) {
      setLoading(false);
      return;
    }

    async function fetchBalance() {
      try {
        setLoading(true);
        const provider = getProvider();

        const musdToken = new ethers.Contract(
          TOKEN_ADDRESSES.MUSD,
          ERC20_ABI,
          provider
        );

        const bal = await musdToken.balanceOf(userAddress);
        setBalance(ethers.formatEther(bal));
      } catch (err) {
        console.error('Error fetching MUSD balance:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchBalance();
  }, [mounted, userAddress]);

  return { balance, loading, error };
}

/**
 * Hook to read user's bMUSD balance
 */
export function useBMUSDBalance(userAddress?: string) {
  const [balance, setBalance] = useState<string>('0');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !userAddress) {
      setLoading(false);
      return;
    }

    async function fetchBalance() {
      try {
        setLoading(true);
        const provider = getProvider();

        const bmusdToken = new ethers.Contract(
          CONTRACT_ADDRESSES.bMUSD,
          ERC20_ABI,
          provider
        );

        const bal = await bmusdToken.balanceOf(userAddress);
        setBalance(ethers.formatEther(bal));
      } catch (err) {
        console.error('Error fetching bMUSD balance:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchBalance();
  }, [mounted, userAddress]);

  return { balance, loading, error };
}

/**
 * Combined hook for dashboard - fetches all data at once
 */
export function useDashboardData(userAddress?: string) {
  const position = useUserPosition(userAddress);
  const turbo = useTurboPosition(userAddress);
  const yields = useClaimableYield();
  const protocol = useProtocolStats();
  const btcBalance = useBTCBalance(userAddress);
  const musdBalance = useMUSDBalance(userAddress);
  const bmusdBalance = useBMUSDBalance(userAddress);

  return {
    position: position.position,
    turboPosition: turbo.position,
    yieldData: yields.yieldData,
    protocolStats: protocol.stats,
    btcBalance: btcBalance.balance,
    musdBalance: musdBalance.balance,
    bmusdBalance: bmusdBalance.balance,
    loading:
      position.loading ||
      turbo.loading ||
      yields.loading ||
      protocol.loading ||
      btcBalance.loading ||
      musdBalance.loading ||
      bmusdBalance.loading,
    error:
      position.error ||
      turbo.error ||
      protocol.error ||
      btcBalance.error ||
      musdBalance.error ||
      bmusdBalance.error,
  };
}
