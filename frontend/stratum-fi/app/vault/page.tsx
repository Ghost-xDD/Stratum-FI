'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/lib/constants';
import {
  formatUSD,
  formatPercentage,
  formatBTC,
  getLTVColor,
} from '@/lib/utils';
import { MOCK_DATA } from '@/lib/constants';
import {
  Bitcoin,
  DollarSign,
  ArrowRight,
  Info,
  AlertCircle,
  TrendingUp,
  Shield,
  Zap,
} from 'lucide-react';

export default function VaultPage() {
  const [depositAmount, setDepositAmount] = React.useState('');
  const [borrowAmount, setBorrowAmount] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);

  const position = MOCK_DATA.userPosition;
  const btcPrice = MOCK_DATA.btcPrice;
  const yields = MOCK_DATA.yields;

  // Calculate values
  const depositValue = depositAmount ? parseFloat(depositAmount) * btcPrice : 0;
  const newCollateral = position.collateralUSD + depositValue;
  const maxBorrow = newCollateral * 0.5; // 50% LTV
  const borrowValue = borrowAmount;
  const newDebt = position.debt + borrowValue;
  const newLTV = newCollateral > 0 ? (newDebt / newCollateral) * 100 : 0;

  const handleDeposit = async () => {
    setIsLoading(true);
    // Will integrate with VaultController.deposit()
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
  };

  const handleBorrow = async () => {
    setIsLoading(true);
    // Will integrate with DebtManager.borrow()
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="space-y-6"
        >
          {/* Header */}
          <motion.div variants={fadeInUp}>
            <h1 className="text-3xl font-bold">Vault</h1>
            <p className="text-text-secondary mt-1">
              Deposit BTC collateral and borrow bMUSD
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Action Area */}
            <motion.div variants={fadeInUp} className="lg:col-span-2 space-y-6">
              {/* Tabs for Deposit/Borrow */}
              <Card>
                <CardContent className="p-6">
                  <Tabs defaultValue="deposit" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="deposit" className="gap-2">
                        <Bitcoin className="h-4 w-4" />
                        Deposit
                      </TabsTrigger>
                      <TabsTrigger value="borrow" className="gap-2">
                        <DollarSign className="h-4 w-4" />
                        Borrow
                      </TabsTrigger>
                    </TabsList>

                    {/* Deposit Tab */}
                    <TabsContent value="deposit" className="space-y-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Amount to Deposit
                          </label>
                          <Input
                            type="number"
                            placeholder="0.0"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                            suffix="BTC"
                            className="text-lg h-14"
                          />
                          <div className="flex justify-between mt-2 text-sm text-text-muted">
                            <span>≈ {formatUSD(depositValue)}</span>
                            <span>Balance: 0.059 BTC</span>
                          </div>
                        </div>

                        {/* Quick Amount Buttons */}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDepositAmount('0.001')}
                          >
                            0.001 BTC
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDepositAmount('0.01')}
                          >
                            0.01 BTC
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDepositAmount('0.059')}
                          >
                            Max
                          </Button>
                        </div>

                        {/* What You Get */}
                        {depositAmount && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 rounded-lg bg-primary/5 border border-primary/20"
                          >
                            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-primary" />
                              What You'll Get
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-text-muted">
                                  Earn APR
                                </span>
                                <span className="font-semibold text-primary">
                                  ~{formatPercentage(yields.primaryAPR)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-text-muted">
                                  New borrowing power
                                </span>
                                <span className="font-semibold">
                                  {formatUSD(depositValue * 0.5)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-text-muted">
                                  Total collateral
                                </span>
                                <span className="font-semibold">
                                  {formatUSD(newCollateral)}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        <Button
                          className="w-full h-12"
                          disabled={
                            !depositAmount || parseFloat(depositAmount) <= 0
                          }
                          onClick={handleDeposit}
                          loading={isLoading}
                        >
                          Deposit BTC
                        </Button>
                      </div>
                    </TabsContent>

                    {/* Borrow Tab */}
                    <TabsContent value="borrow" className="space-y-6">
                      <div className="space-y-4">
                        {/* Available to Borrow */}
                        <div className="p-4 rounded-lg bg-secondary/5 border border-secondary/20">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-text-muted">
                              Available to Borrow
                            </span>
                            <span className="text-2xl font-bold gradient-text">
                              {formatUSD(position.borrowingPowerRemaining)}
                            </span>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between mb-3">
                            <label className="text-sm font-medium">
                              Borrow Amount
                            </label>
                            <span className="text-sm font-mono">
                              {formatUSD(borrowAmount)}
                            </span>
                          </div>
                          <Slider
                            value={[borrowAmount]}
                            onValueChange={(value) => setBorrowAmount(value[0])}
                            max={position.borrowingPowerRemaining}
                            step={0.1}
                            showValue={false}
                          />
                          <div className="flex justify-between mt-2 text-xs text-text-muted">
                            <span>$0</span>
                            <span>
                              {formatUSD(position.borrowingPowerRemaining)}
                            </span>
                          </div>
                        </div>

                        {/* Quick Percentage Buttons */}
                        <div className="grid grid-cols-4 gap-2">
                          {[25, 50, 75, 100].map((pct) => (
                            <Button
                              key={pct}
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setBorrowAmount(
                                  (position.borrowingPowerRemaining * pct) / 100
                                )
                              }
                            >
                              {pct}%
                            </Button>
                          ))}
                        </div>

                        {/* Loan Terms */}
                        {borrowAmount > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-3"
                          >
                            <div className="p-4 rounded-lg bg-dark-surface border border-white/10">
                              <h4 className="text-sm font-medium mb-3">
                                Loan Terms
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-text-muted">
                                    Interest Rate
                                  </span>
                                  <span className="font-semibold text-success">
                                    0%
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-text-muted">
                                    Liquidation Risk
                                  </span>
                                  <Badge variant="success" className="text-xs">
                                    None
                                  </Badge>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-text-muted">
                                    New LTV
                                  </span>
                                  <span
                                    className="font-semibold"
                                    style={{ color: getLTVColor(newLTV) }}
                                  >
                                    {formatPercentage(newLTV)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-text-muted">
                                    Est. Payoff Time
                                  </span>
                                  <span className="font-semibold">
                                    ~2.8 years
                                  </span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        <Button
                          className="w-full h-12"
                          disabled={borrowAmount <= 0}
                          onClick={handleBorrow}
                          loading={isLoading}
                        >
                          Borrow bMUSD
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-success/10">
                      <Shield className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">No Liquidations</h4>
                      <p className="text-xs text-text-muted mt-1">
                        Your collateral is never at risk
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">
                        Earn While Borrowed
                      </h4>
                      <p className="text-xs text-text-muted mt-1">
                        ~12.5% APR on deposits
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-secondary/10">
                      <Zap className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Self-Repaying</h4>
                      <p className="text-xs text-text-muted mt-1">
                        Yield pays down debt
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </motion.div>

            {/* Position Summary Sidebar */}
            <motion.div variants={fadeInUp} className="space-y-4">
              {/* Current Position */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Position</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-text-muted">
                        Collateral
                      </span>
                      <span className="font-semibold">
                        {formatUSD(position.collateralUSD)}
                      </span>
                    </div>
                    <div className="text-xs text-text-muted">
                      {formatBTC(position.collateralUSD / btcPrice)} BTC
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-text-muted">Debt</span>
                      <span className="font-semibold">
                        {formatUSD(position.debt)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-text-muted">LTV Ratio</span>
                      <span
                        className="font-semibold"
                        style={{ color: getLTVColor(position.ltv * 100) }}
                      >
                        {formatPercentage(position.ltv * 100)}
                      </span>
                    </div>
                    <Progress
                      value={position.ltv * 100}
                      max={50}
                      className="h-2"
                      isLTV
                    />
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-text-muted">
                        Borrowing Power
                      </span>
                      <span className="font-semibold text-primary">
                        {formatUSD(position.borrowingPowerRemaining)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Yield Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Yield Earnings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-text-muted">Current APR</span>
                    <span className="font-semibold text-primary">
                      {formatPercentage(yields.primaryAPR)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-text-muted">Claimable</span>
                    <span className="font-semibold">
                      {formatUSD(yields.claimable)}
                    </span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Harvest Yield
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-gradient-to-br from-secondary/5 to-transparent">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="h-5 w-5 text-secondary" />
                    Turbo Mode
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-text-secondary">
                    Leverage your position for up to 2x yield
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    asChild
                  >
                    <a href="/turbo">
                      Enable Turbo
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
