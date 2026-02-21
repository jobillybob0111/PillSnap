import * as React from 'react';
import { cn } from '@/lib/utils';

const Badge = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { variant?: 'success' | 'warning' | 'danger' | 'default' }>(
  ({ className, variant = 'default', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-semibold transition-colors',
        variant === 'success' && 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
        variant === 'warning' && 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
        variant === 'danger' && 'bg-red-500/15 text-red-700 dark:text-red-400',
        variant === 'default' && 'bg-primary/15 text-primary',
        className
      )}
      {...props}
    />
  )
);
Badge.displayName = 'Badge';

export { Badge };
