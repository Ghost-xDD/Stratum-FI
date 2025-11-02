'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { formatUSD, formatNumber } from '@/lib/utils';
import { MOCK_DATA } from '@/lib/constants';
import { TrendingUp, Users, DollarSign, Percent } from 'lucide-react';

const stats = [
  {
    icon: DollarSign,
    label: 'Total Value Locked',
    value: formatUSD(MOCK_DATA.protocol.totalTVL),
    change: '+12.5%',
    trend: 'up',
  },
  {
    icon: Users,
    label: 'Active Loans',
    value: MOCK_DATA.protocol.activeLoans.toString(),
    change: '+8',
    trend: 'up',
  },
  {
    icon: Percent,
    label: 'Average APR',
    value: `${MOCK_DATA.protocol.avgAPR}%`,
    change: '+0.3%',
    trend: 'up',
  },
  {
    icon: TrendingUp,
    label: 'Total Yield Distributed',
    value: formatUSD(MOCK_DATA.protocol.totalYieldDistributed),
    change: '+$1,250',
    trend: 'up',
  },
];

export function StatsTicker() {
  return (
    <section className="py-8 glass border-y border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex overflow-hidden">
          <motion.div
            animate={{
              x: [0, -100 * stats.length + '%'],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: 'loop',
                duration: 20,
                ease: 'linear',
              },
            }}
            className="flex"
          >
            {/* Duplicate stats for seamless loop */}
            {[...stats, ...stats].map((stat, index) => (
              <div
                key={index}
                className="flex items-center gap-4 px-8 whitespace-nowrap"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-dark-surface">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-text-muted">{stat.label}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-semibold text-text-primary">
                        {stat.value}
                      </p>
                      <span
                        className={`text-sm ${
                          stat.trend === 'up' ? 'text-success' : 'text-error'
                        }`}
                      >
                        {stat.change}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
