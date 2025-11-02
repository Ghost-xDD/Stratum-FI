'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn, truncateAddress } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Bitcoin,
  DollarSign,
  Zap,
  Sparkles,
  Menu,
  X,
  ChevronLeft,
  Settings,
  HelpCircle,
  LogOut,
  Wallet,
  ArrowUpRight,
  BarChart3,
} from 'lucide-react';

const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/vault',
    label: 'Vault',
    icon: Bitcoin,
    description: 'Deposit & Borrow',
  },
  {
    href: '/turbo',
    label: 'Turbo Mode',
    icon: Zap,
    badge: 'Advanced',
    badgeVariant: 'secondary' as const,
  },
  {
    href: '/harvest',
    label: 'Harvest',
    icon: Sparkles,
  },
];

const bottomNavItems = [
  {
    href: '/analytics',
    label: 'Analytics',
    icon: BarChart3,
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
  },
  {
    href: '/help',
    label: 'Help',
    icon: HelpCircle,
  },
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Mock wallet state
  const isConnected = true;
  const address = '0x31F5a8b3C2308b72308A245b9A1e6e1a5F2e2308';
  const balance = '0.059 BTC';

  if (!mounted) {
    return (
      <aside className="w-[280px] h-full bg-dark-surface border-r border-white/10 lg:relative" />
    );
  }

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full z-50',
          'bg-dark-surface border-r border-white/10',
          'flex flex-col',
          'transition-all duration-300 ease-in-out',
          'lg:relative lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          isCollapsed ? 'w-20' : 'w-[280px]'
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className={cn(
                'flex items-center gap-3 transition-all',
                isCollapsed && 'justify-center'
              )}
            >
              <div className="w-10 h-10 rounded-xl bg-primary-gradient flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="overflow-hidden"
                  >
                    <span className="font-bold text-xl gradient-text whitespace-nowrap">
                      Stratum Fi
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </Link>

            {/* Collapse Button (Desktop) */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex"
            >
              <ChevronLeft
                className={cn(
                  'h-4 w-4 transition-transform',
                  isCollapsed && 'rotate-180'
                )}
              />
            </Button>

            {/* Close Button (Mobile) */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Wallet Info */}
        {isConnected && (
          <div className="p-4 border-b border-white/10">
            <div
              className={cn(
                'p-3 rounded-xl bg-dark-background/50',
                'flex items-center gap-3',
                isCollapsed && 'justify-center'
              )}
            >
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="overflow-hidden flex-1"
                  >
                    <p className="text-sm font-medium text-text-primary truncate">
                      {truncateAddress(address)}
                    </p>
                    <p className="text-xs text-text-muted">{balance}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 px-3 py-3 rounded-xl',
                  'transition-all duration-200',
                  'hover:bg-dark-background/50',
                  isActive && 'bg-primary/10',
                  isCollapsed && 'justify-center'
                )}
              >
                <div
                  className={cn(
                    'p-2 rounded-lg transition-all',
                    isActive
                      ? 'bg-primary text-white'
                      : 'bg-dark-background group-hover:bg-primary/10'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5',
                      isActive ? 'text-white' : 'text-primary'
                    )}
                  />
                </div>
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="overflow-hidden flex items-center gap-2 flex-1"
                    >
                      <span
                        className={cn(
                          'font-medium whitespace-nowrap',
                          isActive ? 'text-text-primary' : 'text-text-secondary'
                        )}
                      >
                        {item.label}
                      </span>
                      {item.badge && (
                        <Badge variant={item.badgeVariant} className="text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Navigation */}
        <div className="p-4 border-t border-white/10 space-y-2">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 px-3 py-2 rounded-lg',
                  'transition-all duration-200',
                  'hover:bg-dark-background/50',
                  'text-text-muted hover:text-text-primary',
                  isCollapsed && 'justify-center'
                )}
              >
                <Icon className="h-5 w-5" />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="overflow-hidden whitespace-nowrap text-sm"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}

          {/* Disconnect Button */}
          {isConnected && (
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start gap-3 text-text-muted hover:text-error',
                isCollapsed && 'justify-center'
              )}
            >
              <LogOut className="h-5 w-5" />
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="overflow-hidden whitespace-nowrap text-sm"
                  >
                    Disconnect
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          )}
        </div>

        {/* Stats Footer */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 border-t border-white/10 bg-dark-background/50"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-muted">TVL</span>
                  <span className="text-xs font-semibold">$2.1M</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-muted">Active Loans</span>
                  <span className="text-xs font-semibold">127</span>
                </div>
                <a
                  href="#"
                  className="flex items-center justify-center gap-1 text-xs text-primary hover:underline"
                >
                  View Protocol Stats
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </aside>
    </>
  );
}
