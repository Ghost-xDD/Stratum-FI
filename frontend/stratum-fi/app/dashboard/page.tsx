'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PositionSummarySimple } from '@/components/dashboard/position-summary-simple';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/lib/constants';
import { formatUSD, formatBTC } from '@/lib/utils';
import {
  Bitcoin,
  DollarSign,
  TrendingUp,
  ArrowRight,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';

/**
 * Simplified Dashboard - Only uses data available from smart contracts
 *
 * Data sources (from 05-check-status.ts):
 * - vaultController.balanceOf(user.address) → Collateral
 * - debtManager.userDebt(user.address) → Debt
 * - debtManager.getBorrowingCapacity() → Max borrow, available
 * - turboLoop.getSecondaryLP(user.address) → Turbo LP position
 * - harvester.getClaimableYield() → Claimable yield
 * - strategy.totalBTCDeposited() → Protocol total BTC
 * - debtManager.totalDebt() → Protocol total debt
 */
export default function DashboardSimplePage() {
  const [isLoading, setIsLoading] = React.useState(false);

  // Mock data - will be replaced with actual contract reads
  const protocolStats = {
    totalBTC: '0.0042',
    totalDebt: '12.4',
    activeUsers: 7,
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    // Will call contract read functions here
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
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
                Your self-repaying loan position
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}
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

          {/* Main Position Summary */}
          <PositionSummarySimple />

          {/* Protocol Stats */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Protocol Statistics</CardTitle>
                <Badge variant="glass">Live Data</Badge>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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
                      From strategy.totalBTCDeposited()
                    </p>
                  </div>

                  <div className="text-center p-4 rounded-lg bg-dark-surface/50">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-secondary" />
                      <span className="text-sm text-text-muted">
                        Total Debt
                      </span>
                    </div>
                    <p className="text-2xl font-bold font-mono">
                      {protocolStats.totalDebt} bMUSD
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      From debtManager.totalDebt()
                    </p>
                  </div>

                  <div className="text-center p-4 rounded-lg bg-dark-surface/50">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-success" />
                      <span className="text-sm text-text-muted">
                        Active Users
                      </span>
                    </div>
                    <p className="text-2xl font-bold">
                      {protocolStats.activeUsers}
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      Using the protocol
                    </p>
                  </div>
                </div>
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
                      href="https://explorer.mezo.org"
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
                      Your Position is Self-Repaying
                    </h3>
                    <p className="text-sm text-text-secondary">
                      Trading fees from your BTC in the MUSD/BTC pool
                      automatically pay down your debt over time. No manual
                      repayments needed, and your collateral can never be
                      liquidated.
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
