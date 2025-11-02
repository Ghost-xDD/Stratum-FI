'use client';

import React from 'react';
import { Header } from '@/components/layout/header';
import { PositionSummary } from '@/components/dashboard/position-summary';
import { YieldTracker } from '@/components/dashboard/yield-tracker';
import { DebtTimeline } from '@/components/dashboard/debt-timeline';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/lib/constants';
import { Plus, TrendingUp, Zap, DollarSign } from 'lucide-react';

export default function DashboardPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-dark-background">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="space-y-8"
          >
            {/* Page Header */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              <div>
                <h1 className="text-3xl font-bold text-text-primary">
                  Your Dashboard
                </h1>
                <p className="text-text-secondary mt-1">
                  Manage your self-repaying loans and track yields
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="sm">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Position
                </Button>
              </div>
            </motion.div>

            {/* Position Summary */}
            <PositionSummary />

            {/* Main Content Tabs */}
            <motion.div variants={fadeInUp}>
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full max-w-[400px] grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="yields">Yields</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <DebtTimeline />
                    </div>
                    <div className="lg:col-span-1">
                      <QuickActions />
                    </div>
                  </div>
                  <YieldTracker />
                </TabsContent>

                <TabsContent value="yields" className="space-y-6">
                  <YieldTracker />
                  <PoolPerformance />
                </TabsContent>

                <TabsContent value="activity" className="space-y-6">
                  <RecentTransactions />
                </TabsContent>
              </Tabs>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </>
  );
}

// Quick Actions Component
function QuickActions() {
  const actions = [
    {
      icon: DollarSign,
      label: 'Deposit More',
      description: 'Add BTC collateral',
      variant: 'outline' as const,
      href: '/deposit',
    },
    {
      icon: TrendingUp,
      label: 'Borrow More',
      description: 'Up to $4.77 available',
      variant: 'outline' as const,
      href: '/borrow',
    },
    {
      icon: Zap,
      label: 'Turbo Mode',
      description: 'Boost your yields',
      variant: 'default' as const,
      href: '/turbo',
    },
  ];

  return (
    <motion.div variants={fadeInUp}>
      <div className="h-full space-y-4">
        <h3 className="text-lg font-semibold">Quick Actions</h3>
        <div className="space-y-3">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant={action.variant}
              className="w-full justify-start h-auto p-4"
              asChild
            >
              <a href={action.href}>
                <action.icon className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <p className="font-medium">{action.label}</p>
                  <p className="text-xs text-text-muted font-normal">
                    {action.description}
                  </p>
                </div>
              </a>
            </Button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// Pool Performance Component
function PoolPerformance() {
  return (
    <motion.div
      variants={fadeInUp}
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
    >
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">
          MUSD/BTC Pool Performance
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-text-muted">TVL</span>
            <span className="font-mono">$1.25M</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">24h Volume</span>
            <span className="font-mono">$125K</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Your Share</span>
            <span className="font-mono">0.09%</span>
          </div>
        </div>
      </div>
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">
          bMUSD/MUSD Pool Performance
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-text-muted">TVL</span>
            <span className="font-mono">$850K</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">24h Volume</span>
            <span className="font-mono">$85K</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Your Share</span>
            <span className="font-mono">0.18%</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
