'use client';

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn, getLTVGradient } from '@/lib/utils';

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    showIndicator?: boolean;
    ltv?: boolean;
  }
>(
  (
    { className, value = 0, showIndicator = false, ltv = false, ...props },
    ref
  ) => {
    const gradient =
      ltv && typeof value === 'number'
        ? getLTVGradient(value)
        : 'from-primary/20 to-primary';

    return (
      <div className="relative">
        <ProgressPrimitive.Root
          ref={ref}
          className={cn(
            'relative h-2 w-full overflow-hidden rounded-full bg-dark-surface',
            className
          )}
          {...props}
        >
          <ProgressPrimitive.Indicator
            className={cn(
              'h-full w-full flex-1 transition-all duration-500 ease-out rounded-full',
              ltv ? `bg-gradient-to-r ${gradient}` : 'bg-primary'
            )}
            style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
          />
        </ProgressPrimitive.Root>
        {showIndicator && (
          <div
            className="absolute -top-1 w-4 h-4 bg-primary rounded-full shadow-glow transition-all duration-500"
            style={{ left: `${value}%`, transform: 'translateX(-50%)' }}
          />
        )}
      </div>
    );
  }
);
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
