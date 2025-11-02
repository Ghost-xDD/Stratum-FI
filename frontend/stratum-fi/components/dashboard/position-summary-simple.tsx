'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatUSD, formatPercentage, getLTVColor } from '@/lib/utils';
import { fadeInUp } from '@/lib/constants';
import {
  Bitcoin,
  DollarSign,
  Sparkles,
  Zap,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import { useDashboardData } from '@/lib/contracts';
import { useBTCPrice } from '@/lib/hooks/useBTCPrice';

interface PositionSummarySimpleProps {
  userAddress?: string;
}

export function PositionSummarySimple({
  userAddress,
}: PositionSummarySimpleProps) {
  const {
    position: contractPosition,
    turboPosition,
    yieldData,
    loading,
    error,
  } = useDashboardData(userAddress);

  const { price: btcPriceUSD } = useBTCPrice();

  const position = contractPosition
    ? {
        collateralBTC: contractPosition.collateralBTC,
        debt: contractPosition.debt,
        maxBorrow: contractPosition.maxBorrow,
        available: contractPosition.available,
        secondaryLP: turboPosition?.secondaryLP || '0',
        claimableYield: yieldData?.totalUSD.toString() || '0',
        btcPriceUSD,
      }
    : null;

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-text-muted">Loading position data...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8 border-error/50 bg-error/5">
        <div className="text-center">
          <p className="text-error mb-2">Failed to load position data</p>
          <p className="text-sm text-text-muted">{error.message}</p>
        </div>
      </Card>
    );
  }

  if (!userAddress || !position) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <p className="text-text-muted mb-2">No wallet connected</p>
          <p className="text-sm text-text-secondary">
            Connect your wallet to view your position
          </p>
        </div>
      </Card>
    );
  }

  // Calculate derived values
  const collateralUSD =
    parseFloat(position.collateralBTC) * position.btcPriceUSD;
  const debtNum = parseFloat(position.debt);
  const maxBorrowNum = parseFloat(position.maxBorrow);
  const ltv = maxBorrowNum > 0 ? (debtNum / (collateralUSD / 2)) * 100 : 0; // LTV based on collateral
  const hasTurboPosition = parseFloat(position.secondaryLP) > 0;

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={fadeInUp}
      className="space-y-6"
    >
      {/* Main Position Card */}
      <Card className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Collateral */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Bitcoin className="h-4 w-4 text-primary" />
              <span className="text-sm text-text-muted">Collateral</span>
            </div>
            <p className="text-2xl font-bold font-mono">
              {position.collateralBTC} BTC
            </p>
            <p className="text-sm text-text-secondary">
              ≈ {formatUSD(collateralUSD)}
            </p>
            <Badge variant="success" className="text-xs mt-2">
              Earning Yield
            </Badge>
          </div>

          {/* Debt */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-text-muted" />
              <span className="text-sm text-text-muted">Debt</span>
            </div>
            <p className="text-2xl font-bold font-mono">
              {position.debt} bMUSD
            </p>
            <p className="text-sm text-text-secondary">
              ≈ {formatUSD(debtNum)}
            </p>
            <Badge variant="glass" className="text-xs mt-2">
              0% Interest
            </Badge>
          </div>

          {/* LTV */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-text-muted" />
              <span className="text-sm text-text-muted">LTV Ratio</span>
            </div>
            <p
              className="text-2xl font-bold font-mono"
              style={{ color: getLTVColor(ltv) }}
            >
              {formatPercentage(ltv)}
            </p>
            <Progress value={ltv} max={50} className="h-2 mt-2" ltv />
            <p className="text-xs text-text-muted mt-1">Max 50%</p>
          </div>

          {/* Available */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-success" />
              <span className="text-sm text-text-muted">Available</span>
            </div>
            <p className="text-2xl font-bold font-mono text-success">
              {position.available}
            </p>
            <p className="text-sm text-text-secondary">
              ≈ {formatUSD(parseFloat(position.available))}
            </p>
            <p className="text-xs text-text-muted mt-2">Can borrow</p>
          </div>
        </div>
      </Card>

      {/* Yield & Turbo Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Claimable Yield */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Claimable Yield</h3>
            </div>
            <Badge variant="success">Ready</Badge>
          </div>

          <div className="mb-4">
            <p className="text-3xl font-bold number-glow mb-1">
              {formatUSD(parseFloat(position.claimableYield))}
            </p>
            <p className="text-sm text-text-muted">
              From trading fees in your LP position
            </p>
          </div>

          <Button className="w-full" size="lg">
            <Sparkles className="h-4 w-4 mr-2" />
            Harvest Yield
          </Button>
        </Card>

        {/* Turbo Mode Status */}
        <Card className="p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl" />

          <div className="flex items-center justify-between mb-4 relative">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-secondary" />
              <h3 className="font-semibold">Turbo Mode</h3>
            </div>
            {hasTurboPosition ? (
              <Badge variant="secondary" className="animate-pulse">
                Active
              </Badge>
            ) : (
              <Badge variant="outline">Inactive</Badge>
            )}
          </div>

          {hasTurboPosition ? (
            <div className="relative">
              <p className="text-sm text-text-muted mb-2">
                Secondary LP Position
              </p>
              <p className="text-3xl font-bold mb-1">{position.secondaryLP}</p>
              <p className="text-sm text-text-secondary mb-4">
                bMUSD/MUSD LP tokens
              </p>
              <Button variant="outline" className="w-full" asChild>
                <a href="/turbo">View Details</a>
              </Button>
            </div>
          ) : (
            <div className="relative">
              <p className="text-sm text-text-secondary mb-4">
                Leverage your position to earn up to 2x yield from dual
                liquidity pools
              </p>
              <Button variant="secondary" className="w-full" asChild>
                <a href="/turbo">
                  Enable Turbo Mode
                  <Zap className="h-4 w-4 ml-2" />
                </a>
              </Button>
            </div>
          )}
        </Card>
      </div>

      <Card className="p-6 bg-gradient-to-br from-primary/5 to-transparent">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold mb-2">Self-Repaying Loan Status</h3>
            <p className="text-sm text-text-secondary mb-1">
              Your yield automatically pays down debt over time
            </p>
            <p className="text-xs text-text-muted">
              No manual repayments needed • No liquidation risk
            </p>
          </div>
          <Badge variant="success" className="text-xs">
            Auto-Repaying
          </Badge>
        </div>
      </Card>
    </motion.div>
  );
}
