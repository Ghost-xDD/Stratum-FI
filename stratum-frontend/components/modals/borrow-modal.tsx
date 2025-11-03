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
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  formatUSD,
  formatPercentage,
  calculateDaysToRepay,
  getLTVColor,
} from '@/lib/utils';
import { MOCK_DATA } from '@/lib/constants';
import { DollarSign, Calendar, AlertCircle, CheckCircle } from 'lucide-react';

interface BorrowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BorrowModal({ isOpen, onClose }: BorrowModalProps) {
  const position = MOCK_DATA.userPosition;
  const maxBorrow = position.available;

  const [borrowAmount, setBorrowAmount] = React.useState('');
  const [borrowPercentage, setBorrowPercentage] = React.useState([50]);
  const [isLoading, setIsLoading] = React.useState(false);

  const amountFromPercentage = (maxBorrow * borrowPercentage[0]) / 100;
  const newDebt = position.debt + parseFloat(borrowAmount || '0');
  const newLTV = (newDebt / position.collateralUSD) * 100;
  const daysToRepay = calculateDaysToRepay(
    newDebt,
    position.collateralUSD,
    MOCK_DATA.yields.primaryAPR
  );

  React.useEffect(() => {
    setBorrowAmount(amountFromPercentage.toFixed(2));
  }, [borrowPercentage, amountFromPercentage]);

  const handleBorrow = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
    onClose();
  };

  const handleAmountChange = (value: string) => {
    setBorrowAmount(value);
    const percentage = (parseFloat(value || '0') / maxBorrow) * 100;
    setBorrowPercentage([Math.min(100, Math.max(0, percentage))]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            Borrow bMUSD
          </DialogTitle>
          <DialogDescription>
            Borrow against your BTC collateral with zero interest
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Slider */}
          <div className="space-y-4">
            <label className="text-sm font-medium text-text-primary">
              How much do you want to borrow?
            </label>
            <div className="px-3">
              <Slider
                value={borrowPercentage}
                onValueChange={setBorrowPercentage}
                max={100}
                step={1}
                showValue={true}
                className="mb-8"
              />
            </div>
            <div className="text-center">
              <span className="text-sm text-text-muted">Max available: </span>
              <span className="text-sm font-semibold text-primary">
                {formatUSD(maxBorrow)}
              </span>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">
              Borrow Amount
            </label>
            <Input
              type="number"
              placeholder="0.00"
              value={borrowAmount}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="text-lg font-mono"
              suffix={<span className="text-sm font-medium">bMUSD</span>}
            />
            <p className="text-sm text-text-muted">
              ≈ {formatUSD(parseFloat(borrowAmount || '0'))}
            </p>
          </div>

          {/* Loan Terms */}
          <Card className="p-4 space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              Loan Terms
              <Badge variant="success" className="text-xs">
                Self-Repaying
              </Badge>
            </h4>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Interest Rate</span>
                <span className="font-semibold text-success">0%</span>
              </div>
              <p className="text-xs text-text-muted">
                Your yield pays the interest automatically!
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">New LTV Ratio</span>
                <span className={`font-semibold ${getLTVColor(newLTV)}`}>
                  {formatPercentage(newLTV)}
                </span>
              </div>
              <Progress value={newLTV} className="h-2" ltv={true} />
              <div className="flex justify-between text-xs text-text-muted">
                <span>Safe</span>
                <span>50% Max</span>
                <span>90% Liq.</span>
              </div>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Liquidation Risk</span>
              <span className="font-semibold text-success flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                None
              </span>
            </div>
          </Card>

          {/* Repayment Estimate */}
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium mb-1">Estimated Payoff Time</h4>
                <p className="text-2xl font-bold text-primary mb-1">
                  {daysToRepay} days
                </p>
                <p className="text-sm text-text-secondary">
                  Based on current{' '}
                  {formatPercentage(MOCK_DATA.yields.primaryAPR)} APR
                </p>
              </div>
            </div>
          </Card>

          {/* Info Box */}
          <div className="p-3 bg-secondary/10 border border-secondary/20 rounded-lg">
            <p className="text-sm text-text-primary flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-secondary mt-0.5" />
              <span>
                Your collateral earns ~
                {formatPercentage(MOCK_DATA.yields.primaryAPR)} APR. Since debt
                grows at 0%, it automatically gets repaid over time!
              </span>
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleBorrow}
            disabled={
              !borrowAmount ||
              parseFloat(borrowAmount) <= 0 ||
              parseFloat(borrowAmount) > maxBorrow
            }
            loading={isLoading}
          >
            {isLoading ? 'Borrowing...' : 'Borrow bMUSD'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
