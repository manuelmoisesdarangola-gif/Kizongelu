/**
 * @file src/components/onboarding/BemVindoComecarPage.tsx
 * Página /bem-vindo/comecar (Particulares):
 * - Pré-visualização das 7 etapas guiadas.
 * - Botão de ação "Começar agora" (inicia novo projeto no Wizard).
 */

import React from 'react';
import {
  Layers,
  MapPin,
  Maximize2,
  Hammer,
  Paintbrush,
  Receipt,
  FileCheck2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface BemVindoComecarPageProps {
  onStartBudget: () => void;
  onBack: () => void;
}

export const BemVindoComecarPage: React.FC<BemVindoComecarPageProps> = ({
  onStartBudget,
  onBack,
}) => {
  const steps = [
    {
      num: 1,
      title: 'Tipo de Obra',
      desc: 'Construção nova de raiz, reabilitação ou ampliação de moradia.',
      icon: Layers,
    },
    {
      num: 2,
      title: 'Localização em Angola',
      desc: 'Província e município para calibrar frete e mão de obra local.',
      icon: MapPin,
    },
    {
      num: 3,
      title: 'Dimensões & Compartimentos',
      desc: 'Área bruta, pisos, quartos, suites, casas de banho e anexos.',
      icon: Maximize2,
    },
    {
      num: 4,
      title: 'Estrutura & Alvenarias',
      desc: 'Tipo de fundação, betão armado, blocos e cobertura.',
      icon: Hammer,
    },
    {
      num: 5,
      title: 'Acabamentos & Instalações',
      desc: 'Cerâmicos, tintas, redes elétricas e águas residuais.',
      icon: Paintbrush,
    },
    {
      num: 6,
      title: 'Cálculo Determinístico de Engenharia',
      desc: 'O motor calcula materiais (sacos de cimento, varões) e operários.',
      icon: Receipt,
    },
    {
      num: 7,
      title: 'Caderno Técnico & QR Code',
      desc: 'Mapa de quantidades e PDF profissional pronto para exportação.',
      icon: FileCheck2,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8FAFC] via-white to-slate-50 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-3xl w-full bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-10 space-y-8">
        {/* Topo */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
              Passo 3 de 3 &bull; O Seu Primeiro Orçamento
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Como funciona o cálculo em 7 etapas
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Processo intuitivo e rigoroso, sem necessidade de conhecimentos prévios de engenharia.
            </p>
          </div>

          <button
            onClick={onBack}
            className="self-start sm:self-center px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold border border-slate-200 flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar</span>
          </button>
        </div>

        {/* Linha Cronológica das 7 Etapas */}
        <div className="space-y-3">
          {steps.map((st) => {
            const Icon = st.icon;
            return (
              <div
                key={st.num}
                className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex items-start space-x-3.5 hover:bg-white hover:border-amber-400 hover:shadow-xs transition-all"
              >
                <div className="w-8 h-8 rounded-xl bg-[#0F3D5C] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                  {st.num}
                </div>
                <div className="flex-1 space-y-0.5">
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Icon className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>{st.title}</span>
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {st.desc}
                  </p>
                </div>
                <div className="hidden sm:block text-[11px] font-bold text-slate-400">
                  {st.num <= 3 ? 'Gratuito' : 'Capítulos'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Botão de Ação */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Pode guardar o rascunho e continuar a qualquer hora.</span>
          </div>

          <button
            onClick={onStartBudget}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#F59E0B] hover:bg-[#D97706] active:bg-[#B45309] text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-amber-500/25 flex items-center justify-center space-x-2 transition-all active:scale-95 cursor-pointer"
          >
            <span>Começar agora</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
};
