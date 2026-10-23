/**
 * @file app/(app)/wizard/[projectId]/_components/wizard-header.tsx
 * Cabeçalho do Wizard com progresso, tempo estimado restante e indicador de auto-save.
 */

import React, { useState } from 'react';
import { useWizardStore } from '../../../../../lib/stores/wizard-store';
import { Check, Clock, Loader2, Save, X, AlertCircle } from 'lucide-react';

interface WizardHeaderProps {
  onSaveAndExit?: () => void;
}

const STEP_NAMES: Record<number, string> = {
  1: 'Tipo de Obra',
  2: 'Localização',
  3: 'Dimensões & Compartimentos',
  4: 'Opções Construtivas',
  5: 'Instalações & Acabamentos',
  6: 'Orçamento Disponível',
  7: 'Documentação e Projecto',
};

const REMAINING_MINUTES: Record<number, number> = {
  1: 3,
  2: 3,
  3: 2,
  4: 2,
  5: 1,
  6: 1,
  7: 1,
};

export const WizardHeader: React.FC<WizardHeaderProps> = ({ onSaveAndExit }) => {
  const { currentStep, totalSteps, isSaving, lastSavedAt } = useWizardStore();
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const progressPercent = Math.round((currentStep / totalSteps) * 100);
  const remainingMinutes = REMAINING_MINUTES[currentStep] || 1;

  const handleConfirmExit = () => {
    setShowExitConfirm(false);
    if (onSaveAndExit) {
      onSaveAndExit();
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5">
          <div className="flex items-center justify-between gap-3">
            {/* Título da Etapa Atual */}
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
                <span className="text-amber-600 font-bold uppercase tracking-wider">
                  Etapa {currentStep} de {totalSteps}
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1 text-slate-600">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Falta ~{remainingMinutes} {remainingMinutes === 1 ? 'minuto' : 'minutos'}</span>
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-0.5">
                {STEP_NAMES[currentStep] || 'Configuração'}
              </h1>
            </div>

            {/* Estado de Auto-Save & Botão Sair */}
            <div className="flex items-center space-x-2.5">
              <div className="hidden sm:flex items-center">
                {isSaving ? (
                  <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-[11px] text-amber-700 font-semibold animate-pulse">
                    <Loader2 className="w-3 h-3 text-amber-600 animate-spin" />
                    <span>A guardar...</span>
                  </div>
                ) : lastSavedAt ? (
                  <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 font-bold transition-all animate-in fade-in zoom-in-95 duration-200">
                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                    <span>Guardado</span>
                  </div>
                ) : null}
              </div>

              {onSaveAndExit && (
                <button
                  type="button"
                  onClick={() => setShowExitConfirm(true)}
                  className="px-3 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer flex items-center space-x-1.5"
                >
                  <Save className="w-3.5 h-3.5 text-slate-600" />
                  <span>Guardar e sair</span>
                </button>
              )}
            </div>
          </div>

          {/* Barra de Progresso Horizontal */}
          <div className="mt-3 relative w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-300 ease-out rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </header>

      {/* Modal de Confirmação para Guardar e Sair (4.4) */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 sm:p-6 shadow-xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Guardar e sair do assistente?
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                O seu progresso está guardado em rascunho. Poderá retomar este orçamento mais tarde a partir deste dispositivo.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Continuar a editar
              </button>
              <button
                type="button"
                onClick={handleConfirmExit}
                className="flex-1 py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Confirmar e sair
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
