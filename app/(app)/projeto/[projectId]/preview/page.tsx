/**
 * @file app/(app)/projeto/[projectId]/preview/page.tsx
 * Página de Pré-Visualização, Confiança e Paywall .
 */

import React, { useEffect, useState } from 'react';
import { getPreview, ProjectPreviewData, UNLOCK_PRICE_KZ } from '../../../../../lib/actions/preview';
import { ProcessingScreen } from './processing-screen';
import { PaywallModal } from './paywall-modal';
import { PdfPreviewModal } from './pdf-preview-modal';
import { aiService } from '../../../../../lib/ai-service';
import { AiResult } from '../../../../../lib/ai-service/types';
import { AiExplanationDrawer } from '../../../../../components/ui/ai-explanation-drawer';
import { AiBadge } from '../../../../../components/ui/ai-badge';
import { TourOverlay } from '@/src/components/onboarding/TourOverlay';
import { previewTour, getUserToursSeen } from '@/lib/tours';
import { useAuth } from '@/src/auth/auth-context';
import {
  Lock,
  Unlock,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Download,
  Calendar,
  Layers,
  Home,
  MapPin,
  Sparkles,
  ArrowRight,
  TrendingUp,
  HelpCircle,
  Clock,
  Coins,
  ChevronDown,
} from 'lucide-react';

interface PreviewPageProps {
  projectId?: string;
  onNavigateToOverview?: () => void;
}

export const ProjectPreviewPage: React.FC<PreviewPageProps> = ({
  projectId = 'proj_sample_01',
  onNavigateToOverview,
}) => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [data, setData] = useState<ProjectPreviewData | null>(null);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [interactiveMilestone, setInteractiveMilestone] = useState<'cobertura' | 'estrutura' | 'chave_na_mao'>('cobertura');

  // Estado do Drawer de Explicação por IA
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiExplanationResult, setAiExplanationResult] = useState<AiResult | null>(null);

  const handleExplainBudget = async () => {
    setIsAiDrawerOpen(true);
    if (!aiExplanationResult && data) {
      setIsAiLoading(true);
      try {
        const res = await aiService.explainResult(data, {
          province: data.summary.province,
          projectTitle: data.title,
        });
        setAiExplanationResult(res);
      } catch (err) {
        console.warn('Erro ao obter explicação de IA:', err);
      } finally {
        setIsAiLoading(false);
      }
    }
  };

  // Carrega dados de preview
  const loadData = async () => {
    try {
      const res = await getPreview(projectId);
      setData(res);
    } catch (err) {
      console.error('Erro ao carregar preview:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  const { currentUser } = useAuth();
  const [isTourOpen, setIsTourOpen] = useState(false);

  useEffect(() => {
    if (!isProcessing && data) {
      const toursSeen = getUserToursSeen(currentUser.id);
      if (!toursSeen.preview) {
        setTimeout(() => setIsTourOpen(true), 600);
      }
    }
  }, [isProcessing, data, currentUser.id]);

  if (isProcessing) {
    return <ProcessingScreen onComplete={() => setIsProcessing(false)} />;
  }

  if (!data) {
    return (
      <div className="p-12 text-center text-slate-500 font-sans">
        A carregar dados do projeto...
      </div>
    );
  }

  // Cor e texto do badge de confiança
  const confidenceColor =
    data.confidence.level === 'HIGH'
      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
      : data.confidence.level === 'MEDIUM'
      ? 'bg-amber-50 text-amber-800 border-amber-200'
      : 'bg-rose-50 text-rose-800 border-rose-200';

  const confidenceBadgeText =
    data.confidence.level === 'HIGH'
      ? 'Confiança Alta'
      : data.confidence.level === 'MEDIUM'
      ? 'Confiança Média'
      : 'Confiança Baixa';

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 sm:pb-16 font-['Inter',sans-serif]">
      {/* Top Banner de Estado */}
      <div className="bg-[#0A293E] text-white py-4 px-4 sm:px-6 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${data.isUnlocked ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-slate-950'}`}>
              {data.isUnlocked ? 'ORÇAMENTO DESBLOQUEADO' : 'PRÉ-VISUALIZAÇÃO'}
            </span>
            <span className="text-xs text-slate-300 font-medium truncate max-w-sm">
              {data.title} • {data.summary.municipality}, {data.summary.province}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleExplainBudget}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Explicar o meu orçamento</span>
            </button>

            {!data.isUnlocked ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsPaywallOpen(true)}
                  className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Desbloquear PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPaywallOpen(true)}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-amber-500 hover:from-emerald-400 hover:to-amber-400 text-slate-950 rounded-xl text-xs font-black flex items-center space-x-1.5 transition-all shadow-md cursor-pointer active:scale-95"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Desbloquear Orçamento Completo (1 Crédito)</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setIsPdfModalOpen(true)}
                  className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ver / Descarregar PDF</span>
                </button>

                {onNavigateToOverview && (
                  <button
                    type="button"
                    onClick={onNavigateToOverview}
                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <span>Visão Geral do Projecto</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Layout 2 Colunas (Desktop) / Empilhado (Mobile) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ================= COLUNA ESQUERDA — RESUMO ================= */}
          <div className="lg:col-span-5 space-y-6">
            {/* Card Principal: Total Estimado */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs relative overflow-hidden">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Valor Global Estimado da Obra
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-mono">
                  {data.totals.grandTotal.toLocaleString('pt-PT')}
                </span>
                <span className="text-base font-extrabold text-amber-600">Kz</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Estimativa paramétrica incluindo materiais, mão de obra e transporte regional.
              </p>

              {/* Decomposição do Fecho Financeiro: Custos Diretos + BDI + IVA */}
              {data.totals.financialClosing && (
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Custo Direto (Materiais + MO + Frete):</span>
                    <span className="font-bold font-mono text-slate-800">
                      {data.totals.financialClosing.directCost.toLocaleString('pt-PT')} Kz
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>BDI Analítico (21,5%):</span>
                    <span className="font-bold font-mono text-slate-800">
                      +{data.totals.financialClosing.bdi.bdiAmount.toLocaleString('pt-PT')} Kz
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-amber-900 bg-amber-50 p-2 rounded-lg font-semibold">
                    <span>Base Tributável (Preço sem IVA):</span>
                    <span className="font-mono">
                      {data.totals.financialClosing.baseTributavel.toLocaleString('pt-PT')} Kz
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>IVA Geral (14% AGT):</span>
                    <span className="font-bold font-mono text-slate-800">
                      +{data.totals.financialClosing.taxes.ivaAmount.toLocaleString('pt-PT')} Kz
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    <span>* Retenção na Fonte (6,5% AGT):</span>
                    <span className="font-mono text-slate-600">
                      -{data.totals.financialClosing.taxes.retencaoFonteAmount.toLocaleString('pt-PT')} Kz
                    </span>
                  </div>
                </div>
              )}

              {/* Botão de Explicação Assistida por IA */}
              <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleExplainBudget}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Explicar este cálculo</span>
                </button>
                <AiBadge />
              </div>

              {/* Badge de Confiança */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Índice de Confiança:</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${confidenceColor}`}>
                    {confidenceBadgeText} ({data.confidence.score}/100)
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {data.confidence.reasons.join(' • ')}
                </p>
              </div>

              {/* Auditoria de Consistência e Alertas (Fase 4) */}
              {data.alerts && data.alerts.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      Alertas de Engenharia
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                      {data.alerts.length} Detetados
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {data.alerts.slice(0, 2).map((alt: any) => (
                      <div key={alt.id} className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-[11px]">
                        <span className="font-bold text-slate-800 block">{alt.title}</span>
                        <span className="text-slate-500 text-[10px] leading-tight block mt-0.5">{alt.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Comparação com o Orçamento Indicado pelo Cliente */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-500" />
                Comparação Orçamental
              </h4>

              {data.budgetComparison.targetBudgetValue !== null ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                      <span className="text-slate-400 block text-[11px]">Estimativa Técnica</span>
                      <span className="font-extrabold font-mono text-slate-900 text-sm">
                        {data.totals.grandTotal.toLocaleString('pt-PT')} Kz
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                      <span className="text-slate-400 block text-[11px]">Orçamento Indicado</span>
                      <span className="font-extrabold font-mono text-slate-900 text-sm">
                        {data.budgetComparison.targetBudgetLabel}
                      </span>
                    </div>
                  </div>

                  {/* Diferença e Mensagem */}
                  <div
                    className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                      data.budgetComparison.status === 'ABOVE'
                        ? 'bg-amber-50/70 border-amber-200 text-amber-950 font-medium'
                        : 'bg-emerald-50/70 border-emerald-200 text-emerald-950 font-medium'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold mb-1">
                      <span>Diferença Orçamental:</span>
                      <span className="font-mono">
                        {data.budgetComparison.difference > 0 ? '+' : ''}
                        {data.budgetComparison.difference.toLocaleString('pt-PT')} Kz
                      </span>
                    </div>
                    <p>{data.budgetComparison.message}</p>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
                  {data.budgetComparison.message}
                </div>
              )}
            </div>

            {/* Ficha Síntese da Construção */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3 text-xs">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                Características da Construção
              </h4>

              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div className="flex items-center space-x-2">
                  <Home className="w-4 h-4 text-slate-400" />
                  <span>Tipo: <strong>{data.summary.typeLabel}</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>Local: <strong>{data.summary.province}</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-slate-400" />
                  <span>Área: <strong>{data.summary.area} m²</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-slate-400" />
                  <span>Acabamento: <strong>{data.summary.finishLevelLabel}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= COLUNA DIREITA — CAPÍTULOS ================= */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs relative">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    Capítulos da Obra
                  </h3>
                  <p className="text-xs text-slate-500">
                    Primeiros 3 capítulos abertos para pré-visualização. Restantes bloqueados.
                  </p>
                </div>
                {!data.isUnlocked && (
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    3 Capítulos Bloqueados
                  </span>
                )}
              </div>

              {/* Tabela dos 6 Capítulos */}
              <div className="space-y-3 relative">
                {data.chapters.map((ch) => (
                  <div
                    key={ch.id}
                    className={`rounded-2xl border transition-all p-4 ${
                      ch.isLocked
                        ? 'border-slate-200 bg-slate-50/50 filter blur-[1.8px] select-none opacity-60'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-black font-mono text-xs">
                          {ch.number}
                        </span>
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-900">{ch.name}</h4>
                          <span className="text-[11px] text-slate-400">Representa {ch.percentage}% do custo total</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-mono font-bold text-sm text-slate-900">
                          {ch.subtotal.toLocaleString('pt-PT')} Kz
                        </span>
                      </div>
                    </div>

                    {/* Amostra de Itens para capítulos abertos */}
                    {ch.sampleItems && ch.sampleItems.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                        {ch.sampleItems.map((item, iIdx) => (
                          <div key={iIdx} className="flex justify-between items-center text-[11px]">
                            <span className="text-slate-700">{item.name}</span>
                            <span className="font-mono text-slate-500">
                              {item.quantity} {item.unit} • {item.total.toLocaleString('pt-PT')} Kz
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Camada Sobreposta de Paywall nos Capítulos Bloqueados */}
                {!data.isUnlocked && (
                  <div className="absolute inset-x-0 bottom-0 top-[52%] flex flex-col items-center justify-center p-6 bg-slate-900/40 backdrop-blur-[2px] rounded-2xl text-center z-20">
                    <span className="text-xs font-black tracking-widest uppercase text-amber-300 px-3 py-1 rounded-full bg-slate-900/80 mb-2 border border-amber-400/30">
                      PRÉ-VISUALIZAÇÃO LIMITADA
                    </span>
                    <h4 className="text-base sm:text-lg font-black text-white drop-shadow-md">
                      Desbloqueie o Mapa de Quantidades Completo
                    </h4>
                    <p className="text-xs text-slate-200 mt-1 max-w-sm drop-shadow-sm">
                      Acesso integral a Cobertura, Instalações Técnicas, Acabamentos e exportação para PDF e Excel.
                    </p>

                    <button
                      type="button"
                      onClick={() => setIsPaywallOpen(true)}
                      className="mt-4 px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded-xl transition-all shadow-lg shadow-amber-500/30 flex items-center space-x-2 cursor-pointer active:scale-98"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Desbloquear Orçamento Completo (1 Crédito)</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ================= SECÇÃO: ORÇAMENTO POR FASES (TIMELINE) ================= */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-500" />
                Orçamento por Fases da Construção (Cronograma)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Timeline vertical de 10 etapas construtivas com previsão de custos acumulados.
              </p>
            </div>

            {/* Campo Interativo: Quanto preciso para chegar à cobertura? */}
            <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs max-w-md">
              <span className="font-extrabold text-amber-950 block mb-0.5 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-amber-600" />
                Quanto preciso para chegar à cobertura?
              </span>
              <p className="text-amber-900 leading-relaxed text-[11px]">
                {data.milestoneCoverage.coberturaMessage}
              </p>
            </div>
          </div>

          {/* Timeline de 10 Fases */}
          <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-200 space-y-6 pt-2">
            {data.phases.map((phase) => (
              <div
                key={phase.number}
                className={`relative group ${
                  phase.isLocked
                    ? 'filter blur-[1.5px] opacity-60 select-none'
                    : ''
                }`}
              >
                {/* Marcador na linha */}
                <div
                  className={`absolute -left-[31px] sm:-left-[39px] top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold font-mono ${
                    phase.number === 1
                      ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-xs'
                      : 'bg-white border-slate-300 text-slate-500'
                  }`}
                >
                  {phase.number}
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h5 className="font-extrabold text-sm text-slate-900">
                      Etapa {phase.number}: {phase.name}
                    </h5>
                    <p className="text-xs text-slate-500 mt-0.5">{phase.description}</p>
                  </div>

                  <div className="text-right sm:flex-shrink-0">
                    <span className="font-mono font-bold text-sm text-slate-900 block">
                      {phase.cost.toLocaleString('pt-PT')} Kz
                    </span>
                    <span className="text-[11px] text-slate-400 block font-mono">
                      Acumulado: {phase.accumulatedCost.toLocaleString('pt-PT')} Kz
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Barra Fixa em Mobile (Fundo do ecrã) */}
      {!data.isUnlocked && (
        <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 sm:hidden z-40">
          <button
            type="button"
            onClick={() => setIsPaywallOpen(true)}
            className="w-full min-h-[56px] bg-amber-500 active:bg-amber-400 text-slate-950 font-black text-sm rounded-xl transition-all shadow-md shadow-amber-500/20 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            <span>Desbloquear Orçamento Completo (1 Crédito)</span>
          </button>
        </div>
      )}

      {/* Modal de Paywall Adaptativo */}
      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        projectId={projectId}
        userType={data.userType}
        hasActiveSubscription={data.hasActiveSubscription}
        onUnlocked={() => {
          loadData();
          if (onNavigateToOverview) {
            onNavigateToOverview();
          }
        }}
      />

      {/* Modal de Visualização de PDF */}
      <PdfPreviewModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        data={data}
        onOpenPaywall={() => {
          setIsPdfModalOpen(false);
          setIsPaywallOpen(true);
        }}
      />

      {/* Drawer Lateral de Explicação por IA */}
      <AiExplanationDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        result={aiExplanationResult}
        isLoading={isAiLoading}
      />

      {/* Fase 14: Tour Contextual de Pré-visualização */}
      <TourOverlay
        userId={currentUser.id}
        tour={previewTour}
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
      />
    </div>
  );
};

export default ProjectPreviewPage;
