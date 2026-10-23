/**
 * @file app/(app)/wizard/[projectId]/etapa-6/page.tsx
 * ETAPA 6 — Orçamento Disponível (Expectativa de Custo)
 */

import React from 'react';
import { useWizardStore } from '../../../../../lib/stores/wizard-store';
import { Coins, Info, Check, HelpCircle } from 'lucide-react';

const BUDGET_OPTIONS = [
  { id: 'ATE_5M', label: 'Até 5.000.000 Kz', desc: 'Obras de pequeno porte, remodelações ligeiras ou anexos.' },
  { id: '5M_10M', label: '5.000.000 Kz a 10.000.000 Kz', desc: 'Moradias compactas T1/T2 ou ampliações parciais.' },
  { id: '10M_20M', label: '10.000.000 Kz a 20.000.000 Kz', desc: 'Moradias T2/T3 familiares padrão económico/médio.' },
  { id: '20M_40M', label: '20.000.000 Kz a 40.000.000 Kz', desc: 'Moradias T3/T4 amplas com acabamentos de qualidade.' },
  { id: '40M_80M', label: '40.000.000 Kz a 80.000.000 Kz', desc: 'Residências de alto padrão, pisos múltiplos e garagens.' },
  { id: 'MAIS_80M', label: 'Mais de 80.000.000 Kz', desc: 'Construções de luxo ou edifícios multifamiliares/comerciais.' },
  { id: 'NAO_SEI', label: 'Ainda não sei / Sem limite definido', desc: 'Pretendo calcular o custo real antes de fixar o orçamento.' },
];

export const Step6Orcamento: React.FC = () => {
  const { data, setStepData } = useWizardStore();
  const selectedBudget = data.step6.targetBudget;

  const handleSelect = (id: string) => {
    setStepData('step6', { targetBudget: id });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Qual é a sua expectativa de orçamento disponível?
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Ajuda-nos a verificar se a obra projetada é compatível com o seu planeamento financeiro.
        </p>
      </div>

      {/* Alerta de Transparência */}
      <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 text-blue-900 text-xs flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-extrabold block text-blue-950 mb-0.5">
            Nota de Independência Técnica:
          </span>
          <p className="leading-relaxed text-blue-800">
            Este valor <strong>não influencia o cálculo técnico</strong> das quantidades nem dos materiais. O mapa de quantidades é 100% determinístico e baseado em normas de engenharia.
          </p>
        </div>
      </div>

      {/* 6 Radio Cards + Ainda não sei */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {BUDGET_OPTIONS.map((opt) => {
          const isSelected = selectedBudget === opt.id;

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleSelect(opt.id)}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-amber-500 bg-amber-50/50 shadow-xs ring-2 ring-amber-400/30'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-slate-900">{opt.label}</span>
                {isSelected ? (
                  <Check className="w-4 h-4 text-amber-600 stroke-[3]" />
                ) : (
                  <Coins className="w-4 h-4 text-slate-300" />
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{opt.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Step6Orcamento;
