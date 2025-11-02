'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatUSD, formatPercentage } from '@/lib/utils';
import { MOCK_DATA } from '@/lib/constants';
import { motion } from 'framer-motion';
import {
  Zap,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface TurboModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TurboModal({ isOpen, onClose }: TurboModalProps) {
  const [bmusdAmount, setBmusdAmount] = React.useState('');
  const [musdAmount, setMusdAmount] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const availableBmusd = 1.06; // Mock available bMUSD
  const musdBalance = 1858; // Mock MUSD balance

  // Auto-match MUSD to bMUSD (1:1 ratio)
  React.useEffect(() => {
    setMusdAmount(bmusdAmount);
  }, [bmusdAmount]);

  const expectedLPTokens = parseFloat(bmusdAmount || '0') * 2; // Simplified calculation
  const expectedAPR = MOCK_DATA.yields.secondaryAPR;
  const dailyEarnings = (expectedLPTokens * expectedAPR) / 365 / 100;

  const handleTurboLoop = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
    onClose();
  };

  const handleMaxBmusd = () => {
    setBmusdAmount(availableBmusd.toString());
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            🚀 Turbo Mode
            <Badge variant="secondary" className="ml-2">
              Advanced
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Multiply your yield by leveraging your position
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Visual Flow Diagram */}
          <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5">
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              How Turbo Mode Works
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-24 text-sm font-medium">Your BTC</div>
                <ArrowRight className="h-4 w-4 text-text-muted" />
                <div className="flex-1 p-2 bg-dark-surface rounded text-sm">
                  MUSD/BTC Pool → Pays your debt
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-24 text-sm font-medium text-primary">
                  + Turbo
                </div>
                <ArrowRight className="h-4 w-4 text-text-muted" />
                <div className="flex-1 p-2 bg-primary/10 rounded text-sm font-medium">
                  bMUSD/MUSD Pool → Extra profit!
                </div>
              </div>
            </div>
          </Card>

          {/* Input Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">
                bMUSD Amount
              </label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={bmusdAmount}
                  onChange={(e) => setBmusdAmount(e.target.value)}
                  className="pr-20"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMaxBmusd}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 px-2 text-xs"
                >
                  MAX
                </Button>
              </div>
              <p className="text-xs text-text-muted">
                Available: {availableBmusd} bMUSD
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">
                MUSD Amount
                <Badge variant="outline" className="ml-2 text-xs">
                  1:1 Ratio
                </Badge>
              </label>
              <Input
                type="number"
                placeholder="0.00"
                value={musdAmount}
                onChange={(e) => setMusdAmount(e.target.value)}
                className="bg-dark-surface/50"
                disabled
              />
              <p className="text-xs text-text-muted">
                Balance: {musdBalance} MUSD
              </p>
            </div>
          </div>

          {/* Expected Returns */}
          <Card className="p-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-success" />
              Expected Returns
            </h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-text-muted">LP Tokens</p>
                <p className="text-lg font-bold">
                  ~{expectedLPTokens.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-text-muted">APR</p>
                <p className="text-lg font-bold text-success">
                  ~{formatPercentage(expectedAPR)}
                </p>
              </div>
              <div>
                <p className="text-sm text-text-muted">Daily</p>
                <p className="text-lg font-bold text-primary">
                  ~{formatUSD(dailyEarnings)}
                </p>
              </div>
            </div>
          </Card>

          {/* Warning */}
          <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-warning">
                  Advanced Strategy
                </p>
                <p className="text-sm text-text-secondary">
                  Turbo Mode requires both bMUSD and MUSD tokens. Make sure you
                  understand the risks of providing liquidity before proceeding.
                </p>
              </div>
            </div>
          </div>

          {/* Insufficient Balance Warning */}
          {parseFloat(musdAmount || '0') > musdBalance && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 bg-error/10 border border-error/20 rounded-lg"
            >
              <p className="text-sm text-error">
                Insufficient MUSD balance. You need {musdAmount} MUSD but only
                have {musdBalance}.
              </p>
            </motion.div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleTurboLoop}
            disabled={
              !bmusdAmount ||
              parseFloat(bmusdAmount) <= 0 ||
              parseFloat(bmusdAmount) > availableBmusd ||
              parseFloat(musdAmount) > musdBalance
            }
            loading={isLoading}
            className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
          >
            {isLoading ? 'Activating...' : 'Activate Turbo Mode 🚀'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
