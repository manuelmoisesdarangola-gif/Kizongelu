import * as React from 'react';
import { cn } from '../../lib/utils/cn';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const inputId = id || (label ? `cb-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <label htmlFor={inputId} className="inline-flex items-center space-x-2 cursor-pointer select-none">
        <input
          id={inputId}
          type="checkbox"
          ref={ref}
          className={cn(
            'h-4 w-4 rounded-md border border-[#E2E8F0] text-[#0F3D5C] focus:ring-[#0F3D5C] accent-[#0F3D5C]',
            className
          )}
          {...props}
        />
        {label && <span className="text-xs text-slate-700 font-medium">{label}</span>}
      </label>
    );
  }
);
Checkbox.displayName = 'Checkbox';
