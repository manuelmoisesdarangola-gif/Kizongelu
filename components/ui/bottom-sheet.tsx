/**
 * @file components/ui/bottom-sheet.tsx
 * Bottom Sheet para ações secundárias em dispositivos móveis (Fase 18).
 */

import * as React from 'react';
import { cn } from '../../lib/utils/cn';
import { X } from 'lucide-react';

export interface BottomSheetAction {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'danger' | 'highlight';
  onClick: () => void;
}

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  actions?: BottomSheetAction[];
  children?: React.ReactNode;
  className?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  description,
  actions,
  children,
  className,
}) => {
  // WCAG 2.1 AA: ESC listener
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Painel de ações secundárias'}
      className="fixed inset-0 z-50 flex flex-col justify-end"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet Content */}
      <div
        className={cn(
          'relative z-50 w-full max-w-lg mx-auto rounded-t-3xl border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 pb-8 shadow-2xl max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200',
          className
        )}
      >
        {/* Drag Handle Indicator */}
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-slate-300 dark:bg-slate-700" />

        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            {title && <h3 className="text-base font-bold text-[#0F3D5C] dark:text-sky-400">{title}</h3>}
            {description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar ações"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {actions && actions.length > 0 && (
          <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
            {actions.map((act) => (
              <button
                key={act.id}
                onClick={() => {
                  act.onClick();
                  onClose();
                }}
                className={cn(
                  'w-full min-h-[52px] py-3 px-3 flex items-center gap-3 text-left transition-colors rounded-xl active:bg-slate-100 dark:active:bg-slate-800 cursor-pointer',
                  act.variant === 'danger' && 'text-rose-600 dark:text-rose-400 font-semibold',
                  act.variant === 'highlight' && 'text-[#0F3D5C] dark:text-amber-400 font-bold',
                  !act.variant && 'text-slate-800 dark:text-slate-200'
                )}
              >
                {act.icon && <span className="shrink-0">{act.icon}</span>}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">{act.label}</div>
                  {act.description && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{act.description}</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {children && <div className="mt-4">{children}</div>}
      </div>
    </div>
  );
};
