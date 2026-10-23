/**
 * @file app/(app)/wizard/[projectId]/etapa-3/page.tsx
 * ETAPA 3 — Características Dimensionais e Compartimentos
 */

import React, { useState } from 'react';
import { useWizardStore } from '../../../../../lib/stores/wizard-store';
import { Ruler, Plus, Minus, CheckSquare, Square, AlertCircle, HelpCircle, Sparkles, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';
import { aiService } from '../../../../../lib/ai-service';
import { AiResult } from '../../../../../lib/ai-service/types';
import { AiBadge } from '../../../../../components/ui/ai-badge';

export const Step3Caracteristicas: React.FC = () => {
  const { data, setStepData, validationErrors } = useWizardStore();
  const step = data.step3 || {
    areaUnknown: false,
    area: 200,
    length: 20,
    width: 10,
    floors: 1,
    bedrooms: 3,
    bathrooms: 2,
    hasLivingRoom: true,
    hasKitchen: true,
    hasGarage: false,
    hasBalcony: false,
    hasAnnex: false,
  };

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AiResult | null>(null);

  const updateField = (field: keyof typeof step, val: any) => {
    setStepData('step3', { [field]: val });
  };

  const handleAnalyzeResponses = async () => {
    setIsAnalyzing(true);
    try {
      const res = await aiService.validateConsistency(data);
      setAiAnalysis(res);
    } catch (err) {
      console.warn('Erro ao analisar consistência:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAreaChange = (val: number) => {
    updateField('area', val);
    // Se o utilizador inserir área, calcula dimensões aproximadas proporcionais 2:1
    if (val > 0 && !step.length && !step.width) {
      const approxWidth = Math.round(Math.sqrt(val / 2) * 10) / 10;
      const approxLength = Math.round((val / approxWidth) * 10) / 10;
      setStepData('step3', { area: val, length: approxLength, width: approxWidth });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Dimensões e Divisões da Obra
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Indique a área aproximada e os compartimentos. Se não souber a área exata, ative o toggle "Não sei".
        </p>
      </div>

      {/* Bloco 1: Dimensões Geométricas */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Ruler className="w-4 h-4 text-amber-500" />
            Área e Dimensões
          </h3>

          {/* Toggle Não Sei */}
          <label className="flex items-center space-x-2 text-xs font-semibold text-slate-600 cursor-pointer select-none">
            <span>Não sei a área exata</span>
            <input
              type="checkbox"
              checked={step.areaUnknown}
              onChange={(e) => updateField('areaUnknown', e.target.checked)}
              className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
            />
          </label>
        </div>

        {!step.areaUnknown ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Área de Construção (m²) <span className="text-amber-600">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="10"
                  max="5000"
                  value={step.area || ''}
                  onChange={(e) => handleAreaChange(Number(e.target.value))}
                  placeholder="Ex: 200"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-3 text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  m²
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Comprimento (m)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="2"
                  max="200"
                  value={step.length || ''}
                  onChange={(e) => updateField('length', Number(e.target.value))}
                  placeholder="Ex: 20"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-3 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  m
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Largura (m)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="2"
                  max="200"
                  value={step.width || ''}
                  onChange={(e) => updateField('width', Number(e.target.value))}
                  placeholder="Ex: 10"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-3 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  m
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p>
              Sem a área exata, o motor estimará a metragem quadrada automaticamente com base na contagem de divisões (quartos, WC, sala e cozinha) definida abaixo.
            </p>
          </div>
        )}

        {validationErrors['step3.area'] && (
          <p className="text-xs text-rose-600 font-semibold flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {validationErrors['step3.area']}
          </p>
        )}
      </div>

      {/* Bloco 2: Steppers para Contagens */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
          Pisos e Divisões Principais
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Stepper Pisos */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase">Nº de Pisos (Andares)</span>
            <div className="flex items-center justify-between mt-3">
              <button
                type="button"
                onClick={() => updateField('floors', Math.max(1, (step.floors || 1) - 1))}
                className="w-10 h-10 rounded-lg bg-white border border-slate-300 flex items-center justify-center text-slate-700 hover:bg-slate-100 cursor-pointer shadow-2xs font-bold"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-xl font-black font-mono text-slate-900">{step.floors || 1}</span>
              <button
                type="button"
                onClick={() => updateField('floors', Math.min(6, (step.floors || 1) + 1))}
                className="w-10 h-10 rounded-lg bg-white border border-slate-300 flex items-center justify-center text-slate-700 hover:bg-slate-100 cursor-pointer shadow-2xs font-bold"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Stepper Quartos */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase">Quartos (Suítes)</span>
            <div className="flex items-center justify-between mt-3">
              <button
                type="button"
                onClick={() => updateField('bedrooms', Math.max(0, (step.bedrooms || 0) - 1))}
                className="w-10 h-10 rounded-lg bg-white border border-slate-300 flex items-center justify-center text-slate-700 hover:bg-slate-100 cursor-pointer shadow-2xs font-bold"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-xl font-black font-mono text-slate-900">{step.bedrooms ?? 3}</span>
              <button
                type="button"
                onClick={() => updateField('bedrooms', Math.min(10, (step.bedrooms || 0) + 1))}
                className="w-10 h-10 rounded-lg bg-white border border-slate-300 flex items-center justify-center text-slate-700 hover:bg-slate-100 cursor-pointer shadow-2xs font-bold"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Stepper WC */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase">Casas de Banho (WC)</span>
            <div className="flex items-center justify-between mt-3">
              <button
                type="button"
                onClick={() => updateField('bathrooms', Math.max(1, (step.bathrooms || 1) - 1))}
                className="w-10 h-10 rounded-lg bg-white border border-slate-300 flex items-center justify-center text-slate-700 hover:bg-slate-100 cursor-pointer shadow-2xs font-bold"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-xl font-black font-mono text-slate-900">{step.bathrooms || 2}</span>
              <button
                type="button"
                onClick={() => updateField('bathrooms', Math.min(8, (step.bathrooms || 1) + 1))}
                className="w-10 h-10 rounded-lg bg-white border border-slate-300 flex items-center justify-center text-slate-700 hover:bg-slate-100 cursor-pointer shadow-2xs font-bold"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bloco 3: Checkboxes de Compartimentos Especiais */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-3">
        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
          Compartimentos Incluídos
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { id: 'hasLivingRoom', label: 'Sala de Estar/Jantar' },
            { id: 'hasKitchen', label: 'Cozinha Equipada' },
            { id: 'hasGarage', label: 'Garagem Coberta' },
            { id: 'hasBalcony', label: 'Varanda / Alpendre' },
            { id: 'hasAnnex', label: 'Anexo de Serviço' },
          ].map((item) => {
            const isChecked = !!(step as any)[item.id];

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => updateField(item.id as any, !isChecked)}
                className={`p-3 rounded-xl border text-left transition-all flex items-center space-x-2.5 cursor-pointer ${
                  isChecked
                    ? 'border-amber-500 bg-amber-50/60 text-slate-900 font-bold'
                    : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:border-slate-300'
                }`}
              >
                {isChecked ? (
                  <CheckSquare className="w-4 h-4 text-amber-600 flex-shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 flex-shrink-0" />
                )}
                <span className="text-xs">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bloco 4: Assistente de Inteligência Artificial — Análise de Respostas */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-slate-900">Validação Inteligente de Respostas</h3>
                <AiBadge needsConfirmation={aiAnalysis?.needsConfirmation} />
              </div>
              <p className="text-xs text-slate-500">
                Audita consistência entre divisões, área útil e sistemas construtivos.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAnalyzeResponses}
            disabled={isAnalyzing}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer self-start sm:self-auto"
          >
            {isAnalyzing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>A analisar...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Analisar as minhas respostas</span>
              </>
            )}
          </button>
        </div>

        {/* Exibição dos Resultados da IA */}
        {aiAnalysis && (
          <div className="space-y-3 pt-2">
            <div className="p-4 rounded-xl border bg-white border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  Parecer Técnico
                </span>
                <AiBadge needsConfirmation={aiAnalysis.needsConfirmation} />
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">
                {aiAnalysis.text}
              </p>

              {/* Se necessitar de confirmação / aviso amarelo */}
              {aiAnalysis.needsConfirmation && (
                <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Necessita de confirmação:</span>
                    <span className="ml-1">Foram identificadas incompatibilidades habituais que devem ser revistas ou confirmadas antes de prosseguir.</span>
                  </div>
                </div>
              )}

              {/* Avisos como Sugestões (não bloqueiam) */}
              {aiAnalysis.warnings && aiAnalysis.warnings.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">
                    Avisos e Observações:
                  </span>
                  {aiAnalysis.warnings.map((warn, i) => (
                    <div key={i} className="text-xs text-rose-700 bg-rose-50/60 p-2.5 rounded-lg border border-rose-100 flex items-start gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
                      <span>{warn}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Sugestões Práticas */}
              {aiAnalysis.suggestions && aiAnalysis.suggestions.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Sugestões de Refinamento:
                  </span>
                  {aiAnalysis.suggestions.map((sug, i) => (
                    <div key={i} className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200 flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{sug}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Step3Caracteristicas;
