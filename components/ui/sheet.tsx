import * as React from 'react';
import { cn } from '../../lib/utils/cn';
import { X } from 'lucide-react';

export interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  side?: 'left' | 'right';
  children: React.ReactNode;
  className?: string;
}

export const Sheet: React.FC<SheetProps> = ({
  open,
  onOpenChange,
  title,
  side = 'right',
  children,
  className,
}) => {
  if (!open) return null;

  const sideStyles = {
    right: 'inset-y-0 right-0 max-w-md w-full animate-in slide-in-from-right duration-200 border-l',
    left: 'inset-y-0 left-0 max-w-md w-full animate-in slide-in-from-left duration-200 border-r',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="fixed inset-0 bg-black/50 transition-opacity animate-in fade-in"
        onClick={() => onOpenChange(false)}
      />
      <div
        className={cn(
          'fixed z-50 flex flex-col bg-white p-6 shadow-2xl border-[#E2E8F0] overflow-y-auto',
          sideStyles[side],
          className
        )}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          {title && <h3 className="text-sm font-bold text-[#0F3D5C]">{title}</h3>}
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="py-4 flex-1">{children}</div>
      </div>
    </div>
  );
};
