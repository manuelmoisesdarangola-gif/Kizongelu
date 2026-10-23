/**
 * @file src/components/budget/BudgetList.tsx
 * Listagem de orçamentos com isolamento estrito por `userId` e filtros em Angola.
 */

import React, { useState } from 'react';
import { useAuth } from '../../auth/auth-context';
import { BudgetRepository } from '../../db/budget-repository';
import { CalculationEngine } from '../../engine/calculation-engine';
import { BudgetRecord, AngolaProvince, BudgetStatus } from '../../types/domain';
import { PROVINCIAS_ANGOLA } from '../../db/provinces-database';
import {
  FileSpreadsheet,
  Search,
  Filter,
  Eye,
  Trash2,
  MapPin,
  Calendar,
  Share2,
  CheckCircle2,
  Clock,
  PlusCircle,
  ShieldCheck,
  Building,
} from 'lucide-react';

interface BudgetListProps {
  onSelectBudget: (budget: BudgetRecord) => void;
  onNewBudget: () => void;
}

export const BudgetList: React.FC<BudgetListProps> = ({ onSelectBudget, onNewBudget }) => {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Carrega orçamentos estritamente isolados pelo userId
  const budgets = BudgetRepository.getByUserId(currentUser.id, currentUser.role);

  const filteredBudgets = budgets.filter((budget) => {
    const matchesSearch =
      budget.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      budget.clienteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      budget.localizacaoExata.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesProvince = selectedProvince === 'all' || budget.provincia === selectedProvince;
    const matchesStatus = selectedStatus === 'all' || budget.status === selectedStatus;

    return matchesSearch && matchesProvince && matchesStatus;
  });

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Tem a certeza de que deseja eliminar este orçamento?')) {
      BudgetRepository.delete(id, currentUser.id, currentUser.role);
      setRefreshTrigger((prev) => prev + 1);
    }
  };

  const getStatusBadge = (status: BudgetStatus) => {
    switch (status) {
      case 'aprovado':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Aprovado
          </span>
        );
      case 'em_execucao':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-800 border border-sky-200">
            <Clock className="w-3 h-3 mr-1" />
            Em Execução
          </span>
        );
      case 'calculado':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
            Calculado (Kz)
          </span>
        );
      case 'concluido':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-300">
            Concluído
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
            Rascunho
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner de Quota do Utilizador & Contexto de Isolamento */}
      <div className="bg-white rounded-xl p-5 border border-[#E2E8F0] shadow-card-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-bold text-[#0F3D5C]">Painel de Orçamentação</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-[#0F3D5C]/10 text-[#0F3D5C] border border-[#0F3D5C]/20">
              {currentUser.plano}
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            {currentUser.role === 'admin' ? (
              <span className="text-rose-600 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 inline" /> Modo Administrador: Visualização de todos os orçamentos do sistema.
              </span>
            ) : (
              <span>
                Isolamento estrito ativo para o utilizador: <strong className="text-slate-800">{currentUser.nome}</strong>.
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2 text-right">
            <span className="text-[11px] uppercase tracking-wider text-[#64748B] block font-medium">
              Saldo de Orçamentos
            </span>
            <span className="text-base font-bold text-[#0F3D5C]">
              {currentUser.role === 'admin' ? 'Ilimitado' : `${currentUser.orçamentosDisponiveis} disponíveis`}
            </span>
          </div>

          <button
            onClick={onNewBudget}
            className="bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-semibold text-sm px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center space-x-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span>Novo Orçamento</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros e Pesquisa */}
      <div className="bg-white rounded-xl p-4 border border-[#E2E8F0] shadow-card-subtle flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pesquisar por obra, cliente ou local..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-[#E2E8F0] focus:outline-none focus:border-[#0F3D5C] focus:ring-1 focus:ring-[#0F3D5C] bg-[#F8FAFC]"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center space-x-1.5 text-xs text-[#64748B]">
            <Filter className="w-3.5 h-3.5" />
            <span>Província:</span>
          </div>
          <select
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
            className="text-xs py-2 px-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-slate-800 focus:outline-none focus:border-[#0F3D5C]"
          >
            <option value="all">Todas as Províncias</option>
            {Object.values(PROVINCIAS_ANGOLA).map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs py-2 px-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-slate-800 focus:outline-none focus:border-[#0F3D5C]"
          >
            <option value="all">Todos os Estados</option>
            <option value="calculado">Calculado</option>
            <option value="aprovado">Aprovado</option>
            <option value="em_execucao">Em Execução</option>
            <option value="concluido">Concluído</option>
          </select>
        </div>
      </div>

      {/* Tabela de Orçamentos */}
      {filteredBudgets.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-[#E2E8F0] text-center">
          <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-[#0F3D5C]">Nenhum orçamento encontrado</h3>
          <p className="text-xs text-[#64748B] max-w-md mx-auto mt-1 mb-4">
            {searchTerm || selectedProvince !== 'all' || selectedStatus !== 'all'
              ? 'Não foram encontrados orçamentos com os critérios de pesquisa selecionados.'
              : 'Ainda não possui orçamentos registados nesta conta. Crie o seu primeiro mapa de quantidades com a base de preços actualizada.'}
          </p>
          <button
            onClick={onNewBudget}
            className="inline-flex items-center space-x-2 bg-[#0F3D5C] hover:bg-[#1A547C] text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Criar Primeiro Orçamento</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBudgets.map((budget) => {
            const provincia = PROVINCIAS_ANGOLA[budget.provincia];
            const totalFormatado = budget.calculo
              ? CalculationEngine.formatKz(budget.calculo.precoTotalFinalKz)
              : '0 Kz';

            return (
              <div
                key={budget.id}
                onClick={() => onSelectBudget(budget)}
                className="bg-white rounded-xl border border-[#E2E8F0] hover:border-[#0F3D5C]/40 p-5 shadow-card-subtle hover:shadow-card-hover transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[11px] font-medium text-[#0F3D5C] bg-[#0F3D5C]/5 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Building className="w-3 h-3" />
                      {budget.areaEstimadaM2} m²
                    </span>
                    {getStatusBadge(budget.status)}
                  </div>

                  <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-[#0F3D5C] transition-colors line-clamp-2">
                    {budget.titulo}
                  </h3>

                  <div className="mt-2.5 space-y-1.5 text-xs text-[#64748B]">
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="truncate">
                        {provincia?.nome || budget.provincia} &bull; {budget.localizacaoExata}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{new Date(budget.dataCriacao).toLocaleDateString('pt-PT')}</span>
                      <span className="text-slate-300">&bull;</span>
                      <span className="truncate">{budget.clienteNome}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-medium">
                      Total Estimado (Kz)
                    </span>
                    <span className="text-base font-extrabold text-[#0F3D5C]">
                      {totalFormatado}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectBudget(budget);
                      }}
                      className="p-1.5 text-[#0F3D5C] hover:bg-[#0F3D5C]/10 rounded-lg transition-colors"
                      title="Ver Mapa de Quantidades e Custos"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => handleDelete(budget.id, e)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Eliminar Orçamento"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
