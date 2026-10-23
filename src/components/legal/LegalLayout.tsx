/**
 * @file src/components/legal/LegalLayout.tsx
 * Layout Padrão para Páginas Jurídicas, Regulatórias e de Conformidade (Fase 16).
 *
 * Características da Especificação:
 * - Última actualização + Versão oficial.
 * - Índice navegável (sticky em desktop / accordion no mobile).
 * - Âncoras funcionais para link direto (#section).
 * - Contacto final oficial (Gabinete Jurídico, DPO, Talatona, Luanda).
 * - Suporte a impressão limpa de conformidade.
 */

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Calendar,
  FileText,
  ChevronDown,
  ChevronRight,
  Printer,
  Mail,
  MapPin,
  Phone,
  ArrowLeft,
  Share2,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { updateDocumentSeo } from '@/lib/seo/meta';

export interface LegalSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface LegalLayoutProps {
  title: string;
  subtitle: string;
  version: string;
  lastUpdated: string;
  documentType: string;
  canonicalUrl: string;
  sections: LegalSection[];
  onNavigateHome?: () => void;
  onNavigate?: (path: string) => void;
}

export const LegalLayout: React.FC<LegalLayoutProps> = ({
  title,
  subtitle,
  version,
  lastUpdated,
  documentType,
  canonicalUrl,
  sections,
  onNavigateHome,
  onNavigate,
}) => {
  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id || '');
  const [mobileIndexOpen, setMobileIndexOpen] = useState(false);

  useEffect(() => {
    updateDocumentSeo({
      title: `${title} | Kizongelu Angola`,
      description: subtitle,
      canonicalUrl,
    });
  }, [title, subtitle, canonicalUrl]);

  // Observer de scroll para destacar a secção ativa no índice sticky
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 120;
      for (let i = sections.length - 1; i >= 0; i--) {
        const sec = sections[i];
        const el = document.getElementById(sec.id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sec.id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    setMobileIndexOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -90;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      try {
        window.history.replaceState(null, '', `#${id}`);
      } catch (e) {}
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="py-10 sm:py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Top Header / Breadcrumb */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <button
              onClick={onNavigateHome}
              className="hover:text-[#0F3D5C] transition-colors cursor-pointer flex items-center gap-1 font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Início</span>
            </button>
            <span>/</span>
            <span className="text-slate-400">Legal & Conformidade Angola</span>
            <span>/</span>
            <span className="text-[#0F3D5C] font-bold">{documentType}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-[#0F3D5C] tracking-tight">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
            {subtitle}
          </p>
        </div>

        {/* Metadados do Documento: Versão & Data */}
        <div className="flex flex-col sm:items-end text-xs text-slate-500 space-y-1.5 shrink-0 bg-slate-50 p-3 sm:p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-800">Versão:</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 font-mono font-bold text-[11px]">
              {version}
            </span>
          </div>
          <div className="flex items-center space-x-1.5 text-slate-500">
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
            <span>Última actualização: <strong>{lastUpdated}</strong></span>
          </div>
          <button
            onClick={handlePrint}
            className="text-[11px] font-bold text-[#0F3D5C] hover:text-[#F59E0B] flex items-center gap-1 pt-0.5 cursor-pointer"
          >
            <Printer className="w-3 h-3" />
            <span>Imprimir documento oficial</span>
          </button>
        </div>
      </div>

      {/* Accordion de Índice Mobile (< 1024px) */}
      <div className="lg:hidden mb-8 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <button
          onClick={() => setMobileIndexOpen(!mobileIndexOpen)}
          className="w-full p-4 flex items-center justify-between text-left font-bold text-xs text-slate-800 bg-slate-50 cursor-pointer"
        >
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-[#F59E0B]" />
            <span>Índice do Documento ({sections.length} Secções)</span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-slate-500 transition-transform ${
              mobileIndexOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {mobileIndexOpen && (
          <div className="p-3 border-t border-slate-100 space-y-1 max-h-64 overflow-y-auto">
            {sections.map((sec, idx) => (
              <button
                key={sec.id}
                onClick={() => scrollToSection(sec.id)}
                className={`w-full text-left py-2 px-3 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                  activeSection === sec.id
                    ? 'bg-[#0F3D5C] text-white font-bold'
                    : 'text-slate-600 hover:bg-slate-100 font-medium'
                }`}
              >
                <span className="truncate">
                  {idx + 1}. {sec.title}
                </span>
                <ChevronRight className="w-3 h-3 shrink-0 ml-1 opacity-70" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid Principal: Desktop Sticky Sidebar + Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sticky Sidebar do Índice (Desktop >= 1024px) */}
        <aside className="hidden lg:block lg:col-span-4 sticky top-24 space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 text-xs font-bold text-[#0F3D5C] uppercase tracking-wider">
              <FileText className="w-4 h-4 text-[#F59E0B]" />
              <span>Índice Geral de Secções</span>
            </div>

            <nav className="space-y-1 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
              {sections.map((sec, idx) => {
                const isActive = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => scrollToSection(sec.id)}
                    className={`w-full text-left py-2 px-3 rounded-xl text-xs transition-all flex items-center justify-between cursor-pointer ${
                      isActive
                        ? 'bg-[#0F3D5C] text-white font-bold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
                    }`}
                  >
                    <span className="truncate">
                      {idx + 1}. {sec.title}
                    </span>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Card de Apoio Rápido e DPO */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 text-xs text-amber-950 space-y-2">
            <span className="font-bold flex items-center gap-1.5 text-amber-900">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Gabinete Jurídico & DPO</span>
            </span>
            <p className="text-[11px] text-amber-900/80 leading-relaxed">
              Questões sobre estes termos, conformidade regulamentar ou tratamento de dados em Angola:
            </p>
            <div className="text-[11px] font-semibold text-slate-800 pt-1">
              <a href="mailto:dpo@kizongelu.ao" className="text-[#0F3D5C] hover:underline block">
                dpo@kizongelu.ao
              </a>
              <span className="text-slate-500 block">Talatona, Luanda &bull; Angola</span>
            </div>
          </div>
        </aside>

        {/* Área Central de Conteúdo Legal */}
        <main className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-12">
          {sections.map((sec, idx) => (
            <section
              key={sec.id}
              id={sec.id}
              className="scroll-mt-28 space-y-4 pt-2 border-b border-slate-100 pb-8 last:border-b-0 last:pb-0"
            >
              <div className="flex items-baseline space-x-2">
                <span className="text-xs font-black text-amber-600 uppercase tracking-widest">
                  Secção {idx + 1}
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-[#0F3D5C] tracking-tight">
                {sec.title}
              </h2>
              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4">
                {sec.content}
              </div>
            </section>
          ))}

          {/* Contacto Institucional & Representação Legal */}
          <div className="mt-12 p-6 sm:p-8 bg-[#F8FAFC] rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center space-x-2 text-sm font-bold text-[#0F3D5C]">
              <ShieldCheck className="w-5 h-5 text-amber-500" />
              <span>Entidade Responsável & Contactos Institucionais</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              O software e serviços Kizongelu são operados no estrito cumprimento do ordenamento jurídico da República de Angola. Para notificações formais, pedidos de informação sobre a Lei 22/11 de Protecção de Dados Pessoais ou comunicações institucionais:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700 pt-2">
              <div className="space-y-1.5">
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-900">Sede Administrativa:</strong>
                    <span>Condomínio Belas Business Park, Talatona, Luanda &bull; Angola</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Apoio Geral: +244 923 000 000</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Gabinete Jurídico: juridico@kizongelu.ao</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Encarregado de Proteção de Dados: dpo@kizongelu.ao</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
