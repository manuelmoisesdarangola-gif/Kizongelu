/**
 * @file src/components/budget/TransparencyDrawer.tsx
 * Painel de Transparência e Explicabilidade Técnica por Item (Fase 17).
 * Drawer lateral em desktop / Bottom sheet no mobile com fórmulas, inputs, coeficientes,
 * fontes de preços, mini-simulador interativo e histórico de diffs.
 */

import React, { useState, useId } from 'react';
import {
  X,
  Calculator,
  Sliders,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  History,
  FileCode,
  Building,
  Calendar,
  Layers,
  HelpCircle,
  TrendingUp,
  Cpu,
  ArrowRight,
} from 'lucide-react';
import { CalculationItem } from '@/lib/calculation-engine/types';
import { explainItem, simulateItemQty, ItemExplanation, CURRENT_ENGINE_VERSION } from '@/lib/calculation-engine/explain';
import { formatCurrencyKz } from '@/lib/format/currency';

interface TransparencyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  item: CalculationItem | null;
  projectContext?: {
    province?: string;
    areaM2?: number;
    foundationType?: string;
    finishLevel?: string;
  };
}

export const TransparencyDrawer: React.FC<TransparencyDrawerProps> = ({
  isOpen,
  onClose,
  item,
  projectContext,
}) => {
  const sliderId = useId();
  if (!isOpen || !item) return null;

  const baseArea = projectContext?.areaM2 || 120;
  const [simulatedArea, setSimulatedArea] = useState<number>(baseArea);
  const [activeTab, setActiveTab] = useState<'formula' | 'simulator' | 'sources'>('formula');

  const explanation: ItemExplanation = explainItem(item, projectContext);
  const simulation = simulateItemQty(item, baseArea, simulatedArea);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      {/* Container: Drawer Lateral no Desktop (w-full sm:max-w-xl) / Bottom Sheet em Mobile */}
      <div className="w-full sm:max-w-xl bg-white h-full sm:h-auto shadow-2xl flex flex-col border-l border-slate-200 overflow-hidden animate-in slide-in-from-right duration-300 sm:duration-200">
        {/* Header do Drawer */}
        <div className="p-4 sm:p-5 bg-[#0F3D5C] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-[#F59E0B] flex items-center justify-center font-black text-sm border border-amber-500/30">
              ƒx
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-300 bg-white/10 px-2 py-0.5 rounded">
                  {explanation.code}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-full border border-amber-400/30">
                  Motor {explanation.engineVersion}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white line-clamp-1 mt-0.5">
                {explanation.description}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            title="Fechar painel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Tabs do Drawer */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50 px-4 shrink-0 text-xs font-bold text-slate-600">
          <button
            onClick={() => setActiveTab('formula')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'formula'
                ? 'border-[#0F3D5C] text-[#0F3D5C]'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Fórmula & Coeficientes
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'simulator'
                ? 'border-[#0F3D5C] text-[#0F3D5C]'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Mini-Simulador</span>
          </button>
          <button
            onClick={() => setActiveTab('sources')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'sources'
                ? 'border-[#0F3D5C] text-[#0F3D5C]'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Preço & Fontes
          </button>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs text-slate-700">
          {/* Alerta de Verificação Recomendada (se usou valor padrão) */}
          {explanation.hasVerificationAlert && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start space-x-3 text-amber-950">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <strong className="block text-xs font-bold">Verificação Recomendada no Estaleiro</strong>
                <p className="text-[11px] leading-relaxed text-amber-900/90">
                  {explanation.verificationSuggestion}
                </p>
              </div>
            </div>
          )}

          {/* Destaque de Recalculado (Diff v1 → v2) */}
          {explanation.isRecalculated && explanation.recalculatedDiff && (
            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl flex items-start space-x-3 text-blue-950">
              <History className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <strong className="text-xs font-bold">Item Recalculado (Versão Atual)</strong>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 bg-blue-200/60 rounded text-blue-900">
                    Diff Detectado
                  </span>
                </div>
                <p className="text-[11px] text-blue-900/90">
                  Quantidade: <span className="line-through text-slate-500">{explanation.recalculatedDiff.previousQty}</span> &rarr;{' '}
                  <span className="font-bold text-blue-950">{explanation.recalculatedDiff.currentQty} {explanation.unit}</span>
                  <br />
                  Motivo: {explanation.recalculatedDiff.reason}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'formula' && (
            <>
              {/* 1. Fórmula Aplicada */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-[#0F3D5C]" />
                  <span>Fórmula Aplicada (Motor Determinístico)</span>
                </span>
                <div className="p-3.5 bg-slate-900 text-amber-400 font-mono text-xs rounded-xl shadow-inner border border-slate-800">
                  {explanation.formulaNotation}
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-mono text-[11px]">
                  {explanation.readableFormula}
                </div>
              </div>

              {/* 2. Dados Usados e Origem */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#0F3D5C]" />
                  <span>Variáveis e Origem dos Dados</span>
                </span>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100/70 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-600">
                      <tr>
                        <th className="p-2.5">Variável</th>
                        <th className="p-2.5">Valor Usado</th>
                        <th className="p-2.5">Origem Técnica</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {explanation.inputs.map((inp, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-2.5 font-bold text-slate-900">{inp.label}</td>
                          <td className="p-2.5 font-mono text-[#0F3D5C] font-semibold">{inp.value}</td>
                          <td className="p-2.5">
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                              {inp.origin}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 3. Coeficientes Técnicos */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-[#0F3D5C]" />
                  <span>Coeficientes de Calibração (Normas de Angola)</span>
                </span>
                <div className="space-y-2">
                  {explanation.coefficients.map((c, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between"
                    >
                      <div>
                        <strong className="text-slate-900 block">{c.label}</strong>
                        <span className="text-[10px] text-slate-500 font-mono">{c.code}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-[#0F3D5C] font-mono">
                          {c.value} {c.unit}
                        </span>
                        <span className="block text-[9px] text-slate-400">v{c.version}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Nota Técnica Oficial */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
                  <Info className="w-4 h-4 text-[#0F3D5C]" />
                  <span>Justificação de Engenharia</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {explanation.technicalNote}
                </p>
              </div>
            </>
          )}

          {activeTab === 'simulator' && (
            <div className="space-y-6">
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-[#F59E0B]" />
                  <span>Simulador de Sensibilidade de Área</span>
                </span>
                <p className="text-[11px] text-amber-900/80 leading-relaxed">
                  Veja instantaneamente como a variação da área bruta de construção afecta a quantidade deste material e o orçamento parcial correspondente.
                </p>
              </div>

              {/* Controles de Simulação */}
              <div className="space-y-4 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label htmlFor={sliderId} className="font-bold text-slate-800 text-xs">
                    Área Bruta de Construção:
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min={30}
                      max={800}
                      value={simulatedArea}
                      onChange={(e) => setSimulatedArea(Math.max(1, Number(e.target.value)))}
                      className="w-20 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-right"
                    />
                    <span className="font-bold text-slate-600">m²</span>
                  </div>
                </div>

                <input
                  id={sliderId}
                  type="range"
                  min={30}
                  max={600}
                  step={5}
                  value={simulatedArea}
                  onChange={(e) => setSimulatedArea(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0F3D5C]"
                />

                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>30 m² (Anexo)</span>
                  <span>{baseArea} m² (Atual)</span>
                  <span>600 m² (Vivenda V4+)</span>
                </div>
              </div>

              {/* Resultado da Simulação */}
              <div className="p-5 bg-white rounded-2xl border-2 border-[#0F3D5C]/30 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold text-slate-500">Resultado Recalculado:</span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      (simulation.percentageChange ?? 0) >= 0
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {(simulation.percentageChange ?? 0) >= 0
                      ? `+${simulation.percentageChange ?? 0}%`
                      : `${simulation.percentageChange ?? 0}%`}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-500">Quantidade Prevista:</span>
                    <span className="text-lg font-black text-slate-900 block font-mono">
                      {simulation.newQuantity.toLocaleString('pt-AO')} {item.unit}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Base atual: {item.quantity} {item.unit}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-500">Custo Total Previsto:</span>
                    <span className="text-lg font-black text-[#0F3D5C] block">
                      {formatCurrencyKz(simulation.newTotal)}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Base atual: {formatCurrencyKz(item.total)}
                    </span>
                  </div>
                </div>

                {simulation.diffQty !== 0 && (
                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600 flex items-center justify-between">
                    <span>Impacto Financeiro Direto:</span>
                    <strong className={(simulation.diffTotal ?? 0) >= 0 ? 'text-amber-700' : 'text-emerald-700'}>
                      {(simulation.diffTotal ?? 0) >= 0
                        ? `+${formatCurrencyKz(simulation.diffTotal ?? 0)}`
                        : formatCurrencyKz(simulation.diffTotal ?? 0)}
                    </strong>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'sources' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider block">
                  Cotação Unitária em Kwanzas (Kz)
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-[#0F3D5C]">
                    {formatCurrencyKz(explanation.priceDetails.unitPriceKz)}
                  </span>
                  <span className="text-xs text-slate-500">por {item.unit}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">
                    Fonte de Preço Verificada
                  </span>
                  <strong className="text-xs text-slate-900 block flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-[#0F3D5C]" />
                    <span>{explanation.priceDetails.source}</span>
                  </strong>
                </div>

                <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">
                    Região & Data de Coleta
                  </span>
                  <strong className="text-xs text-slate-900 block flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#F59E0B]" />
                    <span>{explanation.priceDetails.province} &bull; {explanation.priceDetails.lastUpdated}</span>
                  </strong>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-slate-600 text-[11px] leading-relaxed">
                  As cotações de armazém são aferidas semanalmente em entrepostos credenciados. Caso possua cotação negociada mais vantajosa com o seu fornecedor local, pode editar o preço unitário diretamente no mapa de quantidades.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé do Drawer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500 font-mono">
            Subtotal: <strong className="text-slate-900">{formatCurrencyKz(item.total)}</strong>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#0F3D5C] hover:bg-[#0A293E] active:scale-95 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Concluir Análise
          </button>
        </div>
      </div>
    </div>
  );
};
