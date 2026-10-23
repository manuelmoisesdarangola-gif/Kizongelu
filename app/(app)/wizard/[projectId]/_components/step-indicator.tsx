/**
 * @file app/(app)/wizard/[projectId]/_components/step-indicator.tsx
 * Barra horizontal de indicadores das 7 etapas.
 */

import React from 'react';
import { useWizardStore } from '../../../../../lib/stores/wizard-store';
import { Check, Home, MapPin, Ruler, Hammer, Zap, Coins, FileText } from 'lucide-react';

const STEP_ICONS = [Home, MapPin, Ruler, Hammer, Zap, Coins, FileText];
const STEP_SHORT_NAMES = [
  'Tipo',
  'Local',
  'Dimensões',
  'Estrutura',
  'Acabamentos',
  'Orçamento',
  'Documentos',
];

export const StepIndicator: React.FC = () => {
  const { currentStep, totalSteps, goToStep } = useWizardStore();

  return (
    <div className="w-full overflow-x-auto py-2 px-1 scrollbar-none">
      <div className="flex items-center justify-between min-w-[560px] sm:min-w-0 max-w-4xl mx-auto px-4">
        {Array.from({ length: totalSteps }).map((_, idx) => {
          const stepNumber = idx + 1;
          const Icon = STEP_ICONS[idx];
          const isCurrent = currentStep === stepNumber;
          const isCompleted = currentStep > stepNumber;

          return (
            <React.Fragment key={stepNumber}>
              <button
                type="button"
                onClick={() => goToStep(stepNumber)}
                className={`flex flex-col items-center group cursor-pointer transition-all ${
                  isCurrent ? 'scale-105' : 'opacity-70 hover:opacity-100'
                }`}
              >
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs transition-colors border ${
                    isCurrent
                      ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-md shadow-amber-500/25 ring-4 ring-amber-100'
                      : isCompleted
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                      : 'bg-white border-slate-200 text-slate-400'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : <Icon className="w-4 h-4" />}
                </div>
                <span
                  className={`text-[11px] mt-1 font-semibold whitespace-nowrap ${
                    isCurrent ? 'text-amber-700 font-bold' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                  }`}
                >
                  {STEP_SHORT_NAMES[idx]}
                </span>
              </button>

              {stepNumber < totalSteps && (
                <div
                  className={`flex-1 h-0.5 mx-2 rounded-full transition-colors ${
                    stepNumber < currentStep ? 'bg-emerald-400' : 'bg-slate-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
