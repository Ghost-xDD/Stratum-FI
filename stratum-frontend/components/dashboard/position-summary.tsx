'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { StatCard } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  formatBTC,
  formatUSD,
  formatPercentage,
  getLTVColor,
  getLTVStatus,
} from '@/lib/utils';
import { MOCK_DATA } from '@/lib/constants';
import { fadeInUp } from '@/lib/constants';
import { TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

export function PositionSummary() {
  const position = MOCK_DATA.userPosition;
  const ltvColor = getLTVColor(position.ltv);
  const ltvStatus = getLTVStatus(position.ltv);

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={fadeInUp}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
    >
      {/* Collateral Card */}
      <StatCard className="relative overflow-hidden">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm text-text-muted mb-1">Collateral</p>
            <p className="text-2xl lg:text-3xl font-bold font-mono">
              {formatBTC(position.collateral, 4)}
            </p>
            <p className="text-sm text-text-secondary mt-1">
              {formatUSD(position.collateralUSD)}
            </p>
          </div>
          <div className="p-2 rounded-lg bg-primary/10">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success" className="text-xs">
            Earning 12.5% APR
          </Badge>
        </div>
      </StatCard>

      {/* Debt Card */}
      <StatCard className="relative overflow-hidden">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm text-text-muted mb-1">Total Debt</p>
            <p className="text-2xl lg:text-3xl font-bold font-mono">
              {position.debt} bMUSD
            </p>
            <p className="text-sm text-text-secondary mt-1">
              {formatUSD(position.debt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="glass" className="text-xs">
            0% Interest Rate
          </Badge>
        </div>
      </StatCard>

      {/* LTV Ratio Card */}
      <StatCard className="relative overflow-hidden">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm text-text-muted mb-1">LTV Ratio</p>
            <div className="flex items-center gap-2">
              <p className={`text-2xl lg:text-3xl font-bold ${ltvColor}`}>
                {formatPercentage(position.ltv)}
              </p>
              {position.ltv < 50 ? (
                <CheckCircle className="h-5 w-5 text-success" />
              ) : position.ltv < 80 ? (
                <AlertCircle className="h-5 w-5 text-warning" />
              ) : (
                <AlertCircle className="h-5 w-5 text-error" />
              )}
            </div>
            <p className={`text-sm mt-1 ${ltvColor}`}>{ltvStatus}</p>
          </div>
        </div>
        <Progress
          value={position.ltv}
          className="h-2"
          ltv={true}
          showIndicator={true}
        />
        <div className="flex justify-between text-xs text-text-muted mt-2">
          <span>0%</span>
          <span>50% Max</span>
          <span>90% Liq.</span>
        </div>
      </StatCard>

      {/* Available to Borrow Card */}
      <StatCard className="relative overflow-hidden">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm text-text-muted mb-1">Can Borrow</p>
            <p className="text-2xl lg:text-3xl font-bold font-mono">
              {position.available} bMUSD
            </p>
            <p className="text-sm text-text-secondary mt-1">
              {formatUSD(position.available)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Max: {formatUSD(position.maxBorrow)}
          </Badge>
        </div>
      </StatCard>
    </motion.div>
  );
}
