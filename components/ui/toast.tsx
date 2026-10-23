import * as React from 'react';
import { cn } from '../../lib/utils/cn';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

export const Toast: React.FC<ToastProps> = ({
  type = 'info',
  title,
  message,
  onClose,
  className,
}) => {
  const typeIcons = {
    success: <CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0" />,
    error: <AlertCircle className="h-4 w-4 text-[#EF4444] shrink-0" />,
    warning: <AlertCircle className="h-4 w-4 text-[#F59E0B] shrink-0" />,
    info: <Info className="h-4 w-4 text-[#0F3D5C] shrink-0" />,
  };

  const typeBorders = {
    success: 'border-[#10B981]/20 bg-emerald-50/70',
    error: 'border-[#EF4444]/20 bg-rose-50/70',
    warning: 'border-[#F59E0B]/20 bg-amber-50/70',
    info: 'border-[#0F3D5C]/20 bg-blue-50/70',
  };

  return (
    <div
      className={cn(
        'flex items-start space-x-3 rounded-xl border p-4 shadow-md transition-all text-xs',
        typeBorders[type],
        className
      )}
    >
      <div className="mt-0.5">{typeIcons[type]}</div>
      <div className="flex-1">
        {title && <h4 className="font-bold text-slate-900 mb-0.5">{title}</h4>}
        <p className="text-slate-700 leading-relaxed">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 rounded p-0.5 transition-colors cursor-pointer"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};
