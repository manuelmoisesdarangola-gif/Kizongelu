/**
 * @file app/(app)/wizard/[projectId]/etapa-4/page.tsx
 * ETAPA 4 — Opções Construtivas e Nível de Acabamento
 */

import React from 'react';
import { useWizardStore } from '../../../../../lib/stores/wizard-store';
import { Layers, ShieldAlert, Sparkles, Gem, BadgeDollarSign, Check } from 'lucide-react';

export const Step4Construtivas: React.FC = () => {
  const { data, setStepData } = useWizardStore();
  const step = data.step4;

  const updateField = (field: keyof typeof step, val: any) => {
    setStepData('step4', { [field]: val });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Sistemas Construtivos e Nível de Acabamento
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Defina as soluções de fundação, estrutura, cobertura e padrão dos materiais.
        </p>
      </div>

      {/* Bloco 1: Fundação */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-3">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Tipo de Fundação
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { id: 'sapata_corrida', title: 'Sapata Corrida', desc: 'Valas contínuas com betão ciclópico / armado. Mais comum.' },
            { id: 'sapata_isolada', title: 'Sapatas Isoladas', desc: 'Plintos pontuais sob cada pilar interligados por vigas de travamento.' },
            { id: 'laje', title: 'Laje Geral (Radier)', desc: 'Laje espessa contínua em todo o perímetro do solo.' },
            { id: 'nao_sei', title: 'Não sei indicar', desc: 'O motor assume sapata corrida e reduz o score de confiança.' },
          ].map((item) => {
            const isSelected = step.foundation === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => updateField('foundation', item.id)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50/50 shadow-2xs ring-2 ring-amber-400/30'
                    : 'border-slate-200 bg-slate-50/30 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-slate-900">{item.title}</span>
                  {isSelected && <Check className="w-4 h-4 text-amber-600" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{item.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bloco 2: Estrutura */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-3">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Sistema Estrutural
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'betao_armado', title: 'Betão Armado Convencional', desc: 'Pilares, vigas e lintéis em betão com armadura de aço.' },
            { id: 'alvenaria_estrutural', title: 'Alvenaria Estrutural', desc: 'Paredes autoportantes com blocos de cimento armados internamente.' },
            { id: 'nao_sei', title: 'Não sei indicar', desc: 'Assume betão armado com alerta de confiança média.' },
          ].map((item) => {
            const isSelected = step.structure === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => updateField('structure', item.id)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50/50 shadow-2xs ring-2 ring-amber-400/30'
                    : 'border-slate-200 bg-slate-50/30 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-slate-900">{item.title}</span>
                  {isSelected && <Check className="w-4 h-4 text-amber-600" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{item.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bloco 3: Cobertura */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-3">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Tipo de Cobertura
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {[
            { id: 'chapa', title: 'Chapa Zincada / IBR', desc: 'Estrutura leve em madeira ou perfil metálico. Custo económico.' },
            { id: 'telha', title: 'Telha Cerâmica / Betão', desc: 'Maior isolamento térmico e estética clássica.' },
            { id: 'laje', title: 'Laje Plana Maciça', desc: 'Permite aproveitamento de terraço acessível.' },
            { id: 'nao_sei', title: 'Não sei indicar', desc: 'Assume cobertura em chapa IBR.' },
          ].map((item) => {
            const isSelected = step.roof === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => updateField('roof', item.id)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50/50 shadow-2xs ring-2 ring-amber-400/30'
                    : 'border-slate-200 bg-slate-50/30 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-slate-900">{item.title}</span>
                  {isSelected && <Check className="w-4 h-4 text-amber-600" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{item.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bloco 4: Nível de Acabamento (3 Cartões Grandes) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Padrão de Acabamento
          </label>
          <p className="text-xs text-slate-500 mt-0.5">
            Determina a qualidade e faixa de preço de cerâmicas, louças sanitárias, tintas e caixilharia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              id: 'economico',
              title: 'Padrão Económico',
              priceTag: 'Mais Acessível',
              icon: BadgeDollarSign,
              features: [
                'Cerâmica standard 40x40 nacional',
                'Tinta plástica base aquosa',
                'Louças sanitárias essenciais',
                'Janelas de alumínio simples',
              ],
            },
            {
              id: 'medio',
              title: 'Padrão Médio',
              priceTag: 'Mais Popular',
              icon: Sparkles,
              features: [
                'Cerâmica retificada 60x60',
                'Tinta acrílica lavável acetinada',
                'Louças e torneiras mono-comando',
                'Janelas em alumínio com vidro duplo',
              ],
            },
            {
              id: 'alto',
              title: 'Padrão Alto / Luxo',
              priceTag: 'Premium',
              icon: Gem,
              features: [
                'Porcelanato polido 60x120 ou 80x80',
                'Tetos falsos em pladur com sancas de luz',
                'Sanitários suspensos e canalização multicamada',
                'Caixilharia termo-acústica e portas em madeira nobre',
              ],
            },
          ].map((card) => {
            const isSelected = step.finishLevel === card.id;
            const Icon = card.icon;

            return (
              <button
                key={card.id}
                type="button"
                onClick={() => updateField('finishLevel', card.id)}
                className={`p-5 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50/40 shadow-sm ring-2 ring-amber-400/40'
                    : 'border-slate-200 bg-slate-50/30 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isSelected ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        card.id === 'medio'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {card.priceTag}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-sm text-slate-900 mt-3">{card.title}</h4>

                  <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
                    {card.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Step4Construtivas;
