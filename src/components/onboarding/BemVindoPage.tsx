/**
 * @file src/components/onboarding/BemVindoPage.tsx
 * Página /bem-vindo:
 * - Apresentada após criar conta.
 * - Ilustração moderna de engenharia + 3 bullets descritivos de valor.
 * - Botão principal "Começar" (direciona para /bem-vindo/perfil).
 * - Link ghost "Saltar e explorar" (direciona diretamente para /painel).
 */

import React from 'react';
import {
  HardHat,
  Calculator,
  FileCheck2,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface BemVindoPageProps {
  userName: string;
  onStart: () => void;
  onSkip: () => void;
}

export const BemVindoPage: React.FC<BemVindoPageProps> = ({
  userName,
  onStart,
  onSkip,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8FAFC] via-white to-slate-50 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-2xl w-full bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-10 space-y-8 text-center relative overflow-hidden">
        {/* Glow de fundo */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Topo / Logo */}
        <div className="inline-flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-full shadow-xs">
          <HardHat className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-black tracking-tight text-[#0F3D5C]">
            Kizongelu &bull; Onboarding Oficial
          </span>
        </div>

        {/* Ilustração e Ícone Principal */}
        <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-[#0F3D5C] to-slate-800 text-white flex items-center justify-center shadow-xl shadow-slate-900/10">
          <Calculator className="w-12 h-12 text-amber-400" />
          <span className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs shadow-md">
            <Sparkles className="w-4 h-4" />
          </span>
        </div>

        {/* Mensagem de Boas-vindas */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Bem-vindo ao Kizongelu, {userName}!
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto leading-relaxed">
            A primeira plataforma em Angola que gera estimativas de custo determinísticas e mapas de quantidades alinhados com as boas práticas de engenharia civil.
          </p>
        </div>

        {/* 3 Bullets de Destaque */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-left pt-2">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 hover:border-amber-400 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Previsão em Kwanzas</h4>
            <p className="text-[11px] text-slate-500 leading-normal">
              Cálculo rigoroso de materiais e mão de obra sem estimativas arbitrárias.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 hover:border-amber-400 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Calibração Provincial</h4>
            <p className="text-[11px] text-slate-500 leading-normal">
              Preços de cimento, ferro e fretes calibrados para todas as 21 províncias.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 hover:border-amber-400 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Caderno com QR Code</h4>
            <p className="text-[11px] text-slate-500 leading-normal">
              Exportação em PDF e Excel com mapa de medições discriminado e verificação QR.
            </p>
          </div>
        </div>

        {/* Ações */}
        <div className="space-y-3 pt-2">
          <button
            onClick={onStart}
            className="w-full sm:w-auto min-w-[240px] px-8 py-3.5 bg-[#F59E0B] hover:bg-[#D97706] active:bg-[#B45309] text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-amber-500/25 inline-flex items-center justify-center space-x-2 transition-all active:scale-95 cursor-pointer"
          >
            <span>Começar</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>

          <div>
            <button
              onClick={onSkip}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors py-1 cursor-pointer"
            >
              Saltar e explorar o painel &rarr;
            </button>
          </div>
        </div>

        {/* Rodapé institucional */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-center space-x-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Boas Práticas de Engenharia Civil &bull; Angola</span>
        </div>
      </div>
    </div>
  );
};
