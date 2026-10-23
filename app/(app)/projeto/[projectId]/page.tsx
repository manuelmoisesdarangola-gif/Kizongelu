/**
 * @file app/(app)/projeto/[projectId]/page.tsx
 * Página de Visão Geral do Projeto .
 * Suporta Tabs: Visão Geral · Orçamento · Documentos · Versões e Estado (DRAFT / COMPLETED / UNLOCKED).
 */

import React, { useEffect, useState } from 'react';
import { getPreview, ProjectPreviewData } from '../../../../lib/actions/preview';
import {
  FolderKanban,
  FileText,
  Files,
  History,
  Lock,
  Unlock,
  CheckCircle2,
  Calendar,
  Layers,
  MapPin,
  ArrowRight,
  ExternalLink,
  Coins,
  Sparkles,
} from 'lucide-react';

interface ProjectOverviewProps {
  projectId?: string;
  onNavigateToPreview?: () => void;
}

export const ProjectOverviewPage: React.FC<ProjectOverviewProps> = ({
  projectId = 'proj_sample_01',
  onNavigateToPreview,
}) => {
  const [tab, setTab] = useState<'overview' | 'budget' | 'documents' | 'versions'>('overview');
  const [data, setData] = useState<ProjectPreviewData | null>(null);

  useEffect(() => {
    getPreview(projectId).then(setData).catch(console.error);
  }, [projectId]);

  if (!data) {
    return (
      <div className="p-12 text-center text-slate-500 font-sans">
        A carregar dados do projeto...
      </div>
    );
  }

  const statusBadge =
    data.status === 'UNLOCKED'
      ? { label: 'Concluído', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: Unlock }
      : data.status === 'ESTIMATED'
      ? { label: 'Orçamento Gerado (Pré-visualização)', bg: 'bg-amber-50 text-amber-800 border-amber-200', icon: Lock }
      : { label: 'Rascunho (Draft)', bg: 'bg-slate-100 text-slate-700 border-slate-200', icon: FolderKanban };

  const StatusIcon = statusBadge.icon;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16 font-['Inter',sans-serif]">
      {/* Header do Projeto */}
      <div className="bg-white border-b border-slate-200 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5 mb-1.5">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1 ${statusBadge.bg}`}>
                <StatusIcon className="w-3.5 h-3.5" />
                <span>{statusBadge.label}</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">ID: {data.projectId}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {data.title}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {data.summary.municipality}, {data.summary.province} • {data.summary.area} m² • {data.summary.typeLabel}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {onNavigateToPreview && (
              <button
                type="button"
                onClick={onNavigateToPreview}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center space-x-2 transition-all shadow-xs cursor-pointer"
              >
                <span>Abrir Ecrã de Preview</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto mt-6 flex space-x-1 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setTab('overview')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center space-x-2 ${
              tab === 'overview'
                ? 'border-amber-500 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FolderKanban className="w-4 h-4" />
            <span>Visão Geral</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('budget')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center space-x-2 ${
              tab === 'budget'
                ? 'border-amber-500 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>Orçamento</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('documents')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center space-x-2 ${
              tab === 'documents'
                ? 'border-amber-500 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Files className="w-4 h-4" />
            <span>Documentos</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('versions')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center space-x-2 ${
              tab === 'versions'
                ? 'border-amber-500 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Versões</span>
          </button>
        </div>
      </div>

      {/* Conteúdo da Tab */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Valor Paramétrico Total
                </span>
                <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900 block mt-1">
                  {data.totals.grandTotal.toLocaleString('pt-PT')} Kz
                </span>
                <p className="text-xs text-slate-500 mt-1">
                  Materiais ({data.totals.materialsTotal.toLocaleString('pt-PT')} Kz) + M.O. ({data.totals.laborTotal.toLocaleString('pt-PT')} Kz)
                </p>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Índice de Confiança
                </span>
                <span className="text-2xl font-black text-slate-900 block mt-1">
                  {data.confidence.level} ({data.confidence.score}/100)
                </span>
                <p className="text-xs text-slate-500 mt-1">
                  {data.confidence.reasons[0] || 'Parâmetros completos e consistentes.'}
                </p>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Para Chegar à Cobertura
                </span>
                <span className="text-2xl font-black font-mono text-amber-600 block mt-1">
                  {data.milestoneCoverage.coberturaCost.toLocaleString('pt-PT')} Kz
                </span>
                <p className="text-xs text-slate-500 mt-1">
                  Equivale a {data.milestoneCoverage.coberturaPercentage}% do valor total da obra.
                </p>
              </div>
            </div>

            {/* Ações Rápidas */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-extrabold text-slate-900">
                  Pronto para aceder aos detalhes e exportar?
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Consulte a pré-visualização completa ou desbloqueie os 6 capítulos para obter o Orçamento e Mapa de Quantidades em PDF e Excel.
                </p>
              </div>
              {onNavigateToPreview && (
                <button
                  type="button"
                  onClick={onNavigateToPreview}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-xs cursor-pointer flex-shrink-0"
                >
                  Abrir Pré-Visualização
                </button>
              )}
            </div>
          </div>
        )}

        {tab === 'budget' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">
              Resumo Estrutural do Orçamento
            </h3>
            <div className="space-y-3">
              {data.chapters.map((ch) => (
                <div key={ch.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-extrabold text-slate-900 text-sm block">{ch.name}</span>
                    <span className="text-slate-400">Capítulo {ch.number} • {ch.percentage}% do total</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {ch.subtotal.toLocaleString('pt-PT')} Kz
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'documents' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">
              Documentos e Anexos da Obra
            </h3>
            <p className="text-xs text-slate-500">
              Fotografias do terreno, plantas e croquis associados a este projeto.
            </p>
            <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center text-xs text-slate-400">
              Nenhum documento adicional carregado até ao momento.
            </div>
          </div>
        )}

        {tab === 'versions' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">
              Histórico de Versões do Cálculo
            </h3>
            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/30 flex justify-between items-center">
                <div>
                  <span className="font-extrabold text-emerald-950 block">Versão Atual (v1.0)</span>
                  <span className="text-slate-500">Base de Preços de Engenharia • Tabela Luanda 2026</span>
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                  Ativa
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectOverviewPage;
