/**
 * @file src/layouts/PublicLayout.tsx
 * LAYOUT 1 — PÚBLICO (marketing, sem autenticação)
 * 
 * Rotas: /, /como-funciona, /precos, /blog, /blog/:slug, /sobre,
 * /contactos, /termos, /privacidade, /cookies, /aviso-tecnico,
 * /ferramentas, /ferramentas/:slug, /verificar/:token
 * 
 * DESKTOP (>= 1024px):
 * - Header sticky, fundo branco translúcido (backdrop blur), altura 72px, border-bottom 1px #E2E8F0.
 *   - Esquerda: logo Kizongelu (ícone + wordmark em #0F3D5C).
 *   - Centro: navegação horizontal com 5 itens (Como funciona · Preços · Blog · FAQ · Contactos).
 *   - Direita: botão ghost "Entrar" + botão laranja "Começar orçamento".
 * - Sem sidebar.
 * - Footer completo em 4 colunas (Produto · Empresa · Legal · Contactos) + barra final com copyright + "Feito em Angola 🇦🇴".
 * 
 * MOBILE (< 1024px):
 * - Header sticky, altura 56px.
 *   - Esquerda: logo compacto.
 *   - Direita: botão "Entrar" + ícone hamburger.
 * - Menu mobile: drawer lateral da direita com navegação + botões CTA.
 * - Barra CTA fixa no fundo (aparece após scroll de 25%):
 *   - Botão full-width "Começar o meu orçamento" (56px, laranja).
 */

import React, { useState, useEffect } from 'react';
import {
  HardHat,
  Menu,
  X,
  ArrowRight,
  ShieldCheck,
  QrCode,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  ChevronRight,
  Building2,
  Cookie,
} from 'lucide-react';
import { hasAnalyticsConsent, grantAnalyticsConsent, revokeAnalyticsConsent, initGA4, trackEvent } from '@/lib/analytics/tracker';
import { LISTA_8_PROVINCIAS } from '@/lib/data/provincias';
import { ALL_21_PROVINCE_FACTORS } from '@/lib/data/province-factors';
import { CookiePreferencesModal } from '@/src/components/legal/CookiePreferencesModal';
import { Footer } from '@/src/components/layout/Footer';
import { logConsentDecision } from '@/lib/actions/consent';

export type PublicRoute =
  | '/'
  | '/como-funciona'
  | '/precos'
  | '/blog'
  | '/sobre'
  | '/contactos'
  | '/termos'
  | '/privacidade'
  | '/cookies'
  | '/aviso-tecnico'
  | '/ferramentas'
  | '/verificar';

interface PublicLayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onStartWizard: () => void;
  onLogin: () => void;
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({
  currentPath,
  onNavigate,
  onStartWizard,
  onLogin,
  children,
}) => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [showBottomCta, setShowBottomCta] = useState(false);
  const [cookieConsentOpen, setCookieConsentOpen] = useState(false);
  const [preferencesModalOpen, setPreferencesModalOpen] = useState(false);

  // Inicialização do Google Analytics 4 com consentimento prévio
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('kizongelu_ga_consent_accepted');
      if (stored === null) {
        setCookieConsentOpen(true);
      } else if (stored === 'true') {
        initGA4();
      }
    }
  }, []);

  const handleAcceptCookies = async () => {
    await logConsentDecision({
      essential: true,
      analytics: true,
      functional: true,
      marketing: true,
    });
    grantAnalyticsConsent();
    setCookieConsentOpen(false);
  };

  const handleDeclineCookies = async () => {
    await logConsentDecision({
      essential: true,
      analytics: false,
      functional: false,
      marketing: false,
    });
    revokeAnalyticsConsent();
    setCookieConsentOpen(false);
  };

  // Monitoriza scroll para exibir a barra CTA fixa no fundo em mobile (>25% de scroll)
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0 && scrollY / docHeight > 0.2) {
        setShowBottomCta(true);
      } else {
        setShowBottomCta(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Como funciona', path: '/como-funciona' },
    { label: 'Preços', path: '/precos' },
    { label: 'Blog', path: '/blog' },
    { label: 'FAQ', path: '/faq' },
    { label: 'Contactos', path: '/contactos' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-['Inter',sans-serif] flex flex-col selection:bg-amber-400 selection:text-slate-900">
      {/* ========================================================================= */}
      {/* 1. HEADER (DESKTOP >= 1024px: 72px; MOBILE < 1024px: 56px)                 */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* DESKTOP (>= 1024px, 72px) */}
          <div className="hidden lg:flex items-center justify-between h-[72px]">
            {/* Esquerda: Logo Kizongelu */}
            <button
              onClick={() => onNavigate('/')}
              className="flex items-center space-x-3 text-left cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#0F3D5C] text-white flex items-center justify-center shadow-md shadow-[#0F3D5C]/20 border border-[#0A293E] group-hover:bg-[#0A293E] transition-colors">
                <HardHat className="w-6 h-6 text-[#F59E0B]" />
              </div>
              <div>
                <span className="font-black text-xl tracking-tight text-[#0F3D5C] block leading-tight">
                  Kizongelu
                </span>
                <span className="text-sm font-medium text-slate-600 block">
                  Orçamentos de construção civil para Angola
                </span>
              </div>
            </button>

            {/* Centro: Navegação horizontal com 5 itens e Validar QR */}
            <nav className="flex items-center gap-7 text-sm font-semibold text-slate-600">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => onNavigate(item.path)}
                  className={`hover:text-[#0F3D5C] transition-colors cursor-pointer py-1 ${
                    currentPath === item.path
                      ? 'text-[#0F3D5C] border-b-2 border-[#F59E0B]'
                      : 'hover:text-[#0F3D5C]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => onNavigate('/verificar')}
                className="text-slate-600 hover:text-[#0F3D5C] flex items-center space-x-1.5 transition-colors cursor-pointer py-1"
                title="Validar autenticidade por QR Code"
              >
                <QrCode className="w-4 h-4 text-[#0F3D5C]" />
                <span>Validar QR</span>
              </button>
            </nav>

            {/* Direita: Separador vertical discreto + Botão ghost "Entrar" + Botão laranja "Começar orçamento" */}
            <div className="flex items-center space-x-3">
              <div className="h-6 w-px bg-slate-200 mx-2" />

              <button
                onClick={onLogin}
                className="px-4 py-2 text-sm font-semibold text-[#0F3D5C] border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Entrar
              </button>

              <button
                onClick={onStartWizard}
                className="min-h-[44px] px-5 py-2.5 bg-[#F59E0B] hover:bg-[#D97706] active:bg-[#B45309] text-slate-950 font-black text-sm rounded-xl shadow-md shadow-amber-500/20 active:scale-95 flex items-center space-x-2 transition-all cursor-pointer"
              >
                <span>Começar orçamento</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5] text-slate-950" />
              </button>
            </div>
          </div>

          {/* MOBILE (< 1024px, 56px) - Otimizado para 390px */}
          <div className="flex lg:hidden items-center justify-between h-14">
            {/* Esquerda: Logo compacto */}
            <button
              onClick={() => onNavigate('/')}
              className="flex items-center space-x-2 text-left cursor-pointer shrink-0"
            >
              <div className="w-8 h-8 rounded-lg bg-[#0F3D5C] text-white flex items-center justify-center font-black shadow-xs">
                <HardHat className="w-4 h-4 text-[#F59E0B]" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-[#0F3D5C]">
                Kizongelu
              </span>
            </button>

            {/* Direita: CTA 1-clique + Botão ghost "Entrar" + Ícone Hamburger */}
            <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
              <button
                onClick={onStartWizard}
                className="min-h-[36px] px-2.5 sm:px-3 py-1.5 bg-[#F59E0B] hover:bg-[#D97706] active:bg-[#B45309] text-slate-950 font-black text-xs rounded-lg shadow-xs flex items-center space-x-1 transition-all active:scale-95 cursor-pointer"
              >
                <span>Começar</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5] text-slate-950" />
              </button>

              <button
                onClick={onLogin}
                className="min-h-[36px] px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-[#0F3D5C] border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Entrar
              </button>

              <button
                onClick={() => setMobileDrawerOpen(true)}
                className="min-h-[40px] min-w-[40px] flex items-center justify-center p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Abrir menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. DRAWER LATERAL MOBILE (DIREITA)                                        */}
      {/* ========================================================================= */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs animate-in fade-in"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative w-full max-w-xs bg-white h-full shadow-2xl flex flex-col p-5 z-10 animate-in slide-in-from-right duration-200">
            {/* Topo do Drawer */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-[#0F3D5C] text-white flex items-center justify-center">
                  <HardHat className="w-4 h-4 text-[#F59E0B]" />
                </div>
                <span className="font-extrabold text-base text-[#0F3D5C]">
                  Kizongelu
                </span>
              </div>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center p-1.5 rounded-xl text-slate-400 hover:text-slate-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Links de Navegação */}
            <div className="py-5 space-y-1 flex-1 overflow-y-auto">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    onNavigate(item.path);
                  }}
                  className="w-full text-left px-3 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                >
                  <span>{item.label}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              ))}

              <button
                onClick={() => {
                  setMobileDrawerOpen(false);
                  onNavigate('/verificar');
                }}
                className="w-full text-left px-3 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-between"
              >
                <span className="flex items-center space-x-2">
                  <QrCode className="w-4 h-4 text-[#0F3D5C]" />
                  <span>Validar QR Code</span>
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <div className="pt-4 border-t border-slate-100 mt-4">
                <button
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    onNavigate('/ferramentas');
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Calculadoras e Ferramentas Grátis
                </button>
                <button
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    onNavigate('/sobre');
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Sobre a Kizongelu
                </button>
              </div>
            </div>

            {/* CTAs no Fundo do Drawer */}
            <div className="pt-4 border-t border-slate-100 space-y-2.5">
              <button
                onClick={() => {
                  setMobileDrawerOpen(false);
                  onStartWizard();
                }}
                className="w-full min-h-[50px] bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-black text-sm rounded-xl flex items-center justify-center space-x-2 shadow-md shadow-amber-500/20 active:scale-95 transition-transform"
              >
                <span>Começar orçamento</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setMobileDrawerOpen(false);
                  onLogin();
                }}
                className="w-full min-h-[46px] border border-slate-200 text-[#0F3D5C] font-bold text-sm rounded-xl hover:bg-slate-50 transition-colors"
              >
                Entrar na Conta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CONTEÚDO DA PÁGINA                                                     */}
      {/* ========================================================================= */}
      <main className="flex-1">
        {children}
      </main>

      {/* ========================================================================= */}
      {/* 4. BARRA CTA FIXA NO FUNDO (MOBILE < 1024px, APARECE APÓS SCROLL DE 25%)  */}
      {/* ========================================================================= */}
      {showBottomCta && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 p-3 bg-white/95 backdrop-blur-md border-t border-slate-200 z-30 shadow-xl animate-in slide-in-from-bottom duration-200">
          <button
            onClick={onStartWizard}
            className="w-full h-14 bg-[#F59E0B] hover:bg-[#D97706] active:bg-[#B45309] text-slate-950 font-black text-base rounded-xl shadow-lg shadow-amber-500/30 flex items-center justify-center space-x-2 active:scale-95 transition-all cursor-pointer"
          >
            <span>Começar o meu orçamento</span>
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. RODAPÉ INSTITUCIONAL OFICIAL UNIFICADO (5 COLUNAS)                     */}
      {/* ========================================================================= */}
      <Footer onNavigate={onNavigate} onStartWizard={onStartWizard} />

      {/* ========================================================================= */}
      {/* BANNER DE CONSENTIMENTO DE COOKIES E GOOGLE ANALYTICS 4 (FASE 15)          */}
      {/* ========================================================================= */}
      {cookieConsentOpen && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 bg-slate-900/95 backdrop-blur-md text-white p-5 rounded-2xl border border-slate-700 shadow-2xl animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-start space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-[#F59E0B] flex items-center justify-center shrink-0 border border-amber-500/30">
              <Cookie className="w-5 h-5" />
            </div>
            <div className="space-y-2 flex-1">
              <h4 className="font-bold text-sm text-white leading-tight">
                Privacidade & Cookies em Angola
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Utilizamos cookies essenciais e métricas anónimas do Google Analytics 4 para calibrar a experiência e as cotações de construção em Angola.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleAcceptCookies}
                  className="px-3.5 py-1.5 bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  Aceitar tudo
                </button>
                <button
                  type="button"
                  onClick={handleDeclineCookies}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Só essenciais
                </button>
                <button
                  type="button"
                  onClick={() => setPreferencesModalOpen(true)}
                  className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-amber-300 font-semibold text-xs rounded-lg transition-colors cursor-pointer border border-amber-500/30"
                >
                  Personalizar
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('/cookies')}
                  className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer ml-auto"
                >
                  Ver tabela
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Personalização Granular de Cookies (Fase 16) */}
      <CookiePreferencesModal
        isOpen={preferencesModalOpen}
        onClose={() => setPreferencesModalOpen(false)}
        onSaved={() => {
          setCookieConsentOpen(false);
          setPreferencesModalOpen(false);
        }}
        onNavigatePolicy={() => {
          setPreferencesModalOpen(false);
          onNavigate('/cookies');
        }}
      />
    </div>
  );
};

export default PublicLayout;
