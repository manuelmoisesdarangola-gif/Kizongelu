/**
 * @file app/(app)/wizard/[projectId]/_components/wizard-footer.tsx
 * Rodapé de Navegação do Wizard com botões de 56px de altura (Mobile-first).
 */

import React from 'react';
import { useWizardStore } from '../../../../../lib/stores/wizard-store';
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';

interface WizardFooterProps {
  onComplete?: () => void;
}

export const WizardFooter: React.FC<WizardFooterProps> = ({ onComplete }) => {
  const {
    currentStep,
    totalSteps,
    prevStep,
    nextStep,
    handleNextStep: storeHandleNextStep,
    isSubmitting,
    completeWizard,
    data,
  } = useWizardStore();

  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  const isNextDisabled = React.useMemo(() => {
    if (currentStep === 1) {
      const step1Type = data.step1?.type || (data.step1 as any)?.workType;
      return !step1Type;
    }
    if (currentStep === 2) {
      return !data.step2?.province || !data.step2?.municipality;
    }
    if (currentStep === 3) {
      return !data.step3?.areaUnknown && (!data.step3?.area || data.step3.area < 5);
    }
    return false;
  }, [
    currentStep,
    data,
    data.step1?.type,
    (data.step1 as any)?.workType,
    data.step2?.province,
    data.step2?.municipality,
    data.step3?.area,
    data.step3?.areaUnknown,
  ]);

  const handleNextStep = async () => {
    if (isNextDisabled || isSubmitting) return;

    if (isLastStep) {
      if (onComplete) {
        onComplete();
      } else {
        await completeWizard();
      }
    } else {
      nextStep();
    }
  };

  const handleNextOrSubmit = handleNextStep;

  return (
    <footer className="sticky bottom-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-3 sm:py-4">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-3">
        {/* Botão Voltar (Ghost) */}
        {!isFirstStep ? (
          <button
            type="button"
            onClick={prevStep}
            disabled={isSubmitting}
            className="min-h-[56px] px-5 sm:px-6 rounded-xl font-bold text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer flex items-center space-x-2 border border-slate-200"
          >
            <ArrowLeft className="w-5 h-5 text-slate-500" />
            <span>Voltar</span>
          </button>
        ) : (
          <div className="w-20 sm:w-24" />
        )}

        {/* Botão Continuar / Concluir Cálculo (Laranja / 56px) */}
        <button
          type="button"
          onClick={handleNextStep}
          disabled={isSubmitting || isNextDisabled}
          className={`min-h-[56px] flex-1 sm:flex-initial sm:min-w-[240px] px-6 sm:px-8 bg-amber-500 text-slate-950 font-black text-base rounded-xl transition-all flex items-center justify-center space-x-2.5 ${
            isNextDisabled || isSubmitting
              ? 'opacity-40 cursor-not-allowed shadow-none'
              : 'hover:bg-amber-400 active:scale-[0.99] shadow-md shadow-amber-500/20 cursor-pointer'
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>A processar cálculo...</span>
            </>
          ) : isLastStep ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-slate-950" />
              <span>Concluir cálculo</span>
            </>
          ) : (
            <>
              <span>Continuar</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </footer>
  );
};
