'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatUSD, formatBTC, truncateAddress } from '@/lib/utils';
import { fadeInUp } from '@/lib/constants';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react';

interface Transaction {
  id: string;
  type: 'deposit' | 'borrow' | 'harvest' | 'turboLoop';
  amount: string;
  token: string;
  status: 'pending' | 'success' | 'failed';
  timestamp: string;
  hash: string;
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'borrow',
    amount: '42.7',
    token: 'bMUSD',
    status: 'success',
    timestamp: '5 mins ago',
    hash: '0x1234...5678',
  },
  {
    id: '2',
    type: 'deposit',
    amount: '0.001',
    token: 'BTC',
    status: 'success',
    timestamp: '10 mins ago',
    hash: '0x2345...6789',
  },
  {
    id: '3',
    type: 'harvest',
    amount: '0.05',
    token: 'USD',
    status: 'success',
    timestamp: '1 hour ago',
    hash: '0x3456...7890',
  },
  {
    id: '4',
    type: 'turboLoop',
    amount: '15.06',
    token: 'LP',
    status: 'pending',
    timestamp: '2 hours ago',
    hash: '0x4567...8901',
  },
];

const getTransactionIcon = (type: Transaction['type']) => {
  switch (type) {
    case 'deposit':
      return <ArrowDownIcon className="h-4 w-4" />;
    case 'borrow':
      return <ArrowUpIcon className="h-4 w-4" />;
    case 'harvest':
      return <CheckCircle className="h-4 w-4" />;
    case 'turboLoop':
      return <Loader2 className="h-4 w-4 animate-spin" />;
    default:
      return null;
  }
};

const getTransactionLabel = (type: Transaction['type']) => {
  switch (type) {
    case 'deposit':
      return 'Deposited';
    case 'borrow':
      return 'Borrowed';
    case 'harvest':
      return 'Harvested';
    case 'turboLoop':
      return 'Turbo Loop';
    default:
      return type;
  }
};

const getStatusIcon = (status: Transaction['status']) => {
  switch (status) {
    case 'success':
      return <CheckCircle className="h-4 w-4 text-success" />;
    case 'pending':
      return <Loader2 className="h-4 w-4 text-warning animate-spin" />;
    case 'failed':
      return <XCircle className="h-4 w-4 text-error" />;
    default:
      return null;
  }
};

const getStatusColor = (status: Transaction['status']) => {
  switch (status) {
    case 'success':
      return 'success';
    case 'pending':
      return 'warning';
    case 'failed':
      return 'destructive';
    default:
      return 'default';
  }
};

export function RecentTransactions() {
  return (
    <motion.div initial="initial" animate="animate" variants={fadeInUp}>
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-xl font-semibold">
            Recent Transactions
          </CardTitle>
          <Button variant="ghost" size="sm">
            View All
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockTransactions.map((tx, index) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 rounded-lg bg-dark-surface/50 hover:bg-dark-surface transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg bg-primary/10 ${
                      tx.type === 'deposit'
                        ? 'text-success'
                        : tx.type === 'borrow'
                        ? 'text-primary'
                        : tx.type === 'harvest'
                        ? 'text-secondary'
                        : 'text-warning'
                    }`}
                  >
                    {getTransactionIcon(tx.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-text-primary">
                        {getTransactionLabel(tx.type)}
                      </p>
                      <Badge
                        variant={getStatusColor(tx.status) as any}
                        className="text-xs"
                      >
                        <span className="flex items-center gap-1">
                          {getStatusIcon(tx.status)}
                          {tx.status}
                        </span>
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-text-muted">
                        {tx.amount} {tx.token}
                      </p>
                      <span className="text-text-muted">•</span>
                      <p className="text-sm text-text-muted flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {tx.timestamp}
                      </p>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-text-muted hover:text-primary"
                  onClick={() =>
                    window.open(
                      `https://explorer.mezo.org/tx/${tx.hash}`,
                      '_blank'
                    )
                  }
                >
                  {truncateAddress(tx.hash)}
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
