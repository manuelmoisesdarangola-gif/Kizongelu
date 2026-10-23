/**
 * @file src/components/admin/AdminDashboard.tsx
 * Ecrã de Dashboard Administrativo do Kizongelu (Fase 10 - Tarefa 2).
 * 
 * - 5 KPIs: Receita mês · Orçamentos emitidos · Taxa conversão · Pagamentos pendentes · Assinaturas activas
 * - Gráfico linha: receita dos últimos 30 dias (SVG interativo)
 * - Gráfico barras: orçamentos por província de Angola
 * - Donut: distribuição por tipo de utilizador
 * - Tabela "Pagamentos pendentes de aprovação" (5 linhas + botão ver todos)
 * - Alertas operacionais
 */

import React, { useState } from 'react';
import { formatCurrencyKz } from '../../../lib/format/currency';
import {
  TrendingUp,
  FileText,
  Percent,
  Clock,
  Crown,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Eye,
  ArrowUpRight,
  ShieldAlert,
  Building,
  Users,
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigateToSection: (section: any) => void;
  pendingCount: number;
  paymentsList: Array<{
    id: string;
    projectId: string;
    projectName: string;
    clientName: string;
    amount: number;
    method: string;
    reference: string;
    status: string;
    submittedAt: string;
    packageType?: string;
  }>;
  onReviewPayment: (paymentId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigateToSection,
  pendingCount,
  paymentsList,
  onReviewPayment,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<{ day: number; val: number; date: string } | null>(null);

  // Filtros rápidos da tabela de pagamentos pendentes (Bloco 7.3)
  const [filterMethod, setFilterMethod] = useState<'all' | 'mcx' | 'transfer'>('all');
  const [filterPeriod, setFilterPeriod] = useState<'today' | '7d' | '30d'>('today');

  // Dados dos 30 dias de receita (Kz)
  const revenue30Days = [
    { day: 1, val: 68000, date: '25 Fev' },
    { day: 3, val: 95000, date: '27 Fev' },
    { day: 5, val: 122000, date: '01 Mar' },
    { day: 8, val: 81000, date: '04 Mar' },
    { day: 10, val: 145000, date: '06 Mar' },
    { day: 12, val: 98000, date: '08 Mar' },
    { day: 15, val: 190000, date: '11 Mar' },
    { day: 17, val: 135000, date: '13 Mar' },
    { day: 19, val: 215000, date: '15 Mar' },
    { day: 22, val: 160000, date: '18 Mar' },
    { day: 24, val: 240000, date: '20 Mar' },
    { day: 26, val: 180000, date: '22 Mar' },
    { day: 28, val: 275000, date: '23 Mar' },
    { day: 30, val: 320000, date: 'Hoje' },
  ];

  const maxVal = Math.max(...revenue30Days.map((d) => d.val));
  const minVal = Math.min(...revenue30Days.map((d) => d.val));

  // Províncias com contagem de orçamentos
  const provincialBudgets = [
    { provincia: 'Luanda', count: 78, pct: 55, color: '#F59E0B' },
    { provincia: 'Benguela', count: 24, pct: 17, color: '#38BDF8' },
    { provincia: 'Huíla', count: 16, pct: 11, color: '#10B981' },
    { provincia: 'Huambo', count: 11, pct: 8, color: '#A855F7' },
    { provincia: 'Cabinda', count: 8, pct: 6, color: '#F43F5E' },
    { provincia: 'Cuanza Sul', count: 5, pct: 3, color: '#94A3B8' },
  ];

  // Distribuição de utilizadores (Donut)
  // TODO: ligar ao cálculo real de distribuição por role
  // TODO: ligar ao cálculo real de novos registos semanais na BD. Valor actual (+24) é mock de demonstração
  const userDistribution = [
    { tipo: 'Particular', pct: 48, count: 245, color: '#38BDF8' },
    { tipo: 'Profissional', pct: 28, count: 142, color: '#F59E0B' },
    { tipo: 'Empresa', pct: 18, count: 91, color: '#10B981' },
    { tipo: 'Empresa Plus', pct: 6, count: 32, color: '#A855F7' },
  ];

  // Bloco 7.7: Badges coloridos por pacote
  const getPackageBadge = (amount: number, packageType?: string) => {
    let name = packageType;
    if (!name) {
      if (amount >= 45000) name = 'Empresa Plus';
      else if (amount >= 25000) name = 'Empresa';
      else if (amount >= 15000) name = 'Profissional';
      else name = 'Particular';
    }

    switch (name) {
      case 'Particular':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide bg-slate-500/20 text-slate-300 border border-slate-500/30">
            Particular
          </span>
        );
      case 'Profissional':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide bg-sky-500/20 text-sky-300 border border-sky-500/30">
            Profissional
          </span>
        );
      case 'Empresa':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Empresa
          </span>
        );
      case 'Empresa Plus':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            Empresa Plus
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide bg-slate-500/20 text-slate-300">
            {name}
          </span>
        );
    }
  };

  const pendingPayments = paymentsList.filter((p) => p.status === 'PENDING_APPROVAL');

  // Bloco 7.3: Filtragem rápida por método e período
  const filteredPayments = pendingPayments.filter((p) => {
    if (filterMethod === 'mcx' && p.method !== 'MULTICAIXA_EXPRESS') return false;
    if (filterMethod === 'transfer' && p.method !== 'TRANSFERENCIA') return false;
    if (filterPeriod === 'today') {
      return p.submittedAt.includes('Hoje');
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. OS 5 KPIS PRINCIPAIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Receita Mês */}
        {/* TODO: ligar a agregação real da BD. Valor actual (2.840.000 Kz) é mock/seed de demonstração */}
        <div className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700/80 shadow-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Receita do Mês</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 mt-2">2.840.000 Kz</div>
          <div className="flex items-center text-[11px] text-emerald-400 font-semibold mt-1">
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            <span>+24.2% vs mês anterior</span>
          </div>
        </div>

        {/* KPI 2: Orçamentos Emitidos */}
        <div className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700/80 shadow-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Orçamentos Emitidos</span>
            <FileText className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">142</div>
          <span className="text-[11px] text-slate-400 font-semibold mt-1 block">
            +18 emitidos esta semana
          </span>
        </div>

        {/* KPI 3: Taxa de Conversão */}
        <div
          title="Meta configurável em Definições > KPIs"
          className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700/80 shadow-md"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Taxa de Conversão</span>
            <Percent className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">68.4%</div>
          <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">
            Acima da meta (60%)
          </span>
        </div>

        {/* KPI 4: Pagamentos Pendentes */}
        <div
          onClick={() => onNavigateToSection('pagamentos')}
          className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700/80 shadow-md cursor-pointer hover:border-amber-500/50 transition-colors group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider group-hover:text-amber-300">
              Pagamentos Pendentes
            </span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2 flex items-center justify-between">
            <span>{pendingCount}</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] animate-pulse" />
          </div>
          <span className="text-[11px] text-amber-300 font-semibold mt-1 block">
            Comprovativos por conferir
          </span>
        </div>

        {/* KPI 5: Pacotes Activos */}
        {/* TODO: ligar a query real de distribuição. Valores actuais são mock de demonstração */}
        <div
          onClick={() => onNavigateToSection('assinaturas')}
          className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700/80 shadow-md cursor-pointer hover:border-amber-500/50 transition-colors group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider group-hover:text-amber-300">
              Pacotes Activos
            </span>
            <Crown className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">38</div>
          <span className="text-[11px] text-slate-400 font-semibold mt-1 block">
            25 Empresas · 13 Profissionais
          </span>
        </div>
      </div>

      {/* 2. GRÁFICOS: LINHA DE RECEITA (30 DIAS) + BARRAS PROVÍNCIAS + DONUT UTILIZADORES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GRÁFICO 1: LINHA DE RECEITA (2 COLUNAS EM DESKTOP) */}
        <div className="lg:col-span-2 bg-slate-800/90 rounded-3xl p-6 border border-slate-700/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-base font-bold text-white">Evolução da Receita nos Últimos 30 Dias</h3>
              <p className="text-xs text-slate-400">
                Faturação diária validada via pagamentos aprovados.
              </p>
            </div>
            <div className="text-xs font-mono bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700 text-amber-400 font-bold">
              Últimos 30 dias · 2.840.000 Kz
            </div>
          </div>

          {/* Gráfico SVG de Linha Interativo */}
          <div className="relative pt-6 pb-2">
            {hoveredPoint && (
              <div className="absolute top-0 right-4 px-3 py-1 bg-amber-500 text-slate-950 rounded-lg text-xs font-bold shadow-md">
                {hoveredPoint.date}: {formatCurrencyKz(hoveredPoint.val)}
              </div>
            )}

            <svg viewBox="0 0 600 180" className="w-full h-44 overflow-visible">
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Linhas de grelha horizontais */}
              <line x1="0" y1="30" x2="600" y2="30" stroke="#334155" strokeDasharray="3 3" opacity="0.5" />
              <line x1="0" y1="80" x2="600" y2="80" stroke="#334155" strokeDasharray="3 3" opacity="0.5" />
              <line x1="0" y1="130" x2="600" y2="130" stroke="#334155" strokeDasharray="3 3" opacity="0.5" />

              {/* Área com gradiente */}
              {(() => {
                const points = revenue30Days.map((d, i) => {
                  const x = (i / (revenue30Days.length - 1)) * 600;
                  const y = 160 - ((d.val - minVal) / (maxVal - minVal || 1)) * 130;
                  return { x, y, ...d };
                });

                const lineD = points.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');
                const areaD = `${lineD} L 600 170 L 0 170 Z`;

                return (
                  <>
                    <path d={areaD} fill="url(#revenueGrad)" />
                    <path d={lineD} fill="none" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
                    {points.map((p, i) => (
                      <circle
                        key={i}
                        cx={p.x}
                        cy={p.y}
                        r={hoveredPoint?.day === p.day ? 6 : 4}
                        fill="#F59E0B"
                        stroke="#0F172A"
                        strokeWidth="2"
                        className="cursor-pointer transition-all hover:r-6"
                        onMouseEnter={() => setHoveredPoint(p)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    ))}
                  </>
                );
              })()}
            </svg>

            <div className="flex justify-between text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-700/60">
              <span>25 Fev</span>
              <span>05 Mar</span>
              <span>15 Mar</span>
              <span>Hoje (24 Mar)</span>
            </div>
          </div>
        </div>

        {/* GRÁFICO 2: DONUT DE UTILIZADORES */}
        <div className="bg-slate-800/90 rounded-3xl p-6 border border-slate-700/80 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-white">Distribuição por Utilizador</h3>
              <p className="text-xs text-slate-400">Total de 510 contas activas na plataforma.</p>
            </div>
            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl whitespace-nowrap">
              +24 esta semana
            </span>
          </div>

          <div className="flex items-center justify-center py-2">
            <div className="relative w-36 h-36">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                {/* Particular (48%) */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="transparent"
                  stroke="#38BDF8"
                  strokeWidth="3.8"
                  strokeDasharray="48 52"
                  strokeDashoffset="0"
                />
                {/* Profissional (28%) */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="transparent"
                  stroke="#F59E0B"
                  strokeWidth="3.8"
                  strokeDasharray="28 72"
                  strokeDashoffset="-48"
                />
                {/* Empresa (18%) */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="transparent"
                  stroke="#10B981"
                  strokeWidth="3.8"
                  strokeDasharray="18 82"
                  strokeDashoffset="-76"
                />
                {/* Empresa Plus (6%) */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="transparent"
                  stroke="#A855F7"
                  strokeWidth="3.8"
                  strokeDasharray="6 94"
                  strokeDashoffset="-94"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black text-white">510</span>
                <span className="text-[9px] text-slate-400 uppercase font-bold">Contas</span>
              </div>
            </div>
          </div>

          {/* Legenda do Donut */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {userDistribution.map((item) => (
              <div key={item.tipo} className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-300 font-medium truncate">{item.tipo}</span>
                <span className="text-slate-400 font-mono ml-auto">{item.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. BARRAS: ORÇAMENTOS POR PROVÍNCIA + ALERTAS OPERACIONAIS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Barras: Províncias */}
        <div className="lg:col-span-2 bg-slate-800/90 rounded-3xl p-6 border border-slate-700/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Orçamentos Emitidos por Província</h3>
              <p className="text-xs text-slate-400">Concentração geográfica das obras orçadas em Angola.</p>
            </div>
            <span className="text-xs font-bold text-slate-400">142 Orçamentos</span>
          </div>

          <div className="space-y-3 pt-2">
            {provincialBudgets.map((b) => (
              <div key={b.provincia} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-200">{b.provincia}</span>
                  <span className="text-slate-400 font-mono">
                    {b.count} obras ({b.pct}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${b.pct}%`, backgroundColor: b.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alertas Operacionais */}
        <div className="bg-slate-800/90 rounded-3xl p-6 border border-slate-700/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              Alertas Operacionais
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-full">
              3 Ativos
            </span>
          </div>

          <div className="space-y-3">
            {/* Alerta 1: Comprovativos pendentes */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start space-x-3">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <strong className="text-xs font-bold text-amber-300">
                    3 Comprovativos sem Revisão
                  </strong>
                  <span className="text-[10px] text-amber-400/80 font-mono">
                    Hoje, 14:15
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Pagamentos Multicaixa Express no Kilamba e Viana pendentes de conciliação.
                </p>
                <button
                  onClick={() => onNavigateToSection('pagamentos')}
                  className="mt-2 text-[10px] font-bold text-amber-400 hover:underline cursor-pointer"
                >
                  Conferir agora →
                </button>
              </div>
            </div>

            {/* Alerta 2: Preço de Cimento Cabinda */}
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start space-x-3">
              <Clock className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <strong className="text-xs font-bold text-rose-300">
                    Cimento em Cabinda Desactualizado
                  </strong>
                  <span className="text-[10px] text-rose-400/80 font-mono">
                    Última revisão: 12/10/2026
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Preço de referência do cimento 42.5R em Cabinda não é revisto há 14 dias.
                </p>
                <div className="mt-1 text-[10px] text-slate-400 italic">
                  Ciclo de revisão recomendado: 90 dias.
                </div>
                <button
                  onClick={() => onNavigateToSection('precos')}
                  className="mt-2 text-[10px] font-bold text-rose-400 hover:underline cursor-pointer"
                >
                  Ajustar tabela de preços →
                </button>
              </div>
            </div>

            {/* Alerta 3: Integridade do Motor */}
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-start space-x-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <strong className="text-xs font-bold text-emerald-300">
                    Motor Determinístico v2.4 Íntegro
                  </strong>
                  <span className="text-[10px] text-emerald-400/80 font-mono">
                    Última verificação: Hoje, 16:30
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Backup automático diário e coeficientes revistos em Setembro 2026. Motor validado por engenheiros civis.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. TABELA: PAGAMENTOS PENDENTES DE APROVAÇÃO (5 LINHAS + VER TODOS) */}
      <div className="bg-slate-800/90 rounded-3xl border border-slate-700/80 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              Pagamentos Pendentes de Aprovação
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Conferência financeira dos comprovativos para desbloqueio imediato da obra ao utilizador.
            </p>
          </div>
          <button
            onClick={() => onNavigateToSection('pagamentos')}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
          >
            <span>Ver Todos ({pendingCount})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Faixa de Filtros Rápidos (Bloco 7.3 — Opção A) */}
        <div className="px-6 py-3.5 border-b border-slate-700/80 bg-slate-900/40 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Método */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Método:</span>
              <button
                type="button"
                onClick={() => setFilterMethod('all')}
                className={`px-3 py-1.5 text-xs rounded-full transition-all cursor-pointer ${
                  filterMethod === 'all'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 font-semibold'
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setFilterMethod('mcx')}
                className={`px-3 py-1.5 text-xs rounded-full transition-all cursor-pointer ${
                  filterMethod === 'mcx'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 font-semibold'
                }`}
              >
                Multicaixa Express
              </button>
              <button
                type="button"
                onClick={() => setFilterMethod('transfer')}
                className={`px-3 py-1.5 text-xs rounded-full transition-all cursor-pointer ${
                  filterMethod === 'transfer'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 font-semibold'
                }`}
              >
                Transferência bancária
              </button>
            </div>

            {/* Separador visual */}
            <div className="w-px h-5 bg-white/10 mx-2 hidden sm:block" />

            {/* Período */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Período:</span>
              <button
                type="button"
                onClick={() => setFilterPeriod('today')}
                className={`px-3 py-1.5 text-xs rounded-full transition-all cursor-pointer ${
                  filterPeriod === 'today'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 font-semibold'
                }`}
              >
                Hoje
              </button>
              <button
                type="button"
                onClick={() => setFilterPeriod('7d')}
                className={`px-3 py-1.5 text-xs rounded-full transition-all cursor-pointer ${
                  filterPeriod === '7d'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 font-semibold'
                }`}
              >
                7 dias
              </button>
              <button
                type="button"
                onClick={() => setFilterPeriod('30d')}
                className={`px-3 py-1.5 text-xs rounded-full transition-all cursor-pointer ${
                  filterPeriod === '30d'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 font-semibold'
                }`}
              >
                30 dias
              </button>
            </div>
          </div>

          {(filterMethod !== 'all' || filterPeriod !== 'today') && (
            <button
              type="button"
              onClick={() => {
                setFilterMethod('all');
                setFilterPeriod('today');
              }}
              className="text-[11px] font-semibold text-amber-400 hover:underline cursor-pointer"
            >
              Repor filtros
            </button>
          )}
        </div>

        {filteredPayments.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-xs">
            <CheckCircle2 className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            Nenhum pagamento pendente encontrado com os filtros selecionados.
            <div className="mt-3">
              <button
                type="button"
                onClick={() => {
                  setFilterMethod('all');
                  setFilterPeriod('today');
                }}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer"
              >
                Limpar filtros
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-700">
                <tr>
                  <th className="px-6 py-4 font-bold">Referência / Obra</th>
                  <th className="px-6 py-4 font-bold">Cliente</th>
                  <th className="px-6 py-4 font-bold">Pacote</th>
                  <th className="px-6 py-4 font-bold">Método</th>
                  <th className="px-6 py-4 font-bold">Valor</th>
                  <th className="px-6 py-4 font-bold">Submetido</th>
                  <th className="px-6 py-4 font-bold text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {filteredPayments.slice(0, 5).map((p) => (
                  <tr key={p.id} className="hover:bg-slate-750/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white">{p.projectName}</div>
                      <div className="text-[10px] text-amber-300 font-mono">{p.reference}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-200">{p.clientName}</td>
                    <td className="px-6 py-4">
                      {getPackageBadge(p.amount, p.packageType)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-300">
                        {p.method === 'MULTICAIXA_EXPRESS' ? 'Multicaixa Express' : 'Transferência bancária'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-amber-400 text-sm">
                      {formatCurrencyKz(p.amount)}
                    </td>
                    <td className="px-6 py-4 text-slate-400">{p.submittedAt}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => onReviewPayment(p.id)}
                        className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold rounded-xl text-xs transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Rever</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
