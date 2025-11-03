'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn, truncateAddress } from '@/lib/utils';
import { Menu, X } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/vault', label: 'Vault' },
  { href: '/turbo', label: 'Turbo', badge: 'Advanced' },
  { href: '/harvest', label: 'Harvest' },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Mock wallet state
  const isConnected = true;
  const address = '0x31F5a8b3C2308b72308A245b9A1e6e1a5F2e2308';
  const balance = '0.059 BTC';

  return (
    <header className="sticky top-0 z-40 w-full glass border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-primary-gradient flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="font-bold text-xl hidden sm:inline gradient-text">
              Stratum Fi
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative px-4 py-2 text-sm font-medium transition-all duration-200',
                  'hover:text-text-primary',
                  pathname === item.href
                    ? 'text-text-primary'
                    : 'text-text-muted'
                )}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {item.label}
                  {item.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </span>
                {pathname === item.href && (
                  <div className="absolute inset-0 bg-primary/10 rounded-lg" />
                )}
              </Link>
            ))}
          </nav>

          {/* Wallet Connection */}
          <div className="flex items-center gap-3">
            {isConnected ? (
              <div className="hidden sm:flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-text-primary">
                    {truncateAddress(address)}
                  </p>
                  <p className="text-xs text-text-muted">{balance}</p>
                </div>
                <Button variant="outline" size="sm">
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button size="sm">Connect Wallet</Button>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10">
          <nav className="container mx-auto px-4 py-4">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    pathname === item.href
                      ? 'bg-primary/10 text-text-primary'
                      : 'text-text-muted hover:text-text-primary hover:bg-dark-surface'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="flex items-center justify-between">
                    {item.label}
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </span>
                </Link>
              ))}

              {isConnected && (
                <div className="pt-4 border-t border-white/10">
                  <div className="px-4 py-2">
                    <p className="text-sm font-medium text-text-primary">
                      {truncateAddress(address)}
                    </p>
                    <p className="text-xs text-text-muted mt-1">{balance}</p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    Disconnect
                  </Button>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
