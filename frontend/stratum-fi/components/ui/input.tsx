import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  suffix?: React.ReactNode;
  prefix?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, suffix, prefix, ...props }, ref) => {
    return (
      <div className="relative">
        {prefix && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
            {prefix}
          </div>
        )}
        <input
          type={type}
          className={cn(
            'flex h-12 w-full rounded-lg bg-dark-surface border border-white/10 px-4 py-3 text-sm text-text-primary placeholder-text-muted transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50',
            prefix && 'pl-10',
            suffix && 'pr-10',
            className
          )}
          ref={ref}
          {...props}
        />
        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
            {suffix}
          </div>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
