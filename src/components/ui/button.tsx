import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
          variant === 'primary' &&
            'bg-[hsl(var(--primary))] text-white shadow-soft hover:opacity-95 hover:shadow-soft-lg',
          variant === 'secondary' && 'bg-muted text-foreground hover:bg-muted/80',
          variant === 'ghost' && 'hover:bg-muted',
          variant === 'outline' && 'border border-[hsl(var(--border))] bg-transparent hover:bg-muted',
          size === 'sm' && 'h-9 px-4 text-sm',
          size === 'md' && 'h-11 px-6 text-sm',
          size === 'lg' && 'h-12 px-8 text-base',
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
