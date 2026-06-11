import * as React from 'react';
import { cn } from '@/lib/utils';

const Badge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: 'default' | 'gold' | 'teal' | 'draft' }
>(({ className, variant = 'default', ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
      variant === 'default' && 'border-white/20 bg-white/5 text-white/80',
      variant === 'gold' && 'border-gold/30 bg-gold/10 text-gold',
      variant === 'teal' && 'border-teal-500/30 bg-teal-500/10 text-teal-300',
      variant === 'draft' && 'border-amber-500/30 bg-amber-500/10 text-amber-300',
      className
    )}
    {...props}
  />
));
Badge.displayName = 'Badge';

export { Badge };
