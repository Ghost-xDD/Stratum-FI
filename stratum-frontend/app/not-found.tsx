'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* 404 */}
        <div className="mb-8">
          <h1 className="text-8xl font-bold">
            <span className="gradient-text">404</span>
          </h1>
        </div>

        {/* Message */}
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-text-secondary mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved
          to a new location.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </Link>
          <Link href="/">
            <Button>
              <Home className="h-4 w-4 mr-2" />
              Home Page
            </Button>
          </Link>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-2xl animate-float" />
        <div
          className="absolute bottom-20 right-10 w-32 h-32 bg-secondary/10 rounded-full blur-2xl animate-float"
          style={{ animationDelay: '1s' }}
        />
      </div>
    </div>
  );
}
