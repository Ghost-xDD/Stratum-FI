'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  WalletIcon,
  CoinsIcon,
  TrendingUpIcon,
  CheckCircle,
} from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/lib/constants';

const steps = [
  {
    step: 1,
    icon: WalletIcon,
    title: 'Deposit Bitcoin',
    description:
      'Connect your wallet and deposit BTC into the Stratum vault. Your BTC enters the MUSD/BTC liquidity pool.',
    highlight: 'No minimums • Withdraw anytime',
  },
  {
    step: 2,
    icon: CoinsIcon,
    title: 'Borrow bMUSD',
    description:
      'Borrow up to 50% of your collateral value in bMUSD stablecoins. Zero interest rate - your yield covers it all.',
    highlight: '0% interest • No credit check',
  },
  {
    step: 3,
    icon: TrendingUpIcon,
    title: 'Earn Trading Fees',
    description:
      'Your BTC earns ~12.5% APR from DEX trading fees. These yields automatically pay down your debt over time.',
    highlight: 'Passive income • Auto-repayment',
  },
  {
    step: 4,
    icon: CheckCircle,
    title: 'Debt-Free Profit',
    description:
      'After 90-180 days, your debt is fully repaid. Continue earning yield or withdraw your BTC + profits.',
    highlight: 'Keep all profits • Repeat anytime',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 sm:py-32 bg-dark-surface/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="mx-auto max-w-7xl"
        >
          {/* Section header */}
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <Badge variant="glass" className="mb-4">
              Simple Process
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              How <span className="gradient-text">Stratum Fi</span> Works
            </h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              Four simple steps to unlock your Bitcoin&apos;s earning potential
              without selling
            </p>
          </motion.div>

          {/* Steps */}
          <div className="relative">
            {/* Connection line (desktop only) */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent -translate-y-1/2" />

            <motion.div
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative"
            >
              {steps.map((step, index) => (
                <motion.div
                  key={step.step}
                  variants={fadeInUp}
                  custom={index}
                  className="relative"
                >
                  {/* Mobile connection line */}
                  {index < steps.length - 1 && (
                    <div className="lg:hidden absolute top-full left-1/2 w-0.5 h-8 bg-gradient-to-b from-primary/30 to-transparent -translate-x-1/2" />
                  )}

                  <Card className="h-full p-6 relative overflow-hidden group">
                    {/* Step number */}
                    <div className="absolute top-4 right-4 text-6xl font-bold text-primary/10 group-hover:text-primary/20 transition-colors">
                      {step.step}
                    </div>

                    {/* Icon */}
                    <div className="relative z-10 mb-4">
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <step.icon className="h-7 w-7 text-primary" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10">
                      <h3 className="text-xl font-semibold mb-2 text-text-primary">
                        {step.title}
                      </h3>
                      <p className="text-text-secondary mb-4">
                        {step.description}
                      </p>
                      <p className="text-sm text-primary font-medium">
                        {step.highlight}
                      </p>
                    </div>

                    {/* Hover effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Visual flow diagram */}
          <motion.div variants={fadeInUp} className="mt-16 max-w-4xl mx-auto">
            <Card className="p-8 lg:p-12 relative overflow-hidden">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-semibold mb-2">
                  The Magic of Self-Repaying Loans
                </h3>
                <p className="text-text-secondary">
                  Your yield continuously reduces your debt
                </p>
              </div>

              {/* Diagram */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                <div className="text-center">
                  <div className="text-4xl font-bold number-glow mb-2">
                    $100
                  </div>
                  <p className="text-sm text-text-muted">Initial Debt</p>
                </div>

                <div className="relative">
                  <div className="h-2 bg-dark-surface rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: '0%' }}
                      whileInView={{ width: '70%' }}
                      transition={{ duration: 2, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                    />
                  </div>
                  <p className="text-center text-sm text-text-muted mt-2">
                    Time passes...
                  </p>
                </div>

                <div className="text-center">
                  <div className="text-4xl font-bold text-success mb-2">$0</div>
                  <p className="text-sm text-text-muted">
                    Debt after ~120 days
                  </p>
                </div>
              </div>

              <div className="mt-8 text-center">
                <Badge variant="success" className="text-sm px-4 py-1">
                  Your collateral keeps earning even after debt is repaid!
                </Badge>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
