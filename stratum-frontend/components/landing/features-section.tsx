'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import {
  Shield,
  TrendingUp,
  Zap,
  RefreshCw,
  Lock,
  Sparkles,
} from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/lib/constants';

const features = [
  {
    icon: RefreshCw,
    title: 'Self-Repaying Loans',
    description:
      'Your collateral generates yield that automatically pays down your debt. No manual payments ever needed.',
    gradient: 'from-primary/20 to-primary/5',
  },
  {
    icon: Shield,
    title: 'Zero Liquidation Risk',
    description:
      'Unlike traditional DeFi loans, you can never be liquidated. Your Bitcoin is always safe.',
    gradient: 'from-success/20 to-success/5',
  },
  {
    icon: TrendingUp,
    title: 'Dual Yield Sources',
    description:
      'Earn from trading fees on your BTC collateral. Activate Turbo mode for 2x yield opportunities.',
    gradient: 'from-secondary/20 to-secondary/5',
  },
  {
    icon: Zap,
    title: 'Instant Borrowing',
    description:
      'Borrow up to 50% of your collateral value instantly. No credit checks or approval process.',
    gradient: 'from-warning/20 to-warning/5',
  },
  {
    icon: Lock,
    title: 'Non-Custodial',
    description:
      'You maintain full control of your assets. Smart contracts handle everything trustlessly.',
    gradient: 'from-error/20 to-error/5',
  },
  {
    icon: Sparkles,
    title: 'Compound Growth',
    description:
      'Reinvest your yields to accelerate debt repayment or withdraw profits anytime.',
    gradient: 'from-primary/20 to-secondary/5',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 sm:py-32">
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
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Why Choose <span className="gradient-text">Stratum Fi</span>
            </h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              Experience the future of Bitcoin lending with features designed
              for sustainable, risk-free borrowing
            </p>
          </motion.div>

          {/* Features grid */}
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                custom={index}
                className="group"
              >
                <Card className="h-full p-6 lg:p-8 card-hover relative overflow-hidden">
                  {/* Background gradient */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                  />

                  <div className="relative z-10">
                    {/* Icon */}
                    <div className="mb-4 inline-flex p-3 rounded-xl bg-dark-surface group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-semibold mb-2 text-text-primary">
                      {feature.title}
                    </h3>
                    <p className="text-text-secondary">{feature.description}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
