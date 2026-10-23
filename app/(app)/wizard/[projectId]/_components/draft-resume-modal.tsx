/**
 * @file app/(app)/wizard/[projectId]/_components/draft-resume-modal.tsx
 * Modal de retoma de rascunho pendente (últimos 30 dias).
 */

import React from 'react';
import { useWizardStore } from '../../../../../lib/stores/wizard-store';
import { Clock, ArrowRight, RefreshCw, FileText, AlertCircle } from 'lucide-react';

export const DraftResumeModal: React.FC = () => {
  const { isResumeModalOpen, pendingDraft, resumeDraft, dismissDraftAndCreateNew } = useWizardStore();

  if (!isResumeModalOpen || !pendingDraft) return null;

  const formattedDate = new Date(pendingDraft.updatedAt).toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="p-6 sm:p-7">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-4">
            <Clock className="w-6 h-6" />
          </div>

          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            Encontrámos um orçamento em andamento
          </h3>
          <p className="text-sm text-slate-600 mt-2">
            Existe um rascunho não concluído nos últimos 30 dias. Deseja continuar de onde parou ou iniciar um novo cálculo?
          </p>

          <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5">
            <div className="flex items-center space-x-2 text-slate-700 font-bold">
              <FileText className="w-4 h-4 text-amber-500" />
              <span>{pendingDraft.title}</span>
            </div>
            <div className="text-slate-500 flex items-center justify-between">
              <span>Última alteração: {formattedDate}</span>
              <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Etapa {pendingDraft.currentStep} de 7
              </span>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row-reverse gap-2.5">
            <button
              type="button"
              onClick={resumeDraft}
              className="w-full sm:flex-1 min-h-[48px] bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm rounded-xl transition-colors cursor-pointer flex items-center justify-center space-x-2 shadow-xs"
            >
              <span>Continuar Rascunho</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={dismissDraftAndCreateNew}
              className="w-full sm:flex-1 min-h-[48px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors cursor-pointer flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-4 h-4 text-slate-500" />
              <span>Começar Novo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
