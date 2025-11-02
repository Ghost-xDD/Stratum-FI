'use client';

import React from 'react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/lib/constants';
import { formatUSD, formatPercentage } from '@/lib/utils';
import { MOCK_DATA } from '@/lib/constants';
import {
  Sparkles,
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Clock,
  Info,
} from 'lucide-react';
import Link from 'next/link';

export default function HarvestPage() {
  const [isHarvesting, setIsHarvesting] = React.useState(false);
  const yields = MOCK_DATA.yields;
  const totalClaimable = yields.claimable;

  const handleHarvest = async () => {
    setIsHarvesting(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsHarvesting(false);
    // In real app, would update yields
  };

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
                <Sparkles className="h-12 w-12 text-primary" />
              </div>
              <h1 className="text-4xl font-bold">Harvest Yields</h1>
              <p className="text-xl text-text-secondary max-w-2xl mx-auto">
                Collect your accumulated trading fees from both yield sources
              </p>
            </motion.div>

            {/* Yield Summary */}
            <motion.div variants={fadeInUp}>
              <Card className="p-8 bg-gradient-to-br from-primary/5 to-secondary/5">
                <div className="text-center mb-8">
                  <p className="text-sm text-text-muted mb-2">
                    Total Claimable
                  </p>
                  <p className="text-5xl font-bold number-glow mb-2">
                    {formatUSD(totalClaimable)}
                  </p>
                  <Badge variant="success" className="animate-pulse">
                    Ready to Harvest
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-6 bg-dark-surface/50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Primary Yield</h3>
                      <Badge variant="outline">MUSD/BTC</Badge>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-text-muted">Earned</span>
                        <span className="font-mono font-semibold">
                          {formatUSD(yields.primaryEarned)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">APR</span>
                        <span className="font-mono text-success">
                          {formatPercentage(yields.primaryAPR)}
                        </span>
                      </div>
                      <div className="pt-3 border-t border-white/10">
                        <p className="text-xs text-text-muted">
                          These fees are automatically paying down your debt
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 bg-dark-surface/50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Secondary Yield</h3>
                      <Badge variant="secondary">bMUSD/MUSD</Badge>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-text-muted">Earned</span>
                        <span className="font-mono font-semibold">
                          {formatUSD(yields.secondaryEarned)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">APR</span>
                        <span className="font-mono text-success">
                          {formatPercentage(yields.secondaryAPR)}
                        </span>
                      </div>
                      <div className="pt-3 border-t border-white/10">
                        <p className="text-xs text-text-muted">
                          Pure profit from your Turbo Mode position
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </Card>
            </motion.div>

            {/* Info Section */}
            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <Card className="p-6 text-center">
                <DollarSign className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Compound Growth</h3>
                <p className="text-sm text-text-secondary">
                  Reinvest yields to accelerate debt repayment
                </p>
              </Card>
              <Card className="p-6 text-center">
                <Clock className="h-8 w-8 text-secondary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Auto-Harvest</h3>
                <p className="text-sm text-text-secondary">
                  Primary yields are automatically applied to debt
                </p>
              </Card>
              <Card className="p-6 text-center">
                <TrendingUp className="h-8 w-8 text-success mx-auto mb-3" />
                <h3 className="font-semibold mb-2">No Gas Fees</h3>
                <p className="text-sm text-text-secondary">
                  Protocol covers harvesting costs for you
                </p>
              </Card>
            </motion.div>

            {/* Important Note */}
            <motion.div variants={fadeInUp}>
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold text-primary mb-1">
                      How Harvesting Works
                    </p>
                    <p className="text-sm text-text-secondary">
                      Primary yield (MUSD/BTC pool) automatically reduces your
                      debt balance. Only secondary yield (bMUSD/MUSD pool) needs
                      manual harvesting. The protocol's keeper bot handles the
                      primary yield for you!
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div variants={fadeInUp} className="text-center">
              <Button
                size="lg"
                onClick={handleHarvest}
                disabled={totalClaimable < 0.01}
                loading={isHarvesting}
                className="min-w-[200px]"
              >
                {isHarvesting
                  ? 'Harvesting...'
                  : `Harvest ${formatUSD(totalClaimable)}`}
              </Button>
              {totalClaimable < 0.01 && (
                <p className="text-sm text-text-muted mt-2">
                  Minimum harvest amount: $0.01
                </p>
              )}
            </motion.div>
          </motion.div>
        </div>
      </main>
    </>
  );
}
