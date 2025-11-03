'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { BorrowModal } from '@/components/modals/borrow-modal';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/lib/constants';
import {
  formatUSD,
  formatBTC,
  formatPercentage,
  getLTVColor,
} from '@/lib/utils';
import { MOCK_DATA } from '@/lib/constants';
import {
  DollarSign,
  ArrowLeft,
  Percent,
  CheckCircle,
  TrendingDown,
} from 'lucide-react';
import Link from 'next/link';

export default function BorrowPage() {
  const [modalOpen, setModalOpen] = React.useState(false);
  const position = MOCK_DATA.userPosition;

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="space-y-8"
        >
          {/* Back button */}
          <motion.div variants={fadeInUp}>
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </motion.div>

          {/* Page Header */}
          <motion.div variants={fadeInUp} className="text-center space-y-4">
            <div className="inline-flex p-4 rounded-2xl bg-primary/10 mb-4">
              <DollarSign className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">Borrow bMUSD</h1>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              Access liquidity without selling your Bitcoin. Your yield
              automatically repays the loan - no manual payments needed.
            </p>
          </motion.div>

          {/* Current Position */}
          <motion.div variants={fadeInUp}>
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">
                Your Borrowing Power
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-text-muted mb-1">Collateral</p>
                  <p className="text-2xl font-bold">
                    {formatBTC(position.collateral, 4)}
                  </p>
                  <p className="text-sm text-text-secondary">
                    {formatUSD(position.collateralUSD)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-text-muted mb-1">Current Debt</p>
                  <p className="text-2xl font-bold">{position.debt} bMUSD</p>
                  <p className="text-sm text-text-secondary">
                    {formatUSD(position.debt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-text-muted mb-1">
                    Available to Borrow
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {position.available} bMUSD
                  </p>
                  <p className="text-sm text-text-secondary">
                    {formatUSD(position.available)}
                  </p>
                </div>
              </div>
              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Current LTV</span>
                  <span
                    className={`font-semibold ${getLTVColor(position.ltv)}`}
                  >
                    {formatPercentage(position.ltv)}
                  </span>
                </div>
                <Progress value={position.ltv} className="h-2" ltv={true} />
                <div className="flex justify-between text-xs text-text-muted">
                  <span>0%</span>
                  <span>50% Max</span>
                  <span>90% Liq.</span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Features */}
          <motion.div
            variants={fadeInUp}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <Card className="p-6 text-center">
              <div className="inline-flex p-3 rounded-xl bg-success/10 mb-4">
                <Percent className="h-6 w-6 text-success" />
              </div>
              <h3 className="font-semibold mb-2">0% Interest Rate</h3>
              <p className="text-sm text-text-secondary">
                Your collateral yield covers all interest automatically
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="inline-flex p-3 rounded-xl bg-primary/10 mb-4">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">No Liquidations</h3>
              <p className="text-sm text-text-secondary">
                Your position is always safe, regardless of market conditions
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="inline-flex p-3 rounded-xl bg-secondary/10 mb-4">
                <TrendingDown className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="font-semibold mb-2">Self-Repaying</h3>
              <p className="text-sm text-text-secondary">
                Watch your debt decrease automatically over time
              </p>
            </Card>
          </motion.div>

          {/* Example Scenario */}
          <motion.div variants={fadeInUp}>
            <Card className="p-8 bg-gradient-to-br from-primary/5 to-transparent">
              <h2 className="text-2xl font-semibold mb-4">Example Scenario</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-text-muted mb-2">
                      If you borrow:
                    </p>
                    <p className="text-3xl font-bold">
                      {position.available} bMUSD
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-text-muted mb-2">
                      Est. time to repay:
                    </p>
                    <p className="text-3xl font-bold text-success">~120 days</p>
                  </div>
                </div>
                <p className="text-text-secondary">
                  With your collateral earning ~12.5% APR and zero interest on
                  debt, your loan will be fully repaid in approximately 4 months
                  without any action from you.
                </p>
              </div>
            </Card>
          </motion.div>

          {/* CTA */}
          <motion.div variants={fadeInUp} className="text-center">
            <Button
              size="lg"
              onClick={() => setModalOpen(true)}
              className="min-w-[200px]"
              disabled={position.available <= 0}
            >
              {position.available > 0 ? 'Borrow bMUSD' : 'No Borrowing Power'}
            </Button>
            {position.available <= 0 && (
              <p className="text-sm text-text-muted mt-2">
                Deposit BTC first to enable borrowing
              </p>
            )}
          </motion.div>
        </motion.div>
      </div>
      <BorrowModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </DashboardLayout>
  );
}
