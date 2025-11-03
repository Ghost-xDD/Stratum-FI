'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatUSD, formatPercentage } from '@/lib/utils';
import { MOCK_DATA } from '@/lib/constants';
import { fadeInUp } from '@/lib/constants';
import { DollarSign, TrendingUp, Zap, Sparkles } from 'lucide-react';

export function YieldTracker() {
  const yields = MOCK_DATA.yields;
  const pools = MOCK_DATA.pools;

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={fadeInUp}
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
    >
      {/* Primary Yield Card */}
      <Card className="card-hover">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-semibold">Primary Yield</CardTitle>
          <Badge variant="default" className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            MUSD/BTC Pool
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-muted">Deposited</span>
              <span className="font-mono font-semibold">
                {formatUSD(pools.musdBtc.userLPTokens)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-muted">LP Value</span>
              <span className="font-mono font-semibold">
                {formatUSD(pools.musdBtc.userLPTokens)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-muted">APR</span>
              <span className="font-mono font-semibold text-success">
                {formatPercentage(pools.musdBtc.apr)}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-text-muted">Fees Earned</span>
              <span className="text-lg font-bold number-glow">
                {formatUSD(yields.primaryEarned)}
              </span>
            </div>
            <p className="text-xs text-text-muted mb-3">
              These fees automatically pay down your debt
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              disabled={yields.primaryEarned < 0.01}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Auto-Repaying Debt
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Secondary Yield Card (Turbo Mode) */}
      <Card className="card-hover relative">
        <div className="absolute top-4 right-4">
          <Badge variant="secondary" className="animate-pulse">
            <Zap className="h-3 w-3 mr-1" />
            Turbo Mode
          </Badge>
        </div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-semibold">
            Secondary Yield
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-muted">LP Tokens</span>
              <span className="font-mono font-semibold">
                {pools.bmusdMusd.userLPTokens}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-muted">LP Value</span>
              <span className="font-mono font-semibold">
                {formatUSD(pools.bmusdMusd.userLPTokens)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-muted">APR</span>
              <span className="font-mono font-semibold text-success">
                {formatPercentage(pools.bmusdMusd.apr)}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-text-muted">Fees Earned</span>
              <span className="text-lg font-bold number-glow">
                {formatUSD(yields.secondaryEarned)}
              </span>
            </div>
            <p className="text-xs text-text-muted mb-3">
              Extra profit from leveraged position
            </p>
            <Button
              variant="default"
              size="sm"
              className="w-full"
              disabled={yields.secondaryEarned < 0.01}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Claim {formatUSD(yields.secondaryEarned)}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Combined Yield Summary */}
      <Card className="lg:col-span-2 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Total Yield Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-dark-surface/50 rounded-lg">
              <p className="text-sm text-text-muted mb-1">Total Earned</p>
              <p className="text-2xl font-bold number-glow">
                {formatUSD(yields.claimable)}
              </p>
              <p className="text-xs text-success mt-1">+2.5% this week</p>
            </div>
            <div className="text-center p-4 bg-dark-surface/50 rounded-lg">
              <p className="text-sm text-text-muted mb-1">Effective APR</p>
              <p className="text-2xl font-bold text-primary">
                {formatPercentage(
                  (yields.primaryAPR + yields.secondaryAPR) / 2
                )}
              </p>
              <p className="text-xs text-text-muted mt-1">Combined yield</p>
            </div>
            <div className="text-center p-4 bg-dark-surface/50 rounded-lg">
              <p className="text-sm text-text-muted mb-1">Daily Earnings</p>
              <p className="text-2xl font-bold text-success">
                {formatUSD(0.05)}
              </p>
              <p className="text-xs text-text-muted mt-1">Average rate</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
