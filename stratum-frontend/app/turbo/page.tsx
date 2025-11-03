'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/lib/constants';
import { formatUSD } from '@/lib/utils';
import {
  Zap,
  CheckCircle,
  AlertCircle,
  Loader2,
  TrendingUp,
  Layers,
  Info,
  ArrowLeft,
} from 'lucide-react';
import { useAccount } from 'wagmi';
import {
  useUserPosition,
  useTurboPosition,
  useMUSDBalance,
  useBMUSDBalance,
  useApproveTurbo,
  useBorrowBMUSD,
  useExecuteTurboLoop,
  TOKEN_ADDRESSES,
  CONTRACT_ADDRESSES,
} from '@/lib/contracts';
import { toast } from 'sonner';
import Link from 'next/link';

export default function TurboPage() {
  const { address, isConnected } = useAccount();
  const [turboAmount, setTurboAmount] = React.useState('');
  const [step, setStep] = React.useState<
    'ready' | 'borrowing' | 'approving' | 'executing' | 'complete'
  >('ready');

  // Fetch data
  const { position } = useUserPosition(address);
  const { position: turboPosition } = useTurboPosition(address);
  const { balance: musdBalance, loading: musdLoading } =
    useMUSDBalance(address);
  const { balance: bmusdBalance } = useBMUSDBalance(address);

  // Write hooks
  const { borrow: borrowBMUSD } = useBorrowBMUSD();
  const { approve: approveTurbo } = useApproveTurbo();
  const { executeTurbo, isPending, isSuccess, hash } = useExecuteTurboLoop();

  const availableToBorrow = position ? parseFloat(position.available) : 0;
  const hasExistingPosition =
    turboPosition && parseFloat(turboPosition.secondaryLP) > 0;
  const musdBalanceNum = parseFloat(musdBalance);
  const turboAmountNum = parseFloat(turboAmount) || 0;

  // Calculate if user has enough MUSD
  const needsMoreMUSD = turboAmountNum > musdBalanceNum;

  const handleExecuteTurbo = async () => {
    if (!turboAmount || turboAmountNum <= 0) {
      toast.error('Please enter an amount');
      return;
    }

    if (turboAmountNum > availableToBorrow) {
      toast.error('Amount exceeds available borrowing capacity');
      return;
    }

    if (needsMoreMUSD) {
      toast.error(
        `You need ${turboAmountNum} MUSD but only have ${musdBalanceNum} MUSD`
      );
      return;
    }

    try {
      // Step 1: Borrow bMUSD
      setStep('borrowing');
      toast.info('Step 1/3: Borrowing bMUSD...');
      await borrowBMUSD(turboAmount);

      // Step 2: Approve bMUSD
      setStep('approving');
      toast.success('bMUSD borrowed!');
      toast.info('Step 2/3: Approving bMUSD...');
      await approveTurbo(CONTRACT_ADDRESSES.bMUSD);

      // Approve MUSD
      toast.success('bMUSD approved!');
      toast.info('Step 2/3: Approving MUSD...');
      await approveTurbo(TOKEN_ADDRESSES.MUSD);

      // Step 3: Execute Turbo Loop
      setStep('executing');
      toast.success('Tokens approved!');
      toast.info('Step 3/3: Executing Turbo Loop...');
      await executeTurbo(turboAmount, turboAmount); // 1:1 ratio for stable pair

      setStep('complete');
    } catch (error) {
      console.error('Turbo error:', error);
      const message =
        error instanceof Error ? error.message : 'Transaction failed';
      toast.error(message);
      setStep('ready');
    }
  };

  // Success handling
  React.useEffect(() => {
    if (isSuccess && step === 'complete') {
      toast.success('🎉 Turbo Mode Activated!', {
        description: 'You are now earning dual yield',
        action: hash
          ? {
              label: 'View Transaction',
              onClick: () =>
                window.open(
                  `https://explorer.test.mezo.org/tx/${hash}`,
                  '_blank'
                ),
            }
          : undefined,
      });
      setTurboAmount('');
      setStep('ready');
    }
  }, [isSuccess, step, hash]);

  if (!isConnected) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <Card className="p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
              <p className="text-text-secondary">
                Please connect your wallet to use Turbo Mode
              </p>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="space-y-6"
        >
          {/* Header */}
          <motion.div variants={fadeInUp}>
            <div className="flex items-center gap-4 mb-2">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold">Turbo Mode</h1>
                  <Badge variant="secondary" className="animate-pulse">
                    <Zap className="h-3 w-3 mr-1" />
                    Advanced
                  </Badge>
                </div>
                <p className="text-text-secondary mt-1">
                  Leverage your borrowing power for dual yield generation
                </p>
              </div>
              {hasExistingPosition && (
                <Badge variant="success" className="text-sm">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Active
                </Badge>
              )}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Action Card */}
            <motion.div variants={fadeInUp} className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Activate Turbo Mode</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* How It Works */}
                  <div className="p-4 rounded-lg bg-secondary/5 border border-secondary/20">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Info className="h-4 w-4 text-secondary" />
                      How Turbo Mode Works
                    </h4>
                    <ol className="space-y-2 text-sm text-text-secondary">
                      <li className="flex gap-2">
                        <span className="text-secondary font-bold">1.</span>
                        <span>Borrow more bMUSD (up to your limit)</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-secondary font-bold">2.</span>
                        <span>
                          Pair it with your MUSD in the bMUSD/MUSD pool
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-secondary font-bold">3.</span>
                        <span>Earn extra yield from trading fees</span>
                      </li>
                    </ol>
                  </div>

                  {/* Amount Input */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Amount to Loop
                      </label>
                      <Input
                        type="number"
                        placeholder="0.0"
                        value={turboAmount}
                        onChange={(e) => setTurboAmount(e.target.value)}
                        suffix="bMUSD"
                        className="text-lg h-14"
                        disabled={isPending}
                      />
                      <div className="flex justify-between mt-2 text-sm">
                        <span className="text-text-muted">
                          Will pair with equal MUSD
                        </span>
                        <span className="text-text-muted">
                          Available: {availableToBorrow.toFixed(2)} bMUSD
                        </span>
                      </div>
                    </div>

                    {/* Quick Amount Buttons */}
                    <div className="grid grid-cols-4 gap-2">
                      {[25, 50, 75, 100].map((pct) => (
                        <Button
                          key={pct}
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setTurboAmount(
                              ((availableToBorrow * pct) / 100).toString()
                            )
                          }
                          disabled={isPending}
                        >
                          {pct}%
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Requirements Check */}
                  {turboAmountNum > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3"
                    >
                      <h4 className="text-sm font-medium">Requirements</h4>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-dark-surface">
                          <div className="flex items-center gap-2">
                            {turboAmountNum <= availableToBorrow ? (
                              <CheckCircle className="h-4 w-4 text-success" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-error" />
                            )}
                            <span className="text-sm">Borrowing Capacity</span>
                          </div>
                          <span className="text-sm font-mono">
                            {turboAmountNum.toFixed(2)} /{' '}
                            {availableToBorrow.toFixed(2)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg bg-dark-surface">
                          <div className="flex items-center gap-2">
                            {!needsMoreMUSD ? (
                              <CheckCircle className="h-4 w-4 text-success" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-error" />
                            )}
                            <span className="text-sm">MUSD Balance</span>
                          </div>
                          <span className="text-sm font-mono">
                            {musdBalanceNum.toFixed(2)} /{' '}
                            {turboAmountNum.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {needsMoreMUSD && (
                        <div className="p-3 rounded-lg bg-warning/5 border border-warning/20">
                          <p className="text-sm text-warning flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            You need {turboAmountNum.toFixed(2)} MUSD to pair.
                            Get MUSD from{' '}
                            <a
                              href="https://app.tigris.trade"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline"
                            >
                              Tigris DEX
                            </a>
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Execute Button */}
                  <Button
                    className="w-full h-12"
                    disabled={
                      !turboAmount ||
                      turboAmountNum <= 0 ||
                      turboAmountNum > availableToBorrow ||
                      needsMoreMUSD ||
                      isPending
                    }
                    onClick={handleExecuteTurbo}
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {step === 'borrowing' && 'Borrowing...'}
                        {step === 'approving' && 'Approving...'}
                        {step === 'executing' && 'Executing Loop...'}
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Execute Turbo Mode
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4 bg-gradient-to-br from-primary/5 to-transparent">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-1">Dual Yield</h4>
                      <p className="text-xs text-text-muted">
                        Earn from both MUSD/BTC and bMUSD/MUSD pools
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-secondary/5 to-transparent">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-secondary/20">
                      <Layers className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-1">Leverage</h4>
                      <p className="text-xs text-text-muted">
                        Use borrowed funds to increase yield exposure
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </motion.div>

            {/* Status Sidebar */}
            <motion.div variants={fadeInUp} className="space-y-4">
              {/* Current Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Turbo Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {hasExistingPosition ? (
                    <>
                      <div className="text-center p-4 rounded-lg bg-success/10">
                        <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
                        <p className="font-semibold text-success">Active</p>
                      </div>
                      <div>
                        <p className="text-sm text-text-muted mb-1">
                          LP Position
                        </p>
                        <p className="text-xl font-bold font-mono">
                          {turboPosition?.secondaryLP}
                        </p>
                        <p className="text-xs text-text-muted">
                          bMUSD/MUSD LP tokens
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-4 rounded-lg bg-dark-surface">
                      <Zap className="h-8 w-8 text-text-muted mx-auto mb-2" />
                      <p className="font-semibold text-text-muted">Inactive</p>
                      <p className="text-xs text-text-muted mt-2">
                        Execute below to activate
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Your Balances */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Balances</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-text-muted">bMUSD</span>
                    <span className="font-mono text-sm">
                      {parseFloat(bmusdBalance).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-text-muted">MUSD</span>
                    <span className="font-mono text-sm">
                      {musdLoading ? '...' : musdBalanceNum.toFixed(2)}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-white/10">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-text-muted">
                        Can Borrow
                      </span>
                      <span className="font-semibold text-primary">
                        {availableToBorrow.toFixed(2)} bMUSD
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Expected Returns */}
              {turboAmountNum > 0 && !needsMoreMUSD && (
                <Card className="bg-gradient-to-br from-secondary/10 to-transparent">
                  <CardHeader>
                    <CardTitle className="text-lg">Expected Returns</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-text-muted">
                        Additional APR
                      </span>
                      <span className="font-semibold text-secondary">
                        ~8-10%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-text-muted">LP Value</span>
                      <span className="font-semibold">
                        {formatUSD(turboAmountNum * 2)}
                      </span>
                    </div>
                    <div className="pt-3 border-t border-white/10">
                      <p className="text-xs text-text-muted">
                        Secondary yield is claimable as profit
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>

          {/* Process Steps */}
          <motion.div variants={fadeInUp}>
            <Card>
              <CardHeader>
                <CardTitle>Transaction Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div
                    className={`p-4 rounded-lg ${
                      step === 'borrowing'
                        ? 'bg-primary/10 border border-primary'
                        : 'bg-dark-surface'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          step === 'borrowing'
                            ? 'bg-primary text-white'
                            : 'bg-dark-background text-text-muted'
                        }`}
                      >
                        1
                      </div>
                      <span className="font-medium">Borrow bMUSD</span>
                    </div>
                    <p className="text-xs text-text-muted ml-11">
                      Take out additional bMUSD loan
                    </p>
                  </div>

                  <div
                    className={`p-4 rounded-lg ${
                      step === 'approving'
                        ? 'bg-primary/10 border border-primary'
                        : 'bg-dark-surface'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          step === 'approving'
                            ? 'bg-primary text-white'
                            : 'bg-dark-background text-text-muted'
                        }`}
                      >
                        2
                      </div>
                      <span className="font-medium">Approve Tokens</span>
                    </div>
                    <p className="text-xs text-text-muted ml-11">
                      Allow TurboLoop to use your tokens
                    </p>
                  </div>

                  <div
                    className={`p-4 rounded-lg ${
                      step === 'executing'
                        ? 'bg-primary/10 border border-primary'
                        : 'bg-dark-surface'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          step === 'executing'
                            ? 'bg-primary text-white'
                            : 'bg-dark-background text-text-muted'
                        }`}
                      >
                        3
                      </div>
                      <span className="font-medium">Execute Loop</span>
                    </div>
                    <p className="text-xs text-text-muted ml-11">
                      Add liquidity to bMUSD/MUSD pool
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Warning */}
          <motion.div variants={fadeInUp}>
            <Card className="bg-gradient-to-br from-warning/5 to-transparent border-warning/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium mb-1">Advanced Strategy</p>
                    <p className="text-text-secondary text-xs">
                      Turbo Mode increases your debt to provide liquidity.
                      Secondary yield does NOT auto-repay debt - you can claim
                      it as profit. Make sure you understand the mechanism
                      before proceeding.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
