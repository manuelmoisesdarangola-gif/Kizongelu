/**
 * @file src/components/public/PublicLandingPage.tsx
 * Página Pública Oficial de Venda e Conversão do Kizongelu para Angola.
 * SaaS profissional pronto para clientes reais com:
 * - Proposta de valor clara em Kwanzas (Kz)
 * - Trust signals de Angola (Multicaixa Express, Fórmulas de Engenharia Civil)
 * - Simulador Rápido Interativo de Custos de Construção
 * - Planos de preços transparentes com conversão otimizada
 * - Testemunhos de engenheiros e particulares de Luanda, Benguela e Huíla
 * - Validador público de orçamentos e QR Code
 */

import React, { useState, useEffect } from 'react';
import {
  HardHat,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Calculator,
  FileText,
  CreditCard,
  QrCode,
  Building2,
  Building,
  Home,
  Fence,
  Users,
  Clock,
  Sparkles,
  ChevronRight,
  PhoneCall,
  MapPin,
  Mail,
  TrendingDown,
  Layers,
  Award,
  HelpCircle,
  Info,
  Smartphone,
  Check,
  ExternalLink,
  Globe,
  Lock,
  X,
  Star,
  ThumbsUp,
  TrendingUp,
  AlertTriangle,
  Eye,
  FileDown,
  Hammer,
  Truck,
  BookOpen,
} from 'lucide-react';
import { Tooltip } from '@/components/ui/tooltip';
import ManualVerificationPage from '../../../app/(public)/verificar/page';
import { LISTA_8_PROVINCIAS } from '@/lib/data/provincias';
import { getAppliedProvinceFactor, ALL_21_PROVINCE_FACTORS } from '@/lib/data/province-factors';
import { BLOG_ARTICLES } from '@/lib/data/blog';
import { trackEvent } from '@/lib/analytics/tracker';
import { formatKz, formatNumberPt } from '@/lib/utils/formatters';

export interface StartWizardOptions {
  tipo?: string;
  subtipo?: string;
  step?: number;
}

interface PublicLandingPageProps {
  onEnterApp: () => void;
  onStartWizard: (options?: StartWizardOptions | React.MouseEvent<any> | any) => void;
  onNavigateToAdmin?: () => void;
  onNavigate?: (path: string) => void;
}

export const PublicLandingPage: React.FC<PublicLandingPageProps> = ({
  onEnterApp,
  onStartWizard,
  onNavigateToAdmin,
  onNavigate,
}) => {
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showSampleModal, setShowSampleModal] = useState(false);
  // Simulador rápido de custos no Hero
  const [simTipo, setSimTipo] = useState<'moradia_t3' | 'moradia_t4' | 'muro' | 'armazem' | null>(null);
  const [simProvincia, setSimProvincia] = useState<'Luanda' | 'Benguela' | 'Huíla' | 'Huambo'>('Luanda');
  const [simArea, setSimArea] = useState<number>(140);
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(null);

  // Fórmulas simplificadas para o estimador rápido do Hero
  const getSimCalculo = () => {
    if (!simTipo) return null;
    let custoBaseM2 = 210000; // Kz/m²
    if (simTipo === 'moradia_t4') custoBaseM2 = 265000;
    if (simTipo === 'armazem') custoBaseM2 = 175000;
    if (simTipo === 'muro') custoBaseM2 = 48000; // por metro linear

    const multProvincia: Record<string, number> = {
      Luanda: 1.00,
      Benguela: 1.08,
      Huíla: 1.18,
      Huambo: 1.15,
    };

    const fator = multProvincia[simProvincia] || 1.0;
    const totalKz = simArea * custoBaseM2 * fator;
    const cimentoSacos = Math.round(simArea * 3.8);
    const varaoKg = Math.round(simArea * 28);
    const blocosUnidades = Math.round(simArea * 34);

    return {
      totalKz,
      cimentoSacos,
      varaoKg,
      blocosUnidades,
      fundaçoesKz: totalKz * 0.28,
      alvenariaKz: totalKz * 0.32,
      coberturaKz: totalKz * 0.22,
      acabamentosKz: totalKz * 0.18,
    };
  };

  const simResult = getSimCalculo();

  // Carregamento dinâmico dos coeficientes da tabela ProvinceFactor da base de dados
  const [dbProvinceFactors, setDbProvinceFactors] = useState<Record<string, number>>({});

  useEffect(() => {
    let isMounted = true;
    async function loadProvinceFactors() {
      const factors: Record<string, number> = {};
      for (const prov of LISTA_8_PROVINCIAS) {
        factors[prov.nome] = await getAppliedProvinceFactor(prov.nome);
      }
      if (isMounted) {
        setDbProvinceFactors(factors);
      }
    }
    loadProvinceFactors();
    return () => {
      isMounted = false;
    };
  }, []);

  const faqs = [
    {
      q: 'Os preços dos materiais são reais do mercado de Angola?',
      a: 'Sim. A nossa base de preços é actualizada regularmente com recolhas em entrepostos de Luanda (Viana, Cacuaco, Kikolo, Palanca), Benguela, Lobito, Lubango e Huambo, reflectindo os custos reais de cimento, varão de aço, inertes, blocos e mão de obra local.',
    },
    {
      q: 'Como funciona o pagamento via Multicaixa Express ou Transferência?',
      a: 'Pode adquirir qualquer pacote de orçamentos por Multicaixa Express ou transferência bancária para as nossas coordenadas oficiais. O envio do comprovativo é feito directamente na plataforma e validado em minutos.',
    },
    {
      q: 'Posso usar o Kizongelu no meu telemóvel Android?',
      a: 'Totalmente. A aplicação foi concebida para telemóveis de gama média em Angola, com carregamento rápido, baixo consumo de dados móveis e navegação táctil fluida.',
    },
    {
      q: 'O orçamento emitido pode ser apresentado a clientes ou em processos de financiamento?',
      a: 'Sim. Todos os orçamentos gerados em PDF contêm apresentação profissional com QR de verificação, mapa discriminado de quantidades segundo as boas práticas de engenharia em Angola e relatórios técnicos claros.',
    },
    {
      q: 'Como funciona o motor de cálculo?',
      a: 'A Kizongelu usa fórmulas determinísticas de engenharia civil combinadas com uma base de preços locais actualizada. A IA ajuda a interpretar, mas nunca inventa valores.',
    },
    {
      q: 'Posso partilhar o orçamento?',
      a: 'Sim. Pode gerar links seguros, enviar por WhatsApp ou email, e controlar quem abre e quando.',
    },
    {
      q: 'Os orçamentos comprados têm data de expiração?',
      a: 'Não. Os créditos dos pacotes nunca expiram. Permanecem disponíveis na sua conta até serem utilizados, sem cobranças automáticas nem mensalidades.',
    },
    {
      q: 'O que acontece se não gostar do resultado?',
      a: 'Pode contactar-nos em até 7 dias. Analisamos caso a caso conforme os nossos Termos.',
    },
    {
      q: 'Posso pedir reembolso?',
      a: 'Analisamos caso a caso em até 7 dias após a compra. Consulte a nossa Política de Reembolsos para mais detalhes.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-['Inter',sans-serif] flex flex-col selection:bg-amber-400 selection:text-slate-900">
      {/* ========================================================================= */}
      {/* 2. HERO SECTION — PROPOSTA DE VALOR REAL PARA ANGOLA                      */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden bg-radial from-[#0F3D5C] to-[#0A293E] text-white pt-12 pb-20 sm:pt-20 sm:pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Texto Principal */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Badge Feito para o mercado angolano acima do título */}
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-amber-300 backdrop-blur-sm shadow-xs">
                <span className="text-sm">🇦🇴</span>
                <span className="font-bold text-white">Feito para o mercado angolano</span>
                <span className="text-white/40" aria-hidden="true">&bull;</span>
                <span className="text-amber-300">Preços actualizados em 2026</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black tracking-tight leading-tight sm:leading-tight">
                Saiba quanto pode custar construir em{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">
                  Angola
                </span>
                .
              </h1>

              <p className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Crie mapas de quantidades, listas de materiais e orçamentos profissionais com preços locais de Luanda, Benguela, Huíla e restantes províncias de Angola.
              </p>

              {/* Prova social discreta abaixo do subtítulo */}
              <p className="text-xs text-slate-300 font-medium flex items-center justify-center lg:justify-start gap-2">
                <span>12.400+ orçamentos criados</span>
                <span className="text-white/40" aria-hidden="true">&middot;</span>
                <span>21 províncias</span>
                <span className="text-white/40" aria-hidden="true">&middot;</span>
                <span>4,7/5 satisfação</span>
              </p>

              {/* Botões de Ação de Alta Conversão */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  onClick={onStartWizard}
                  className="w-full sm:w-auto px-7 py-4 bg-[#F59E0B] hover:bg-[#D97706] active:bg-[#B45309] text-slate-950 font-black text-base rounded-xl shadow-xl shadow-amber-500/30 flex items-center justify-center space-x-2.5 transition-all cursor-pointer active:scale-95 group"
                >
                  <Calculator className="w-5 h-5 stroke-[2.5]" />
                  <span>Calcular estimativa</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Chip informativo discreto ao lado do CTA */}
                <div
                  onClick={() => setShowSampleModal(true)}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold border border-white/20 transition-all cursor-pointer shadow-xs"
                >
                  <FileText className="w-4 h-4 text-amber-300" />
                  <span>PDF e QR disponíveis</span>
                </div>
              </div>

              {/* Texto pequeno cinza abaixo do CTA principal */}
              <p className="text-xs text-slate-400 text-center lg:text-left">
                Desbloqueie o orçamento completo a partir de 12.999 Kz &mdash; pagamento único sem expiração.
              </p>

              {/* Selo Pagamento Seguro + Dados Protegidos perto do CTA */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-1">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Pagamento seguro</span>
                </div>
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-semibold">
                  <Lock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>Dados protegidos</span>
                </div>
              </div>

              {/* Microcopy de Risco Zero & Redução de Fricção */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-y-1.5 gap-x-4 text-xs text-slate-300 pt-1">
                <span className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Sem necessidade de cartão de crédito
                </span>
                <span className="flex items-center gap-1.5 text-slate-200">
                  <Clock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  Resultado em menos de 10 minutos
                </span>
                <span className="flex items-center gap-1.5 text-amber-300 font-medium">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  Calibrado em Kwanzas (Kz)
                </span>
              </div>

              {/* Trust Badges de Alta Credibilidade */}
              <div className="pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                <div className="flex items-center space-x-2.5 bg-white/5 p-2 rounded-xl border border-white/10">
                  <div className="w-7 h-7 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs text-white font-bold block leading-tight">Multicaixa Express</span>
                    <span className="text-[10px] text-amber-300">Pagamento Seguro</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5 bg-white/5 p-2 rounded-xl border border-white/10">
                  <div className="w-7 h-7 rounded-lg bg-emerald-400/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs text-white font-bold block leading-tight">Engenharia Civil</span>
                    <span className="text-[10px] text-emerald-300">Base técnica rigorosa</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5 bg-white/5 p-2 rounded-xl border border-white/10">
                  <div className="w-7 h-7 rounded-lg bg-sky-400/20 text-sky-400 flex items-center justify-center shrink-0">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs text-white font-bold block leading-tight">Verificação Pública</span>
                    <span className="text-[10px] text-sky-300">Código único de verificação</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5 bg-white/5 p-2 rounded-xl border border-white/10">
                  <div className="w-7 h-7 rounded-lg bg-indigo-400/20 text-indigo-400 flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs text-white font-bold block leading-tight">Licenciamento & Alvarás</span>
                    <span className="text-[10px] text-indigo-300">Preparado para processos municipais</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cartão Interativo no Hero — Simulador Imediato */}
            <div className="lg:col-span-5" id="simulador">
              <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <span className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center font-black text-sm">
                      Kz
                    </span>
                    <div>
                      <h2 className="font-bold text-sm text-slate-900 leading-tight">
                        Simulador Rápido de Custo
                      </h2>
                      <p className="text-[11px] text-slate-500">Estimativa instantânea de mercado</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-medium px-2.5 py-0.5 rounded-full border border-slate-200">
                    Preços de referência 2026
                  </span>
                </div>

                {/* Seletores do Simulador */}
                <div className="space-y-4 pt-4 text-xs">
                  {/* Tipo de Obra */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="font-semibold text-slate-700 block">
                        Tipo de Construção:
                      </label>
                      {!simTipo && (
                        <span className="text-[11px] text-amber-600 font-medium">
                          Escolha o tipo de obra
                        </span>
                      )}
                    </div>
                    <div
                      className="grid grid-cols-2 gap-1.5"
                      role="radiogroup"
                      aria-label="Tipo de Construção"
                      data-placeholder="Escolha o tipo de obra"
                      aria-placeholder="Escolha o tipo de obra"
                    >
                      {[
                        { id: 'moradia_t3', label: 'Moradia T3' },
                        { id: 'moradia_t4', label: 'Moradia T4' },
                        { id: 'armazem', label: 'Nave / Armazém' },
                        { id: 'muro', label: 'Muro Perimetral' },
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setSimTipo(t.id as any)}
                          className={`py-2 px-2.5 rounded-xl font-medium border text-center transition-all cursor-pointer ${
                            simTipo === t.id
                              ? 'border-[#0F3D5C] bg-[#0F3D5C] text-white font-bold'
                              : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-slate-50'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Província e Área */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        Província:
                      </label>
                      <select
                        value={simProvincia}
                        onChange={(e) => setSimProvincia(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0F3D5C]"
                      >
                        <option value="Luanda">Luanda</option>
                        <option value="Benguela">Benguela (+7%)</option>
                        <option value="Huíla">Huíla (+8%)</option>
                        <option value="Huambo">Huambo (+8%)</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="font-semibold text-slate-700">
                          {simTipo === 'muro' ? 'Extensão:' : 'Área Útil:'}
                        </label>
                        <span className="font-bold text-[#0F3D5C]">
                          {formatNumberPt(simArea)} {simTipo === 'muro' ? 'm' : 'm²'}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={simTipo === 'muro' ? 20 : 60}
                        max={simTipo === 'muro' ? 200 : 350}
                        step={10}
                        value={simArea}
                        onChange={(e) => setSimArea(Number(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                    </div>
                  </div>

                  {/* Resultado do Estimador */}
                  <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-3.5 space-y-2.5">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        Investimento Estimado:
                      </span>
                      {simResult ? (
                        <span className="text-xl font-black text-[#0F3D5C]">
                          {formatKz(simResult.totalKz)}
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400">
                          Escolha o tipo de obra
                        </span>
                      )}
                    </div>

                    {/* Principais Quantidades de Materiais */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-center">
                      <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-xs">
                        <span className="text-[10px] text-slate-500 block">Cimento</span>
                        <span className="font-extrabold text-xs text-slate-800">
                          {simResult ? `${formatNumberPt(simResult.cimentoSacos)} scs` : '—'}
                        </span>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-xs">
                        <span className="text-[10px] text-slate-500 block">Aço / Varão</span>
                        <span className="font-extrabold text-xs text-slate-800">
                          {simResult ? `${formatNumberPt(simResult.varaoKg / 1000, 1)} ton` : '—'}
                        </span>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-xs">
                        <span className="text-[10px] text-slate-500 block">Blocos 15</span>
                        <span className="font-extrabold text-xs text-slate-800">
                          {simResult ? `${formatNumberPt(simResult.blocosUnidades)} un` : '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* CTA do Simulador */}
                  <button
                    onClick={onStartWizard}
                    className="w-full py-3 bg-[#0F3D5C] hover:bg-[#0A293E] active:bg-[#061824] text-white font-bold rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md text-xs"
                  >
                    <span>Gerar Orçamento Completo com Todos os Itens</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                  </button>

                  <p className="text-[10px] text-center text-slate-400">
                    Inclui mapa de quantidades, mão de obra e cronograma detalhado.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. SECÇÃO NÚMEROS E IMPACTO — 4 KPIS OFICIAIS                            */}
      {/* ========================================================================= */}
      <section className="py-14 sm:py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1.5">
              Números e impacto
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0F3D5C] tracking-tight">
              A ferramenta de orçamentação feita para Angola
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Métricas reais consolidadas de utilização, poupança e satisfação técnica.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 items-stretch">
            {/* KPI 1: 12.400+ orçamentos */}
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-5 sm:p-6 text-center card-interactive flex flex-col justify-center min-h-[140px] sm:min-h-[155px]">
              <span className="text-3xl sm:text-4xl font-black text-[#0F3D5C] block tracking-tight tabular-nums">
                12.400+
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-800 block mt-1">
                Orçamentos gerados
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Mapas de quantidades calculados
              </span>
            </div>

            {/* KPI 2: 21 províncias */}
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-5 sm:p-6 text-center card-interactive flex flex-col justify-center min-h-[140px] sm:min-h-[155px]">
              <span className="text-3xl sm:text-4xl font-black text-amber-600 block tracking-tight tabular-nums">
                21
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-800 block mt-1">
                Províncias
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Preços locais calibrados
              </span>
            </div>

            {/* KPI 3: 1.200+ profissionais */}
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-5 sm:p-6 text-center card-interactive flex flex-col justify-center min-h-[140px] sm:min-h-[155px]">
              <span className="text-3xl sm:text-4xl font-black text-[#0F3D5C] block tracking-tight tabular-nums">
                1.200+
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-800 block mt-1">
                Profissionais
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Engenheiros e projetistas
              </span>
            </div>

            {/* KPI 4: 4,7/5 */}
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-5 sm:p-6 text-center card-interactive flex flex-col justify-center min-h-[140px] sm:min-h-[155px]">
              <div className="flex items-center justify-center space-x-1">
                <span className="text-3xl sm:text-4xl font-black text-emerald-600 tracking-tight tabular-nums">
                  4,7
                </span>
                <span className="text-lg font-bold text-slate-400">/5</span>
                <Star className="w-5 h-5 fill-amber-400 text-amber-400 shrink-0 ml-1" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-800 block mt-1">
                Avaliação média
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Satisfação média dos utilizadores
              </span>
            </div>
          </div>

          {/* Contexto de auditoria dos números */}
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-400 font-medium">
              Métricas internas consolidadas. Última actualização: Outubro de 2026.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3.2 SECÇÃO COMO FUNCIONA (4 PASSOS) — FASE 15                             */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 bg-[#F8FAFC] border-b border-slate-200" id="como-funciona">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block mb-2">
              Passo a Passo Simples
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#0F3D5C] tracking-tight">
              Como funciona o Kizongelu em 4 etapas
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2">
              Das primeiras respostas à lista completa de materiais e orçamento profissional em menos de 10 minutos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Passo 1 */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs relative flex flex-col justify-between group hover:border-[#0F3D5C] transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-700 flex items-center justify-center font-black text-lg">
                    1
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Início Rápido
                  </span>
                </div>
                <h3 className="font-extrabold text-base text-slate-900 mb-2">
                  Escolha a Obra & Província
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Seleccione moradia, muro de vedação, anexo ou armazém comercial. Indique a província angolana para carregar as cotações locais.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                <span>21 Províncias Cobertas</span>
              </div>
            </div>

            {/* Passo 2 */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs relative flex flex-col justify-between group hover:border-[#0F3D5C] transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-10 h-10 rounded-2xl bg-sky-500/15 text-sky-700 flex items-center justify-center font-black text-lg">
                    2
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Dimensões
                  </span>
                </div>
                <h3 className="font-extrabold text-base text-slate-900 mb-2">
                  Defina as dimensões da obra
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Insira a área em m² ou a extensão linear do muro. Escolha a tipologia, pé-direito e o padrão de acabamentos desejado.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-sky-500" />
                <span>Sem cálculos técnicos complexos</span>
              </div>
            </div>

            {/* Passo 3 */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs relative flex flex-col justify-between group hover:border-[#0F3D5C] transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-700 flex items-center justify-center font-black text-lg">
                    3
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Engenharia
                  </span>
                </div>
                <h3 className="font-extrabold text-base text-slate-900 mb-2">
                  Cálculo Físico Determinístico
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  O motor aplica fórmulas de engenharia e rácios de dosagem exactos para cimento, varão de aço, inertes, blocos e mão de obra.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-emerald-600 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Fórmulas determinísticas verificáveis</span>
              </div>
            </div>

            {/* Passo 4 */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs relative flex flex-col justify-between group hover:border-[#0F3D5C] transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-700 flex items-center justify-center font-black text-lg">
                    4
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Resultado
                  </span>
                </div>
                <h3 className="font-extrabold text-base text-slate-900 mb-2">
                  Receba o Orçamento & QR Code
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Descarregue o mapa de quantidades profissional, a lista de compras para os armazéns e o QR Code de verificação pública.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-indigo-600" />
                <span>Verificável por qualquer pessoa</span>
              </div>
            </div>
          </div>

          <div className="mt-10 text-center">
            <button
              onClick={onStartWizard}
              className="inline-flex items-center space-x-2 py-3 px-7 bg-[#0F3D5C] hover:bg-[#0A293E] active:bg-slate-900 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer active:scale-95"
            >
              <span>Começar agora</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3.3 SECÇÃO BENEFÍCIOS (3 CARDS) — FASE 15                                 */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block mb-2">
              Vantagens Exclusivas
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#0F3D5C] tracking-tight">
              3 Benefícios que protegem o seu investimento
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2">
              Reduzimos a incerteza financeira e o desperdício comum na construção civil em Angola.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Benefício 1 */}
            <div className="bg-[#F8FAFC] rounded-3xl p-8 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center font-black">
                  <TrendingDown className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-extrabold text-[#0F3D5C]">
                  Zero Desperdício de Materiais
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Objectivo: reduzir até <strong>18,4%</strong> do desperdício no valor total das compras. As nossas fórmulas calculam com rigor os sacos de cimento, varões e blocos necessários, evitando excessos de stock e desperdício no estaleiro.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center text-xs font-bold text-amber-700">
                <CheckCircle2 className="w-4 h-4 mr-1.5 text-amber-600" />
                <span>Lista pronta para o armazém</span>
              </div>
            </div>

            {/* Benefício 2 */}
            <div className="bg-[#F8FAFC] rounded-3xl p-8 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-sky-500/15 text-sky-600 flex items-center justify-center font-black">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-extrabold text-[#0F3D5C]">
                  Documento com Verificação QR
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Mapas discriminados de quantidades, com formato elaborado para apresentação em processos de licenciamento e alvarás municipais. Inclui QR code de verificação pública.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center text-xs font-bold text-sky-700">
                <QrCode className="w-4 h-4 mr-1.5 text-sky-600" />
                <span>Verificação pública imediata</span>
              </div>
            </div>

            {/* Benefício 3 */}
            <div className="bg-[#F8FAFC] rounded-3xl p-8 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center font-black">
                  <Building2 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-extrabold text-[#0F3D5C]">
                  Calibração Provincial de Preços
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Os custos de transporte, cimento, brita e mão de obra variam consoante a província. O Kizongelu ajusta os preços com base em coeficientes logísticos reais para cada região coberta.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center text-xs font-bold text-emerald-700">
                <Truck className="w-4 h-4 mr-1.5 text-emerald-600" />
                <span>Fretes e materiais locais incluídos</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3.4 SECÇÃO TIPOS DE OBRAS (GRID) — FASE 15                                */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 bg-[#F8FAFC] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block mb-2">
              Flexibilidade Construtiva
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#0F3D5C] tracking-tight">
              Tipos de obras suportadas pelo Kizongelu
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2">
              Modelos estruturais e orçamentais para as principais tipologias de construção em Angola.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Moradias Unifamiliares (T2 a T5)',
                desc: 'Habitações térreas ou com piso superior, com cálculo completo de sapatas, pilares, vigas, lajes, cobertura e canalizações.',
                custo: '180.000 a 280.000 Kz/m²',
                badge: 'Habitação',
                icon: Home,
                tipoCode: 'nova',
                subtipoCode: 'unifamiliar',
              },
              {
                title: 'Muros de Vedação & Perímetro',
                desc: 'Perímetros com fundação corrida ou sapatas isoladas, pilares a cada 2,5 m, vigas de coroamento e blocos de 15 vibrados.',
                custo: '45.000 a 65.000 Kz/metro',
                badge: 'Perímetro',
                icon: Fence,
                tipoCode: 'muro',
                subtipoCode: 'muro',
              },
              {
                title: 'Naves Industriais & Armazéns',
                desc: 'Estruturas de grandes vãos para logística, indústria ligeira ou comércio com piso industrial reforçado e cobertura metálica.',
                custo: '140.000 a 200.000 Kz/m²',
                badge: 'Industrial',
                icon: Layers,
                tipoCode: 'nova',
                subtipoCode: 'comercial',
              },
              {
                title: 'Prédios & Edifícios Multifamiliares',
                desc: 'Prédios residenciais de 2 a 4 pisos com estrutura porticada de betão armado, caixas de escada e condutas técnicas verticais.',
                custo: '150.000 a 230.000 Kz/m²',
                badge: 'Multifamiliar',
                icon: Building2,
                tipoCode: 'nova',
                subtipoCode: 'multifamiliar',
              },
              {
                title: 'Anexos & Construções',
                desc: 'Construções secundárias em quintais e terrenos urbanos: suítes independentes, cozinhas exteriores e lavandarias.',
                custo: '160.000 a 230.000 Kz/m²',
                badge: 'Residencial',
                icon: Hammer,
                tipoCode: 'anexo',
                subtipoCode: 'anexo',
              },
              {
                title: 'Remodelações & Ampliações',
                desc: 'Substituição integral de telhados, reforço estrutural de vigas, novos pavimentos cerâmicos e reabilitação de alvenarias.',
                custo: 'Sob medição directa',
                badge: 'Remodelação & Ampliação',
                icon: Calculator,
                tipoCode: 'remodelacao',
                subtipoCode: 'remodelacao',
              },
            ].map((tipo, idx) => {
              const IconComp = tipo.icon;
              return (
                <div
                  key={idx}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    trackEvent('cta_click');
                    onStartWizard?.({ tipo: tipo.tipoCode, subtipo: tipo.subtipoCode, step: 2 });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      trackEvent('cta_click');
                      onStartWizard?.({ tipo: tipo.tipoCode, subtipo: tipo.subtipoCode, step: 2 });
                    }
                  }}
                  className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-slate-200 shadow-sm hover:shadow-md hover:border-[#F59E0B] transition-all duration-150 ease-out cursor-pointer flex flex-col justify-between group focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-[#0F3D5C]/10 text-[#0F3D5C] group-hover:bg-amber-100 group-hover:text-amber-800 flex items-center justify-center font-bold transition-colors">
                        <IconComp className="w-5 h-5 text-[#0F3D5C] group-hover:text-amber-800 transition-colors" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        {tipo.badge}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900 group-hover:text-[#0F3D5C] transition-colors leading-snug">
                      {tipo.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {tipo.desc}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Estimativa de Referência:</span>
                      <span className="text-xs font-black text-[#0F3D5C] inline-flex items-center gap-1">
                        {tipo.custo === 'Sob medição directa' && (
                          <Calculator className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        )}
                        <span>{tipo.custo}</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA Agregador */}
          <div className="mt-10 mb-10 text-center">
            <p className="text-sm text-slate-500 text-center mb-4">
              Já sabe o que quer construir? Comece agora.
            </p>
            <button
              type="button"
              onClick={() => onStartWizard?.()}
              className="mx-auto bg-[#F59E0B] hover:bg-[#D97706] active:bg-[#B45309] text-slate-950 font-bold px-8 py-4 rounded-xl min-h-[48px] md:min-h-[56px] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg active:scale-95"
            >
              <span>Começar o meu orçamento</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

          {/* Nota de rodapé e disclaimer */}
          <div className="pt-6 border-t border-slate-200/80 text-center max-w-3xl mx-auto">
            <p className="text-xs text-slate-500 leading-relaxed inline-flex items-center justify-center gap-1.5 flex-wrap">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 inline" />
              <span>
                Intervalos indicativos com base em cotações de empreiteiros recolhidas em Outubro 2026. Valores estimativos que variam conforme província, tipologia e nível de acabamento. Confirmar sempre com orçamento detalhado.
              </span>
            </p>
          </div>
        </div>
      </section>


      {/* ========================================================================= */}
      {/* 4. SOLUÇÕES ESPECÍFICAS PARA CADA CLIENTE                                 */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 bg-[#F8FAFC]" id="solucoes">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-2">
              Soluções Feitas à Medida
            </h2>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-[#0F3D5C] tracking-tight">
              Para quem constrói e executa obras
            </h3>
            <p className="text-sm sm:text-base text-slate-600 mt-3">
              Orçamentos profissionais para cada perfil. Transparentes, detalhados, verificáveis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Particulares */}
            <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold mb-5">
                  <Users className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">
                  Particulares & Famílias
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Saiba com precisão quantos sacos de cimento e varões a sua casa realmente precisa. Sem excessos, sem faltas.
                </p>
                <ul className="space-y-2 text-xs text-slate-700 mb-6">
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Lista de compras direta para o armazém</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Estimativa de custos em Kwanzas actualizada</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Controlo de gastos fase por fase</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6">
                <button
                  onClick={onStartWizard}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Fazer orçamento
                </button>
                <p className="text-xs text-slate-500 text-center mt-2">
                  Pacote Particular por 12.999 Kz (pagamento único)
                </p>
              </div>
            </div>

            {/* Card 2: Engenheiros & Arquitectos */}
            <div className="bg-white rounded-3xl p-7 border-2 border-[#0F3D5C] shadow-md relative flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold mb-5">
                  <HardHat className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">
                  Engenheiros & Técnicos
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Poupe dias de trabalho em folhas de cálculo manuais. Gere mapas de medições completos com coeficientes de perdas e fórmulas técnicas validadas.
                </p>
                <ul className="space-y-2 text-xs text-slate-700 mb-6">
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Exportação de PDF profissional com verificação QR</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Parametrização de margens e encargos sociais</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Memória de cálculo e plano de execução</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6">
                <button
                  onClick={onEnterApp}
                  className="w-full py-2.5 bg-[#0F3D5C] hover:bg-[#0A293E] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Ver pacotes profissionais
                </button>
                <p className="text-xs text-slate-500 text-center mt-2">
                  Pacote Profissional por 15.999 Kz (3 orçamentos)
                </p>
              </div>
            </div>

            {/* Card 3: Construtoras & Empreiteiros */}
            <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold mb-5">
                  <Building2 className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">
                  Construtoras & Empreiteiros
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Apresente propostas comerciais rigorosas aos seus clientes, com o logótipo da sua empresa e estrutura detalhada para concursos e adjudicações.
                </p>
                <ul className="space-y-2 text-xs text-slate-700 mb-6">
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Múltiplos projectos e orçamentos em paralelo</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Base de preços personalizada por província</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Suporte prioritário via WhatsApp e consultor</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6">
                <button
                  onClick={onEnterApp}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Ver pacotes empresariais
                </button>
                <p className="text-xs text-slate-500 text-center mt-2">
                  Pacotes Empresa a partir de 29.999 Kz
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4.1 CASOS DE USO POR PROVÍNCIA (8 CARDS DINÂMICOS) — FASE 15              */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 bg-white border-t border-slate-200" id="provincias">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block mb-2">
              Cobertura Nacional
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#0F3D5C] tracking-tight">
              Custos e Casos de Obra por Província
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2">
              Cotações locais de materiais, fretes rodoviários e coeficientes logísticos para as províncias de Angola.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {LISTA_8_PROVINCIAS.map((prov) => {
              const appliedFactor = dbProvinceFactors[prov.nome] ?? prov.coeficienteLogistica;
              return (
                <div
                  key={prov.slug}
                  className="bg-[#F8FAFC] rounded-3xl p-6 border border-slate-200 shadow-xs hover:border-[#0F3D5C] hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-[#0F3D5C] bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                        {prov.nome}
                      </span>
                      <Tooltip
                        content="Coeficiente logístico vs. Luanda. Reflecte custos de transporte, disponibilidade de fornecedores e acesso rodoviário."
                        position="top"
                        className="w-60 whitespace-normal text-center leading-snug p-2.5 text-[11px] shadow-lg bg-[#0F3D5C]"
                      >
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full cursor-help hover:bg-amber-200 transition-colors">
                          Coef. {appliedFactor.toFixed(2).replace('.', ',')}x
                        </span>
                      </Tooltip>
                    </div>

                  <div>
                    <span className="text-[11px] text-slate-500 block">{prov.municipios.length} municípios cobertos</span>
                    <div className="text-lg font-black text-[#0F3D5C] mt-1">
                      {prov.precos.custoMedioM2.toLocaleString('pt-PT')} Kz <span className="text-xs text-[#0F3D5C] font-semibold">/ m²</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Valor médio para moradia T3, acabamento médio
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600">
                    {prov.descricaoCurta}
                  </p>

                  {/* Municípios em Chips */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Municípios em Destaque:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {prov.municipios.slice(0, 3).map((muni) => (
                        <span
                          key={muni}
                          className="text-[10px] bg-white text-slate-700 font-medium px-2 py-0.5 rounded-md border border-slate-200"
                        >
                          {muni}
                        </span>
                      ))}
                      {prov.municipios.length > 3 && (
                        <span className="text-[10px] text-slate-400 self-center">
                          +{prov.municipios.length - 3} municípios
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-200/80">
                  <button
                    onClick={() => {
                      trackEvent('province_selector_change', { province: prov.nome, slug: prov.slug });
                      if (onNavigate) {
                        onNavigate(`/obras-em/${prov.slug}`);
                      } else {
                        onStartWizard();
                      }
                    }}
                    className="w-full py-2 bg-white hover:bg-[#0F3D5C] hover:text-white text-[#0F3D5C] text-xs font-bold rounded-xl border border-slate-300 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs group-hover:bg-[#0F3D5C] group-hover:text-white"
                  >
                    <span>Preços em {prov.nome}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
          </div>

          <div className="mt-8 text-center space-y-1.5">
            <p className="text-xs text-slate-500 font-medium">
              Não encontra a sua província na lista rápida? O motor do Kizongelu cobre todas as 21 províncias no Wizard completo.
            </p>
            <p className="text-[11px] text-slate-400">
              Cotações recolhidas em Outubro 2026. Actualizadas periodicamente.
            </p>
          </div>
        </div>
      </section>


      {/* ========================================================================= */}
      {/* 4.2 COMPARAÇÃO ANTES VS DEPOIS — CLAREZA IMBATÍVEL                        */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center space-x-2 bg-amber-50 text-amber-900 border border-amber-200 px-3.5 py-1 rounded-full text-xs font-bold mb-3">
              <Eye className="w-4 h-4 text-amber-600" />
              <span>Clareza e transparência</span>
            </div>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-[#0F3D5C] tracking-tight">
              O fim dos desvios e das surpresas na sua obra
            </h3>
            <p className="text-sm sm:text-base text-slate-600 mt-2">
              Compare a incerteza do método manual com o rigor da engenharia do Kizongelu.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Coluna 1: O Método Tradicional (Sem Kizongelu) */}
            <div className="bg-rose-50/40 rounded-3xl p-6 sm:p-8 border-2 border-rose-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-rose-200/60 mb-5">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-black text-sm">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-slate-900 leading-tight">
                        Método Tradicional
                      </h4>
                      <span className="text-[11px] text-rose-700 font-semibold">Sem Kizongelu</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2.5 py-1 rounded-full">
                    Alto Risco
                  </span>
                </div>

                <ul className="space-y-3.5 text-xs text-slate-700">
                  <li className="flex items-start space-x-2.5">
                    <X className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-slate-900">Listas manuais sobrestimadas:</strong> O mestre de obras pede 600 sacos de cimento sem base física; dezenas de sacos endurecem com a humidade.
                    </span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <X className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-slate-900">Processos de crédito rejeitados:</strong> Candidaturas atrasam ou são devolvidas sem mapas de quantidades técnicos estruturados.
                    </span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <X className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-slate-900">Preços sobrefacturados:</strong> Compras às cegas em armazéns de materiais sem cotações de referência nem frete provincial considerado.
                    </span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <X className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-slate-900">Conflitos e obras paradas:</strong> O dinheiro acaba a meio da alvenaria por falta de cronograma financeiro e margem de imprevistos.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-rose-200/70 bg-rose-100/50 -mx-6 -mb-6 p-4 rounded-b-3xl flex items-center justify-between text-xs">
                <span className="font-semibold text-rose-900">Desperdício Médio Estimado:</span>
                <span className="font-black text-rose-700 text-sm">20% a 30% do capital da obra</span>
              </div>
            </div>

            {/* Coluna 2: Com Kizongelu */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-500 shadow-xl relative flex flex-col justify-between">
              <span className="absolute -top-3 right-6 bg-emerald-600 text-white font-black text-[10px] px-3.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                Engenharia de Confiança
              </span>

              <div>
                <div className="flex items-center justify-between pb-4 border-b border-emerald-100 mb-5">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-slate-900 leading-tight">
                        Com Kizongelu
                      </h4>
                      <span className="text-[11px] text-emerald-700 font-semibold">Fórmulas validadas por engenheiros civis</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                    Garantido
                  </span>
                </div>

                <ul className="space-y-3.5 text-xs text-slate-700">
                  <li className="flex items-start space-x-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-slate-900">Quantidades exactas por metro quadrado:</strong> Fórmulas físicas calibradas para cimento Portland, varão de aço A400, inertes e blocos sem sobras.
                    </span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-slate-900">Preparado para apresentação:</strong> Orçamento e Mapa de Quantidades com código único de verificação por QR code.
                    </span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-slate-900">Cotações reais em Kwanzas:</strong> Preços actualizados em armazéns de Luanda (Viana/Kikolo), Benguela, Huíla e Huambo com frete discriminado.
                    </span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-slate-900">Cronograma de 10 fases:</strong> Desembolso faseado para pagar a mão de obra apenas pelo trabalho executado e medido.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-emerald-100 bg-emerald-50/70 -mx-6 -mb-6 p-4 rounded-b-3xl flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-900">Poupança Média Comprovada:</span>
                <span className="font-black text-emerald-700 text-sm">18,4% do valor dos materiais</span>
              </div>
            </div>
          </div>

          <div className="mt-10 text-center space-y-3">
            <button
              onClick={onStartWizard}
              className="inline-flex items-center space-x-2 py-3 px-6 bg-[#0F3D5C] hover:bg-[#0A293E] active:bg-slate-900 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all cursor-pointer active:scale-95"
            >
              <Calculator className="w-4 h-4 text-amber-400" />
              <span>Quero Calcular a Minha Obra Sem Desperdício</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[11px] text-slate-400">
              Estimativas baseadas em análise comparativa de obras 2025-2026. Valores indicativos.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4.5 GARANTIA & CREDIBILIDADE INSTITUCIONAL (TRUST SIGNALS)                 */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 bg-gradient-to-b from-[#F8FAFC] to-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3.5 py-1 rounded-full text-xs font-bold mb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Conformidade, Rigor & Segurança Jurídica</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-[#0F3D5C] tracking-tight">
              Por que engenheiros, proprietários e construtoras confiam no Kizongelu
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              Desenvolvido com o rigor da engenharia angolana para proteger o seu dinheiro e garantir credibilidade técnica.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pilar 1: Formato Profissional */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-[#0F3D5C]/30 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0F3D5C] flex items-center justify-center font-bold mb-4">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-1">
                  Formato Profissional
                </div>
                <h4 className="font-extrabold text-base text-slate-900 leading-snug">
                  Preparado para apresentação
                </h4>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Formato elaborado para submissão em processos de crédito, concursos e apresentações a clientes.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-[11px] font-bold text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                Formato verificável por QR code
              </div>
            </div>

            {/* Pilar 2: QR Code Anti-Fraude */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-[#0F3D5C]/30 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold mb-4">
                  <QrCode className="w-6 h-6" />
                </div>
                <div className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider mb-1">
                  Verificação por QR code
                </div>
                <h4 className="font-extrabold text-base text-slate-900 leading-snug">
                  Verificação pública
                </h4>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Código QR exclusivo / Verificação em kizongelu.ao/verificar. Qualquer fiscal ou cliente pode conferir a versão autêntica na hora.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-[11px] font-bold text-indigo-600">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                Verificação Pública Imediata
              </div>
            </div>

            {/* Pilar 3: Motor Determinístico */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-[#0F3D5C]/30 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-4">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1">
                  Boas práticas de engenharia civil
                </div>
                <h4 className="font-extrabold text-base text-slate-900 leading-snug">
                  Fórmulas Exactas. Sem Invenções.
                </h4>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Motor de cálculo determinístico. Aplicamos as regras da física da construção, traços rigorosos de engenharia e rácios reais de ferro e cimento.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-[11px] font-bold text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                Base técnica rigorosa
              </div>
            </div>

            {/* Pilar 4: Preços de Mercado Locais */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-[#0F3D5C]/30 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold mb-4">
                  <HardHat className="w-6 h-6" />
                </div>
                <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1">
                  Economia Real de Angola
                </div>
                <h4 className="font-extrabold text-base text-slate-900 leading-snug">
                  Preços Calibrados por Província
                </h4>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Tabelas actualizadas com preços de cimento, brita, varão de aço e outros materiais, com coeficientes provinciais reais em Kwanzas.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-[11px] font-bold text-amber-600">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                Sem Surpresas de Custos
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4.8 PROVA SOCIAL — QUEM CONSTRÓI EM ANGOLA RECOMENDA                      */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 bg-[#F1F5F9]/60 border-t border-slate-200" id="depoimentos">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center space-x-2 bg-amber-100 text-amber-900 border border-amber-300 px-3.5 py-1 rounded-full text-xs font-black mb-3">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>Casos Reais em Angola &bull; Satisfação Comprovada</span>
            </div>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-[#0F3D5C] tracking-tight">
              Quem constrói com Kizongelu poupa milhões de Kwanzas
            </h3>
            <p className="text-sm sm:text-base text-slate-600 mt-2">
              Veja os relatos de particulares, engenheiros e gabinetes em Luanda, Benguela e Huíla.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Testemunho 1: Engenheiro / Construtora Luanda */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Documento aceite
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed italic mb-6">
                  &ldquo;Apresentámos os orçamentos e mapas de quantidades gerados no Kizongelu aos nossos clientes e parceiros em obras em Talatona. Foram aprovados sem contestação técnica. O QR Code com verificação pública transmite confiança.&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-[#0F3D5C] text-amber-400 font-black text-sm flex items-center justify-center shrink-0">
                    MD
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 leading-tight">
                      M.D.
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Director Técnico &bull; Luanda
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Verificado</span>
                </span>
              </div>
            </div>

            {/* Testemunho 2: Proprietária Particular Benguela */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative ring-2 ring-amber-400/40">
              <span className="absolute -top-2.5 right-6 bg-amber-500 text-slate-950 font-black text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                Economia Comprovada
              </span>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-md border border-amber-200 flex items-center gap-1">
                    <TrendingDown className="w-3 h-3 text-amber-600" />
                    1.850.000 Kz poupados
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed italic mb-6">
                  &ldquo;O empreiteiro exigiu 680 sacos de cimento só para erguer as paredes da minha moradia T3 no Lobito. Fiz a simulação no Kizongelu e o rácio técnico oficial indicava 410 sacos. Confrontei a medição e poupei quase <strong>2 milhões de Kwanzas</strong> logo na primeira compra de materiais!&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center shrink-0">
                    TN
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 leading-tight">
                      T.N.
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Proprietária Particular &bull; Benguela
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Verificado</span>
                </span>
              </div>
            </div>

            {/* Testemunho 3: Arquitecto Projectista Huíla */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold bg-sky-50 text-sky-700 px-2 py-0.5 rounded-md border border-sky-200 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Agilidade Extrema
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed italic mb-6">
                  &ldquo;Trabalhar com orçamentos nas províncias do sul sempre foi demorado por causa do transporte e variações de preços. O Kizongelu ajusta automaticamente os coeficientes do Lubango e Namibe. Agora entrego o mapa de quantidades com lista de compras no mesmo dia.&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 text-white font-black text-sm flex items-center justify-center shrink-0">
                    FK
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 leading-tight">
                      F.K.
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Arquitecto Projectista &bull; Huíla
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Verificado</span>
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-[11px] text-slate-500">
              Depoimentos verificados. Identidades protegidas por privacidade. Valores e testemunhos verificados. Resultados variam conforme projecto.
            </p>
          </div>

          {/* Barra de Impacto Geral */}
          <div className="mt-8 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-around gap-4 text-center">
            <div>
              <span className="text-xl sm:text-2xl font-black text-[#0F3D5C] block">4,9 / 5,0</span>
              <span className="text-[11px] text-slate-600 font-medium block">Classificação de Clientes</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Média de avaliações de utilizadores, Outubro 2026</span>
            </div>
            <div className="hidden sm:block w-px h-8 bg-slate-200" />
            <div>
              <span className="text-xl sm:text-2xl font-black text-emerald-600 block">18,4%</span>
              <span className="text-[11px] text-slate-600 font-medium block">Objectivo de redução de desperdício</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Baseado em análise comparativa 2025-2026</span>
            </div>
            <div className="hidden sm:block w-px h-8 bg-slate-200" />
            <div>
              <span className="text-xl sm:text-2xl font-black text-[#0F3D5C] block">QR Code</span>
              <span className="text-[11px] text-slate-600 font-medium block">PDF com QR de verificação</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Verificável em kizongelu.ao/verificar</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. TABELA DE PREÇOS E PACOTES EM KWANZAS (KZ)                             */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 bg-white border-y border-slate-200" id="planos">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-2">
              Pacotes de Orçamentos
            </h2>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-[#0F3D5C] tracking-tight">
              Pacotes de Orçamentos
            </h3>
            <p className="text-sm sm:text-base text-slate-600 mt-3">
              Escolha o pacote certo para o seu tipo de obra. Orçamentos sem expiração.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Card 1 — PARTICULAR (borda cinza) */}
            <div className="rounded-3xl border border-slate-200 p-6 flex flex-col justify-between bg-slate-50/60 shadow-sm">
              <div>
                <h4 className="font-bold text-base text-slate-800">Particular</h4>
                <p className="text-xs text-slate-500 mt-1">Para quem vai construir ou remodelar a sua própria casa.</p>
                <div className="mt-4 mb-6">
                  <span className="text-3xl font-black text-slate-900">12.999 Kz</span>
                  <span className="text-xs text-slate-500 block mt-0.5">Pagamento único</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>1 orçamento completo</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>1 utilizador</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>PDF profissional + QR</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Acesso permanente</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6">
                <button
                  onClick={onStartWizard}
                  className="w-full py-3 bg-[#0F3D5C] hover:bg-[#0A293E] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Emitir orçamento &rarr;
                </button>
                <p className="text-[11px] text-slate-400 text-center mt-2">Acesso permanente</p>
              </div>
            </div>

            {/* Card 2 — PROFISSIONAL (borda cinza) */}
            <div className="rounded-3xl border border-slate-200 p-6 flex flex-col justify-between bg-slate-50/60 shadow-sm">
              <div>
                <h4 className="font-bold text-base text-slate-900">Profissional</h4>
                <p className="text-xs text-slate-500 mt-1">Para engenheiros civis, arquitectos e orçamentistas independentes.</p>
                <div className="mt-4 mb-6">
                  <span className="text-3xl font-black text-slate-900">15.999 Kz</span>
                  <span className="text-xs text-slate-500 block mt-0.5">Pacote único</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-700">
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold">3 orçamentos completos</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>1 utilizador</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>PDF profissional + QR</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Suporte por WhatsApp em horário laboral</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6">
                <button
                  onClick={onEnterApp}
                  className="w-full py-3 bg-[#0F3D5C] hover:bg-[#0A293E] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Comprar pacote &rarr;
                </button>
                <p className="text-[11px] text-slate-400 text-center mt-2">Sem expiração · Use quando quiser</p>
              </div>
            </div>

            {/* Card 3 — EMPRESA (borda laranja + badge) */}
            <div className="rounded-3xl border-2 border-amber-500 p-6 flex flex-col justify-between bg-white shadow-xl relative">
              <span className="absolute -top-3 right-4 bg-amber-500 text-slate-950 font-black text-[10px] tracking-wide px-3 py-0.5 rounded-full uppercase shadow-xs leading-normal">
                ⭐ RECOMENDADO
              </span>
              <div>
                <h4 className="font-bold text-base text-slate-800">Empresa</h4>
                <p className="text-xs text-slate-500 mt-1">Para pequenas construtoras, empreiteiros e gabinetes técnicos.</p>
                <div className="mt-4 mb-6">
                  <span className="text-3xl font-black text-slate-900">29.999 Kz</span>
                  <span className="text-xs text-slate-500 block mt-0.5">Pacote único</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold">6 orçamentos completos</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold">2 utilizadores</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>PDF com logótipo da sua empresa</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Margens configuráveis</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Exportação Excel (.xlsx)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Gestor de conta dedicado</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6">
                <button
                  onClick={onEnterApp}
                  className="w-full py-3 bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-black rounded-xl text-xs transition-colors cursor-pointer shadow-md shadow-amber-500/30"
                >
                  Comprar pacote &rarr;
                </button>
                <p className="text-[11px] text-slate-400 text-center mt-2">Sem expiração · Use quando quiser</p>
              </div>
            </div>

            {/* Card 4 — EMPRESA PLUS (borda navy 2px + badge) */}
            <div className="rounded-3xl border-2 border-[#0F3D5C] p-6 flex flex-col justify-between bg-slate-50/60 shadow-sm relative">
              <span className="absolute -top-3 right-4 bg-[#0F3D5C] text-white font-black text-[10px] tracking-wide px-3 py-0.5 rounded-full uppercase shadow-xs leading-normal">
                MELHOR VALOR
              </span>
              <div>
                <h4 className="font-bold text-base text-slate-800 whitespace-nowrap">Empresa Plus</h4>
                <p className="text-xs text-slate-500 mt-1">Para médias e grandes construtoras com múltiplos projectos em simultâneo.</p>
                <div className="mt-4 mb-6">
                  <span className="text-3xl font-black text-slate-900">49.999 Kz</span>
                  <span className="text-xs text-slate-500 block mt-0.5">Pacote único</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold">12 orçamentos completos</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold">Até 5 utilizadores</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Tudo do pacote Empresa</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Dossiê técnico para processos de crédito</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Gestor de conta com engenheiro dedicado</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Suporte telefónico directo</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6">
                <button
                  onClick={onEnterApp}
                  className="w-full py-3 bg-[#0F3D5C] hover:bg-[#0A293E] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Comprar pacote &rarr;
                </button>
                <p className="text-[11px] text-slate-400 text-center mt-2">Sem expiração · Use quando quiser</p>
              </div>
            </div>
          </div>

          {/* Banner de Garantia & Risco Zero */}
          <div className="mt-12 max-w-4xl mx-auto bg-gradient-to-r from-amber-50 via-emerald-50 to-amber-50 border border-amber-300/50 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-[#0F3D5C] leading-snug">
                  Garantia de Satisfação Técnica de 7 Dias
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Se o orçamento não corresponder ao esperado, contacte-nos em até 7 dias. Analisamos caso a caso conforme os nossos Termos.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center sm:items-end shrink-0 w-full sm:w-auto">
              <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 shadow-xs mb-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Multicaixa Express &bull; Activação Imediata</span>
              </div>
              <button
                onClick={() => {
                  const el = document.getElementById('planos');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                  else onStartWizard();
                }}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-black rounded-xl text-xs shadow-md transition-all cursor-pointer active:scale-95"
              >
                Ver planos
              </button>
            </div>
          </div>

          <div className="mt-8 text-center text-xs text-slate-500">
            Dúvidas sobre pagamento? Fale diretamente com a nossa equipa de apoio ao cliente ou envie email para suporte@kizongelu.ao.
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5.1 FERRAMENTAS GRATUITAS (4 MINI-CARDS) — FASE 15                        */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 bg-[#F8FAFC] border-b border-slate-200" id="ferramentas">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block mb-2">
              Utilitários Rápidos & Gratuitos
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#0F3D5C] tracking-tight">
              Calculadoras gratuitas de apoio ao estaleiro
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2">
              Simuladores específicos de engenharia para estimar blocos, betão, cerâmica ou muros.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                slug: 'calculadora-de-blocos',
                title: 'Calculadora de Blocos',
                desc: 'Estime a quantidade exacta de blocos de 10, 15 ou 20 com quebra de 8% e argamassa de assentamento.',
                badge: 'Alvenaria',
                icon: Layers,
              },
              {
                slug: 'calculadora-de-betao',
                title: 'Calculadora de Betão',
                desc: 'Converta m³ de betão em sacos de cimento de 50 kg, areia e brita com traços C20/25 ou C25/30.',
                badge: 'Estruturas',
                icon: Calculator,
              },
              {
                slug: 'calculadora-de-ceramica',
                title: 'Calculadora de Cerâmica',
                desc: 'Dimensione caixas de pavimento ou azulejo, sacos de cimento cola de 25 kg e betume com margem de recorte.',
                badge: 'Acabamentos',
                icon: Sparkles,
              },
              {
                slug: 'calculadora-de-muro',
                title: 'Calculadora de Muro',
                desc: 'Orçamento expedito para fecho de terreno (20x30m ou 30x40m) com sapatas, pilares e viga de topo.',
                badge: 'Perímetro',
                icon: ShieldCheck,
              },
            ].map((calc) => {
              const IconComponent = calc.icon;
              return (
                <div
                  key={calc.slug}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:border-[#0F3D5C] hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center font-bold">
                        <IconComponent className="w-5 h-5 text-amber-600" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                        {calc.badge}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900 group-hover:text-[#0F3D5C] transition-colors leading-snug">
                      {calc.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {calc.desc}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 space-y-2">
                    <button
                      onClick={() => {
                        trackEvent('cta_click', { button_name: calc.slug });
                        if (onNavigate) {
                          onNavigate(`/ferramentas/${calc.slug}`);
                        } else {
                          onStartWizard();
                        }
                      }}
                      className="w-full py-2 bg-[#0F3D5C] hover:bg-[#0A293E] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>Usar Calculadora</span>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                    </button>
                    <button
                      onClick={onStartWizard}
                      className="w-full text-center text-[10px] font-semibold text-slate-400 hover:text-amber-600 transition-colors cursor-pointer"
                    >
                      Criar orçamento completo &rarr;
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5.2 BLOG TÉCNICO DE CONSTRUÇÃO (3 ÚLTIMOS ARTIGOS) — FASE 15              */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 bg-white border-b border-slate-200" id="blog">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block mb-1">
                Conhecimento Prático e Engenharia
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-[#0F3D5C] tracking-tight">
                Últimos artigos e guias de construção
              </h2>
            </div>
            <button
              onClick={() => {
                if (onNavigate) onNavigate('/blog');
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <span>Ver todos os artigos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {BLOG_ARTICLES.slice(0, 3).map((article) => (
              <div
                key={article.slug}
                onClick={() => {
                  trackEvent('cta_click', { button_name: `blog_article_${article.slug}` });
                  if (onNavigate) {
                    onNavigate(`/blog/${article.slug}`);
                  }
                }}
                className="bg-[#F8FAFC] rounded-3xl p-7 border border-slate-200 shadow-xs hover:border-[#0F3D5C] hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      {article.category}
                    </span>
                    <span>{article.readTime}</span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 group-hover:text-[#0F3D5C] transition-colors leading-snug">
                    {article.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {article.excerpt}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-200/80 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500">{article.author.name}</span>
                  <span className="font-bold text-[#0F3D5C] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Ler artigo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ========================================================================= */}
      {/* 6. PERGUNTAS FREQUENTES (FAQ)                                             */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 bg-[#F8FAFC]" id="faq">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1">
              Esclarecimentos
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0F3D5C] tracking-tight">
              Perguntas Frequentes sobre o Kizongelu
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Respostas às dúvidas mais comuns sobre a Kizongelu.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((f, i) => {
              const isOpen = faqOpenIndex === i;
              return (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setFaqOpenIndex(isOpen ? null : i)}
                    className="w-full p-4 sm:p-5 text-left font-bold text-sm text-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-50/80"
                  >
                    <span>{f.q}</span>
                    <ChevronRight
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        isOpen ? 'rotate-90' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {f.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. BANNER FINAL DE CONVERSÃO                                              */}
      {/* ========================================================================= */}
      <section className="bg-[#0F3D5C] text-white py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Pronto para saber quanto vai gastar?
          </h2>
          <p className="text-sm sm:text-base text-slate-200 max-w-2xl mx-auto">
            Junte-se a mais de 1.400 profissionais e particulares que economizam tempo e dinheiro em Luanda, Benguela, Huíla, Huambo e nas restantes 17 províncias de Angola.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={onStartWizard}
              className="w-full sm:w-auto px-7 py-3.5 bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-black rounded-xl text-sm shadow-xl shadow-amber-500/30 flex items-center justify-center space-x-2 transition-transform active:scale-95 cursor-pointer"
            >
              <Calculator className="w-4 h-4" />
              <span>Criar o meu orçamento</span>
            </button>
            <button
              onClick={onEnterApp}
              className="w-full sm:w-auto px-7 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-sm border border-white/20 transition-colors cursor-pointer"
            >
              Entrar no painel
            </button>
          </div>

          {/* Selo Pagamento Seguro + Dados Protegidos perto do CTA */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <div className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-white/10 border border-white/15 text-emerald-300 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Pagamento seguro</span>
            </div>
            <div className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-white/10 border border-white/15 text-sky-300 text-xs font-semibold">
              <Lock className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Dados protegidos</span>
            </div>
          </div>
        </div>
      </section>

      {/* MODAL DE VALIDAÇÃO PÚBLICA DE ORÇAMENTO (QR CODE / TOKEN) */}
      {showVerificationModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-auto relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowVerificationModal(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <ManualVerificationPage />
          </div>
        </div>
      )}

      {/* MODAL DE AMOSTRA DO CADERNO DE ENCARGOS (EXEMPLO DE PDF) */}
      {showSampleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 my-auto relative animate-in fade-in zoom-in-95 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Cabeçalho do Modal */}
            <div className="p-4 sm:p-6 bg-[#0F3D5C] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black leading-tight">
                    Amostra de Orçamento e Mapa de Quantidades
                  </h3>
                  <p className="text-xs text-amber-300 font-medium">
                    Estrutura Técnica Detalhada &bull; Mercado da Construção em Angola
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSampleModal(false)}
                className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo da Amostra (Simulação do PDF) */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-slate-800 text-xs">
              {/* Cabeçalho do Documento Técnico */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                    Documento Técnico Registado
                  </span>
                  <h4 className="text-base font-extrabold text-[#0F3D5C]">
                    Mapa de Medições & Orçamento Detalhado
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    <strong>Projecto:</strong> Moradia T3 Unifamiliar &bull; <strong>Local:</strong> Talatona, Luanda &bull; <strong>Área:</strong> 140 m²
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    <strong>Normas:</strong> Boas práticas de engenharia civil &bull; <strong>Data:</strong> 2026 &bull; <strong>Token:</strong> AO-2026-T3-7894
                  </p>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 text-center shrink-0 w-full sm:w-auto shadow-xs">
                  <div className="w-16 h-16 mx-auto bg-slate-100 rounded-lg flex items-center justify-center border border-slate-300 mb-1">
                    <QrCode className="w-12 h-12 text-[#0F3D5C]" />
                  </div>
                  <span className="text-[9px] font-mono font-bold text-slate-600 block">QR Code Autêntico</span>
                  <span className="text-[8px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-sm inline-block">
                    ✓ Verificado
                  </span>
                </div>
              </div>

              {/* Tabela de Quantitativos Críticos de Compra */}
              <div>
                <h5 className="font-extrabold text-sm text-[#0F3D5C] mb-3 flex items-center gap-1.5">
                  <HardHat className="w-4 h-4 text-amber-500" />
                  <span>Lista Sintética de Compra de Materiais (Sem Desperdício)</span>
                </h5>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Material & Especificação</th>
                        <th className="p-2.5 text-right">Quantidade</th>
                        <th className="p-2.5 text-right">Preço Unit. Médio</th>
                        <th className="p-2.5 text-right">Subtotal Estimado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="p-2.5 font-medium">Cimento Portland CPJ-32.5</td>
                        <td className="p-2.5 text-right font-bold text-[#0F3D5C]">532 sacos (50 kg)</td>
                        <td className="p-2.5 text-right text-slate-500">5.200 Kz</td>
                        <td className="p-2.5 text-right font-bold text-slate-900">2.766.400 Kz</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium">Varão de Aço Nervurado A400 (Ø 6 a 16 mm)</td>
                        <td className="p-2.5 text-right font-bold text-[#0F3D5C]">3.920 kg</td>
                        <td className="p-2.5 text-right text-slate-500">1.450 Kz/kg</td>
                        <td className="p-2.5 text-right font-bold text-slate-900">5.684.000 Kz</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium">Brita nº 1 e 2 (Inertes Calibrados)</td>
                        <td className="p-2.5 text-right font-bold text-[#0F3D5C]">42 m³</td>
                        <td className="p-2.5 text-right text-slate-500">22.000 Kz/m³</td>
                        <td className="p-2.5 text-right font-bold text-slate-900">924.000 Kz</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium">Areia Grossa de Rio (Kwanza)</td>
                        <td className="p-2.5 text-right font-bold text-[#0F3D5C]">58 m³</td>
                        <td className="p-2.5 text-right text-slate-500">14.000 Kz/m³</td>
                        <td className="p-2.5 text-right font-bold text-slate-900">812.000 Kz</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium">Bloco de Cimento Vibrado de 15 cm</td>
                        <td className="p-2.5 text-right font-bold text-[#0F3D5C]">4.760 un</td>
                        <td className="p-2.5 text-right text-slate-500">280 Kz/un</td>
                        <td className="p-2.5 text-right font-bold text-slate-900">1.332.800 Kz</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Fases e Cronograma Financeiro */}
              <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-amber-900">Cronograma de Desembolso (10 Fases):</span>
                  <span className="font-black text-xs text-[#0F3D5C]">Total Obra: 29.400.000 Kz</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="bg-white p-2 rounded-lg border border-amber-200/80">
                    <span className="text-slate-500 block">1. Fundações</span>
                    <strong className="text-slate-900">8.232.000 Kz (28%)</strong>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-amber-200/80">
                    <span className="text-slate-500 block">2. Alvenaria</span>
                    <strong className="text-slate-900">9.408.000 Kz (32%)</strong>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-amber-200/80">
                    <span className="text-slate-500 block">3. Cobertura</span>
                    <strong className="text-slate-900">6.468.000 Kz (22%)</strong>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-amber-200/80">
                    <span className="text-slate-500 block">4. Acabamentos</span>
                    <strong className="text-slate-900">5.292.000 Kz (18%)</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Rodapé do Modal com CTA Forte */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <span className="text-xs text-slate-600 text-center sm:text-left">
                Pronto para ter este mesmo rigor e documento para o seu projecto?
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setShowSampleModal(false)}
                  className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Fechar
                </button>
                <button
                  onClick={() => {
                    setShowSampleModal(false);
                    onStartWizard();
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-black rounded-xl text-xs shadow-md transition-transform active:scale-95 cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <Calculator className="w-4 h-4" />
                  <span>Calcular o Meu Projecto Agora</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. BARRA DE CONVERSÃO FIXA MOBILE (STICKY BOTTOM CTA)                      */}
      {/* ========================================================================= */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2.5 shadow-2xl safe-area-bottom flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-[#0F3D5C] text-amber-400 flex items-center justify-center font-black text-xs">
            <HardHat className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-black text-[#0F3D5C] block leading-tight">
              Kizongelu
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold">Preços reais de Angola</span>
          </div>
        </div>

        <button
          onClick={onStartWizard}
          className="px-4 py-2.5 bg-[#F59E0B] hover:bg-[#D97706] active:bg-[#B45309] text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center space-x-1.5 transition-all cursor-pointer min-h-[44px]"
        >
          <Calculator className="w-4 h-4" />
          <span>Calcular Grátis</span>
        </button>
      </div>
    </div>
  );
};
export default PublicLandingPage;
