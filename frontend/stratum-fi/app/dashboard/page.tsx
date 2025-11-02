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
} from 'lucide-react';
import { useProtocolStats } from '@/lib/contracts';
import { useAccount } from 'wagmi';

export default function DashboardPage() {
  const { address: userAddress, isConnected } = useAccount();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const { stats: protocolStats, loading: statsLoading } = useProtocolStats();

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
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-text-secondary mt-1">
                {isConnected
                  ? 'Your self-repaying loan position'
                  : 'Connect wallet to view your position'}
              </p>
              {userAddress && (
                <p className="text-xs text-text-muted mt-1 font-mono">
                  {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${
                    isRefreshing ? 'animate-spin' : ''
                  }`}
                />
                Refresh
              </Button>
              <Button size="sm" asChild>
                <a href="/vault">
                  Manage Position
                  <ArrowRight className="h-4 w-4 ml-2" />
                </a>
              </Button>
            </div>
          </motion.div>

          {/* Main Position Summary - Real Contract Data */}
          <PositionSummarySimple userAddress={userAddress} />

          {/* Protocol Stats - Real Contract Data */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Protocol Statistics</CardTitle>
                <Badge variant="glass">Live from Mezo Testnet</Badge>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="ml-3 text-text-muted">
                      Loading protocol stats...
                    </span>
                  </div>
                ) : protocolStats ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="text-center p-4 rounded-lg bg-dark-surface/50">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Bitcoin className="h-4 w-4 text-primary" />
                        <span className="text-sm text-text-muted">
                          Total BTC Locked
                        </span>
                      </div>
                      <p className="text-2xl font-bold font-mono">
                        {protocolStats.totalBTC} BTC
                      </p>
                      <p className="text-xs text-text-muted mt-1">
                        strategy.totalBTCDeposited()
                      </p>
                    </div>

                    <div className="text-center p-4 rounded-lg bg-dark-surface/50">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <DollarSign className="h-4 w-4 text-secondary" />
                        <span className="text-sm text-text-muted">
                          Total Debt Outstanding
                        </span>
                      </div>
                      <p className="text-2xl font-bold font-mono">
                        {protocolStats.totalDebt} bMUSD
                      </p>
                      <p className="text-xs text-text-muted mt-1">
                        debtManager.totalDebt()
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-text-muted">
                    No protocol data available
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button
                    variant="outline"
                    className="h-auto p-4 justify-start"
                    asChild
                  >
                    <a href="/vault?tab=deposit">
                      <Bitcoin className="h-5 w-5 mr-3" />
                      <div className="text-left">
                        <p className="font-medium">Deposit</p>
                        <p className="text-xs text-text-muted font-normal">
                          Add BTC collateral
                        </p>
                      </div>
                    </a>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto p-4 justify-start"
                    asChild
                  >
                    <a href="/vault?tab=borrow">
                      <DollarSign className="h-5 w-5 mr-3" />
                      <div className="text-left">
                        <p className="font-medium">Borrow</p>
                        <p className="text-xs text-text-muted font-normal">
                          Take out bMUSD
                        </p>
                      </div>
                    </a>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto p-4 justify-start"
                    asChild
                  >
                    <a href="/turbo">
                      <TrendingUp className="h-5 w-5 mr-3" />
                      <div className="text-left">
                        <p className="font-medium">Turbo Mode</p>
                        <p className="text-xs text-text-muted font-normal">
                          Boost yields
                        </p>
                      </div>
                    </a>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto p-4 justify-start"
                    asChild
                  >
                    <a
                      href="https://explorer.testnet.mezo.org"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-5 w-5 mr-3" />
                      <div className="text-left">
                        <p className="font-medium">Explorer</p>
                        <p className="text-xs text-text-muted font-normal">
                          View transactions
                        </p>
                      </div>
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Info Banner */}
          <motion.div variants={fadeInUp}>
            <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary/20">
                    <Bitcoin className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">
                      📡 Live Contract Data
                    </h3>
                    <p className="text-sm text-text-secondary">
                      This dashboard reads real-time data from deployed smart
                      contracts on Mezo Testnet (Chain ID: 31611). Your position
                      data is fetched directly from VaultController,
                      DebtManager, TurboLoop, and Harvester contracts.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
