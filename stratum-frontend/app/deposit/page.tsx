'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { DepositModal } from '@/components/modals/deposit-modal';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/lib/constants';
import { Bitcoin, ArrowLeft, TrendingUp, Shield, Clock } from 'lucide-react';
import Link from 'next/link';

export default function DepositPage() {
  const [modalOpen, setModalOpen] = React.useState(false);

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
                <Bitcoin className="h-12 w-12 text-primary" />
              </div>
              <h1 className="text-4xl font-bold">Deposit Bitcoin</h1>
              <p className="text-xl text-text-secondary max-w-2xl mx-auto">
                Start earning yield on your BTC while maintaining full control.
                Your deposits enable self-repaying loans with zero liquidation
                risk.
              </p>
            </motion.div>

            {/* Benefits Grid */}
            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <Card className="p-6 text-center">
                <div className="inline-flex p-3 rounded-xl bg-success/10 mb-4">
                  <TrendingUp className="h-6 w-6 text-success" />
                </div>
                <h3 className="font-semibold mb-2">Earn ~12.5% APR</h3>
                <p className="text-sm text-text-secondary">
                  Your BTC earns trading fees from the MUSD/BTC liquidity pool
                </p>
              </Card>

              <Card className="p-6 text-center">
                <div className="inline-flex p-3 rounded-xl bg-primary/10 mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">No Liquidations</h3>
                <p className="text-sm text-text-secondary">
                  Unlike traditional lending, you can never lose your collateral
                </p>
              </Card>

              <Card className="p-6 text-center">
                <div className="inline-flex p-3 rounded-xl bg-secondary/10 mb-4">
                  <Clock className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="font-semibold mb-2">Withdraw Anytime</h3>
                <p className="text-sm text-text-secondary">
                  No lock periods. Remove your BTC whenever you need it
                </p>
              </Card>
            </motion.div>

            {/* CTA Section */}
            <motion.div variants={fadeInUp} className="text-center space-y-6">
              <Card className="p-8 bg-gradient-to-br from-primary/5 to-transparent">
                <h2 className="text-2xl font-semibold mb-4">Ready to Start?</h2>
                <p className="text-text-secondary mb-6 max-w-lg mx-auto">
                  Deposit any amount of BTC to begin earning yield. Once
                  deposited, you can borrow up to 50% of your collateral value
                  in bMUSD.
                </p>
                <Button
                  size="lg"
                  onClick={() => setModalOpen(true)}
                  className="min-w-[200px]"
                >
                  Deposit BTC
                </Button>
              </Card>

              <div className="flex items-center justify-center gap-4 text-sm text-text-muted">
                <Badge variant="outline">No Minimum Deposit</Badge>
                <Badge variant="outline">Gas Fees Only</Badge>
                <Badge variant="outline">Instant Confirmation</Badge>
              </div>
            </motion.div>
          </motion.div>
        </div>
      <DepositModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </DashboardLayout>
  );
}
