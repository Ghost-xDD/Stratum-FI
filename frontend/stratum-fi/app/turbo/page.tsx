'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { TurboModal } from '@/components/modals/turbo-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/lib/constants';
import { formatUSD, formatPercentage, formatNumber } from '@/lib/utils';
import { MOCK_DATA } from '@/lib/constants';
import {
  Zap,
  ArrowLeft,
  TrendingUp,
  DollarSign,
  Activity,
  BarChart3,
  Info,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Layers,
  Target,
  PieChart,
  Shield,
} from 'lucide-react';
import Link from 'next/link';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Legend,
} from 'recharts';

// Mock data for charts
const performanceData = [
  { time: '00:00', primary: 12.2, secondary: 8.1, combined: 10.15 },
  { time: '04:00', primary: 12.3, secondary: 8.2, combined: 10.25 },
  { time: '08:00', primary: 12.5, secondary: 8.3, combined: 10.4 },
  { time: '12:00', primary: 12.4, secondary: 8.4, combined: 10.4 },
  { time: '16:00', primary: 12.6, secondary: 8.3, combined: 10.45 },
  { time: '20:00', primary: 12.5, secondary: 8.3, combined: 10.4 },
  { time: '24:00', primary: 12.5, secondary: 8.3, combined: 10.4 },
];

const poolAllocation = [
  { name: 'MUSD/BTC', value: 60, color: '#F7931A' },
  { name: 'bMUSD/MUSD', value: 40, color: '#02807D' },
];

const leverageData = [{ name: 'Leverage', value: 75, fill: '#F7931A' }];

const recentTrades = [
  {
    time: '2 mins ago',
    type: 'Add Liquidity',
    amount: '$125.50',
    status: 'success',
  },
  {
    time: '15 mins ago',
    type: 'Harvest Yield',
    amount: '$0.85',
    status: 'success',
  },
  {
    time: '1 hour ago',
    type: 'Rebalance',
    amount: '$500.00',
    status: 'pending',
  },
  {
    time: '3 hours ago',
    type: 'Add Liquidity',
    amount: '$250.00',
    status: 'success',
  },
];

export default function TurboPage() {
  const [modalOpen, setModalOpen] = React.useState(false);
  const pools = MOCK_DATA.pools;
  const yields = MOCK_DATA.yields;
  const position = MOCK_DATA.userPosition;

  const totalValue = pools.musdBtc.userLPTokens + pools.bmusdMusd.userLPTokens;
  const leverage = ((position.debt / position.collateralUSD) * 100).toFixed(1);
  const combinedAPR = (yields.primaryAPR + yields.secondaryAPR) / 1.5;

  return (
    <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="space-y-6"
          >
            {/* Header Section */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
            >
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                </Link>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-bold">Turbo Mode</h1>
                    <Badge variant="secondary" className="animate-pulse">
                      <Zap className="h-3 w-3 mr-1" />
                      Advanced
                    </Badge>
                  </div>
                  <p className="text-text-secondary mt-1">
                    Leverage your position for maximum yield generation
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="sm">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
                <Button
                  size="sm"
                  onClick={() => setModalOpen(true)}
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Manage Position
                </Button>
              </div>
            </motion.div>

            {/* Key Metrics Cards */}
            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              <Card className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full blur-2xl" />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-text-muted">Total Position</p>
                    <DollarSign className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-2xl font-bold">{formatUSD(totalValue)}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <ArrowUpRight className="h-4 w-4 text-success" />
                    <span className="text-sm text-success">+5.2%</span>
                    <span className="text-xs text-text-muted">24h</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-secondary/10 rounded-full blur-2xl" />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-text-muted">Combined APR</p>
                    <TrendingUp className="h-4 w-4 text-secondary" />
                  </div>
                  <p className="text-2xl font-bold gradient-text">
                    {formatPercentage(combinedAPR)}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <Activity className="h-4 w-4 text-text-muted" />
                    <span className="text-sm text-text-muted">Live rate</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-warning/10 rounded-full blur-2xl" />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-text-muted">Leverage</p>
                    <Layers className="h-4 w-4 text-warning" />
                  </div>
                  <p className="text-2xl font-bold">{leverage}x</p>
                  <Progress
                    value={parseFloat(leverage) * 10}
                    className="h-1 mt-2"
                  />
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-success/10 rounded-full blur-2xl" />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-text-muted">Daily Earnings</p>
                    <Clock className="h-4 w-4 text-success" />
                  </div>
                  <p className="text-2xl font-bold">{formatUSD(0.05)}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-sm text-text-muted">
                      Next harvest in 6h
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Main Dashboard Content */}
            <motion.div variants={fadeInUp}>
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="grid w-full max-w-[600px] grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                  <TabsTrigger value="pools">Pool Analysis</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Yield Performance Chart */}
                    <Card className="lg:col-span-2">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>Yield Performance</span>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              24H
                            </Button>
                            <Button variant="ghost" size="sm">
                              7D
                            </Button>
                            <Button variant="ghost" size="sm">
                              30D
                            </Button>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <AreaChart data={performanceData}>
                            <defs>
                              <linearGradient
                                id="primaryGradient"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="5%"
                                  stopColor="#F7931A"
                                  stopOpacity={0.3}
                                />
                                <stop
                                  offset="95%"
                                  stopColor="#F7931A"
                                  stopOpacity={0}
                                />
                              </linearGradient>
                              <linearGradient
                                id="secondaryGradient"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="5%"
                                  stopColor="#02807D"
                                  stopOpacity={0.3}
                                />
                                <stop
                                  offset="95%"
                                  stopColor="#02807D"
                                  stopOpacity={0}
                                />
                              </linearGradient>
                            </defs>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="rgba(255,255,255,0.1)"
                            />
                            <XAxis
                              dataKey="time"
                              stroke="#94A3B8"
                              fontSize={12}
                            />
                            <YAxis stroke="#94A3B8" fontSize={12} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#1E293B',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                              }}
                            />
                            <Area
                              type="monotone"
                              dataKey="primary"
                              stroke="#F7931A"
                              fillOpacity={1}
                              fill="url(#primaryGradient)"
                              strokeWidth={2}
                            />
                            <Area
                              type="monotone"
                              dataKey="secondary"
                              stroke="#02807D"
                              fillOpacity={1}
                              fill="url(#secondaryGradient)"
                              strokeWidth={2}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Position Breakdown */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Position Breakdown</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                          <RePieChart>
                            <Pie
                              data={poolAllocation}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {poolAllocation.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={entry.color}
                                />
                              ))}
                            </Pie>
                            <Tooltip />
                          </RePieChart>
                        </ResponsiveContainer>
                        <div className="space-y-3 mt-4">
                          {poolAllocation.map((pool) => (
                            <div
                              key={pool.name}
                              className="flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: pool.color }}
                                />
                                <span className="text-sm">{pool.name}</span>
                              </div>
                              <span className="text-sm font-medium">
                                {pool.value}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Strategy Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
                      <CardHeader className="relative">
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="h-5 w-5 text-primary" />
                          Risk Management
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="relative space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-text-muted">
                            Health Factor
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-semibold text-success">
                              2.8
                            </span>
                            <Badge variant="success" className="text-xs">
                              Safe
                            </Badge>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-text-muted">
                            Max Leverage
                          </span>
                          <span className="text-lg font-semibold">2.5x</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-text-muted">
                            Liquidation Price
                          </span>
                          <span className="text-lg font-semibold">N/A</span>
                        </div>
                        <div className="pt-2 border-t border-white/10">
                          <p className="text-xs text-text-muted">
                            Your position is protected from liquidation due to
                            the self-repaying mechanism
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent" />
                      <CardHeader className="relative">
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-secondary" />
                          Strategy Optimization
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="relative space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-text-muted">
                            Efficiency Score
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-semibold text-primary">
                              92%
                            </span>
                            <Badge variant="primary" className="text-xs">
                              Optimal
                            </Badge>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-text-muted">
                            Rebalance Needed
                          </span>
                          <span className="text-sm text-success">No</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          disabled
                        >
                          <Activity className="h-4 w-4 mr-2" />
                          Auto-Rebalance Active
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Performance Tab */}
                <TabsContent value="performance" className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>APR Comparison</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart
                            data={[
                              { name: 'Primary Pool', apr: yields.primaryAPR },
                              {
                                name: 'Secondary Pool',
                                apr: yields.secondaryAPR,
                              },
                              { name: 'Combined', apr: combinedAPR },
                            ]}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="rgba(255,255,255,0.1)"
                            />
                            <XAxis
                              dataKey="name"
                              stroke="#94A3B8"
                              fontSize={12}
                            />
                            <YAxis stroke="#94A3B8" fontSize={12} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#1E293B',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                              }}
                            />
                            <Bar
                              dataKey="apr"
                              fill="#F7931A"
                              radius={[8, 8, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Leverage Efficiency</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <RadialBarChart
                            cx="50%"
                            cy="50%"
                            innerRadius="30%"
                            outerRadius="90%"
                            data={leverageData}
                          >
                            <RadialBar
                              minAngle={15}
                              background
                              clockWise
                              dataKey="value"
                              cornerRadius={10}
                            />
                            <Legend
                              iconSize={10}
                              layout="vertical"
                              verticalAlign="middle"
                              align="right"
                            />
                            <Tooltip />
                          </RadialBarChart>
                        </ResponsiveContainer>
                        <div className="text-center mt-4">
                          <p className="text-2xl font-bold">{leverage}x</p>
                          <p className="text-sm text-text-muted">
                            Current Leverage
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Yield Metrics */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Detailed Yield Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-text-muted">
                            24H Performance
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">Fees Earned</span>
                              <span className="font-mono">
                                {formatUSD(0.85)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">IL</span>
                              <span className="font-mono text-success">
                                -0.02%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Net Return</span>
                              <span className="font-mono text-success">
                                +{formatUSD(0.83)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-text-muted">
                            7D Performance
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">Fees Earned</span>
                              <span className="font-mono">
                                {formatUSD(5.95)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">IL</span>
                              <span className="font-mono text-success">
                                -0.15%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Net Return</span>
                              <span className="font-mono text-success">
                                +{formatUSD(5.8)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-text-muted">
                            30D Performance
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">Fees Earned</span>
                              <span className="font-mono">
                                {formatUSD(25.5)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">IL</span>
                              <span className="font-mono text-error">
                                -0.85%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Net Return</span>
                              <span className="font-mono text-success">
                                +{formatUSD(24.65)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Pool Analysis Tab */}
                <TabsContent value="pools" className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>MUSD/BTC Pool</span>
                          <Badge variant="primary">Primary</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-text-muted">
                              Your Position
                            </p>
                            <p className="text-lg font-semibold">
                              {formatUSD(pools.musdBtc.userLPTokens)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-text-muted">
                              Pool Share
                            </p>
                            <p className="text-lg font-semibold">
                              {formatPercentage(pools.musdBtc.userShare * 100)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-text-muted">TVL</p>
                            <p className="text-lg font-semibold">
                              {formatUSD(pools.musdBtc.tvl)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-text-muted">
                              24h Volume
                            </p>
                            <p className="text-lg font-semibold">
                              {formatUSD(pools.musdBtc.volume24h)}
                            </p>
                          </div>
                        </div>
                        <div className="pt-4 border-t border-white/10">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-text-muted">
                              Current APR
                            </span>
                            <span className="text-lg font-semibold text-primary">
                              {formatPercentage(pools.musdBtc.apr)}
                            </span>
                          </div>
                          <Progress
                            value={pools.musdBtc.apr}
                            max={20}
                            className="h-2 mt-2"
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>bMUSD/MUSD Pool</span>
                          <Badge variant="secondary">Secondary</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-text-muted">
                              Your Position
                            </p>
                            <p className="text-lg font-semibold">
                              {formatUSD(pools.bmusdMusd.userLPTokens)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-text-muted">
                              Pool Share
                            </p>
                            <p className="text-lg font-semibold">
                              {formatPercentage(
                                pools.bmusdMusd.userShare * 100
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-text-muted">TVL</p>
                            <p className="text-lg font-semibold">
                              {formatUSD(pools.bmusdMusd.tvl)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-text-muted">
                              24h Volume
                            </p>
                            <p className="text-lg font-semibold">
                              {formatUSD(pools.bmusdMusd.volume24h)}
                            </p>
                          </div>
                        </div>
                        <div className="pt-4 border-t border-white/10">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-text-muted">
                              Current APR
                            </span>
                            <span className="text-lg font-semibold text-secondary">
                              {formatPercentage(pools.bmusdMusd.apr)}
                            </span>
                          </div>
                          <Progress
                            value={pools.bmusdMusd.apr}
                            max={20}
                            className="h-2 mt-2"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Pool Health Indicators */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Pool Health Indicators</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="text-center">
                          <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-success/20 flex items-center justify-center">
                            <Activity className="h-8 w-8 text-success" />
                          </div>
                          <p className="text-sm font-medium">Liquidity Depth</p>
                          <p className="text-xs text-text-muted mt-1">
                            Excellent
                          </p>
                        </div>
                        <div className="text-center">
                          <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-primary/20 flex items-center justify-center">
                            <BarChart3 className="h-8 w-8 text-primary" />
                          </div>
                          <p className="text-sm font-medium">
                            Volume/TVL Ratio
                          </p>
                          <p className="text-xs text-text-muted mt-1">10.2%</p>
                        </div>
                        <div className="text-center">
                          <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-secondary/20 flex items-center justify-center">
                            <PieChart className="h-8 w-8 text-secondary" />
                          </div>
                          <p className="text-sm font-medium">Fee Efficiency</p>
                          <p className="text-xs text-text-muted mt-1">High</p>
                        </div>
                        <div className="text-center">
                          <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-warning/20 flex items-center justify-center">
                            <Shield className="h-8 w-8 text-warning" />
                          </div>
                          <p className="text-sm font-medium">IL Risk</p>
                          <p className="text-xs text-text-muted mt-1">Low</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* History Tab */}
                <TabsContent value="history" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Transaction History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recentTrades.map((trade, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 rounded-lg bg-dark-surface/50 hover:bg-dark-surface transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className={`p-2 rounded-lg ${
                                  trade.status === 'success'
                                    ? 'bg-success/10'
                                    : 'bg-warning/10'
                                }`}
                              >
                                {trade.type === 'Add Liquidity' ? (
                                  <ArrowDownRight
                                    className={`h-4 w-4 ${
                                      trade.status === 'success'
                                        ? 'text-success'
                                        : 'text-warning'
                                    }`}
                                  />
                                ) : trade.type === 'Harvest Yield' ? (
                                  <TrendingUp
                                    className={`h-4 w-4 ${
                                      trade.status === 'success'
                                        ? 'text-success'
                                        : 'text-warning'
                                    }`}
                                  />
                                ) : (
                                  <Activity
                                    className={`h-4 w-4 ${
                                      trade.status === 'success'
                                        ? 'text-success'
                                        : 'text-warning'
                                    }`}
                                  />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{trade.type}</p>
                                <p className="text-sm text-text-muted">
                                  {trade.time}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-mono font-semibold">
                                {trade.amount}
                              </p>
                              <Badge
                                variant={
                                  trade.status === 'success'
                                    ? 'success'
                                    : 'warning'
                                }
                                className="text-xs"
                              >
                                {trade.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>

            {/* Advanced Tips */}
            <motion.div variants={fadeInUp}>
              <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary" />
                    Pro Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold">1</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Optimal Leverage</p>
                        <p className="text-xs text-text-muted mt-1">
                          Keep leverage between 1.5x-2x for best risk/reward
                          ratio
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold">2</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Rebalance Timing</p>
                        <p className="text-xs text-text-muted mt-1">
                          Rebalance when pool ratios deviate by more than 10%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold">3</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Compound Strategy</p>
                        <p className="text-xs text-text-muted mt-1">
                          Reinvest secondary yield monthly for exponential
                          growth
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      <TurboModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </DashboardLayout>
  );
}
