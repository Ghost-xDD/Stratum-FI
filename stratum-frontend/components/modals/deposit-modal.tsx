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
import { formatBTC, formatUSD } from '@/lib/utils';
import { MOCK_DATA } from '@/lib/constants';
import { motion, AnimatePresence } from 'framer-motion';
import { Bitcoin, TrendingUp, Info } from 'lucide-react';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const [amount, setAmount] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const btcPrice = MOCK_DATA.btcPrice;
  const balance = 0.059; // Mock balance
  const usdValue = parseFloat(amount || '0') * btcPrice;

  const handleDeposit = async () => {
    setIsLoading(true);
    // Simulate transaction
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
    onClose();
  };

  const handleMax = () => {
    setAmount(balance.toString());
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Bitcoin className="h-5 w-5 text-primary" />
            </div>
            Deposit BTC
          </DialogTitle>
          <DialogDescription>
            Deposit Bitcoin to start earning yield and enable borrowing
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">
              Amount
            </label>
            <div className="relative">
              <Input
                type="number"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pr-16 text-lg font-mono"
                step="0.0001"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMax}
                  className="h-7 px-2 text-xs"
                >
                  MAX
                </Button>
                <span className="text-sm font-medium">BTC</span>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">≈ {formatUSD(usdValue)}</span>
              <span className="text-text-muted">
                Balance: {formatBTC(balance, 4)}
              </span>
            </div>
          </div>

          {/* Info Cards */}
          <div className="space-y-3">
            <Card className="p-4 bg-primary/5 border-primary/20">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                What Happens
              </h4>
              <ul className="space-y-1 text-sm text-text-secondary">
                <li>✓ Your BTC enters MUSD/BTC pool</li>
                <li>✓ Starts earning trading fees immediately</li>
                <li>✓ Fees automatically pay your future debt</li>
                <li>✓ You can borrow up to 50% LTV</li>
              </ul>
            </Card>

            <div className="flex items-center justify-between p-4 bg-dark-surface rounded-lg">
              <div>
                <p className="text-sm text-text-muted">Expected Annual Yield</p>
                <p className="text-lg font-semibold text-success">~12.5% APR</p>
              </div>
              <Badge variant="success">No Lock Period</Badge>
            </div>
          </div>

          {/* Warning */}
          <AnimatePresence>
            {parseFloat(amount) > balance && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-3 bg-error/10 border border-error/20 rounded-lg flex items-start gap-2">
                  <Info className="h-4 w-4 text-error mt-0.5" />
                  <p className="text-sm text-error">
                    Insufficient balance. You only have {formatBTC(balance, 4)}{' '}
                    available.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleDeposit}
            disabled={
              !amount || parseFloat(amount) <= 0 || parseFloat(amount) > balance
            }
            loading={isLoading}
          >
            {isLoading ? 'Depositing...' : 'Deposit BTC'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
