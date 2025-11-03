'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, TrendingUp, Shield } from 'lucide-react';
import { fadeInUp, fadeIn, staggerContainer } from '@/lib/constants';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl" />

      <div className="container relative mx-auto px-4 py-24 sm:py-32">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="mx-auto max-w-4xl text-center"
        >
          {/* Badge */}
          <motion.div variants={fadeInUp}>
            <Badge variant="glass" className="mb-8 px-4 py-1.5">
              <Sparkles className="w-3 h-3 mr-1" />
              Powered by Mezo L2
            </Badge>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeInUp}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight"
          >
            <span className="text-text-primary">Make Your</span>
            <br />
            <span className="gradient-text">Bitcoin Work</span>
            <br />
            <span className="text-text-primary">For You</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={fadeInUp}
            className="mt-6 text-xl sm:text-2xl text-text-secondary max-w-2xl mx-auto"
          >
            Self-repaying loans on Bitcoin. Deposit BTC, borrow stablecoins.
            Your yield automatically pays down your debt. Zero liquidations.
          </motion.p>

          {/* Key stats */}
          <motion.div
            variants={fadeInUp}
            className="mt-8 flex flex-wrap justify-center gap-8 text-sm sm:text-base"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span className="text-text-muted">0% Interest Rate</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-text-muted">No Liquidations</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
              <span className="text-text-muted">Auto-Repayment</span>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            variants={fadeInUp}
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/dashboard">
              <Button size="xl" className="group">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button size="xl" variant="outline">
                Learn How It Works
              </Button>
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            variants={fadeInUp}
            className="mt-16 grid grid-cols-3 gap-8 max-w-3xl mx-auto"
          >
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold number-glow">
                $2.1M
              </div>
              <div className="text-sm text-text-muted mt-1">
                Total Value Locked
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold number-glow">
                127
              </div>
              <div className="text-sm text-text-muted mt-1">Active Loans</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold number-glow">
                12.5%
              </div>
              <div className="text-sm text-text-muted mt-1">Average APR</div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Animated orbs */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-20 left-10 w-20 h-20 bg-primary/20 rounded-full blur-2xl"
      />
      <motion.div
        animate={{
          y: [0, 20, 0],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
        className="absolute bottom-20 right-10 w-32 h-32 bg-secondary/20 rounded-full blur-2xl"
      />
    </section>
  );
}
