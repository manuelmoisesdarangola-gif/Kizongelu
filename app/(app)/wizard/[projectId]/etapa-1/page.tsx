/**
 * @file app/(app)/wizard/[projectId]/etapa-1/page.tsx
 * ETAPA 1 — Tipo de Obra (7 cartões com ícones)
 */

import React from 'react';
import { useWizardStore } from '../../../../../lib/stores/wizard-store';
import {
  Home,
  Layers,
  Sparkles,
  Wrench,
  Shield,
  Building,
  Car,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';

const PROJECT_TYPES = [
  {
    id: 'NOVA',
    title: 'Construção Nova',
    description: 'Moradia ou edifício construído de raiz no terreno.',
    icon: Home,
  },
  {
    id: 'AMPLIACAO',
    title: 'Ampliação',
    description: 'Acréscimo de piso, divisão, varanda ou área útil à estrutura existente.',
    icon: Layers,
  },
  {
    id: 'REMODELACAO',
    title: 'Remodelação',
    description: 'Substituição de acabamentos, pavimentos, pintura e instalações.',
    icon: Sparkles,
  },
  {
    id: 'REABILITACAO',
    title: 'Reabilitação',
    description: 'Recuperação e reforço estrutural de imóveis antigos ou degradados.',
    icon: Wrench,
  },
  {
    id: 'MURO',
    title: 'Muro de Vedação',
    description: 'Vedação perimetral de alvenaria ou blocos em redor do terreno.',
    icon: Shield,
  },
  {
    id: 'ANEXO',
    title: 'Anexo',
    description: 'Construção secundária independente — arrumos, suíte, cozinha exterior ou edícula.',
    icon: Building,
  },
  {
    id: 'GARAGEM',
    title: 'Garagem',
    description: 'Estrutura coberta para viaturas, isolada ou acoplada à moradia principal.',
    icon: Car,
  },
  {
    id: 'OUTRA',
    title: 'Outro tipo de obra',
    description: 'Obras de tipologia mista ou com características personalizadas.',
    icon: HelpCircle,
  },
];

export const Step1TipoObra: React.FC = () => {
  const { data, setStepData, validationErrors } = useWizardStore();
  const step1 = data.step1 || { type: '', workType: '', title: '' };
  const selectedType = step1.type || (step1 as any).workType;

  const handleSelectType = (type: any) => {
    setStepData('step1', { type, workType: type } as any);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStepData('step1', { title: e.target.value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Qual é o tipo de obra que pretende realizar?
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Seleccione a tipologia que melhor descreve a sua construção para adaptarmos o cálculo às suas necessidades.
        </p>
      </div>

      {/* Grid de 8 Cartões Selecionáveis (4x2 em Desktop, 2x4 em Tablet, 1 col em Mobile) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {PROJECT_TYPES.map((item) => {
          const isSelected = selectedType === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelectType(item.id)}
              className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? 'border-amber-500 bg-amber-50/50 shadow-sm ring-2 ring-amber-400/30'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isSelected ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                {isSelected && <CheckCircle2 className="w-5 h-5 text-amber-600" />}
              </div>

              <div className="mt-3">
                <h3 className="font-extrabold text-slate-900 text-sm">{item.title}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {(validationErrors['step1.type'] || validationErrors['type']) && (
        <p className="text-xs text-rose-600 font-semibold">{validationErrors['step1.type'] || validationErrors['type']}</p>
      )}

      {/* Campo Opcional: Título da Obra */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Identificação do Orçamento (Opcional)
        </label>
        <input
          type="text"
          value={step1.title || ''}
          onChange={handleTitleChange}
          placeholder="Ex: Moradia T3 no Talatona, Residência Familiar Benguela..."
          className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
        />
        {validationErrors['step1.title'] && (
          <p className="text-xs text-rose-600 font-semibold mt-1.5">{validationErrors['step1.title']}</p>
        )}
        <p className="text-[11px] text-slate-500 mt-1">
          Facilita a identificação no seu histórico e nos relatórios exportados.
        </p>
      </div>
    </div>
  );
};

export default Step1TipoObra;
