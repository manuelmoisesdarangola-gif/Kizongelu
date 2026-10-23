/**
 * @file src/components/onboarding/OnboardingChecklist.tsx
 * Card destacado "Vamos começar 🚀" no Dashboard (Fase 14):
 * - 5 itens com progresso acumulado (X de 5).
 * - Cada item com link direto ou ação rápida:
 *   1. Explorar as 7 etapas de cálculo
 *   2. Calibrar província e custos locais
 *   3. Criar o primeiro rascunho de orçamento
 *   4. Pré-visualizar capítulos gratuitos
 *   5. Configurar canais de notificação
 * - Fechável após 5/5 concluídos (ou com botão de descartar quando tudo feito).
 */

import React, { useState, useEffect } from 'react';
import {
  Rocket,
  CheckCircle2,
  Circle,
  ChevronRight,
  X,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  actionLabel: string;
  actionKey: 'wizard' | 'provincia' | 'orcamento' | 'preview' | 'definicoes';
}

const CHECKLIST_STORAGE_KEY = 'kizongelu_onboarding_checklist';

interface OnboardingChecklistProps {
  userId: string;
  onNavigateAction: (actionKey: ChecklistItem['actionKey']) => void;
}

export const OnboardingChecklist: React.FC<OnboardingChecklistProps> = ({
  userId,
  onNavigateAction,
}) => {
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') return { item1: true };
    try {
      const raw = localStorage.getItem(`${CHECKLIST_STORAGE_KEY}_${userId}`);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { item1: true }; // Primeiro item vem concluído como boas-vindas
  });

  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(`${CHECKLIST_STORAGE_KEY}_dismissed_${userId}`) === 'true';
  });

  const items: ChecklistItem[] = [
    {
      id: 'item1',
      title: 'Explorar as 7 etapas de cálculo',
      description: 'Conheça o fluxo guiado de engenharia do tipo de obra aos acabamentos.',
      actionLabel: 'Ver etapas',
      actionKey: 'wizard',
    },
    {
      id: 'item2',
      title: 'Calibrar província e custos locais',
      description: 'Defina a sua localização de referência (Luanda, Benguela, etc.).',
      actionLabel: 'Calibrar',
      actionKey: 'provincia',
    },
    {
      id: 'item3',
      title: 'Criar o primeiro rascunho de orçamento',
      description: 'Gere a estimativa determinística de quantidades para a sua obra.',
      actionLabel: 'Novo orçamento',
      actionKey: 'orcamento',
    },
    {
      id: 'item4',
      title: 'Pré-visualizar capítulos gratuitos',
      description: 'Consulte os 3 primeiros capítulos abertos sem compromisso.',
      actionLabel: 'Pré-visualizar',
      actionKey: 'preview',
    },
    {
      id: 'item5',
      title: 'Configurar canais de notificação',
      description: 'Ative alertas no WhatsApp, Email ou Web Push para avisos de obra.',
      actionLabel: 'Definições',
      actionKey: 'definicoes',
    },
  ];

  const totalCount = items.length;
  const completedCount = items.filter((it) => completedItems[it.id]).length;
  const isAllComplete = completedCount === totalCount;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const toggleItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = { ...completedItems, [id]: !completedItems[id] };
    setCompletedItems(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${CHECKLIST_STORAGE_KEY}_${userId}`, JSON.stringify(updated));
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${CHECKLIST_STORAGE_KEY}_dismissed_${userId}`, 'true');
    }
  };

  if (isDismissed) return null;

  return (
    <div className="bg-gradient-to-r from-[#0F3D5C] to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden border border-slate-700/60 mb-6">
      {/* Glow de fundo */}
      <div className="absolute -right-16 -top-16 w-56 h-56 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />

      {/* Topo do Card */}
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm shrink-0 shadow-md">
              <Rocket className="w-4 h-4" />
            </span>
            <h3 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-1.5">
              <span>Vamos começar</span>
              <span className="text-amber-400 font-normal text-xs uppercase px-2 py-0.5 rounded-full bg-white/10 border border-white/15">
                {completedCount} de {totalCount} concluídos
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-300">
            Complete os passos essenciais para tirar o máximo partido das estimativas de obra em Angola.
          </p>
        </div>

        {/* Botão de Fechar */}
        <button
          onClick={handleDismiss}
          className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title={isAllComplete ? 'Fechar checklist' : 'Ocultar checklist'}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Barra de Progresso */}
      <div className="py-3">
        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Lista dos 5 Itens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
        {items.map((item) => {
          const isDone = Boolean(completedItems[item.id]);

          return (
            <div
              key={item.id}
              className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between space-y-2.5 ${
                isDone
                  ? 'bg-white/5 border-emerald-500/30'
                  : 'bg-white/10 border-white/15 hover:border-amber-400/50 hover:bg-white/15'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <button
                  onClick={(e) => toggleItem(item.id, e)}
                  className="cursor-pointer text-slate-300 hover:text-emerald-400 transition-colors"
                  title={isDone ? 'Marcar como pendente' : 'Marcar como concluído'}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-400" />
                  )}
                </button>
                <span className="text-[10px] font-mono text-slate-400">
                  {isDone ? 'Pronto' : 'Pendente'}
                </span>
              </div>

              <div>
                <h4 className={`text-xs font-bold leading-snug ${isDone ? 'line-through text-slate-400' : 'text-white'}`}>
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-300 mt-1 leading-normal line-clamp-2">
                  {item.description}
                </p>
              </div>

              <button
                onClick={() => {
                  toggleItem(item.id, { stopPropagation: () => {} } as any);
                  onNavigateAction(item.actionKey);
                }}
                className={`w-full py-1.5 px-2.5 rounded-xl text-[11px] font-bold flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                  isDone
                    ? 'bg-white/5 text-slate-300 hover:bg-white/10'
                    : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-sm'
                }`}
              >
                <span>{item.actionLabel}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Parabéns quando 5/5 concluídos */}
      {isAllComplete && (
        <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-xs text-emerald-200">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Excelente! Concluiu todos os passos iniciais com sucesso.</span>
          </div>
          <button
            onClick={handleDismiss}
            className="text-[11px] font-bold text-white underline hover:no-underline cursor-pointer"
          >
            Dispensar Card
          </button>
        </div>
      )}
    </div>
  );
};
