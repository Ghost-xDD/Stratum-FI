'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PositionSummarySimple } from '@/components/dashboard/position-summary-simple';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/lib/constants';
import {
  Bitcoin,
  DollarSign,
  TrendingUp,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock3,
} from 'lucide-react';
import { useProtocolStats } from '@/lib/contracts';
import { useAccount } from 'wagmi';

export default function DashboardPage() {
  const { address: userAddress, isConnected } = useAccount();
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [lastUpdated, setLastUpdated] = React.useState<Date | null>(null);

  const {
    stats: protocolStats,
    loading: statsLoading,
    error: statsError,
  } = useProtocolStats();

  React.useEffect(() => {
    if (protocolStats) {
      setLastUpdated(new Date());
    }
  }, [protocolStats]);

  const formatAmount = (
    value: string | number | null | undefined,
    options: Intl.NumberFormatOptions = {}
  ) => {
    if (value === null || value === undefined) {
      return '—';
    }

    const numericValue =
      typeof value === 'string' ? parseFloat(value) : Number(value);

    if (!Number.isFinite(numericValue)) {
      return '—';
    }

    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      ...options,
    }).format(numericValue);
  };

  const formattedLastUpdated = React.useMemo(() => {
    if (!lastUpdated) {
      return null;
    }

    const delta = Date.now() - lastUpdated.getTime();

    if (delta < 5_000) return 'just now';
    if (delta < 60_000) return `${Math.round(delta / 1_000)}s ago`;
    if (delta < 3_600_000) return `${Math.round(delta / 60_000)}m ago`;
    if (delta < 86_400_000) return `${Math.round(delta / 3_600_000)}h ago`;
    return `${Math.round(delta / 86_400_000)}d ago`;
  }, [lastUpdated]);

  const quickActions = React.useMemo(
    () => [
      {
        href: '/vault?tab=deposit',
        label: 'Deposit collateral',
        description: 'Supply BTC to increase your borrowing limit.',
        icon: Bitcoin,
      },
      {
        href: '/vault?tab=borrow',
        label: 'Borrow bMUSD',
        description: 'Draw liquidity against your collateralized position.',
        icon: DollarSign,
      },
      {
        href: '/turbo',
        label: 'Turbo loop',
        description: 'Deploy looping strategy to amplify BTC exposure.',
        icon: TrendingUp,
      },
      {
        href: 'https://explorer.testnet.mezo.org',
        label: 'Network explorer',
        description: 'Inspect transactions and contract state externally.',
        icon: ExternalLink,
        external: true,
      },
    ],
    []
  );

  const handleRefresh = () => {
    setIsRefreshing(true);

    window.location.reload();
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="space-y-6"
        >
          {/* Header */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between"
          >
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-wide text-text-muted">
                <Badge variant="outline">Portfolio overview</Badge>
                {isConnected ? (
                  <span className="inline-flex items-center gap-1 text-success">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Wallet connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-warning">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Wallet disconnected
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">
                  Dashboard
                </h1>
                <p className="mt-2 text-sm text-text-secondary">
                  Monitor collateral, debt, and protocol activity in real-time.
                </p>
                {userAddress && (
                  <p className="mt-3 text-xs font-mono text-text-muted">
                    {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <Clock3 className="h-4 w-4" />
                <span>
                  {statsLoading
                    ? 'Syncing latest data…'
                    : formattedLastUpdated
                    ? `Updated ${formattedLastUpdated}`
                    : 'Awaiting first sync'}
                </span>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw
                    className={`mr-2 h-4 w-4 ${
                      isRefreshing ? 'animate-spin' : ''
                    }`}
                  />
                  Refresh
                </Button>
                <Button size="sm" asChild>
                  <a href="/vault">
                    Manage position
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Main Position Summary - Real Contract Data */}
          <PositionSummarySimple userAddress={userAddress} />

          {/* Protocol Stats - Real Contract Data */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>Protocol Statistics</CardTitle>
                <Badge variant="outline" className="whitespace-nowrap">
                  Live data · Mezo Testnet
                </Badge>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="flex items-center justify-center py-10 text-sm text-text-muted">
                    <Loader2 className="mr-3 h-5 w-5 animate-spin text-primary" />
                    Refreshing protocol state…
                  </div>
                ) : statsError ? (
                  <div className="flex items-center gap-3 rounded-lg border border-error/30 bg-error/10 p-4 text-sm text-error">
                    <AlertCircle className="h-5 w-5" />
                    Unable to reach the Mezo RPC endpoint. Please try again in a
                    moment.
                  </div>
                ) : protocolStats ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <div className="rounded-lg border border-white/10 bg-dark-surface/40 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                        Total BTC Locked
                      </p>
                      <div className="mt-3 flex items-end justify-between">
                        <div>
                          <p className="text-3xl font-semibold font-mono leading-none">
                            {`${formatAmount(protocolStats.totalBTC, {
                              minimumFractionDigits: 4,
                              maximumFractionDigits: 4,
                            })}`}
                          </p>
                          <span className="text-xs text-text-muted">
                            BTC deposited
                          </span>
                        </div>
                        <Bitcoin className="h-8 w-8 text-primary" />
                      </div>
                      <p className="mt-3 text-xs text-text-muted">
                        Pulled directly from{' '}
                        <span className="font-mono">
                          strategy.totalBTCDeposited()
                        </span>
                      </p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-dark-surface/40 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                        Aggregate Debt
                      </p>
                      <div className="mt-3 flex items-end justify-between">
                        <div>
                          <p className="text-3xl font-semibold font-mono leading-none">
                            {`${formatAmount(protocolStats.totalDebt, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}`}
                          </p>
                          <span className="text-xs text-text-muted">
                            bMUSD outstanding
                          </span>
                        </div>
                        <DollarSign className="h-8 w-8 text-secondary" />
                      </div>
                      <p className="mt-3 text-xs text-text-muted">
                        Mirrors{' '}
                        <span className="font-mono">
                          debtManager.totalDebt()
                        </span>
                      </p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-dark-surface/40 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                        Data feed status
                      </p>
                      <div className="mt-3 flex items-start justify-between">
                        <div>
                          <p className="text-lg font-medium text-success">
                            Healthy
                          </p>
                          <p className="mt-1 text-xs text-text-muted">
                            {formattedLastUpdated
                              ? `Last sync ${formattedLastUpdated}`
                              : 'Standing by for next update'}
                          </p>
                        </div>
                        <CheckCircle2 className="h-6 w-6 text-success" />
                      </div>
                      <p className="mt-3 text-xs text-text-muted">
                        Read-only provider connected to Mezo Testnet RPC.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between rounded-lg border border-white/10 bg-dark-surface/40 p-4 text-sm text-text-muted">
                    <span>No protocol data available</span>
                    <Button variant="outline" size="sm" onClick={handleRefresh}>
                      Retry
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {quickActions.map((action) => {
                    const Icon = action.icon;

                    return (
                      <a
                        key={action.href}
                        href={action.href}
                        {...(action.external
                          ? { target: '_blank', rel: 'noopener noreferrer' }
                          : {})}
                        className="group flex h-full flex-col justify-between rounded-lg border border-white/10 bg-dark-surface/30 p-4 transition hover:border-primary/40 hover:bg-dark-surface/50"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-text-primary">
                              {action.label}
                            </p>
                            <p className="mt-2 text-xs text-text-muted">
                              {action.description}
                            </p>
                          </div>
                          <Icon className="h-5 w-5 text-text-muted transition group-hover:text-primary" />
                        </div>
                        <ArrowRight className="mt-6 h-4 w-4 text-text-muted transition group-hover:translate-x-1 group-hover:text-primary" />
                      </a>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Info Banner */}
          <motion.div variants={fadeInUp}>
            <Card className="border border-white/10 bg-dark-surface/40">
              <CardContent className="space-y-4 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg border border-primary/30 bg-primary/15 p-2">
                      <Bitcoin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-text-primary">
                        Live contract data
                      </h3>
                      <p className="text-sm text-text-secondary">
                        Metrics update whenever the read-only provider detects a
                        new block on Mezo Testnet (Chain ID 31611).
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="self-start md:self-center"
                  >
                    VaultController · DebtManager · TurboLoop · Harvester
                  </Badge>
                </div>
                <p className="text-xs text-text-muted">
                  If figures look stale, trigger a manual refresh or verify the
                  RPC endpoint health via the network explorer.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
