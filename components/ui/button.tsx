import * as React from 'react';
import { cn } from '../../lib/utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'cta' | 'whatsapp' | 'outline' | 'ghost' | 'destructive' | 'secondary';
  size?: 'default' | 'primary' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-xs font-semibold ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F3D5C] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.98] select-none';

    const variantStyles = {
      default: 'bg-[#0F3D5C] text-white hover:bg-[#1A547C] shadow-sm min-h-[48px] sm:min-h-[48px]',
      cta: 'bg-[#F59E0B] text-slate-900 hover:bg-[#D97706] shadow-sm font-bold min-h-[56px] sm:min-h-[48px]',
      whatsapp: 'bg-[#25D366] text-white hover:bg-[#1EBE5D] shadow-sm font-bold min-h-[48px]',
      outline: 'border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 min-h-[48px]',
      ghost: 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 min-h-[48px]',
      destructive: 'bg-rose-600 text-white hover:bg-rose-700 min-h-[48px]',
      secondary: 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 min-h-[48px]',
    };

    const sizeStyles = {
      default: 'min-h-[48px] px-4 py-2.5',
      primary: 'min-h-[56px] h-14 px-6 py-3.5 text-sm font-bold',
      sm: 'min-h-[44px] px-3 py-1.5 text-[11px]',
      lg: 'min-h-[56px] h-14 px-6 text-sm font-bold',
      icon: 'min-h-[48px] min-w-[48px] p-2',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
