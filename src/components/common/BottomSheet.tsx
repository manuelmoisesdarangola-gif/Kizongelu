/**
 * @file src/components/common/BottomSheet.tsx
 * Bottom Sheet mobile-first arrastável com suporte a gestos de arrasto e fecho.
 * Em ecrãs móveis (Android 390x844 e 360x740), desliza a partir de baixo com puxador tátil.
 */

import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxHeight?: string;
  showCloseButton?: boolean;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxHeight = 'max-h-[85vh]',
  showCloseButton = true,
}) => {
  const [startY, setStartY] = useState<number | null>(null);
  const [currentY, setCurrentY] = useState<number>(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setCurrentY(0);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY === null) return;
    const deltaY = e.touches[0].clientY - startY;
    if (deltaY > 0) {
      setCurrentY(deltaY);
    }
  };

  const handleTouchEnd = () => {
    if (currentY > 120) {
      onClose();
    }
    setStartY(null);
    setCurrentY(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-200"
      />

      {/* Sheet Content */}
      <div
        ref={sheetRef}
        style={{
          transform: currentY > 0 ? `translateY(${currentY}px)` : undefined,
          transition: startY === null ? 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
        }}
        className={`relative z-10 w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 flex flex-col ${maxHeight} overflow-hidden animate-in slide-in-from-bottom duration-200`}
      >
        {/* Puxador Tátil de Arraste (Touch Handle) */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="w-full pt-3 pb-2 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing sm:hidden select-none touch-none"
        >
          <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
        </div>

        {/* Cabeçalho */}
        {(title || showCloseButton) && (
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div>
              {title && (
                <h3 className="text-base font-extrabold text-[#0F3D5C] tracking-tight">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs text-[#64748B] mt-0.5">{description}</p>
              )}
            </div>

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="min-h-[48px] min-w-[48px] flex items-center justify-center p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 active:scale-95 transition-all"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Corpo scrollável com padding-bottom de segurança */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 pb-8 overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
};
