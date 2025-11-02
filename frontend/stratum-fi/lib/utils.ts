import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export function parseAmount(
  value: string | number | null | undefined
): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  const numericValue =
    typeof value === 'string' ? parseFloat(value) : Number(value);

  if (!Number.isFinite(numericValue)) {
    return null;
  }

  return numericValue;
}

export function formatTokenAmount(
  value: string | number | null | undefined,
  decimals: number = 2,
  fallback: string = '—'
): string {
  const numericValue = parseAmount(value);

  if (numericValue === null) {
    return fallback;
  }

  return numericValue.toFixed(decimals);
}

export function formatNumber(num: number, decimals: number = 2): string {
  if (!Number.isFinite(num)) {
    return '—';
  }

  if (num >= 1e9) {
    return (num / 1e9).toFixed(decimals) + 'B';
  }
  if (num >= 1e6) {
    return (num / 1e6).toFixed(decimals) + 'M';
  }
  if (num >= 1e3) {
    return (num / 1e3).toFixed(decimals) + 'K';
  }
  return num.toFixed(decimals);
}

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatBTC(amount: number, decimals: number = 6): string {
  if (!Number.isFinite(amount)) {
    return '— BTC';
  }

  return amount.toFixed(decimals) + ' BTC';
}

export function formatPercentage(
  value: number | null | undefined,
  decimals: number = 1
): string {
  if (!Number.isFinite(value ?? NaN)) {
    return '—';
  }

  return (value as number).toFixed(decimals) + '%';
}

export function truncateAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function getLTVColor(ltv: number): string {
  if (ltv < 50) return 'text-success';
  if (ltv < 80) return 'text-warning';
  return 'text-error';
}

export function getLTVStatus(ltv: number): string {
  if (ltv < 50) return 'Healthy';
  if (ltv < 80) return 'Moderate';
  return 'High Risk';
}

export function getLTVGradient(ltv: number): string {
  if (ltv < 50) return 'from-success/20 to-success';
  if (ltv < 80) return 'from-warning/20 to-warning';
  return 'from-error/20 to-error';
}

export function calculateDaysToRepay(
  debt: number,
  collateralValue: number,
  apr: number
): number {
  const dailyYield = (collateralValue * apr) / 365 / 100;
  return Math.ceil(debt / dailyYield);
}

export function calculateProjectedDebt(
  currentDebt: number,
  collateralValue: number,
  apr: number,
  days: number
): number {
  const dailyYield = (collateralValue * apr) / 365 / 100;
  const projectedDebt = currentDebt - dailyYield * days;
  return Math.max(0, projectedDebt);
}
