/**
 * @file app/(app)/projeto/page.tsx
 * Página de Lista de Projetos .
 * - Filtros combinados: Estado (Todos/Rascunho/Estimado/Concluído), Tipo de Obra, Província e Pesquisa.
 * - Tabela / Cards responsivos: Nome · Cliente · Localização · Estado · Total (Kz) · Data · Ações.
 * - Ações: Abrir, Duplicar, Partilhar (Link/QR), Eliminar (Soft delete → Arquivado).
 * - Exportar lista em formato CSV com cabeçalhos sanitizados.
 * - Empty State para buscas sem resultados ou lista sem projetos.
 */

import React, { useState, useEffect } from 'react';
import {
  FolderKanban,
  FileText,
  Search,
  Filter,
  Plus,
  Copy,
  Share2,
  Trash2,
  Download,
  Eye,
  Building,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
  ChevronRight,
  HardHat,
  AlertTriangle,
  RefreshCw,
  Loader2,
  XCircle,
  CheckCircle2,
  X,
  MoreVertical,
} from 'lucide-react';
import { useAuth } from '@/src/auth/auth-context';
import { BottomSheet } from '@/src/components/common/BottomSheet';
import {
  EmptyState,
  ErrorState,
  TableSkeleton,
} from '@/src/components/common/UIStates';
import {
  listProjects,
  duplicateProject,
  archiveProject,
  exportProjectsToCsv,
  ProjectListItem,
} from '@/lib/actions/projects';
import { formatCurrencyKz } from '@/lib/format/currency';
import { useToast } from '@/src/context/ToastContext';

interface ProjetoListPageProps {
  onNewBudget: () => void;
  onOpenProject: (projectId: string) => void;
  onOpenManualConstructor?: () => void;
  pageMode?: 'projetos' | 'orcamentos';
}

export const ProjetoListPage: React.FC<ProjetoListPageProps> = ({
  onNewBudget,
  onOpenProject,
  onOpenManualConstructor,
  pageMode = 'projetos',
}) => {
  const { currentUser } = useAuth();
  const { success, error, info } = useToast();

  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [activeActionProject, setActiveActionProject] = useState<ProjectListItem | null>(null);

  // Estados dos filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(() => (pageMode === 'orcamentos' ? 'ESTIMATED' : 'ALL'));
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [provinceFilter, setProvinceFilter] = useState('ALL');

  // Sincroniza o filtro inicial quando o modo de página alternar
  useEffect(() => {
    if (pageMode === 'orcamentos') {
      setStatusFilter('ESTIMATED');
    } else {
      setStatusFilter('ALL');
    }
  }, [pageMode]);

  const isProOrCompany =
    currentUser.role === 'profissional' ||
    currentUser.role === 'empresa' ||
    currentUser.role === 'empresa_plus';

  const loadData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await listProjects(currentUser.id, currentUser.role, {
        status: statusFilter,
        type: typeFilter,
        province: provinceFilter,
        search: searchQuery,
      });
      setProjects(data);
    } catch (e: any) {
      console.warn(e);
      setErrorMessage(
        e?.message || 'Falha ao carregar a lista de orçamentos. Verifique a sua ligação ou tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser.id, currentUser.role, statusFilter, typeFilter, provinceFilter, searchQuery]);

  const handleDuplicate = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActionLoadingId(id);
    try {
      const dup = await duplicateProject(id, currentUser.id);
      success(`Projecto duplicado com sucesso: "${dup.name}"`);
      await loadData();
    } catch (err: any) {
      error(err?.message || 'Falha ao duplicar');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleArchive = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (window.confirm(`Tem a certeza que deseja arquivar o projecto "${name}"?`)) {
      setActionLoadingId(id);
      try {
        await archiveProject(id, currentUser.id);
        success(`Projecto "${name}" movido para arquivo.`);
        await loadData();
      } catch (err: any) {
        error(err?.message || 'Falha ao arquivar');
      } finally {
        setActionLoadingId(null);
      }
    }
  };

  const handleExportCsv = () => {
    if (projects.length === 0) {
      info('Nenhum projeto disponível para exportação no momento.');
      return;
    }
    setIsExporting(true);
    try {
      const csvContent = exportProjectsToCsv(projects);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Kizongelu_projectos_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      success('Ficheiro CSV exportado com sucesso!');
    } catch (err: any) {
      error('Falha ao exportar ficheiro CSV.');
    } finally {
      setTimeout(() => setIsExporting(false), 500);
    }
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    statusFilter !== 'ALL' ||
    typeFilter !== 'ALL' ||
    provinceFilter !== 'ALL';

  const clearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setTypeFilter('ALL');
    setProvinceFilter('ALL');
  };

  const provinces = ['ALL', 'Luanda', 'Benguela', 'Huíla', 'Huambo', 'Cabinda', 'Malanje', 'Uíge', 'Cuanza Sul'];

  return (
    <div className="space-y-6">
      {/* Topo: Título + Botões Novo e Exportar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            {pageMode === 'orcamentos' ? (
              <>
                <FileText className="w-6 h-6 text-[#0F3D5C]" />
                <span>Meus Orçamentos de Obra</span>
              </>
            ) : (
              <>
                <FolderKanban className="w-6 h-6 text-[#0F3D5C]" />
                <span>Meus Projectos e Obras</span>
              </>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {pageMode === 'orcamentos'
              ? 'Consulte as estimativas orçamentais, quantitativos de materiais e cadernos de encargos.'
              : 'Gestão integrada de todas as obras, rascunhos e estudos prévios.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            disabled={isExporting}
            className="min-h-[44px] py-2.5 px-4 bg-white hover:bg-slate-50 active:scale-95 text-slate-700 font-bold rounded-xl text-xs border border-slate-200 shadow-xs flex items-center space-x-2 transition-all cursor-pointer disabled:opacity-50 disabled:active:scale-100"
            title="Exportar dados em folha de cálculo"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />
            ) : (
              <Download className="w-4 h-4 text-slate-500" />
            )}
            <span className="hidden sm:inline">
              {isExporting ? 'A exportar...' : 'Exportar CSV'}
            </span>
          </button>

          {onOpenManualConstructor && (
            <button
              onClick={onOpenManualConstructor}
              className="h-14 min-h-[56px] sm:h-11 sm:min-h-[44px] py-2 px-3.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold rounded-xl text-xs sm:text-sm flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
              title="Criar orçamento com inserção manual de artigos e preços"
            >
              <HardHat className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Orçamento Manual</span>
              <span className="sm:hidden">Manual</span>
            </button>
          )}

          <button
            onClick={onNewBudget}
            className="h-14 min-h-[56px] sm:h-11 sm:min-h-[44px] py-2.5 px-5 bg-[#F59E0B] hover:bg-[#D97706] active:bg-[#B45309] active:scale-95 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <Plus className="w-5 h-5 stroke-[3]" />
            <span>+ Novo Orçamento</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-card-subtle space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Pesquisa */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-4 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar por projecto, obra ou cliente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 h-12 min-h-[48px] bg-slate-50 border border-slate-200 rounded-xl text-base sm:text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F3D5C]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filtro Estado */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 h-12 min-h-[48px] bg-slate-50 border border-slate-200 rounded-xl text-base sm:text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F3D5C]"
            >
              {pageMode === 'orcamentos' ? (
                <>
                  <option value="ESTIMATED">Orçamentos Estimados</option>
                  <option value="UNLOCKED">Orçamentos Concluídos (Desbloqueados)</option>
                  <option value="ALL">Todos os Orçamentos</option>
                  <option value="DRAFT">Rascunhos Incompletos</option>
                </>
              ) : (
                <>
                  <option value="ALL">Todos os Estados</option>
                  <option value="UNLOCKED">Concluído (Completo)</option>
                  <option value="ESTIMATED">Estimado (Aguardando)</option>
                  <option value="DRAFT">Rascunho</option>
                  <option value="ARCHIVED">Arquivados</option>
                </>
              )}
            </select>
          </div>

          {/* Filtro Tipo de Obra */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2.5 min-h-[44px] bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F3D5C]"
            >
              <option value="ALL">Todos os Tipos</option>
              <option value="NOVA">Construção Nova</option>
              <option value="REMODELACAO">Remodelação</option>
              <option value="AMPLIACAO">Ampliação</option>
              <option value="MURO">Muro de Vedação</option>
              <option value="ANEXO">Anexo</option>
              <option value="GARAGEM">Garagem</option>
            </select>
          </div>

          {/* Filtro Província */}
          <div>
            <select
              value={provinceFilter}
              onChange={(e) => setProvinceFilter(e.target.value)}
              className="w-full px-3 py-2.5 min-h-[44px] bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F3D5C]"
            >
              {provinces.map((prov) => (
                <option key={prov} value={prov}>
                  {prov === 'ALL' ? 'Todas as Províncias' : prov}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Indicador de Filtros Activos e Botão Limpar */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-medium">
              Filtros activos: {projects.length} {projects.length === 1 ? 'projecto encontrado' : 'projectos encontrados'}
            </span>
            <button
              onClick={clearAllFilters}
              className="text-[#0F3D5C] hover:text-[#0A293E] font-bold text-xs flex items-center space-x-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Limpar Filtros</span>
            </button>
          </div>
        )}
      </div>

      {/* ESTADO: ERRO */}
      {errorMessage && (
        <ErrorState
          title="Erro ao carregar lista de orçamentos"
          message={errorMessage}
          onRetry={loadData}
        />
      )}

      {/* ESTADO: A CARREGAR (SKELETON LOADER) */}
      {loading ? (
        <TableSkeleton rows={5} columns={6} />
      ) : projects.length === 0 ? (
        /* ESTADO: VAZIO (EMPTY STATE) */
        hasActiveFilters ? (
          <EmptyState
            type="search"
            title="Nenhum projecto encontrado"
            subtitle="Não encontramos nenhum orçamento com os filtros selecionados. Tente ajustar os critérios de pesquisa."
            ctaText="Limpar Todos os Filtros"
            onCtaClick={clearAllFilters}
          />
        ) : (
          <EmptyState
            type="projects"
            title="Ainda não tem orçamentos criados"
            subtitle="Crie o seu primeiro orçamento para começar a gerir as suas obras com rigor técnico e coeficientes reais de Angola."
            ctaText="+ Criar Primeiro Orçamento"
            onCtaClick={onNewBudget}
          />
        )
      ) : (
        /* ESTADO: SUCESSO / LISTA DE PROJETOS */
        <>
          {/* ========================================================================= */}
          {/* VISTA MOBILE (CARDS) — Otimizada para ecrãs Android de gama média         */}
          {/* ========================================================================= */}
          <div className="md:hidden space-y-3">
            {projects.map((p) => {
              const isRowLoading = actionLoadingId === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => onOpenProject(p.id)}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card-subtle space-y-3 cursor-pointer active:bg-slate-50 transition-colors"
                >
                  {/* Cabeçalho do Card: Nome e Estado */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <h3 className="font-bold text-slate-900 text-sm leading-snug">
                        {p.name}
                      </h3>
                      <div className="text-[11px] text-slate-500">
                        {p.typeLabel} &bull; {p.areaM2} m² &bull; Acab. {p.finishLevel}
                      </div>
                    </div>

                    {p.status === 'UNLOCKED' ? (
                      <span className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Concluído
                      </span>
                    ) : p.status === 'ESTIMATED' ? (
                      <span className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        Estimado
                      </span>
                    ) : p.status === 'ARCHIVED' ? (
                      <span className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                        Arquivado
                      </span>
                    ) : (
                      <span className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                        Rascunho
                      </span>
                    )}
                  </div>

                  {/* Informações de Localização e Cliente */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 pt-1 border-t border-slate-100">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{p.province}, {p.municipality}</span>
                    </div>

                    {isProOrCompany && p.clientName && (
                      <>
                        <span className="text-slate-300">&bull;</span>
                        <span className="text-slate-600 font-medium">Cli: {p.clientName}</span>
                      </>
                    )}

                    <span className="text-slate-300">&bull;</span>
                    <span className="text-slate-400 text-[11px]">
                      {new Date(p.updatedAt).toLocaleDateString('pt-PT')}
                    </span>
                  </div>

                  {/* Valor Total e Ações Táteis (Min. 44px) */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-3" onClick={(e) => e.stopPropagation()}>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">Total Estimado</span>
                      <span className="text-base font-black text-slate-900">
                        {formatCurrencyKz(p.totalKz)}
                      </span>
                    </div>

                    {isRowLoading ? (
                      <div className="flex items-center justify-center p-2 min-h-[44px]">
                        <Loader2 className="w-5 h-5 text-[#0F3D5C] animate-spin" />
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => onOpenProject(p.id)}
                          className="h-12 min-h-[48px] px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center space-x-1.5 active:scale-95 transition-all cursor-pointer"
                        >
                          <Eye className="w-4 h-4 text-[#0F3D5C]" />
                          <span>Ver Projecto</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveActionProject(p);
                          }}
                          className="h-12 min-h-[48px] w-12 min-w-[48px] p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                          title="Mais opções"
                        >
                          <MoreVertical className="w-5 h-5 text-slate-600" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ========================================================================= */}
          {/* VISTA DESKTOP (TABELA COMPLETA) — Para ecrãs médios e largos (>= md)      */}
          {/* ========================================================================= */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-card-subtle overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Nome do Projecto</th>
                    {isProOrCompany && <th className="py-3 px-4">Cliente</th>}
                    <th className="py-3 px-4">Localização</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-right">Total Estimado</th>
                    <th className="py-3 px-4 text-right">Data</th>
                    <th className="py-3 px-4 text-center">ACÇÕES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {projects.map((p) => {
                    const isRowLoading = actionLoadingId === p.id;
                    return (
                      <tr
                        key={p.id}
                        onClick={() => onOpenProject(p.id)}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      >
                        {/* Nome & Tipo */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 group-hover:text-[#0F3D5C] transition-colors">
                            {p.name}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {p.typeLabel} &bull; {p.areaM2} m² &bull; Acabamento {p.finishLevel}
                          </div>
                        </td>

                        {/* Cliente (Visível para profissionais) */}
                        {isProOrCompany && (
                          <td className="py-3.5 px-4 font-medium text-slate-700">
                            <div>{p.clientName || 'Particular'}</div>
                            {p.clientPhone && (
                              <div className="text-[10px] text-slate-400">{p.clientPhone}</div>
                            )}
                          </td>
                        )}

                        {/* Localização */}
                        <td className="py-3.5 px-4 text-slate-600">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>
                              {p.province}, {p.municipality}
                            </span>
                          </div>
                        </td>

                        {/* Estado */}
                        <td className="py-3.5 px-4">
                          {p.status === 'UNLOCKED' ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Concluído
                            </span>
                          ) : p.status === 'ESTIMATED' ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              Estimado
                            </span>
                          ) : p.status === 'ARCHIVED' ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                              Arquivado
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                              Rascunho
                            </span>
                          )}
                        </td>

                        {/* Total Kz */}
                        <td className="py-3.5 px-4 text-right font-black text-slate-900 text-sm">
                          {formatCurrencyKz(p.totalKz)}
                        </td>

                        {/* Data */}
                        <td className="py-3.5 px-4 text-right text-slate-400 text-[11px]">
                          {new Date(p.updatedAt).toLocaleDateString('pt-PT')}
                        </td>

                        {/* Ações */}
                        <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                          {isRowLoading ? (
                            <div className="flex items-center justify-center p-1.5">
                              <Loader2 className="w-4 h-4 text-[#0F3D5C] animate-spin" />
                            </div>
                          ) : (
                            <div className="flex items-center justify-center space-x-1.5">
                              <button
                                onClick={() => onOpenProject(p.id)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-[#0F3D5C] hover:text-white text-[#0F3D5C] rounded-lg text-xs font-bold flex items-center space-x-1 transition-colors cursor-pointer"
                                title="Ver Projecto"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Ver Projecto</span>
                              </button>

                              <button
                                onClick={(e) => handleDuplicate(e, p.id)}
                                className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                title="Duplicar Orçamento"
                              >
                                <Copy className="w-4 h-4" />
                              </button>

                              <button
                                onClick={(e) => handleArchive(e, p.id, p.name)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Arquivar Projecto"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Bottom Sheet de Acções Secundárias em Mobile (arrastável) */}
      <BottomSheet
        isOpen={Boolean(activeActionProject)}
        onClose={() => setActiveActionProject(null)}
        title={activeActionProject?.name || 'Acções do Projecto'}
        description={`ID: ${activeActionProject?.id} · ${activeActionProject?.province}, ${activeActionProject?.municipality}`}
      >
        {activeActionProject && (
          <div className="space-y-3 pb-4">
            <button
              onClick={() => {
                const id = activeActionProject.id;
                setActiveActionProject(null);
                onOpenProject(id);
              }}
              className="w-full h-12 min-h-[48px] px-4 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-98 text-[#0F3D5C] font-bold text-sm flex items-center space-x-3 transition-all cursor-pointer"
            >
              <Eye className="w-5 h-5 text-[#0F3D5C]" />
              <span>Abrir Projecto e Mapa de Quantidades</span>
            </button>

            <button
              onClick={(e) => {
                const id = activeActionProject.id;
                setActiveActionProject(null);
                handleDuplicate(e, id);
              }}
              className="w-full h-12 min-h-[48px] px-4 rounded-xl bg-slate-50 hover:bg-slate-100 active:scale-98 text-slate-800 font-bold text-sm flex items-center space-x-3 border border-slate-200 transition-all cursor-pointer"
            >
              <Copy className="w-5 h-5 text-amber-600" />
              <span>Duplicar Orçamento</span>
            </button>

            <button
              onClick={(e) => {
                const { id, name } = activeActionProject;
                setActiveActionProject(null);
                handleArchive(e, id, name);
              }}
              className="w-full h-12 min-h-[48px] px-4 rounded-xl bg-rose-50 hover:bg-rose-100 active:scale-98 text-rose-700 font-bold text-sm flex items-center space-x-3 border border-rose-200 transition-all cursor-pointer"
            >
              <Trash2 className="w-5 h-5 text-rose-600" />
              <span>Arquivar Projecto</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveActionProject(null)}
              className="w-full h-12 min-h-[48px] px-4 rounded-xl bg-white border border-slate-200 text-slate-600 font-semibold text-sm active:scale-98 flex items-center justify-center transition-all cursor-pointer mt-2"
            >
              Cancelar
            </button>
          </div>
        )}
      </BottomSheet>
    </div>
  );
};

export default ProjetoListPage;
