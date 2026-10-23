/**
 * @file src/context/ToastContext.tsx
 * Sistema de Toasts de Notificação Global para o Kizongelu .
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast, ToastProps } from '@/components/ui/toast';

export interface ToastItem extends Omit<ToastProps, 'onClose'> {
  id: string;
  durationMs?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (item: Omit<ToastItem, 'id'>) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newToast: ToastItem = { ...item, id };

      setToasts((prev) => [...prev, newToast]);

      const duration = item.durationMs ?? 3000;
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, title: string = 'Operação concluída') => {
      showToast({ type: 'success', title, message, durationMs: 3000 });
    },
    [showToast]
  );

  const error = useCallback(
    (message: string, title: string = 'Erro') => {
      showToast({ type: 'error', title, message, durationMs: 4000 });
    },
    [showToast]
  );

  const warning = useCallback(
    (message: string, title: string = 'Atenção') => {
      showToast({ type: 'warning', title, message, durationMs: 3500 });
    },
    [showToast]
  );

  const info = useCallback(
    (message: string, title: string = 'Informação') => {
      showToast({ type: 'info', title, message, durationMs: 3000 });
    },
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast, success, error, warning, info }}>
      {children}
      {/* Toast Overlay Container — Canto superior direito (desktop) / Topo (mobile) */}
      <div
        aria-live="polite"
        className="fixed top-4 sm:top-5 right-3 sm:right-6 left-3 sm:left-auto z-50 flex flex-col space-y-2.5 max-w-sm sm:w-full pointer-events-none"
      >
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto transform transition-all duration-200">
            <Toast
              type={toast.type}
              title={toast.title}
              message={toast.message}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast deve ser utilizado dentro de um ToastProvider');
  }
  return ctx;
}
