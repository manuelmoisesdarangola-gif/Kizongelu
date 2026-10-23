/**
 * @file app/(app)/painel/page.tsx
 * Página Principal do Dashboard .
 * - Saudação "Bom dia / Boa tarde, [Nome]" + data em português angolano.
 * - 4 KPI cards: Projetos · Orçamentos Concluídos · Pagamentos Pendentes · Plano Atual.
 * - KPIs extras para Perfis Profissionais (Valor Médio, Taxa de Conversão, Clientes).
 * - Secção "Projetos Recentes" com badges, valor em Kz e ações rápidas.
 * - Widget "Saldo de Pacote" com créditos disponíveis e botão para novos pacotes.
 * - Empty State amigável se novo utilizador.
 */

import React, { useState, useEffect } from 'react';
import {
  FolderKanban,
  FileCheck2,
  Clock,
  Crown,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Users,
  Copy,
  FileText,
  AlertCircle,
  HardHat,
  ChevronRight,
  Sparkles,
  Layers,
  CheckCircle2,
  ShieldCheck,
  Package,
} from 'lucide-react';
import { useAuth, getDefaultCredits } from '@/src/auth/auth-context';
import {
  listProjects,
  duplicateProject,
  archiveProject,
  ProjectListItem,
  getProfessionalKpis,
} from '@/lib/actions/projects';
import { getUserCredits } from '@/lib/actions/packages';
import { formatCurrencyKz } from '@/lib/format/currency';
import { useToast } from '@/src/context/ToastContext';
import {
  EmptyState,
  ErrorState,
  KpiGridSkeleton,
  TableSkeleton,
} from '@/src/components/common/UIStates';
import { OnboardingChecklist } from '@/src/components/onboarding/OnboardingChecklist';
import { ResumeDraftModal } from '@/src/components/onboarding/ResumeDraftModal';
import { TourOverlay } from '@/src/components/onboarding/TourOverlay';
import { dashboardTour, getUserToursSeen, markTourSeen } from '@/lib/tours';

interface PainelPageProps {
  onNewBudget: () => void;
  onOpenProject: (projectId: string) => void;
  onNavigateToProjects: () => void;
  onNavigateToPlan: () => void;
  onNavigateToPayments: () => void;
}

export const PainelPage: React.FC<PainelPageProps> = ({
  onNewBudget,
  onOpenProject,
  onNavigateToProjects,
  onNavigateToPlan,
  onNavigateToPayments,
}) => {
  const { currentUser } = useAuth();
  const { success, error, info } = useToast();

  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Fase 14: Estado de Retoma de Rascunho e Tour
  const [resumeDraft, setResumeDraft] = useState<ProjectListItem | null>(null);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);

  // Normalização de Role
  const normalizedRole = (currentUser?.role || '').toUpperCase();
  const isAdmin = normalizedRole === 'ADMIN';
  const showProMetrics = ['PROFISSIONAL', 'EMPRESA', 'EMPRESA_PLUS'].includes(normalizedRole);

  // Bloco 6.3: Saldo de Créditos de Pacotes (Dinâmico)
  const [credits, setCredits] = useState<number>(() => {
    if (isAdmin) return 999999;
    if (typeof currentUser?.orçamentosDisponiveis === 'number') {
      return currentUser.orçamentosDisponiveis;
    }
    return getDefaultCredits(currentUser?.role);
  });
  const [loadingCredits, setLoadingCredits] = useState(false);

  const loadCredits = async () => {
    try {
      const available = await getUserCredits(currentUser.id, currentUser.role);
      setCredits(available);
    } catch (e: any) {
      console.warn('Erro ao carregar créditos do utilizador', e);
      if (isAdmin) {
        setCredits(999999);
      } else if (typeof currentUser?.orçamentosDisponiveis === 'number') {
        setCredits(currentUser.orçamentosDisponiveis);
      } else {
        setCredits(getDefaultCredits(currentUser?.role));
      }
    } finally {
      setLoadingCredits(false);
    }
  };

  const loadProjects = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await listProjects(currentUser.id, currentUser.role);
      setProjects(data);

      // Verifica se existe rascunho pendente para o modal de retoma
      const draft = data.find((p) => p.status === 'DRAFT' || p.status === 'ESTIMATED');
      if (draft) {
        setResumeDraft(draft);
        setIsResumeModalOpen(true);
      }

      // Verifica se o utilizador já viu o dashboard tour
      const toursSeen = getUserToursSeen(currentUser.id);
      if (!toursSeen.dashboard) {
        // Exibe o tour após carregar
        setTimeout(() => setIsTourOpen(true), 600);
      }
    } catch (e: any) {
      console.warn('Erro ao carregar projetos', e);
      setLoadError(e?.message || 'Falha ao carregar dados do painel de orçamentos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleTourUpdate = () => {
      const toursSeen = getUserToursSeen(currentUser.id);
      if (!toursSeen.dashboard) {
        setIsTourOpen(true);
      }
    };
    const handlePackagesUpdate = () => {
      loadCredits();
    };

    window.addEventListener('kizongelu:tour:updated', handleTourUpdate);
    window.addEventListener('kizongelu_packages_updated', handlePackagesUpdate);
    return () => {
      window.removeEventListener('kizongelu:tour:updated', handleTourUpdate);
      window.removeEventListener('kizongelu_packages_updated', handlePackagesUpdate);
    };
  }, [currentUser.id]);

  useEffect(() => {
    loadProjects();
    loadCredits();
  }, [currentUser.id, currentUser.role]);

  // Saudação de acordo com o horário local
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const isProOrCompany =
    currentUser.role === 'profissional' ||
    currentUser.role === 'empresa' ||
    currentUser.role === 'empresa_plus';

  const proKpis = getProfessionalKpis(projects, currentUser.role);

  // Cálculos de KPIs
  const totalProjectsCount = projects.length;
  const unlockedCount = projects.filter((p) => p.status === 'UNLOCKED').length;
  const pendingPaymentsCount = projects.filter((p) => p.status === 'ESTIMATED').length;

  const handleDuplicate = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const dup = await duplicateProject(id, currentUser.id);
      success(`Projecto duplicado com sucesso: "${dup.name}"`);
      loadProjects();
    } catch (err: any) {
      error(err.message || 'Falha ao duplicar projecto');
    }
  };

  return (
    <div className="space-y-6">
      {/* Fase 14: Checklist "Vamos começar 🚀" - Apenas renderizar se !isAdmin E projects.length === 0 E credits === 0 */}
      {!isAdmin && projects.length === 0 && credits === 0 && (
        <OnboardingChecklist
          userId={currentUser.id}
          onNavigateAction={(actionKey) => {
            if (actionKey === 'orcamento' || actionKey === 'wizard') {
              onNewBudget();
            } else if (actionKey === 'provincia') {
              onNewBudget();
            } else if (actionKey === 'preview') {
              if (projects.length > 0) {
                onOpenProject(projects[0].id);
              } else {
                onNewBudget();
              }
            } else if (actionKey === 'definicoes') {
              window.location.href = '/definicoes';
            }
          }}
        />
      )}

      {/* 1. Header do Painel com Saudação & CTA Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#0F3D5C] to-[#1E567B] text-white p-4 sm:p-6 rounded-2xl shadow-sm">
        <div>
          <div className="text-xs font-semibold text-amber-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Painel Principal &bull; Angola</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {getGreeting()}, {currentUser.nome}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-xl">
            Acompanhe os seus orçamentos de construção civil com base de preços actualizada e preços de mercado em Kwanzas (Kz).
          </p>
        </div>

        <button
          id="tour-novo-orcamento-btn"
          onClick={onNewBudget}
          className="self-stretch sm:self-auto h-14 min-h-[56px] sm:h-12 sm:min-h-[48px] py-2.5 px-6 bg-[#F59E0B] hover:bg-[#D97706] active:bg-[#B45309] text-slate-950 font-extrabold rounded-2xl shadow-lg shadow-amber-500/30 flex items-center justify-center space-x-2 transition-all cursor-pointer text-sm shrink-0 active:scale-95"
        >
          <Plus className="w-5 h-5 stroke-[3]" />
          <span>+ Novo Orçamento</span>
        </button>
      </div>

      {/* 2. Os 4 KPI Cards Fundamentais (Grid 2x2 fluído em Mobile Android) */}
      {loading ? (
        <KpiGridSkeleton count={4} />
      ) : loadError ? (
        <ErrorState
          title="Erro ao carregar métricas"
          message={loadError}
          onRetry={loadProjects}
        />
      ) : (
        <div id="tour-dashboard-kpis" className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {/* Card 1: Total de Projetos */}
          <div
            onClick={onNavigateToProjects}
            className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-card-subtle hover:border-[#0F3D5C]/40 transition-all cursor-pointer active:bg-slate-50"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">Projectos Totais</span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-50 text-[#0F3D5C] flex items-center justify-center shrink-0">
                <FolderKanban className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-2 sm:mt-3">{totalProjectsCount}</div>
            <div className="text-[10px] sm:text-[11px] text-slate-500 mt-1 flex items-center justify-between">
              <span>Obras registadas</span>
              <span className="font-semibold text-[#0F3D5C] hidden sm:flex items-center">
                Ver lista <ChevronRight className="w-3 h-3 ml-0.5" />
              </span>
            </div>
          </div>

          {/* Card 2: Orçamentos Concluídos */}
          <div
            onClick={onNavigateToProjects}
            className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-card-subtle hover:border-emerald-500/40 transition-all cursor-pointer active:bg-slate-50"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">Completos</span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <FileCheck2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-2 sm:mt-3">{unlockedCount}</div>
            <div className="text-[10px] sm:text-[11px] text-emerald-600 font-semibold mt-1 flex items-center truncate">
              <CheckCircle2 className="w-3 h-3 mr-1 shrink-0" />
              <span>PDF e QR disponíveis</span>
            </div>
          </div>

          {/* Card 3: Pagamentos Pendentes */}
          <div
            onClick={onNavigateToPayments}
            className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-card-subtle hover:border-amber-500/40 transition-all cursor-pointer active:bg-slate-50"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">Validação</span>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-2 sm:mt-3">{pendingPaymentsCount}</div>
            <div className="text-[10px] sm:text-[11px] text-slate-500 mt-1 flex items-center justify-between">
              <span className="truncate">{pendingPaymentsCount > 0 ? 'Em análise' : 'Regular'}</span>
              <span className="font-semibold text-amber-600 hidden sm:flex items-center">
                Recibos <ChevronRight className="w-3 h-3 ml-0.5" />
              </span>
            </div>
          </div>

          {/* Card 4: Créditos Disponíveis (Pacotes - Bloco 6.3) */}
          {isAdmin ? (
            <div
              onClick={onNavigateToPlan}
              className="p-3.5 sm:p-5 rounded-2xl border border-emerald-200 bg-emerald-50/40 shadow-card-subtle transition-all cursor-pointer active:bg-slate-50 group hover:border-emerald-400"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                  Acesso ao Sistema
                </span>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
              <div className="flex items-baseline space-x-2 mt-2 sm:mt-3">
                <div className="text-xl sm:text-2xl font-black text-emerald-800">
                  Acesso Ilimitado
                </div>
              </div>
              <div className="text-[10px] sm:text-[11px] font-semibold mt-1 flex items-center justify-between text-emerald-700">
                <span>Sem restrições de orçamentos</span>
                <span className="font-bold group-hover:underline">Área Admin →</span>
              </div>
            </div>
          ) : (
            <div
              onClick={onNavigateToPlan}
              className={`p-3.5 sm:p-5 rounded-2xl border shadow-card-subtle transition-all cursor-pointer active:bg-slate-50 group ${
                credits === 0
                  ? 'bg-amber-50/40 border-amber-300 hover:border-amber-500'
                  : 'bg-white border-emerald-200 hover:border-emerald-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                  Créditos Disponíveis
                </span>
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    credits === 0
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-50 text-emerald-600'
                  }`}
                >
                  <Package className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
              <div className="flex items-baseline space-x-2 mt-2 sm:mt-3">
                <div
                  className={`text-xl sm:text-2xl font-black ${
                    credits === 0
                      ? 'text-amber-600'
                      : 'text-emerald-700'
                  }`}
                >
                  {loadingCredits ? '—' : credits}
                </div>
                {credits === 0 ? (
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                    Sem créditos
                  </span>
                ) : (
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {credits === 1 ? '1 crédito activo' : `${credits} créditos activos`}
                  </span>
                )}
              </div>
              <div className="text-[10px] sm:text-[11px] font-semibold mt-1 flex items-center justify-between">
                <span className={credits === 0 ? 'text-amber-700 font-bold' : 'text-slate-500'}>
                  {credits === 0
                    ? 'Nenhum orçamento disponível'
                    : credits === 1
                    ? '1 orçamento sem expiração'
                    : `${credits} orçamentos sem expiração`}
                </span>
                <span
                  className={`flex items-center font-bold ${
                    credits === 0
                      ? 'text-amber-700 underline'
                      : 'text-[#0F3D5C] group-hover:underline'
                  }`}
                >
                  {credits === 0 ? 'Comprar Pacote →' : 'Ver Pacotes →'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Seção Extra de KPIs para Perfil Profissional & Empresa (Tarefa 8) - Oculto para Admin e Particular */}
      {showProMetrics && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              <span>Métricas de Gestão Profissional</span>
            </div>
            <span className="text-[11px] font-semibold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-full">
              Exclusivo Profissionais & Empresas
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-amber-200/60 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">Valor Médio por Orçamento</span>
              <div className="text-lg font-bold text-slate-900 mt-1">
                {formatCurrencyKz(proKpis.averageBudgetValueKz)}
              </div>
              <span className="text-[10px] text-slate-400">Calculado sobre a carteira ativa</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-amber-200/60 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">Taxa de Conversão</span>
              <div className="text-lg font-bold text-emerald-700 mt-1">
                {proKpis.conversionRatePercent}%
              </div>
              <span className="text-[10px] text-emerald-600 font-medium">Orçamentos fechados / emitidos</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-amber-200/60 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">Clientes Ativos</span>
              <div className="text-lg font-bold text-[#0F3D5C] mt-1">
                {proKpis.activeClientsCount} Clientes
              </div>
              <span className="text-[10px] text-slate-400">Em carteira provincial</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. Grid Principal: Projetos Recentes (Esquerda) + Progresso Mensal (Direita) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1 & 2: Projetos Recentes */}
        <div id="tour-projetos-recentes" className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-[#0F3D5C]" />
              <span>Projectos Recentes</span>
            </h2>
            <button
              onClick={onNavigateToProjects}
              className="text-xs font-bold text-[#0F3D5C] hover:text-amber-600 transition-colors flex items-center cursor-pointer"
            >
              <span>Ver todos ({totalProjectsCount})</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>

          {/* Estados de UI Padronizados: Loading / Error / Empty / Success */}
          {loading ? (
            <TableSkeleton rows={4} columns={3} />
          ) : loadError ? (
            <ErrorState
              title="Erro ao carregar projectos recentes"
              message={loadError}
              onRetry={loadProjects}
            />
          ) : projects.length === 0 ? (
            <EmptyState
              type="projects"
              title="Ainda não tem orçamentos criados"
              subtitle="Inicie o assistente em 7 etapas para calcular os custos reais da sua obra em Luanda ou demais províncias com precisão."
              ctaText="+ Criar Primeiro Orçamento"
              onCtaClick={onNewBudget}
            />
          ) : (
            /* Tabela / Cards de Projetos Recentes (Success State) */
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-card-subtle divide-y divide-slate-100">
              {projects.slice(0, 4).map((p) => (
                <div
                  key={p.id}
                  onClick={() => onOpenProject(p.id)}
                  className="p-4 hover:bg-slate-50 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-slate-900 hover:text-[#0F3D5C] transition-colors">
                        {p.name}
                      </span>
                      {p.status === 'UNLOCKED' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Concluído
                        </span>
                      ) : p.status === 'ESTIMATED' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Estimado
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                          Rascunho
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500">
                      <span>{p.typeLabel}</span>
                      <span>&bull;</span>
                      <span>{p.province}, {p.municipality}</span>
                      {isProOrCompany && p.clientName && (
                        <>
                          <span>&bull;</span>
                          <span className="text-[#0F3D5C] font-semibold">Cliente: {p.clientName}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-3 shrink-0">
                    <div className="text-left sm:text-right">
                      <div className="text-sm font-black text-slate-900">
                        {formatCurrencyKz(p.totalKz)}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(p.updatedAt).toLocaleDateString('pt-PT')}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      {isProOrCompany && (
                        <button
                          onClick={(e) => handleDuplicate(e, p.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Duplicar Projecto"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      )}
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Coluna 3: Saldo de Pacotes & Acesso Rápido */}
        <div className="space-y-6">
          {/* Widget de Saldo de Pacotes (Bloco 6.3) - Oculto para Administrador */}
          {!isAdmin && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card-subtle space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Saldo de Pacote</span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                    credits === 0
                      ? 'text-amber-700 bg-amber-50 border-amber-200'
                      : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  }`}
                >
                  {credits === 0 ? 'Sem créditos' : `${credits} ${credits === 1 ? 'crédito activo' : 'créditos activos'}`}
                </span>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-700">Créditos Disponíveis</span>
                  <span className={`font-bold ${credits === 0 ? 'text-amber-600' : 'text-emerald-700'}`}>
                    {loadingCredits ? '—' : credits} {credits === 1 ? 'orçamento' : 'orçamentos'}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      credits === 0 ? 'bg-amber-400' : 'bg-emerald-600'
                    }`}
                    style={{ width: `${credits === 0 ? 0 : Math.min(100, Math.max(20, credits * 16.6))}%` }}
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                Os seus créditos não têm prazo de validade. Cada crédito emite 1 orçamento completo com quantitativos detalhados, PDF técnico e QR Code.
              </p>

              <button
                onClick={onNavigateToPlan}
                className={`w-full py-2.5 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center space-x-1.5 ${
                  credits === 0
                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>{credits === 0 ? 'Comprar Pacote' : 'Ver Pacotes'}</span>
              </button>
            </div>
          )}

          {/* Dica do Mercado Angolano */}
          <div className="bg-[#0F3D5C]/5 border border-[#0F3D5C]/15 rounded-2xl p-4 text-xs space-y-2">
            <div className="flex items-center space-x-2 text-[#0F3D5C] font-bold">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Base Oficial de Preços</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Os preços de cimento, varão de aço e inertes foram calibrados para Luanda e capitais provinciais, incluindo taxa de transporte rodoviário.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Faixa Institucional de Credibilidade e Normas Técnicas (Trust Signals) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center font-black shrink-0 border border-amber-500/25">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="font-extrabold text-slate-800 flex items-center gap-2">
              <span>Garantia de Rigor Técnico &bull; Kizongelu</span>
              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-200">
                Fórmulas validadas por engenheiros civis
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Formato elaborado para submissão em processos de licenciamento e alvarás municipais.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600 font-semibold">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Base técnica rigorosa
          </span>
          <span>&bull;</span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Verificação por QR code
          </span>
          <span>&bull;</span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Multicaixa Express
          </span>
        </div>
      </div>

      {/* Fase 14: Modal de Retoma de Orçamento Incompleto */}
      {resumeDraft && (
        <ResumeDraftModal
          draft={resumeDraft}
          isOpen={isResumeModalOpen}
          onResume={(projectId) => {
            setIsResumeModalOpen(false);
            onOpenProject(projectId);
          }}
          onDiscard={async (projectId) => {
            setIsResumeModalOpen(false);
            await archiveProject(projectId);
            loadProjects();
            info('Rascunho descartado com sucesso.');
          }}
          onDismiss={() => setIsResumeModalOpen(false)}
        />
      )}

      {/* Fase 14: Tour Guiado Contextual */}
      <TourOverlay
        userId={currentUser.id}
        tour={dashboardTour}
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onComplete={() => {
          setIsTourOpen(false);
          success('Tour concluído!', 'Já está pronto para criar o seu primeiro orçamento de construção.');
        }}
      />
    </div>
  );
};

export default PainelPage;
