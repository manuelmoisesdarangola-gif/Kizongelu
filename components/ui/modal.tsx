/**
 * @file components/ui/modal.tsx
 * Componente Modal base do Design System Kizongelu.
 */

import * as React from 'react';
import { cn } from '../../lib/utils/cn';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  className,
}) => {
  // WCAG 2.1 AA: fechar modal com tecla ESC
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Janela modal'}
      className="fixed inset-0 z-50 flex items-center justify-center sm:p-4"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Content — Full screen em mobile (< 640px) e rounded centralizado em desktop */}
      <div
        className={cn(
          'relative z-50 w-full bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 shadow-2xl animate-in zoom-in-95 duration-150',
          'max-sm:fixed max-sm:inset-0 max-sm:h-full max-sm:w-full max-sm:rounded-none max-sm:border-none max-sm:overflow-y-auto max-sm:p-5',
          'sm:rounded-2xl sm:p-6 sm:max-h-[90vh] sm:overflow-y-auto',
          sizeClasses[size],
          className
        )}
      >
        <button
          onClick={onClose}
          aria-label="Fechar janela"
          className="absolute right-4 top-4 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {title && <h2 className="text-base sm:text-lg font-bold text-[#0F3D5C] dark:text-sky-400 pr-10">{title}</h2>}
        {description && <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1 mb-4">{description}</p>}

        <div className="mt-2">{children}</div>
      </div>
    </div>
  );
};
