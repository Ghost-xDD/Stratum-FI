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
import { formatUSD, formatPercentage, getLTVColor } from '@/lib/utils';
import {
  Bitcoin,
  DollarSign,
  ArrowRight,
  TrendingUp,
  Shield,
  Zap,
  Loader2,
} from 'lucide-react';
import { useAccount } from 'wagmi';
import {
  useUserPosition,
  useBTCBalance,
  useApproveBTC,
  useDepositBTC,
  useBorrowBMUSD,
} from '@/lib/contracts';
import { useBTCPrice } from '@/lib/hooks/useBTCPrice';
import { toast } from 'sonner';

export default function VaultPage() {
  const { address, isConnected } = useAccount();
  const [depositAmount, setDepositAmount] = React.useState('');
  const [borrowAmountUSD, setBorrowAmountUSD] = React.useState(0);
  const [activeTab, setActiveTab] = React.useState('deposit');

  const { position, loading: positionLoading } = useUserPosition(address);
  const { balance: btcBalance, loading: balanceLoading } =
    useBTCBalance(address);
  const { price: btcPriceUSD, loading: priceLoading } = useBTCPrice();

  const {
    approve: approveBTC,
    isPending: isApproving,
    isSuccess: approveSuccess,
  } = useApproveBTC();
  const {
    deposit: depositBTC,
    isPending: isDepositing,
    isSuccess: depositSuccess,
    hash: depositHash,
  } = useDepositBTC();
  const {
    borrow: borrowBMUSD,
    isPending: isBorrowing,
    isSuccess: borrowSuccess,
    hash: borrowHash,
  } = useBorrowBMUSD();

  // Calculate deposit values
  const depositValue = depositAmount
    ? parseFloat(depositAmount) * btcPriceUSD
    : 0;
  const currentCollateralUSD = position
    ? parseFloat(position.collateralBTC) * btcPriceUSD
    : 0;
  const newCollateral = currentCollateralUSD + depositValue;

  // Calculate borrow values
  const currentDebt = position ? parseFloat(position.debt) : 0;
  const availableToBorrow = position ? parseFloat(position.available) : 0;
  const newDebt = currentDebt + borrowAmountUSD;
  const newLTV = newCollateral > 0 ? (newDebt / (newCollateral * 2)) * 100 : 0;

  // Handlers
  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      // Step 1: Approve BTC
      toast.info('Step 1/2: Approving BTC...');
      await approveBTC(depositAmount);
    } catch (error) {
      console.error('Deposit error:', error);
      const message =
        error instanceof Error ? error.message : 'Transaction failed';
      toast.error(message);
    }
  };

  const handleBorrow = async () => {
    if (!borrowAmountUSD || borrowAmountUSD <= 0) {
      toast.error('Please select an amount to borrow');
      return;
    }

    if (borrowAmountUSD > availableToBorrow) {
      toast.error('Amount exceeds available borrowing capacity');
      return;
    }

    try {
      toast.info('Borrowing bMUSD...');
      await borrowBMUSD(borrowAmountUSD.toString());
    } catch (error) {
      console.error('Borrow error:', error);
      const message =
        error instanceof Error ? error.message : 'Transaction failed';
      toast.error(message);
    }
  };

  // Track if we've already initiated deposit to prevent infinite loop
  const depositInitiatedRef = React.useRef(false);

  // Effect: Auto-deposit after approval
  React.useEffect(() => {
    if (approveSuccess && depositAmount && !depositInitiatedRef.current) {
      depositInitiatedRef.current = true;
      toast.success('Approval successful!');
      toast.info('Step 2/2: Depositing BTC...');
      depositBTC(depositAmount);
    }
  }, [approveSuccess, depositAmount, depositBTC]);

  // Reset the ref when deposit succeeds or user changes amount
  React.useEffect(() => {
    if (depositSuccess || !depositAmount) {
      depositInitiatedRef.current = false;
    }
  }, [depositSuccess, depositAmount]);

  // Effect: Show success messages
  React.useEffect(() => {
    if (depositSuccess) {
      toast.success('BTC deposited successfully!', {
        description: 'Your collateral has been added',
        action: depositHash
          ? {
              label: 'View Transaction',
              onClick: () =>
                window.open(
                  `https://explorer.testnet.mezo.org/tx/${depositHash}`,
                  '_blank'
                ),
            }
          : undefined,
      });
      setDepositAmount('');
    }
  }, [depositSuccess, depositHash]);

  React.useEffect(() => {
    if (borrowSuccess) {
      toast.success('bMUSD borrowed successfully!', {
        description: `You borrowed ${borrowAmountUSD} bMUSD`,
        action: borrowHash
          ? {
              label: 'View Transaction',
              onClick: () =>
                window.open(
                  `https://explorer.testnet.mezo.org/tx/${borrowHash}`,
                  '_blank'
                ),
            }
          : undefined,
      });
      setBorrowAmountUSD(0);
    }
  }, [borrowSuccess, borrowHash, borrowAmountUSD]);

  // Loading state
  const isLoading = positionLoading || balanceLoading || priceLoading;
  const isTransacting = isApproving || isDepositing || isBorrowing;

  // Not connected state
  if (!isConnected) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <Card className="p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
              <p className="text-text-secondary">
                Please connect your wallet to deposit BTC and borrow bMUSD
              </p>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Vault</h1>
                <p className="text-text-secondary mt-1">
                  Deposit BTC collateral and borrow bMUSD
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-text-muted">BTC Price</p>
                <p className="text-xl font-bold font-mono text-primary">
                  {formatUSD(btcPriceUSD)}
                </p>
                <p className="text-xs text-text-muted">Live via CoinGecko</p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Action Area */}
            <motion.div variants={fadeInUp} className="lg:col-span-2 space-y-6">
              {/* Tabs for Deposit/Borrow */}
              <Card>
                <CardContent className="p-6">
                  <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="space-y-6"
                  >
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
                            disabled={isTransacting}
                          />
                          <div className="flex justify-between mt-2 text-sm text-text-muted">
                            <span>≈ {formatUSD(depositValue)}</span>
                            <span>
                              Balance: {isLoading ? '...' : btcBalance} BTC
                            </span>
                          </div>
                        </div>

                        {/* Quick Amount Buttons */}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDepositAmount('0.001')}
                            disabled={isTransacting}
                          >
                            0.001 BTC
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDepositAmount('0.01')}
                            disabled={isTransacting}
                          >
                            0.01 BTC
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDepositAmount(btcBalance || '0')}
                            disabled={isTransacting || !btcBalance}
                          >
                            Max
                          </Button>
                        </div>

                        {/* What You Get */}
                        {depositAmount && parseFloat(depositAmount) > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 rounded-lg bg-primary/5 border border-primary/20"
                          >
                            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-primary" />
                              What You&apos;ll Get
                            </h4>
                            <div className="space-y-2 text-sm">
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
                              <div className="flex justify-between">
                                <span className="text-text-muted">
                                  Earn APR
                                </span>
                                <span className="font-semibold text-primary">
                                  ~12.5%
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        <Button
                          className="w-full h-12"
                          disabled={
                            !depositAmount ||
                            parseFloat(depositAmount) <= 0 ||
                            isTransacting
                          }
                          onClick={handleDeposit}
                        >
                          {isTransacting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              {isApproving
                                ? 'Approving...'
                                : isDepositing
                                ? 'Depositing...'
                                : 'Processing...'}
                            </>
                          ) : (
                            'Deposit BTC'
                          )}
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
                              {isLoading ? '...' : formatUSD(availableToBorrow)}
                            </span>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between mb-3">
                            <label className="text-sm font-medium">
                              Borrow Amount
                            </label>
                            <span className="text-sm font-mono">
                              {formatUSD(borrowAmountUSD)}
                            </span>
                          </div>
                          <Slider
                            value={[borrowAmountUSD]}
                            onValueChange={(value) =>
                              setBorrowAmountUSD(value[0])
                            }
                            max={availableToBorrow}
                            step={0.1}
                            showValue={false}
                            disabled={isTransacting}
                          />
                          <div className="flex justify-between mt-2 text-xs text-text-muted">
                            <span>$0</span>
                            <span>{formatUSD(availableToBorrow)}</span>
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
                                setBorrowAmountUSD(
                                  (availableToBorrow * pct) / 100
                                )
                              }
                              disabled={isTransacting}
                            >
                              {pct}%
                            </Button>
                          ))}
                        </div>

                        {/* Loan Terms */}
                        {borrowAmountUSD > 0 && (
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
                              </div>
                            </div>
                          </motion.div>
                        )}

                        <Button
                          className="w-full h-12"
                          disabled={borrowAmountUSD <= 0 || isTransacting}
                          onClick={handleBorrow}
                        >
                          {isBorrowing ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Borrowing...
                            </>
                          ) : (
                            'Borrow bMUSD'
                          )}
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
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  ) : position ? (
                    <>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-text-muted">
                            Collateral
                          </span>
                          <span className="font-semibold">
                            {formatUSD(currentCollateralUSD)}
                          </span>
                        </div>
                        <div className="text-xs text-text-muted">
                          {position.collateralBTC} BTC
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-text-muted">Debt</span>
                          <span className="font-semibold">
                            {formatUSD(currentDebt)}
                          </span>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-text-muted">
                            LTV Ratio
                          </span>
                          <span
                            className="font-semibold"
                            style={{ color: getLTVColor(position.ltv) }}
                          >
                            {formatPercentage(position.ltv)}
                          </span>
                        </div>
                        <Progress
                          value={position.ltv}
                          max={50}
                          className="h-2"
                          ltv
                        />
                      </div>

                      <div className="pt-4 border-t border-white/10">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-text-muted">
                            Borrowing Power
                          </span>
                          <span className="font-semibold text-primary">
                            {formatUSD(availableToBorrow)}
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4 text-text-muted text-sm">
                      No position yet
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Turbo Mode CTA */}
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
