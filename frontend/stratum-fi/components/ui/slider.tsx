'use client';

import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@/lib/utils';

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
    showValue?: boolean;
    formatValue?: (value: number) => string;
  }
>(({ className, showValue = false, formatValue, ...props }, ref) => {
  const value = props.value || props.defaultValue || [0];

  return (
    <div className="relative">
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          'relative flex w-full touch-none select-none items-center',
          className
        )}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-dark-surface">
          <SliderPrimitive.Range className="absolute h-full bg-primary" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-dark-background shadow-lg ring-offset-dark-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-110 hover:shadow-glow cursor-grab active:cursor-grabbing" />
      </SliderPrimitive.Root>
      {showValue && (
        <div className="absolute -top-8 left-0 right-0 flex justify-between text-sm text-text-muted">
          <span>0%</span>
          <span className="text-primary font-semibold">
            {formatValue ? formatValue(value[0]) : `${value[0]}%`}
          </span>
          <span>100%</span>
        </div>
      )}
    </div>
  );
});
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
