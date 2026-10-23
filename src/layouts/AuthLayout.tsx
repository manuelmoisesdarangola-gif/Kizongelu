/**
 * @file src/layouts/AuthLayout.tsx
 * LAYOUT 2 — AUTENTICAÇÃO
 * 
 * Rotas: /entrar, /criar-conta, /recuperar, /redefinir/:token, /confirmar-email/:token
 * 
 * DESKTOP:
 * - Ecrã dividido 40/60.
 * - Painel esquerdo (40%): fundo azul #0F3D5C com gradiente suave, logo grande,
 *   slogan "Saiba quanto precisa para construir.", ilustração técnica minimalista,
 *   3 trust bullets em baixo:
 *     ✓ Sem subscrição para particulares
 *     ✓ Pacotes desde 12.999 Kz
 *     ✓ Dados seguros em Angola
 * - Painel direito (60%): formulário centrado, largura 420px, título grande,
 *   campos com labels visíveis, CTA laranja full-width.
 * 
 * MOBILE:
 * - Sem split. Formulário full-screen com logo no topo.
 * - Padding generoso (24px), campos 56px altura.
 * 
 * Sem header global, sem sidebar, sem bottom nav.
 */

import React from 'react';
import { HardHat, Check, ShieldCheck, ArrowLeft } from 'lucide-react';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  onNavigateHome?: () => void;
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  subtitle,
  onNavigateHome,
  children,
}) => {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-['Inter',sans-serif] flex flex-col lg:grid lg:grid-cols-12 selection:bg-amber-400 selection:text-slate-900">
      {/* ========================================================================= */}
      {/* 1. PAINEL ESQUERDO (40% EM DESKTOP >= 1024px)                             */}
      {/* ========================================================================= */}
      <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-[#0F3D5C] via-[#0D354F] to-[#0A293E] text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Blueprint Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        {/* Topo: Logo Grande */}
        <div className="relative z-10">
          {onNavigateHome && (
            <button
              onClick={onNavigateHome}
              className="inline-flex items-center space-x-1.5 text-xs text-slate-300 hover:text-white mb-8 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao site público</span>
            </button>
          )}

          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20">
              <HardHat className="w-7 h-7" />
            </div>
            <div>
              <span className="font-black text-2xl tracking-tight text-white block leading-none">
                Kizongelu
              </span>
              <span className="text-xs text-amber-200/80 font-medium tracking-wide">
                Orçamentos de construção civil para Angola
              </span>
            </div>
          </div>
        </div>

        {/* Centro: Slogan e Ilustração Técnica Minimalista */}
        <div className="relative z-10 my-8 space-y-6">
          <h2 className="text-3xl xl:text-4xl font-black text-white tracking-tight leading-tight">
            Saiba quanto precisa para construir.
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed max-w-md">
            Calcule quantidades determinísticas de cimento, varão de aço, blocos e mão de obra com os preços actualizados das 21 províncias de Angola.
          </p>

          {/* Ilustração Técnica Blueprint Minimalista */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-amber-300/90 uppercase tracking-wider block">
              Exemplos de parâmetros do motor de cálculo
            </span>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs font-mono text-[11px] text-amber-300/90 space-y-1.5">
              <div className="flex justify-between border-b border-white/10 pb-1 text-slate-400">
                <span>Item Construtivo</span>
                <span>Rendimento Padrão</span>
              </div>
              <div className="flex justify-between text-white">
                <span>Betão C25/30</span>
                <span className="text-amber-400">350 kg Cimento / m³</span>
              </div>
              <div className="flex justify-between text-white">
                <span>Alvenaria de Bloco 15</span>
                <span className="text-amber-400">12,5 un / m²</span>
              </div>
              <div className="flex justify-between text-white">
                <span>Armadura de Aço A400</span>
                <span className="text-amber-400">Taxa 95 kg / m³</span>
              </div>
            </div>
          </div>
        </div>

        {/* Fundo: 3 Trust Bullets */}
        <div className="relative z-10 pt-6 border-t border-white/10 space-y-3">
          <div className="flex items-center space-x-2.5 text-xs text-slate-200">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
            <span className="font-medium">Sem subscrição para particulares</span>
          </div>

          <div className="flex items-center space-x-2.5 text-xs text-slate-200">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
            <span className="font-medium">Pacotes desde 12.999 Kz</span>
          </div>

          <div className="flex items-center space-x-2.5 text-xs text-slate-200">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
            <span className="font-medium">Dados seguros em Angola</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. PAINEL DIREITO (60% EM DESKTOP, FULL-SCREEN EM MOBILE COM PADDING 24px) */}
      {/* ========================================================================= */}
      <div className="flex-1 lg:col-span-7 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-12">
        {/* Mobile Header com Logo (visível apenas < 1024px) */}
        <div className="lg:hidden w-full max-w-[420px] mb-8 text-center flex flex-col items-center">
          {onNavigateHome && (
            <button
              onClick={onNavigateHome}
              className="self-start inline-flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-900 mb-6"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Início</span>
            </button>
          )}

          <div className="w-12 h-12 rounded-2xl bg-[#0F3D5C] text-white flex items-center justify-center font-black shadow-md mb-3">
            <HardHat className="w-7 h-7 text-[#F59E0B]" />
          </div>
          <span className="font-black text-xl tracking-tight text-[#0F3D5C]">
            Kizongelu
          </span>
          <span className="text-xs text-slate-500">
            Saiba quanto precisa para construir.
          </span>
        </div>

        {/* Formulário Centrado com Largura Exata de 420px */}
        <div className="w-full max-w-[420px] space-y-6">
          <div className="space-y-1.5 text-left">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-slate-500">
                {subtitle}
              </p>
            )}
          </div>

          {/* Conteúdo Injetado (Campos com labels visíveis e CTA laranja full-width) */}
          <div className="pt-2">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
