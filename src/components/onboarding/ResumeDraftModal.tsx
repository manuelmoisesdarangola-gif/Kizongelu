/**
 * @file src/components/onboarding/ResumeDraftModal.tsx
 * Modal de Retoma de Orçamento Incompleto (Fase 14):
 * - Disparado ao entrar em /painel se existir rascunho em andamento.
 * - Mensagem: "Encontrámos um orçamento em andamento".
 * - Botões:
 *   - "Continuar Cálculo" (direciona para /wizard/:id ou /projetos/:id/preview)
 *   - "Descartar e Criar Novo"
 *   - "Lembrar mais tarde"
 */

import React from 'react';
import {
  FolderOpen,
  ArrowRight,
  Clock,
  Trash2,
  X,
  MapPin,
  Calendar,
} from 'lucide-react';
import { ProjectListItem } from '@/lib/actions/projects';

interface ResumeDraftModalProps {
  draft: ProjectListItem;
  isOpen: boolean;
  onResume: (projectId: string) => void;
  onDiscard: (projectId: string) => void;
  onDismiss: () => void;
}

export const ResumeDraftModal: React.FC<ResumeDraftModalProps> = ({
  draft,
  isOpen,
  onResume,
  onDiscard,
  onDismiss,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-6">
        {/* Topo */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700">
                Rascunho Não Finalizado
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                Encontrámos um orçamento em andamento
              </h3>
            </div>
          </div>

          <button
            onClick={onDismiss}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Card do Rascunho */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-extrabold text-[#0F3D5C]">
              {draft.name || 'Projecto de Construção'}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-50 text-amber-800 border border-amber-200">
              {draft.status === 'DRAFT' ? 'Rascunho' : 'Pré-visualização'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {draft.province || 'Angola'}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {draft.updatedAt
                ? new Date(draft.updatedAt).toLocaleDateString('pt-PT')
                : 'Recentemente'}
            </span>
          </div>

          {draft.totalKz ? (
            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
              <span className="text-slate-500">Estimativa apurada:</span>
              <span className="font-extrabold text-[#0F3D5C]">
                {draft.totalKz.toLocaleString('pt-PT')} Kz
              </span>
            </div>
          ) : null}
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Pode retomar imediatamente a partir da última etapa preenchida ou descartar este rascunho para começar um cálculo do zero.
        </p>

        {/* Ações */}
        <div className="space-y-2.5 pt-2 border-t border-slate-100">
          <button
            onClick={() => onResume(draft.id)}
            className="w-full py-3 bg-[#0F3D5C] hover:bg-[#0A2A3F] text-white text-xs sm:text-sm font-extrabold rounded-2xl shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <span>Continuar Cálculo</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => onDiscard(draft.id)}
              className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Descartar rascunho</span>
            </button>

            <button
              onClick={onDismiss}
              className="text-xs text-slate-500 hover:text-slate-700 font-semibold cursor-pointer"
            >
              Lembrar mais tarde
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
