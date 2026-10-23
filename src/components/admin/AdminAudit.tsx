/**
 * @file src/components/admin/AdminAudit.tsx
 * Registo de Auditoria e Segurança Imutável (Fase 10 - Tarefa 7).
 * 
 * - Filtros: tipo de evento, administrador, período, gravidade
 * - Tabela com descrição legível humana, identificador de IP, data e hash
 * - Drawer lateral com visualizador de diff lado a lado (Before vs After)
 */

import React, { useState } from 'react';
import {
  AdminDataService,
  AdminAuditDetail,
} from '../../lib/services/admin-data';
import {
  ShieldCheck,
  Search,
  Filter,
  Eye,
  X,
  FileCode,
  ArrowRight,
  AlertTriangle,
  Info,
  ShieldAlert,
  Calendar,
  User,
  Hash,
  RefreshCw,
  GitCompare,
  Download,
} from 'lucide-react';

// B.2 & D.1: Formatação de valores históricos (27.000 Kz e +244 923 000 000) com badge e tooltip
const renderAuditDescription = (descricao: string) => {
  const elements: (string | React.ReactNode)[] = [descricao];

  const processMatch = (
    currentList: (string | React.ReactNode)[],
    target: string,
    createBadge: (key: string) => React.ReactNode
  ) => {
    const nextList: (string | React.ReactNode)[] = [];
    currentList.forEach((item, idx) => {
      if (typeof item === 'string' && item.includes(target)) {
        const parts = item.split(target);
        parts.forEach((part, pIdx) => {
          if (part) nextList.push(part);
          if (pIdx < parts.length - 1) {
            nextList.push(createBadge(`${idx}-${pIdx}`));
          }
        });
      } else {
        nextList.push(item);
      }
    });
    return nextList;
  };

  // Badge 27.000 Kz
  let processed = processMatch(elements, '27.000 Kz', (key) => (
    <span
      key={key}
      title="Valor histórico do modelo antigo (anterior a 10/2026)"
      className="text-amber-300 font-bold inline-flex items-center"
    >
      27.000 Kz
      <span className="ml-1 text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 text-amber-300 font-semibold tracking-wide">
        Histórico
      </span>
    </span>
  ));

  // D.1: Badge +244 923 000 000
  processed = processMatch(processed, '+244 923 000 000', (key) => (
    <span
      key={key}
      title="Contacto telefónico histórico de suporte"
      className="text-amber-300 font-medium inline-flex items-center font-mono"
    >
      +244 923 000 000
      <span className="ml-1 text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 text-amber-300 font-semibold tracking-wide">
        Histórico
      </span>
    </span>
  ));

  return <>{processed}</>;
};

// D.2: Formatação de datas em padrão português: DD/MM/YYYY · HH:mm
const formatAuditTimestamp = (ts: string): string => {
  if (!ts) return '';
  const regex = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::\d{2})?/;
  const match = ts.match(regex);
  if (match) {
    const [, yyyy, mm, dd, hh, min] = match;
    return `${dd}/${mm}/${yyyy} · ${hh}:${min}`;
  }
  return ts;
};

// D.4: Mascaramento dos últimos 2 dígitos do IP com localização
const maskIpAddress = (ipStr: string): string => {
  if (!ipStr) return '';
  return ipStr.replace(/\b(\d{1,3}\.\d{1,3}\.\d{1,3}\.)\d{1,3}\b/, '$1**');
};

// E.5: Contagem de alterações no Diff (Before vs After)
const getDiffChangesCount = (entry: AdminAuditDetail): number => {
  if (!entry.after && !entry.before) return 0;
  if (!entry.before && entry.after) return Object.keys(entry.after).length;
  if (entry.before && !entry.after) return Object.keys(entry.before).length;
  if (entry.before && entry.after) {
    const allKeys = new Set([...Object.keys(entry.before), ...Object.keys(entry.after)]);
    let count = 0;
    allKeys.forEach((key) => {
      const bVal = JSON.stringify(entry.before?.[key]);
      const aVal = JSON.stringify(entry.after?.[key]);
      if (bVal !== aVal) {
        count++;
      }
    });
    return count > 0 ? count : allKeys.size;
  }
  return 0;
};

export const AdminAudit: React.FC = () => {
  const [logs, setLogs] = useState<AdminAuditDetail[]>(() =>
    AdminDataService.getAuditLogs()
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedAdmin, setSelectedAdmin] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('ALL');

  // Drawer de Diff Lado a Lado
  const [selectedEntryForDiff, setSelectedEntryForDiff] = useState<AdminAuditDetail | null>(null);

  const handleRefresh = () => {
    setLogs(AdminDataService.getAuditLogs());
  };

  // D.5: Opções únicas de administrador (normalizando Administrador Kizongelu para Admin Kizongelu)
  const adminOptions = React.useMemo(() => {
    const set = new Set<string>();
    logs.forEach((log) => {
      if (log.adminNome) {
        const normalized = log.adminNome.replace(/Administrador Kizongelu/gi, 'Admin Kizongelu');
        set.add(normalized);
      }
    });
    return Array.from(set).sort();
  }, [logs]);

  const filteredLogs = logs.filter((log) => {
    const normalizedAdminNome = (log.adminNome || '').replace(/Administrador Kizongelu/gi, 'Admin Kizongelu');

    const matchesSearch =
      log.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.evento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      normalizedAdminNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ip.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity = selectedSeverity === 'ALL' || log.gravidade === selectedSeverity;

    const matchesAdmin = selectedAdmin === 'ALL' || normalizedAdminNome === selectedAdmin;

    const matchesType =
      selectedType === 'ALL' ||
      (selectedType === 'PAYMENT' && log.evento.includes('PAYMENT')) ||
      (selectedType === 'PRICE' && log.evento.includes('PRICE')) ||
      (selectedType === 'FORMULA' && log.evento.includes('FORMULA')) ||
      (selectedType === 'ENGINE' && log.evento.includes('ENGINE')) ||
      (selectedType === 'USER' && (log.evento.includes('USER') || log.evento.includes('ROLE'))) ||
      (selectedType === 'SETTINGS' && log.evento.includes('SETTINGS'));

    let matchesPeriod = true;
    if (selectedPeriod === 'TODAY') {
      const todayStr = new Date().toISOString().substring(0, 10);
      matchesPeriod = log.timestamp.startsWith(todayStr);
    } else if (selectedPeriod === '7DAYS') {
      const now = Date.now();
      const logDate = new Date(log.timestamp.replace(' ', 'T')).getTime();
      matchesPeriod = now - logDate <= 7 * 24 * 60 * 60 * 1000;
    } else if (selectedPeriod === '30DAYS') {
      const now = Date.now();
      const logDate = new Date(log.timestamp.replace(' ', 'T')).getTime();
      matchesPeriod = now - logDate <= 30 * 24 * 60 * 60 * 1000;
    }

    return matchesSearch && matchesSeverity && matchesAdmin && matchesType && matchesPeriod;
  });

  // E.6: Exportar registos filtrados para ficheiro CSV
  const exportToCSV = () => {
    const headers = [
      'Data',
      'Administrador',
      'Email',
      'Evento',
      'Gravidade',
      'Descrição',
      'IP',
      'Hash',
    ];

    const rows = filteredLogs.map((e) => [
      `"${formatAuditTimestamp(e.timestamp)}"`,
      `"${(e.adminNome || '').replace(/Administrador Kizongelu/gi, 'Admin Kizongelu').replace(/"/g, '""')}"`,
      `"${(e.adminEmail || '').replace(/"/g, '""')}"`,
      `"${(e.evento || '').replace(/"/g, '""')}"`,
      `"${(e.gravidade || '').replace(/"/g, '""')}"`,
      `"${(e.descricao || '').replace(/"/g, '""')}"`,
      `"${maskIpAddress(e.ip).replace(/"/g, '""')}"`,
      `"${(e.hashSha256 || '').replace(/"/g, '""')}"`,
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `auditoria-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Topo com Título e Estatísticas de Auditoria */}
      <div className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700/80 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-black text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Auditoria de Segurança e Registos de Acesso
            </h1>
            <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/30">
              Registo Imutável
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Rastreamento detalhado de alterações a pagamentos, preços, fórmulas e privilégios administrativos.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* E.6: Botão Exportar CSV */}
          <button
            type="button"
            onClick={exportToCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-300 hover:text-white border border-slate-600 hover:border-slate-500 bg-slate-800/90 hover:bg-slate-750 rounded-xl transition-colors cursor-pointer"
            title="Exportar registos filtrados para CSV"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Exportar CSV</span>
          </button>

          <button
            type="button"
            onClick={handleRefresh}
            className="px-3.5 py-2 bg-slate-700 hover:bg-slate-650 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer border border-slate-600"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span>Actualizar Registos</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros (Tipo, Gravidade, Administrador, Período) */}
      <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Pesquisa */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pesquisar por ação, admin, IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Filtros em Linha */}
        <div className="flex items-center flex-wrap gap-2 w-full md:w-auto">
          {/* Tipo de Evento */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="p-2 rounded-xl border border-slate-700 bg-slate-900 text-white font-medium focus:outline-none"
          >
            <option value="ALL">Todos os Tipos</option>
            <option value="PAYMENT">Pagamentos</option>
            <option value="PRICE">Preços & Materiais</option>
            <option value="FORMULA">Fórmulas Técnicas</option>
            <option value="ENGINE">Versões do Motor</option>
            <option value="USER">Utilizadores & Roles</option>
            <option value="SETTINGS">Definições</option>
          </select>

          {/* Gravidade */}
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="p-2 rounded-xl border border-slate-700 bg-slate-900 text-white font-medium focus:outline-none"
          >
            <option value="ALL">Todas as Gravidades</option>
            <option value="INFO">Informativo (INFO)</option>
            <option value="AVISO">Avisos (AVISO)</option>
            <option value="CRITICO">Crítico (CRITICO)</option>
          </select>

          {/* D.5: Administrador (entre Gravidade e Período) */}
          <select
            value={selectedAdmin}
            onChange={(e) => setSelectedAdmin(e.target.value)}
            className="p-2 rounded-xl border border-slate-700 bg-slate-900 text-white font-medium focus:outline-none"
          >
            <option value="ALL">Todos os administradores</option>
            {adminOptions.map((admin) => (
              <option key={admin} value={admin}>
                {admin}
              </option>
            ))}
          </select>

          {/* Período */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="p-2 rounded-xl border border-slate-700 bg-slate-900 text-white font-medium focus:outline-none"
          >
            <option value="ALL">Todo o histórico</option>
            <option value="TODAY">Hoje</option>
            <option value="7DAYS">Últimos 7 dias</option>
            <option value="30DAYS">Este mês</option>
          </select>
        </div>
      </div>

      {/* Tabela de Auditoria com Descrição Humana */}
      <div className="bg-slate-800/90 rounded-2xl border border-slate-700/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-700">
              <tr>
                <th className="py-3.5 px-6 font-bold w-44">Data / Hora</th>
                <th className="py-3.5 px-6 font-bold w-44">Administrador</th>
                <th className="py-3.5 px-4 font-bold w-36">Evento</th>
                <th className="py-3.5 px-6 font-bold">Descrição da Ação (Humana)</th>
                <th className="py-3.5 px-4 font-bold w-44">IP / Origem</th>
                <th className="py-3.5 px-6 font-bold text-right w-24">Diff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <ShieldCheck className="w-10 h-10 mx-auto mb-3 opacity-30 text-amber-400" />
                    <p className="text-sm font-bold text-white">Nenhum registo de auditoria encontrado</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Não foram encontrados registos correspondentes aos critérios de pesquisa e filtros seleccionados.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedSeverity('ALL');
                        setSelectedAdmin('ALL');
                        setSelectedType('ALL');
                        setSelectedPeriod('ALL');
                      }}
                      className="mt-3.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-650 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                    >
                      Limpar Filtros
                    </button>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-750/50 transition-colors">
                    {/* D.2: Data/Hora em formato PT */}
                    <td className="py-3.5 px-6 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {formatAuditTimestamp(entry.timestamp)}
                    </td>

                    <td className="py-3.5 px-6">
                      <div className="font-bold text-white">
                        {entry.adminNome.replace(/Administrador Kizongelu/gi, 'Admin Kizongelu')}
                      </div>
                      <div className="text-[10px] text-slate-400">{entry.adminEmail}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          entry.gravidade === 'CRITICO'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : entry.gravidade === 'AVISO'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                        }`}
                      >
                        <span>{entry.gravidade}</span>
                      </span>
                    </td>

                    {/* D.1 & D.3: Descrição Humana sem hash na tabela; link para detalhes técnicos */}
                    <td className="py-3.5 px-6 text-slate-200">
                      <div className="font-medium leading-relaxed">{renderAuditDescription(entry.descricao)}</div>
                      <button
                        type="button"
                        onClick={() => setSelectedEntryForDiff(entry)}
                        className="text-[11px] text-amber-400 hover:text-amber-300 font-medium inline-flex items-center gap-1 mt-1 cursor-pointer transition-colors"
                      >
                        <span>Ver detalhes técnicos</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>

                    {/* D.4: IP com últimos 2 dígitos mascarados e tooltip */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 truncate">
                      <span title="IP mascarado por privacidade" className="cursor-help">
                        {maskIpAddress(entry.ip)}
                      </span>
                    </td>

                    {/* E.5: Botão DIFF com GitCompare e contador de alterações */}
                    <td className="py-3.5 px-6 text-right">
                      {(entry.before || entry.after) ? (() => {
                        const count = getDiffChangesCount(entry);
                        return (
                          <button
                            type="button"
                            onClick={() => setSelectedEntryForDiff(entry)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-slate-300 hover:text-white border border-white/10 hover:border-white/20 rounded-lg transition-colors cursor-pointer ml-auto bg-slate-800/80 hover:bg-slate-750"
                            title="Ver alterações detalhadas"
                          >
                            <GitCompare className="w-3.5 h-3.5 text-amber-400" />
                            <span>Ver Diff</span>
                            {count > 0 && (
                              <span className="ml-0.5 px-1.5 py-0.2 text-[9px] font-mono bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30">
                                {count}
                              </span>
                            )}
                          </button>
                        );
                      })() : (
                        <span className="text-[11px] text-slate-500 italic">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DRAWER LATERAL COM DIFF LADO A LADO (BEFORE VS AFTER)                     */}
      {/* ========================================================================= */}
      {selectedEntryForDiff && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex justify-end">
          <div className="bg-slate-900 border-l border-slate-700 w-full max-w-2xl h-full flex flex-col p-6 space-y-5 text-white overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Topo do Drawer */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <FileCode className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-base font-bold text-white">Inspeção de Diff (Antes vs Depois)</h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ID: {selectedEntryForDiff.id} &bull; {formatAuditTimestamp(selectedEntryForDiff.timestamp)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedEntryForDiff(null)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Metadados da Ação */}
            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Administrador:</span>
                <span className="font-bold text-white">
                  {selectedEntryForDiff.adminNome.replace(/Administrador Kizongelu/gi, 'Admin Kizongelu')} ({selectedEntryForDiff.adminEmail})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Evento:</span>
                <span className="font-mono text-amber-300 font-bold">{selectedEntryForDiff.evento}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">IP de Origem:</span>
                <span className="font-mono text-slate-300 cursor-help" title="IP mascarado por privacidade">
                  {maskIpAddress(selectedEntryForDiff.ip)}
                </span>
              </div>
              <div className="pt-1 border-t border-slate-700 text-slate-300">
                {renderAuditDescription(selectedEntryForDiff.descricao)}
              </div>
            </div>

            {/* Painel Lado a Lado (Diff) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
              {/* Coluna "Antes" */}
              <div className="bg-slate-950/80 rounded-2xl border border-rose-500/30 p-4 space-y-2 flex flex-col">
                <div className="flex items-center justify-between pb-2 border-b border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider">
                  <span>Antes (Before)</span>
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                </div>
                <div className="flex-1 font-mono text-[11px] text-slate-300 overflow-x-auto p-2 bg-slate-900/60 rounded-xl">
                  {selectedEntryForDiff.before ? (
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(selectedEntryForDiff.before, null, 2)}
                    </pre>
                  ) : (
                    <span className="text-slate-500 italic">Sem estado prévio (criação inicial)</span>
                  )}
                </div>
              </div>

              {/* Coluna "Depois" */}
              <div className="bg-slate-950/80 rounded-2xl border border-emerald-500/30 p-4 space-y-2 flex flex-col">
                <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <span>Depois (After)</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <div className="flex-1 font-mono text-[11px] text-emerald-300 overflow-x-auto p-2 bg-slate-900/60 rounded-xl">
                  {selectedEntryForDiff.after ? (
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(selectedEntryForDiff.after, null, 2)}
                    </pre>
                  ) : (
                    <span className="text-slate-500 italic">Sem estado posterior</span>
                  )}
                </div>
              </div>
            </div>

            {/* D.3: Hash no Fundo do Detalhe Técnico */}
            <div className="p-3.5 bg-slate-950/90 rounded-2xl border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase tracking-wider font-bold">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Hash className="w-3.5 h-3.5 text-amber-400" />
                  Hash de Integridade Criptográfica (SHA-256)
                </span>
                <span className="text-emerald-400 font-semibold">Registo Imutável</span>
              </div>
              <div className="font-mono text-xs text-amber-300 break-all bg-slate-900 p-2.5 rounded-xl border border-slate-800/80 select-all">
                {selectedEntryForDiff.hashSha256}
              </div>
            </div>

            {/* Rodapé do Drawer */}
            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedEntryForDiff(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors"
              >
                Fechar Painel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAudit;
