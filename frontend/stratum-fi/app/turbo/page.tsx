'use client';

import React from 'react';
import { Header } from '@/components/layout/header';
import { TurboModal } from '@/components/modals/turbo-modal';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/lib/constants';
import { formatUSD, formatPercentage } from '@/lib/utils';
import { MOCK_DATA } from '@/lib/constants';
import {
  Zap,
  ArrowLeft,
  TrendingUp,
  DollarSign,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

export default function TurboPage() {
  const [modalOpen, setModalOpen] = React.useState(false);
  const pools = MOCK_DATA.pools;
  const yields = MOCK_DATA.yields;

  return (
    <>
      <Header />
      <main className="flex-1 bg-dark-background">
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
              <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 mb-4">
                <Zap className="h-12 w-12 text-primary" />
              </div>
              <div className="flex items-center justify-center gap-2">
                <h1 className="text-4xl font-bold">Turbo Mode</h1>
                <Badge variant="secondary" className="text-sm">
                  Advanced
                </Badge>
              </div>
              <p className="text-xl text-text-secondary max-w-2xl mx-auto">
                Leverage your position for dual yield sources. Primary yield
                pays your debt, secondary yield is pure profit.
              </p>
            </motion.div>

            {/* How It Works */}
            <motion.div variants={fadeInUp}>
              <Card className="p-8 bg-gradient-to-br from-primary/5 to-secondary/5">
                <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-primary" />
                  How Turbo Mode Works
                </h2>
                <div className="space-y-6">
                  {/* Visual Flow */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4 bg-dark-surface/50">
                      <h3 className="font-semibold mb-2">
                        1. Your BTC Collateral
                      </h3>
                      <p className="text-sm text-text-secondary mb-3">
                        Earns from MUSD/BTC pool
                      </p>
                      <div className="text-center p-3 bg-dark-surface rounded">
                        <p className="text-2xl font-bold text-primary">
                          {formatPercentage(yields.primaryAPR)}
                        </p>
                        <p className="text-xs text-text-muted">APR</p>
                      </div>
                    </Card>

                    <div className="flex items-center justify-center">
                      <ArrowRight className="h-8 w-8 text-primary hidden md:block" />
                      <div className="md:hidden text-center">
                        <ArrowRight className="h-6 w-6 text-primary rotate-90 mx-auto" />
                      </div>
                    </div>

                    <Card className="p-4 bg-primary/10 border-primary/20">
                      <h3 className="font-semibold mb-2">2. Turbo Position</h3>
                      <p className="text-sm text-text-secondary mb-3">
                        Earns from bMUSD/MUSD pool
                      </p>
                      <div className="text-center p-3 bg-dark-surface rounded">
                        <p className="text-2xl font-bold text-success">
                          {formatPercentage(yields.secondaryAPR)}
                        </p>
                        <p className="text-xs text-text-muted">Extra APR</p>
                      </div>
                    </Card>
                  </div>

                  {/* Combined Results */}
                  <div className="text-center p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
                    <p className="text-sm text-text-muted mb-2">
                      Combined Earning Power
                    </p>
                    <p className="text-4xl font-bold gradient-text">
                      {formatPercentage(
                        (yields.primaryAPR + yields.secondaryAPR) / 1.5
                      )}
                    </p>
                    <p className="text-sm text-text-secondary mt-2">
                      Effective APR with leverage
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Current Status */}
            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Your Turbo Status</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-text-muted">LP Tokens</span>
                    <span className="font-mono font-semibold">
                      {pools.bmusdMusd.userLPTokens}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Position Value</span>
                    <span className="font-mono font-semibold">
                      {formatUSD(pools.bmusdMusd.userLPTokens)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Earning</span>
                    <span className="font-mono font-semibold text-success">
                      {formatPercentage(pools.bmusdMusd.apr)} APR
                    </span>
                  </div>
                  <div className="pt-3 border-t border-white/10">
                    <div className="flex justify-between">
                      <span className="text-text-muted">Claimable Yield</span>
                      <span className="font-mono font-semibold number-glow">
                        {formatUSD(yields.secondaryEarned)}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-4">Requirements</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold">1</span>
                    </div>
                    <div>
                      <p className="font-medium">bMUSD Tokens</p>
                      <p className="text-sm text-text-secondary">
                        From your borrowed amount
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold">2</span>
                    </div>
                    <div>
                      <p className="font-medium">MUSD Tokens</p>
                      <p className="text-sm text-text-secondary">
                        Equal amount (1:1 ratio)
                      </p>
                    </div>
                  </div>
                  <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
                    <p className="text-sm">
                      <span className="font-semibold text-warning">Note:</span>{' '}
                      You'll need to acquire MUSD tokens separately to match
                      your bMUSD amount.
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Benefits */}
            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <Card className="p-6 text-center">
                <DollarSign className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Extra Profit</h3>
                <p className="text-sm text-text-secondary">
                  Secondary yield is pure profit on top of debt repayment
                </p>
              </Card>
              <Card className="p-6 text-center">
                <TrendingUp className="h-8 w-8 text-success mx-auto mb-3" />
                <h3 className="font-semibold mb-2">2x Yield Sources</h3>
                <p className="text-sm text-text-secondary">
                  Earn from both MUSD/BTC and bMUSD/MUSD pools
                </p>
              </Card>
              <Card className="p-6 text-center">
                <Zap className="h-8 w-8 text-secondary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Leverage Effect</h3>
                <p className="text-sm text-text-secondary">
                  Multiply your earning potential without additional risk
                </p>
              </Card>
            </motion.div>

            {/* CTA */}
            <motion.div variants={fadeInUp} className="text-center">
              <Button
                size="lg"
                onClick={() => setModalOpen(true)}
                className="min-w-[200px] bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
              >
                Activate Turbo Mode 🚀
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </main>

      <TurboModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
