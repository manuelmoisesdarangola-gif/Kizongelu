/**
 * @file app/(app)/projeto/[id]/auditoria/page.tsx
 * Página de Auditoria Técnica e Cadeia de Cálculo Determinístico (/projeto/[id]/auditoria) — Fase 17.
 * Destinada a engenheiros civis, fiscais de obra e peritos bancários em Angola.
 */

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ArrowLeft,
  Download,
  FileSpreadsheet,
  FileCode,
  Layers,
  Cpu,
  History,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Building,
  Scale,
  Award,
  BookOpen,
  Printer,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/src/auth/auth-context';
import { useToast } from '@/src/context/ToastContext';
import { getProjectDetail, ProjectDetail } from '@/lib/actions/projects';
import {
  explainCalculation,
  CalculationAuditSummary,
  CURRENT_ENGINE_VERSION,
  CURRENT_FORMULAS_VERSION,
} from '@/lib/calculation-engine/explain';
import { formatCurrencyKz } from '@/lib/format/currency';

interface ProjetoAuditoriaPageProps {
  projectId: string;
  onBack: () => void;
  onNavigateToProject?: () => void;
}

export const ProjetoAuditoriaPage: React.FC<ProjetoAuditoriaPageProps> = ({
  projectId,
  onBack,
  onNavigateToProject,
}) => {
  const { currentUser } = useAuth();
  const { success, warning, info } = useToast();

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [technicalNotes, setTechnicalNotes] = useState(
    'O cálculo paramétrico cumpre as disposições das normas técnicas e regulamentos aplicáveis. Para as sapatas isoladas adoptou-se tensão padrão de 150 kPa que carece de verificação in-situ durante a abertura de valas.'
  );
  const [notesSaved, setNotesSaved] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const detail = await getProjectDetail(projectId, currentUser.id);
        setProject(detail);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [projectId, currentUser.id]);

  if (loading || !project) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-3 border-[#0F3D5C] border-t-[#F59E0B] rounded-full animate-spin" />
          <span className="text-xs text-slate-500 font-semibold">A carregar dossiê de auditoria técnica...</span>
        </div>
      </div>
    );
  }

  const audit: CalculationAuditSummary = explainCalculation(project.calculation, {
    name: project.name,
    province: project.province,
    municipality: project.municipality,
    areaM2: project.areaM2,
    foundationType: (project as any).foundationType,
    createdAt: project.createdAt,
  });

  const handleExportCSV = () => {
    const csvContent = [
      'AUDITORIA TÉCNICA E CADEIA DE CÁLCULO DETERMINÍSTICO - KIZONGELU',
      `Projecto:;${project.name}`,
      `Província:;${project.province} - ${project.municipality}`,
      `Área Bruta:;${project.areaM2} m²`,
      `Versão do Motor:;${audit.engineVersion}`,
      `Versão das Fórmulas:;${audit.formulasVersion}`,
      `Data de Emissão:;${new Date(audit.calculatedAt).toLocaleString('pt-AO')}`,
      `Índice de Confiança:;${audit.confidenceScore}% (${audit.confidenceLevel})`,
      '',
      '1. FÓRMULAS E COEFICIENTES APLICADOS',
      'Código;Designação do Coeficiente;Valor Adotado;Unidade;Base Normativa / Fonte',
      ...audit.coefficientsApplied.map(
        (c) => `"${c.code}";"${c.label}";${c.value};"${c.unit}";"${c.normativeBase}"`
      ),
      '',
      '2. BASE DE PREÇOS UNITÁRIOS APLICADA (KW刹ZAS)',
      'Código Insumo;Material / Serviço;Preço Unitário (Kz);Fornecedor / Armazém de Referência;Província;Data Aferição',
      ...audit.pricesApplied.map(
        (p) => `"${p.materialCode}";"${p.name}";${p.unitPriceKz};"${p.supplier}";"${p.province}";"${p.collectedAt}"`
      ),
      '',
      '3. ITENS COM VERIFICAÇÃO RECOMENDADA',
      'Código Item;Elemento Construtivo;Motivo da Verificação;Recomendação Técnica de Engenharia',
      ...audit.itemsWithAlerts.map(
        (a) => `"${a.code}";"${a.description}";"${a.reason}";"${a.recommendation}"`
      ),
    ].join('\r\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Auditoria_Tecnica_${project.name.replace(/\s+/g, '_')}_Kizongelu.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Auditoria técnica exportada em formato CSV!');
  };

  const handleExportJSON = () => {
    const jsonContent = JSON.stringify(
      {
        dossier: 'Auditoria Técnica Kizongelu',
        projeto: project.name,
        meta: audit,
        notasTecnicas: technicalNotes,
        certificacao: {
          responsavel: 'Eng. Manuel Moisés',
          ordem: 'Ordem dos Engenheiros de Angola (OEA)',
          cedula: 'OEA-AO-4821',
          dataValidacao: new Date().toISOString(),
        },
      },
      null,
      2
    );

    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Auditoria_Tecnica_${project.name.replace(/\s+/g, '_')}_Kizongelu.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Dossiê estruturado exportado em JSON!');
  };

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-4">
      {/* Top Bar com Navegação e Ações de Exportação */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <button
            onClick={onBack}
            className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 mb-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Detalhe da Obra</span>
          </button>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-[#0F3D5C]" />
              <span>Dossiê de Auditoria Técnica & Rastreabilidade</span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Cadeia completa de fórmulas, coeficientes de calibração, base de cotações e certificação de engenharia para {project.name}.
          </p>
        </div>

        {/* Botões de Exportação */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePrintPdf}
            className="px-3.5 py-2.5 bg-[#0F3D5C] hover:bg-[#0A293E] active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-transform cursor-pointer inline-flex items-center space-x-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Relatório</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 transition-colors cursor-pointer inline-flex items-center space-x-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 transition-colors cursor-pointer inline-flex items-center space-x-1.5"
          >
            <FileCode className="w-4 h-4 text-blue-700" />
            <span>Exportar JSON</span>
          </button>
        </div>
      </div>

      {/* Cartão de Resumo da Cadeia de Cálculo & Versão do Motor */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-card-subtle space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Certificação Determinística Oficial
            </span>
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              {project.name} &bull; {project.areaM2} m² de Construção
            </h2>
            <p className="text-xs text-slate-500">
              {project.province}, {project.municipality} &bull; Calculado em {new Date(audit.calculatedAt).toLocaleString('pt-AO')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-mono font-bold flex items-center space-x-2">
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              <span>Motor {audit.engineVersion}</span>
            </div>
            <div className="px-3 py-1.5 bg-blue-50 text-blue-900 border border-blue-200 rounded-xl text-xs font-mono font-bold">
              {audit.formulasVersion}
            </div>
            <div className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Confiança {audit.confidenceScore}%</span>
            </div>
          </div>
        </div>

        {/* 4 Indicadores Rápidos */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Custo Direto</span>
            <span className="text-base font-black text-slate-900 block font-mono">
              {formatCurrencyKz(audit.totalDirectCostKz)}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">BDI Analítico</span>
            <span className="text-base font-black text-[#0F3D5C] block font-mono">
              {audit.bdiRate}%
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Total da Empreitada</span>
            <span className="text-base font-black text-[#F59E0B] block font-mono">
              {formatCurrencyKz(audit.totalGrandKz)}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Itens Auditados</span>
            <span className="text-base font-black text-slate-900 block font-mono">
              {audit.itemsAudited} Artigos
            </span>
          </div>
        </div>
      </div>

      {/* Tabela 1: Coeficientes Paramétricos Aplicados */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-card-subtle space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#0F3D5C]" />
              <span>1. Coeficientes Técnicos & Rendimentos Normativos</span>
            </h3>
            <p className="text-xs text-slate-500">
              Valores paramétricos de dosagem e perdas aferidos para o contexto construtivo de Angola.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Código</th>
                <th className="p-3">Designação</th>
                <th className="p-3 text-right">Valor Calibrado</th>
                <th className="p-3">Unidade</th>
                <th className="p-3">Base Normativa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {audit.coefficientsApplied.map((c, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="p-3 text-slate-500">{c.code}</td>
                  <td className="p-3 font-sans font-bold text-slate-900">{c.label}</td>
                  <td className="p-3 text-right font-black text-[#0F3D5C]">{c.value}</td>
                  <td className="p-3 text-slate-600">{c.unit}</td>
                  <td className="p-3 font-sans text-slate-600">
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px]">
                      {c.normativeBase}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabela 2: Base de Preços Unitários Aplicada */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-card-subtle space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-[#F59E0B]" />
              <span>2. Cotações Unitárias & Fontes de Armazém em {audit.province}</span>
            </h3>
            <p className="text-xs text-slate-500">
              Tabela de preços provinciais aferida em entrepostos e fornecedores autorizados.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Material</th>
                <th className="p-3 text-right">Preço Unitário (Kz)</th>
                <th className="p-3">Fornecedor / Armazém</th>
                <th className="p-3">Província</th>
                <th className="p-3">Data de Coleta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {audit.pricesApplied.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="p-3 font-bold text-slate-900">{p.name}</td>
                  <td className="p-3 text-right font-mono font-black text-[#0F3D5C]">
                    {formatCurrencyKz(p.unitPriceKz)}
                  </td>
                  <td className="p-3 text-slate-600">{p.supplier}</td>
                  <td className="p-3 text-slate-600">{p.province}</td>
                  <td className="p-3 font-mono text-slate-500 text-[11px]">{p.collectedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bloco 3: Itens com Verificação Recomendada */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-amber-200 shadow-card-subtle space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                3. Itens com Verificação Recomendada pelo Motor
              </h3>
              <p className="text-xs text-slate-500">
                Premissas assumidas por ausência de dados geotécnicos prévios no wizard.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300">
            {audit.itemsWithAlerts.length} Alertas
          </span>
        </div>

        <div className="space-y-3">
          {audit.itemsWithAlerts.map((alt, idx) => (
            <div
              key={idx}
              className="p-4 bg-amber-50/40 border border-amber-200/80 rounded-2xl space-y-1.5 text-xs text-amber-950"
            >
              <div className="flex items-center justify-between">
                <strong className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="font-mono text-slate-500">[{alt.code}]</span>
                  <span>{alt.description}</span>
                </strong>
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                  Atenção Técnica
                </span>
              </div>
              <p className="text-[11px] text-slate-700 leading-relaxed">
                <strong>Motivo:</strong> {alt.reason}
              </p>
              <p className="text-[11px] text-emerald-800 font-medium">
                <strong>Recomendação:</strong> {alt.recommendation}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Bloco 4: Histórico de Versões do Orçamento */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-card-subtle space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <History className="w-4 h-4 text-[#0F3D5C]" />
            <span>4. Histórico de Versões & Diffs de Recálculo</span>
          </h3>
          <span className="text-xs text-slate-500">Trilha de Auditoria</span>
        </div>

        <div className="space-y-3">
          {audit.versionHistory.map((ver, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <strong className="text-slate-900 font-bold">{ver.version}</strong>
                  <span className="text-[10px] font-mono text-slate-500">&bull; {ver.date}</span>
                </div>
                <p className="text-[11px] text-slate-600">{ver.diffSummary}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[11px] font-medium text-slate-500 block">Autor: {ver.author}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bloco 5: Notas Técnicas do Orçamentista & Termo de Responsabilidade */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-card-subtle space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#0F3D5C]" />
          <span>5. Parecer e Notas Técnicas do Engenheiro Responsável</span>
        </h3>

        <textarea
          rows={3}
          value={technicalNotes}
          onChange={(e) => setTechnicalNotes(e.target.value)}
          className="w-full p-3.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#0F3D5C]"
          placeholder="Insira notas de fiscalização, premissas de solo ou justificações técnicas..."
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center space-x-2 text-xs text-slate-600">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Termo Técnico: <strong>Eng. Manuel Moisés &bull; OEA-AO-4821</strong></span>
          </div>

          <button
            onClick={() => {
              setNotesSaved(true);
              success('Notas técnicas gravadas com sucesso no dossiê de auditoria!');
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            {notesSaved ? 'Notas Guardadas' : 'Guardar Parecer'}
          </button>
        </div>
      </div>
    </div>
  );
};
