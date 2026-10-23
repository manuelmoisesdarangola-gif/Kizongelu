/**
 * @file app/(app)/wizard/[projectId]/etapa-5/page.tsx
 * ETAPA 5 — Instalações e Acabamentos Detalhados (Chips Selecionáveis)
 */

import React from 'react';
import { useWizardStore } from '../../../../../lib/stores/wizard-store';
import { Zap, Droplets, Grid, Paintbrush, DoorOpen } from 'lucide-react';

export const Step5Instalacoes: React.FC = () => {
  const { data, setStepData } = useWizardStore();
  const step = data.step5;

  const updateField = (field: keyof typeof step, val: any) => {
    setStepData('step5', { [field]: val });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Instalações Técnicas e Detalhes de Acabamento
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Ajuste as redes prediais e os tipos de materiais que pretende para revestimentos e vãos.
        </p>
      </div>

      {/* Categoria 1: Rede Elétrica */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-amber-500" />
          Rede Elétrica e Telecomunicações
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'basica', label: 'Básica (8m cabo/m²)', desc: 'Pontos essenciais de luz, interruptores e tomadas simples.' },
            { id: 'intermedia', label: 'Intermédia (12m cabo/m²)', desc: 'Tomadas reforçadas para eletrodomésticos, TV e iluminação LED.' },
            { id: 'completa', label: 'Completa (18m cabo/m²)', desc: 'Circuitos dedicados para AC, gerador/UPS, domótica e quadro geral amplo.' },
          ].map((item) => {
            const isSelected = step.electrical === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => updateField('electrical', item.id)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50/60 font-bold text-slate-950 shadow-2xs'
                    : 'border-slate-200 bg-slate-50/40 text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="text-xs font-extrabold">{item.label}</span>
                <span className="text-[11px] text-slate-500 mt-1 font-normal">{item.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Categoria 2: Canalização e Águas */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Droplets className="w-4 h-4 text-blue-500" />
          Rede Hidráulica e Sanitária
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'basica', label: 'Básica (PVC / Colagem)', desc: 'Rede simples de água fria e esgoto direto.' },
            { id: 'intermedia', label: 'Intermédia (PPR / Termofusão)', desc: 'Água fria e quente com tubagem PPR soldada a quente.' },
            { id: 'completa', label: 'Completa (Multicamada + Bomba)', desc: 'Pressurização, retorno de água quente e eletrobomba.' },
          ].map((item) => {
            const isSelected = step.plumbing === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => updateField('plumbing', item.id)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/60 font-bold text-slate-950 shadow-2xs'
                    : 'border-slate-200 bg-slate-50/40 text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="text-xs font-extrabold">{item.label}</span>
                <span className="text-[11px] text-slate-500 mt-1 font-normal">{item.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Categoria 3: Pavimentos (Chips) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Grid className="w-4 h-4 text-amber-500" />
          Revestimento de Pavimentos
        </label>
        <div className="flex flex-wrap gap-2.5">
          {[
            { id: 'ceramica_economica', label: 'Cerâmica 40x40 Standard' },
            { id: 'ceramica_padrao', label: 'Cerâmica Retificada 60x60' },
            { id: 'porcelanato_polido', label: 'Porcelanato Polido 60x120' },
            { id: 'betonilha_afagada', label: 'Betonilha Afagada / Microcimento' },
          ].map((chip) => {
            const isSelected = step.flooring === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => updateField('flooring', chip.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Categoria 4: Paredes e Pinturas (Chips) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Paintbrush className="w-4 h-4 text-amber-500" />
          Pintura e Revestimento de Paredes
        </label>
        <div className="flex flex-wrap gap-2.5">
          {[
            { id: 'tinta_plastica', label: 'Tinta Plástica Base Água' },
            { id: 'tinta_acrilica', label: 'Tinta Acrílica Lavável Acetinada' },
            { id: 'revestimento_misto', label: 'Tinta Acrílica + Cerâmica em Zonas Húmidas' },
          ].map((chip) => {
            const isSelected = step.walls === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => updateField('walls', chip.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Categoria 5: Portas e Janelas (Chips) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <DoorOpen className="w-4 h-4 text-amber-500" />
          Caixilharia, Portas e Janelas
        </label>
        <div className="flex flex-wrap gap-2.5">
          {[
            { id: 'aluminio_standard', label: 'Alumínio Standard com Vidro Simples' },
            { id: 'aluminio_termico', label: 'Alumínio Lacado com Vidro Duplo' },
            { id: 'madeira_macica', label: 'Portas em Madeira Maciça' },
          ].map((chip) => {
            const isSelected = step.joinery === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => updateField('joinery', chip.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Step5Instalacoes;
