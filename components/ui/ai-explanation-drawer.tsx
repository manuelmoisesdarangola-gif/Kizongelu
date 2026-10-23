/**
 * @file components/ui/ai-explanation-drawer.tsx
 * Drawer lateral para exibição da explicação executiva do orçamento gerada pela IA.
 */

import React from 'react';
import { X, Sparkles, AlertTriangle, Lightbulb, ShieldCheck, Check } from 'lucide-react';
import { AiResult } from '../../lib/ai-service/types';
import { AiBadge } from './ai-badge';

interface AiExplanationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  result: AiResult | null;
  isLoading: boolean;
}

export const AiExplanationDrawer: React.FC<AiExplanationDrawerProps> = ({
  isOpen,
  onClose,
  result,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl z-10 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-900 text-base">Explicação do Orçamento</h3>
                <AiBadge needsConfirmation={result?.needsConfirmation} />
              </div>
              <p className="text-xs text-slate-500">
                Contextualização técnica dos valores calculados
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-semibold text-slate-600">
                A analisar composição de materiais e mão de obra...
              </p>
            </div>
          ) : result ? (
            <div className="space-y-6">
              {/* Card principal com o texto explicativo */}
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    Síntese Executiva
                  </span>
                  <AiBadge needsConfirmation={result.needsConfirmation} />
                </div>
                <p className="text-sm text-slate-800 leading-relaxed font-normal whitespace-pre-line">
                  {result.text}
                </p>
              </div>

              {/* Se houver aviso amarelo de confirmação */}
              {result.needsConfirmation && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-900">Necessita de Confirmação</h4>
                    <p className="text-xs text-amber-800 mt-0.5">
                      Algumas partes desta estimativa baseiam-se em valores de referência e devem ser aferidas pelo empreiteiro responsável.
                    </p>
                  </div>
                </div>
              )}

              {/* Recomendações e Sugestões */}
              {result.suggestions && result.suggestions.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    Recomendações de Gestão de Obra
                  </h4>
                  <div className="space-y-2.5">
                    {result.suggestions.map((sug, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 flex items-start gap-2.5"
                      >
                        <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{sug}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Raciocínio de Engenharia */}
              {result.reasoning && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Nota Metodológica
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed italic">
                    {result.reasoning}
                  </p>
                </div>
              )}

              {/* Disclaimer obrigatório do motor determinístico */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Garantia de Rigor:</strong> Os quantitativos e custos oficiais são computados exclusivamente pelo Motor Determinístico do Kizongelu. A IA atua unicamente como apoio de leitura e análise técnica.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Nenhuma informação disponível.</p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Kizongelu — Módulo de Engenharia Cognitiva</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
