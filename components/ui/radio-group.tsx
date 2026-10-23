import * as React from 'react';
import { cn } from '../../lib/utils/cn';

interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

export interface RadioGroupProps {
  name: string;
  value?: string;
  defaultValue?: string;
  options: RadioOption[];
  onChange?: (value: string) => void;
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  value: controlledValue,
  defaultValue,
  options,
  onChange,
  className,
}) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue || options[0]?.value || '');
  const currentValue = controlledValue !== undefined ? controlledValue : internalValue;

  const handleSelect = (val: string) => {
    if (controlledValue === undefined) {
      setInternalValue(val);
    }
    onChange?.(val);
  };

  return (
    <div className={cn('space-y-2', className)}>
      {options.map((opt) => {
        const isSelected = currentValue === opt.value;
        return (
          <label
            key={opt.value}
            className={cn(
              'flex items-start space-x-3 p-3 rounded-xl border transition-all cursor-pointer select-none',
              isSelected
                ? 'border-[#0F3D5C] bg-blue-50/30 ring-1 ring-[#0F3D5C]'
                : 'border-[#E2E8F0] hover:bg-slate-50'
            )}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={isSelected}
              onChange={() => handleSelect(opt.value)}
              className="mt-0.5 h-4 w-4 text-[#0F3D5C] border-[#E2E8F0] focus:ring-[#0F3D5C] accent-[#0F3D5C]"
            />
            <div className="flex-1">
              <span className="text-xs font-semibold text-slate-800 block">{opt.label}</span>
              {opt.description && (
                <span className="text-[11px] text-[#64748B] block mt-0.5">{opt.description}</span>
              )}
            </div>
          </label>
        );
      })}
    </div>
  );
};
