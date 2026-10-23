import * as React from 'react';
import { cn } from '../../lib/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'cta' | 'whatsapp' | 'destructive' | 'outline' | 'warning';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variantStyles = {
    default: 'bg-[#0F3D5C] text-white',
    secondary: 'bg-slate-100 text-slate-800 border-slate-200',
    cta: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
    whatsapp: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold',
    destructive: 'bg-rose-100 text-rose-800 border-rose-200',
    warning: 'bg-amber-100 text-amber-800 border-amber-200 font-medium',
    outline: 'text-slate-800 border border-[#E2E8F0]',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#0F3D5C] focus:ring-offset-2',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
