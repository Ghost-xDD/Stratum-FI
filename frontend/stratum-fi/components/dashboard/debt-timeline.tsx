'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  formatUSD,
  calculateDaysToRepay,
  calculateProjectedDebt,
} from '@/lib/utils';
import { MOCK_DATA } from '@/lib/constants';
import { fadeInUp } from '@/lib/constants';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CalendarDays, TrendingDown, Target } from 'lucide-react';

export function DebtTimeline() {
  const position = MOCK_DATA.userPosition;
  const yields = MOCK_DATA.yields;

  const daysToRepay = calculateDaysToRepay(
    position.debt,
    position.collateralUSD,
    yields.primaryAPR
  );

  const repaidPercentage = 35; // Mock: 35% already repaid

  // Generate timeline data
  const timelineData = Array.from({ length: 7 }, (_, i) => {
    const days = i * 30;
    const projectedDebt = calculateProjectedDebt(
      position.debt,
      position.collateralUSD,
      yields.primaryAPR,
      days
    );
    return {
      day: days,
      debt: projectedDebt,
      label: days === 0 ? 'Today' : `Day ${days}`,
    };
  });

  return (
    <motion.div initial="initial" animate="animate" variants={fadeInUp}>
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-xl font-semibold">
            Debt Repayment Timeline
          </CardTitle>
          <Badge variant="success" className="flex items-center gap-1">
            <TrendingDown className="h-3 w-3" />
            Auto-Repaying
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Status */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-text-muted">Current Debt</p>
                <p className="text-2xl font-bold">{formatUSD(position.debt)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-text-muted">Est. Paid Off</p>
                <p className="text-2xl font-bold text-success">
                  {daysToRepay} days
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Progress</span>
                <span className="font-semibold">
                  {repaidPercentage}% repaid
                </span>
              </div>
              <Progress value={repaidPercentage} className="h-3" />
            </div>
          </div>

          {/* Timeline Chart */}
          <div className="h-[200px] -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis dataKey="label" stroke="#94A3B8" fontSize={12} />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={12}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#F8FAFC' }}
                  formatter={(value: any) => formatUSD(value)}
                />
                <Line
                  type="monotone"
                  dataKey="debt"
                  stroke="#F7931A"
                  strokeWidth={3}
                  dot={{ fill: '#F7931A', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Milestones */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-dark-surface/50 rounded-lg">
              <div className="flex justify-center mb-2">
                <CalendarDays className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm font-semibold">Day 30</p>
              <p className="text-xs text-text-muted mt-1">{formatUSD(40)}</p>
            </div>
            <div className="text-center p-3 bg-dark-surface/50 rounded-lg">
              <div className="flex justify-center mb-2">
                <CalendarDays className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm font-semibold">Day 60</p>
              <p className="text-xs text-text-muted mt-1">{formatUSD(32)}</p>
            </div>
            <div className="text-center p-3 bg-dark-surface/50 rounded-lg">
              <div className="flex justify-center mb-2">
                <Target className="h-5 w-5 text-success" />
              </div>
              <p className="text-sm font-semibold">Day {daysToRepay}</p>
              <p className="text-xs text-success mt-1">Debt Free!</p>
            </div>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-sm text-text-primary">
              <span className="font-semibold">💡 Pro Tip:</span> Your debt
              decreases automatically as your collateral earns trading fees. No
              action required!
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
