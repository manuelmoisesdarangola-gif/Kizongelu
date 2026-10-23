/**
 * @file src/components/subscriptions/QuotaExceededModal.tsx
 * Modal de Bloqueio por Quota/Créditos Excedidos:
 * - Disparado quando os créditos do pacote estão esgotados ao tentar criar novo orçamento.
 * - Apresenta mensagem explicativa com saldo de créditos e benefícios.
 * - Botão direto para Aquisição de Novo Pacote de Orçamentos.
 */

import React from 'react';
import { Lock, Sparkles, ArrowRight, X, Calendar } from 'lucide-react';
import { PlanDefinition, SubscriptionRecord } from '@/lib/actions/subscriptions';

interface QuotaExceededModalProps {
  isOpen: boolean;
  subscription?: SubscriptionRecord | null;
  plan?: PlanDefinition | null;
  onUpgrade: () => void;
  onClose: () => void;
}

export const QuotaExceededModal: React.FC<QuotaExceededModalProps> = ({
  isOpen,
  onUpgrade,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-center space-y-6 animate-in fade-in zoom-in-95">
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="w-14 h-14 rounded-3xl bg-amber-100 text-amber-900 flex items-center justify-center mx-auto shadow-md shadow-amber-900/10">
          <Lock className="w-7 h-7 text-amber-700" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Sem Créditos Disponíveis
          </span>
          <h3 className="text-lg font-black text-slate-900">
            Sem orçamentos disponíveis
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
            Utilizou todos os créditos do seu pacote actual. Compre um novo pacote para continuar.
          </p>
        </div>

        {/* Ações */}
        <div className="space-y-2.5 pt-2 border-t border-slate-100">
          <button
            onClick={() => {
              onClose();
              onUpgrade();
            }}
            className="w-full py-3.5 bg-[#0F3D5C] hover:bg-[#0A2A3F] text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-slate-900/10 flex items-center justify-center space-x-2 transition-all active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Comprar pacote &rarr;</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onUpgrade();
            }}
            className="text-xs font-semibold text-slate-500 hover:text-[#0F3D5C] cursor-pointer block w-full py-1"
          >
            Ver pacotes disponíveis
          </button>

          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer block w-full"
          >
            Voltar ao painel de orçamentos
          </button>
        </div>
      </div>
    </div>
  );
};
