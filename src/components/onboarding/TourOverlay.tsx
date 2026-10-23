/**
 * @file src/components/onboarding/TourOverlay.tsx
 * Componente Visual de Tour Contextual com destaque de elemento e navegação por passos.
 */

import React, { useState, useEffect } from 'react';
import { Sparkles, ChevronRight, ChevronLeft, X, Check } from 'lucide-react';
import { TourDefinition, markTourSeen } from '@/lib/tours';

interface TourOverlayProps {
  userId: string;
  tour: TourDefinition;
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export const TourOverlay: React.FC<TourOverlayProps> = ({
  userId,
  tour,
  isOpen,
  onClose,
  onComplete,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
    }
  }, [isOpen]);

  if (!isOpen || !tour.steps.length) return null;

  const currentStep = tour.steps[currentStepIndex];
  const isLast = currentStepIndex === tour.steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      markTourSeen(userId, tour.id);
      onComplete?.();
      onClose();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    markTourSeen(userId, tour.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center p-4">
      {/* Backdrop semi-transparente que não bloqueia totalmente o ecrã mas direciona o foco */}
      <div
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] pointer-events-auto transition-opacity duration-300"
        onClick={handleSkip}
      />

      {/* Caixa de Diálogo do Tour */}
      <div className="relative pointer-events-auto w-full max-w-md bg-white rounded-3xl shadow-2xl border-2 border-amber-400 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-7 h-7 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#0F3D5C]">
              {tour.name}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-slate-400">
              {currentStepIndex + 1} de {tour.steps.length}
            </span>
            <button
              onClick={handleSkip}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              title="Fechar tour"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Título & Descrição do Passo */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-900 border border-amber-300">
              {currentStep.badge || `Passo ${currentStepIndex + 1}`}
            </span>
            <h3 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
              {currentStep.title}
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {currentStep.description}
          </p>
        </div>

        {/* Barra de Progresso Pontilhada */}
        <div className="flex items-center space-x-1.5 pt-1">
          {tour.steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentStepIndex
                  ? 'w-7 bg-[#0F3D5C]'
                  : idx < currentStepIndex
                  ? 'w-2 bg-emerald-500'
                  : 'w-2 bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* Botões de Navegação */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <button
            onClick={handleSkip}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            Saltar Tour
          </button>

          <div className="flex items-center space-x-2">
            {currentStepIndex > 0 && (
              <button
                onClick={handlePrev}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center space-x-1 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Anterior</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-4 py-2 bg-[#0F3D5C] hover:bg-[#0A2A3F] text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <span>{isLast ? 'Concluir' : 'Seguinte'}</span>
              {isLast ? <Check className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
