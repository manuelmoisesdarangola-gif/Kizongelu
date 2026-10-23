/**
 * @file src/components/layout/Footer.tsx
 * Rodapé Institucional Oficial Unificado do Kizongelu (5 Colunas).
 * Cobre Produto, Empresa, Legal, Suporte e Contacto + Bloco das 21 Províncias.
 */

import React, { useState } from 'react';
import { ShieldCheck, MapPin, Mail } from 'lucide-react';
import { ALL_21_PROVINCE_FACTORS } from '@/lib/data/province-factors';

export interface FooterProps {
  onNavigate?: (path: string) => void;
  onStartWizard?: () => void;
  onOpenVerification?: () => void;
}

export function Footer({ onNavigate, onStartWizard, onOpenVerification }: FooterProps) {
  const [showAllFooterProvinces, setShowAllFooterProvinces] = useState(false);

  const handleNav = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  };

  return (
    <footer className="bg-[#0F3D5C] text-slate-300 py-12 text-xs border-t border-[#0A293E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8">
          {/* Coluna 1: Produto */}
          <div className="space-y-3 lg:col-span-2">
            <span className="font-bold text-white text-xs uppercase tracking-wider block">
              Produto
            </span>
            <ul className="space-y-2">
              <li>
                <a href="#como-funciona" onClick={(e) => { e.preventDefault(); handleNav('/como-funciona'); }} className="hover:text-white transition-colors cursor-pointer">
                  Como funciona
                </a>
              </li>
              <li>
                <a href="#planos" onClick={(e) => { e.preventDefault(); handleNav('/precos'); }} className="hover:text-white transition-colors cursor-pointer">
                  Preços & Planos
                </a>
              </li>
              <li>
                <a href="#ferramentas" onClick={(e) => { e.preventDefault(); handleNav('/ferramentas'); }} className="hover:text-white transition-colors cursor-pointer">
                  Ferramentas
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenVerification) {
                      onOpenVerification();
                    } else {
                      handleNav('/verificar');
                    }
                  }}
                  className="hover:text-white transition-colors cursor-pointer text-left text-amber-400 font-semibold"
                >
                  Validador QR
                </button>
              </li>
            </ul>
          </div>

          {/* Coluna 2: Empresa */}
          <div className="space-y-3 lg:col-span-2">
            <span className="font-bold text-white text-xs uppercase tracking-wider block">
              Empresa
            </span>
            <ul className="space-y-2">
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('/sobre')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Sobre
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('/carreiras')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Carreiras
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('/parceiros')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Parceiros
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('/blog')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Blog
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('/contactos')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Contactos
                </button>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Legal (Largura aumentada) */}
          <div className="space-y-3 lg:col-span-3">
            <span className="font-bold text-white text-xs uppercase tracking-wider block">
              Legal
            </span>
            <ul className="space-y-2">
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('/termos')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Termos
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('/privacidade')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Privacidade (Lei 22/11)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('/cookies')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Cookies
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('/aviso-tecnico')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Aviso Técnico
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('/reembolsos')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Reembolsos
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('/utilizacao-aceitavel')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Utilização Aceitável
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('/conformidade')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Conformidade Lei 22/11
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('/ia')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Política IA
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('/seguranca')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Segurança
                </button>
              </li>
            </ul>
          </div>

          {/* Coluna 4: Suporte + Confiança Técnica */}
          <div className="space-y-3 lg:col-span-3">
            <span className="font-bold text-white text-xs uppercase tracking-wider block">
              Suporte
            </span>
            <ul className="space-y-2">
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('/estado')}
                  className="hover:text-white transition-colors cursor-pointer flex items-center space-x-1.5 text-left"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Estado dos Serviços (últimos 30 dias)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('/ajuda')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Centro de Ajuda
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenVerification) {
                      onOpenVerification();
                    } else {
                      handleNav('/verificar');
                    }
                  }}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Validação QR
                </button>
              </li>
            </ul>

            {/* Bloco Base Técnica consolidado em Suporte (com textos concisos em 1 linha) */}
            <div className="pt-3 border-t border-slate-700/60 space-y-1.5">
              <div className="flex items-center space-x-1.5 text-emerald-400">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span className="font-semibold text-[11px]">Base Técnica Rigorosa</span>
              </div>
              <p className="text-[10px] text-slate-300">
                Calibrado para 21 províncias
              </p>
              <div className="text-[10px] text-slate-300">
                Metodologia de engenharia civil
              </div>
            </div>
          </div>

          {/* Coluna 5: Contacto (apenas Talatona e email em linha única) */}
          <div className="space-y-3 lg:col-span-2">
            <span className="font-bold text-white text-xs uppercase tracking-wider block">
              Contacto
            </span>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="whitespace-nowrap">Talatona, Luanda &bull; Angola</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a
                  href="mailto:suporte@kizongelu.ao"
                  className="hover:text-white transition-colors truncate"
                >
                  suporte@kizongelu.ao
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Chips das 21 Províncias de Angola com toggle responsivo para mobile */}
        <div className="pt-8 border-t border-slate-700/60">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-white text-xs uppercase tracking-wider">
              Preços e Obras nas 21 Províncias de Angola:
            </span>
            <button
              type="button"
              onClick={() => setShowAllFooterProvinces(!showAllFooterProvinces)}
              className="text-amber-400 hover:text-amber-300 text-xs font-semibold cursor-pointer sm:hidden"
            >
              {showAllFooterProvinces ? 'Ver menos ↑' : 'Ver todas (21) →'}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {(showAllFooterProvinces ? ALL_21_PROVINCE_FACTORS : ALL_21_PROVINCE_FACTORS.slice(0, 8)).map((prov) => {
              const slug = prov.province.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-');
              return (
                <button
                  key={prov.province}
                  type="button"
                  onClick={() => {
                    handleNav(`/obras-em/${slug}`);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-900/60 hover:bg-[#F59E0B] hover:text-slate-950 text-slate-200 text-[11px] font-medium transition-all cursor-pointer border border-slate-700/60"
                >
                  Obras em {prov.province}
                </button>
              );
            })}

            {!showAllFooterProvinces && (
              <button
                type="button"
                onClick={() => setShowAllFooterProvinces(true)}
                className="px-3 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-[11px] font-bold transition-all cursor-pointer border border-amber-500/30 hidden sm:inline-flex items-center gap-1"
              >
                <span>Ver todas as 21 províncias →</span>
              </button>
            )}

            {showAllFooterProvinces && (
              <button
                type="button"
                onClick={() => setShowAllFooterProvinces(false)}
                className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-[11px] font-medium transition-all cursor-pointer border border-slate-700 hidden sm:inline-flex items-center gap-1"
              >
                <span>Ver menos ↑</span>
              </button>
            )}
          </div>
        </div>

        {/* Barra Final: Copyright + Feito em Angola */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-300 border-t border-slate-700/60">
          <span>&copy; {new Date().getFullYear()} Kizongelu. Todos os direitos reservados. República de Angola.</span>
          <div className="flex items-center space-x-2 font-medium text-slate-200">
            <span>Feito em Angola</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
