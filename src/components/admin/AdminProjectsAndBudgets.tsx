/**
 * @file src/components/admin/AdminProjectsAndBudgets.tsx
 * Gestão Global de Projectos e Orçamentos Emitidos (Fase 10 - Tarefa 1).
 * 
 * Suporta as vistas 'projectos' e 'orcamentos' na navegação administrativa:
 * - Listagem global de obras calculadas em Angola (Luanda, Benguela, Huíla, etc.)
 * - Estado de desbloqueio financeiro e emissão de mapas de quantidades
 * - Acesso rápido a visualização e auditoria
 */

import React, { useState } from 'react';
import { formatCurrencyKz } from '../../../lib/format/currency';
import {
  FolderGit2,
  FileSpreadsheet,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Eye,
  FileText,
  Download,
  Filter,
} from 'lucide-react';

interface ProjectItem {
  id: string;
  nome: string;
  cliente: string;
  email: string;
  tipo: string;
  provincia: string;
  areaM2: number;
  valorTotalKz: number;
  dataCriacao: string;
  status: 'DRAFT' | 'ESTIMATED' | 'UNLOCKED';
}

const SAMPLE_PROJECTS: ProjectItem[] = [
  {
    id: 'proj_sample_01',
    nome: 'Moradia T3 no Kilamba',
    cliente: 'Eng. João Baptista',
    email: 'joao.baptista@exemplo.ao',
    tipo: 'Moradia T3',
    provincia: 'Luanda',
    areaM2: 180,
    valorTotalKz: 28450000,
    dataCriacao: '2026-03-24',
    status: 'UNLOCKED',
  },
  {
    id: 'proj_sample_02',
    nome: 'Armazém Industrial em Viana',
    cliente: 'Eng. Arnaldo Silva',
    email: 'arnaldo.silva@engenharia.ao',
    tipo: 'Armazém / Industrial',
    provincia: 'Luanda',
    areaM2: 650,
    valorTotalKz: 84200000,
    dataCriacao: '2026-03-24',
    status: 'ESTIMATED',
  },
  {
    id: 'proj_sample_03',
    nome: 'Vivenda T4 no Talatona',
    cliente: 'Dra. Teresa Van-Dúnem',
    email: 'teresa.vandunem@construtora.ao',
    tipo: 'Vivenda T4',
    provincia: 'Luanda',
    areaM2: 320,
    valorTotalKz: 56900000,
    dataCriacao: '2026-03-23',
    status: 'UNLOCKED',
  },
  {
    id: 'proj_sample_04',
    nome: 'Muramento 120m no Benfica',
    cliente: 'Mateus Dala',
    email: 'mateus.dala@gmail.com',
    tipo: 'Muro de Vedação',
    provincia: 'Luanda',
    areaM2: 120,
    valorTotalKz: 4800000,
    dataCriacao: '2026-03-22',
    status: 'UNLOCKED',
  },
  {
    id: 'proj_sample_05',
    nome: 'Edifício Residencial na Huíla (Lubango)',
    cliente: 'Eng. Domingos Chipepo',
    email: 'chipepo.eng@gmail.com',
    tipo: 'Residencial Multifamiliar',
    provincia: 'Huíla',
    areaM2: 420,
    valorTotalKz: 72100000,
    dataCriacao: '2026-03-20',
    status: 'UNLOCKED',
  },
  {
    id: 'proj_sample_06',
    nome: 'Moradia T2 no Lobito',
    cliente: 'António Kiala',
    email: 'antonio.kiala@hotmail.com',
    tipo: 'Moradia T2',
    provincia: 'Benguela',
    areaM2: 110,
    valorTotalKz: 18200000,
    dataCriacao: '2026-03-19',
    status: 'ESTIMATED',
  },
];

interface AdminProjectsAndBudgetsProps {
  mode: 'projects' | 'budgets';
  onNavigateToProject?: (id: string) => void;
}

export const AdminProjectsAndBudgets: React.FC<AdminProjectsAndBudgetsProps> = ({
  mode,
  onNavigateToProject,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [provinciaFilter, setProvinciaFilter] = useState('ALL');

  const filtered = SAMPLE_PROJECTS.filter((p) => {
    const matchesSearch =
      p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesProv = provinciaFilter === 'ALL' || p.provincia === provinciaFilter;

    return matchesSearch && matchesProv;
  });

  const isProjects = mode === 'projects';

  return (
    <div className="space-y-6">
      {/* Topo com Título */}
      <div className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700/80 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            {isProjects ? (
              <FolderGit2 className="w-5 h-5 text-amber-400" />
            ) : (
              <FileSpreadsheet className="w-5 h-5 text-amber-400" />
            )}
            <h1 className="text-lg font-black text-white">
              {isProjects ? 'Projectos Cadastrados no Sistema' : 'Mapas e Orçamentos Emitidos'}
            </h1>
            <span className="bg-amber-500/20 text-amber-300 text-xs px-2.5 py-0.5 rounded-full font-bold border border-amber-500/30">
              {filtered.length} Registos
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isProjects
              ? 'Supervisão de todas as obras criadas por particulares e empresas em Angola.'
              : 'Histórico de orçamentos quantificados com preços de materiais de cada província.'}
          </p>
        </div>
      </div>

      {/* Barra de Pesquisa e Filtros */}
      <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pesquisar por projeto, cliente ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <label className="text-slate-400 font-semibold">Província:</label>
          <select
            value={provinciaFilter}
            onChange={(e) => setProvinciaFilter(e.target.value)}
            className="p-2 rounded-xl border border-slate-700 bg-slate-900 text-white font-medium focus:outline-none"
          >
            <option value="ALL">Todas as Províncias</option>
            <option value="Luanda">Luanda</option>
            <option value="Benguela">Benguela</option>
            <option value="Huíla">Huíla</option>
          </select>
        </div>
      </div>

      {/* Tabela de Projectos / Orçamentos */}
      <div className="bg-slate-800/90 rounded-2xl border border-slate-700/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-700">
              <tr>
                <th className="py-3.5 px-6 font-bold">Obra / Projecto</th>
                <th className="py-3.5 px-4 font-bold">Cliente</th>
                <th className="py-3.5 px-4 font-bold">Província & Área</th>
                <th className="py-3.5 px-4 font-bold">Valor Orçamentado</th>
                <th className="py-3.5 px-4 font-bold">Data</th>
                <th className="py-3.5 px-4 font-bold text-center">Desbloqueio</th>
                <th className="py-3.5 px-6 font-bold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-750/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-bold text-white text-sm">{p.nome}</div>
                    <div className="text-[11px] text-amber-300 font-semibold">{p.tipo}</div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="font-semibold text-slate-200">{p.cliente}</div>
                    <div className="text-[10px] text-slate-400">{p.email}</div>
                  </td>

                  <td className="py-4 px-4 text-slate-300">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-amber-400" />
                      <span>{p.provincia}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">{p.areaM2} m² construídos</div>
                  </td>

                  <td className="py-4 px-4 font-mono font-bold text-white text-sm">
                    {formatCurrencyKz(p.valorTotalKz)}
                  </td>

                  <td className="py-4 px-4 font-mono text-[11px] text-slate-400">
                    {p.dataCriacao}
                  </td>

                  <td className="py-4 px-4 text-center">
                    {p.status === 'UNLOCKED' ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Aprovado</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        <Clock className="w-3 h-3" />
                        <span>Aguardando Pagamento</span>
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => onNavigateToProject?.(p.id)}
                        className="p-1.5 bg-slate-700/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                        title="Ver Detalhes do Projecto"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminProjectsAndBudgets;
