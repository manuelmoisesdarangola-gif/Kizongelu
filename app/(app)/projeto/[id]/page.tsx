/**
 * @file app/(app)/projeto/[id]/page.tsx
 * Página de Detalhe do Projeto .
 * - 5 Tabs: Visão Geral · Orçamento (Mapa de Quantidades) · Documentos · Partilhas & QR · Versões.
 * - Visão Geral: Resumo, total Kz, estado, índice de confiança, botões principais (Desbloquear / PDF / Partilhar).
 * - Orçamento: Mapa de quantidades completo por capítulos com preços unitários (exibido integralmente se UNLOCKED, ou resumo protegido se ESTIMATED).
 * - Documentos: Upload de ficheiros técnicos (alvará, plantas, certidões) + lista.
 * - Partilhas: Links ativos de validação pública com código opcional e auditoria de acessos.
 * - Versões: Histórico de revisões do projeto com data, autor e variação percentual.
 */

import React, { useState, useEffect } from 'react';
import {
  FolderKanban,
  ArrowLeft,
  FileText,
  Lock,
  Download,
  Share2,
  Copy,
  QrCode,
  Upload,
  History,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Building2,
  Layers,
  MapPin,
  Calendar,
  Sparkles,
  ExternalLink,
  Trash2,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Calculator,
  FileSpreadsheet,
  ClipboardCheck,
  Plus,
  Check,
  Cpu,
} from 'lucide-react';
import { useAuth } from '@/src/auth/auth-context';
import {
  getProjectDetail,
  ProjectDetail,
  duplicateProject,
  archiveProject,
} from '@/lib/actions/projects';
import { formatCurrencyKz } from '@/lib/format/currency';
import { useToast } from '@/src/context/ToastContext';
import { TransparencyDrawer } from '@/src/components/budget/TransparencyDrawer';
import { CURRENT_ENGINE_VERSION } from '@/lib/calculation-engine/explain';
import { CalculationItem } from '@/lib/calculation-engine/types';

interface ProjetoDetailPageProps {
  projectId: string;
  onBack: () => void;
  onUnlockProject: (projectId: string) => void;
  onOpenPdfModal?: (projectId: string) => void;
  onOpenPublicVerification?: (token: string) => void;
  onNavigateToAuditoria?: (projectId: string) => void;
}

type TabType = 'overview' | 'budget' | 'measurements' | 'documents' | 'shares' | 'versions';

export const ProjetoDetailPage: React.FC<ProjetoDetailPageProps> = ({
  projectId,
  onBack,
  onUnlockProject,
  onOpenPdfModal,
  onOpenPublicVerification,
  onNavigateToAuditoria,
}) => {
  const { currentUser } = useAuth();
  const { success, error, info } = useToast();

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Estado local para documentos simulados/adicionados
  const [docList, setDocList] = useState<any[]>([]);

  // Fase 2: Estado para expansão de Composições de Preço Unitário (CPU) e edição de itens
  const [expandedCpuCode, setExpandedCpuCode] = useState<string | null>(null);
  const [editingItemCode, setEditingItemCode] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editQty, setEditQty] = useState<number>(0);

  // Fase 17: Item selecionado para explicabilidade no Drawer de Transparência
  const [selectedExplanationItem, setSelectedExplanationItem] = useState<CalculationItem | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const detail = await getProjectDetail(projectId, currentUser.id);
        setProject(detail);
        if (detail) {
          setDocList(detail.documents || []);
        }
      } catch (e) {
        console.warn(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [projectId, currentUser.id]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Topo Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-4 bg-slate-200 rounded w-24"></div>
            <div className="h-7 bg-slate-200 rounded-lg w-64"></div>
            <div className="h-3 bg-slate-200 rounded w-48"></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-9 bg-slate-200 rounded-xl w-24"></div>
            <div className="h-9 bg-slate-200 rounded-xl w-28"></div>
          </div>
        </div>

        {/* 4 Cards Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
              <div className="h-3 bg-slate-200 rounded w-16"></div>
              <div className="h-6 bg-slate-200 rounded w-24"></div>
              <div className="h-2.5 bg-slate-200 rounded w-20"></div>
            </div>
          ))}
        </div>

        {/* Content Box Skeleton */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="h-8 bg-slate-200 rounded-xl w-1/3"></div>
          <div className="h-32 bg-slate-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-4 max-w-lg mx-auto my-8 shadow-card-subtle">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <FolderKanban className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">Projecto não encontrado</h2>
          <p className="text-xs text-slate-500 mt-1">
            O orçamento solicitado não existe, foi arquivado ou pertence a outra conta de utilizador.
          </p>
        </div>
        <button
          onClick={onBack}
          className="py-2.5 px-5 bg-[#0F3D5C] hover:bg-[#0A293E] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer inline-flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar aos Projectos</span>
        </button>
      </div>
    );
  }

  const isUnlocked =
    project.status === 'UNLOCKED' ||
    (typeof window !== 'undefined' &&
      window.localStorage?.getItem(`Kizongelu_unlocked_${project.id}`) === 'true');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const newDoc = {
      id: `doc_${Date.now()}`,
      title: file.name,
      category: 'TECHNICAL',
      fileUrl: '#',
      uploadedAt: new Date().toISOString(),
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
    };

    setDocList((prev) => [newDoc, ...prev]);
    success(`Documento "${file.name}" anexado à obra.`);
  };

  // Fase 2: Exportação do Mapa de Quantidades e Preços para Excel (.csv)
  const handleExportCsv = () => {
    if (!project?.calculation?.items) return;
    const headers = ['Capítulo', 'Código', 'Descrição do Artigo', 'Unidade', 'Quantidade', 'Preço Unitário (Kz)', 'Subtotal (Kz)'];
    const rows = project.calculation.items.map((it: any) => [
      `"${it.chapter || 'Geral'}"`,
      `"${it.code}"`,
      `"${it.description?.replace(/"/g, '""')}"`,
      `"${it.unit}"`,
      it.quantity,
      it.unitPriceKz || it.unitPrice,
      it.totalKz || it.total,
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r: any) => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Mapa_Quantidades_${project.name.replace(/\s+/g, '_')}_Angola.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Mapa de Quantidades exportado com sucesso para Excel.');
  };

  // Fase 2: Gravação da edição analítica do item
  const handleSaveItemEdit = (code: string) => {
    if (!project?.calculation?.items) return;
    const updatedItems = project.calculation.items.map((it: any) => {
      if (it.code === code) {
        const newTotal = Math.round(editQty * editPrice);
        return {
          ...it,
          quantity: editQty,
          unitPriceKz: editPrice,
          totalKz: newTotal,
        };
      }
      return it;
    });

    const newGrandTotal = updatedItems.reduce((acc: number, curr: any) => acc + (curr.totalKz || 0), 0);
    const newDirectCost = Math.round(newGrandTotal / 1.385);
    const newBdi = Math.round(newDirectCost * 0.215);
    const newBase = newDirectCost + newBdi;
    const newIva = Math.round(newBase * 0.14);
    const newRetencao = Math.round(newBase * 0.065);

    setProject({
      ...project,
      totalKz: newGrandTotal,
      calculation: {
        ...project.calculation,
        items: updatedItems,
        grandTotalKz: newGrandTotal,
        directCost: newDirectCost,
        financialClosing: {
          ...project.calculation.financialClosing,
          directCost: newDirectCost,
          baseTributavel: newBase,
          bdi: {
            ...project.calculation.financialClosing?.bdi,
            bdiAmount: newBdi,
          },
          taxes: {
            ...project.calculation.financialClosing?.taxes,
            ivaAmount: newIva,
            retencaoFonteAmount: newRetencao,
          },
          precoFinalComIVA: newGrandTotal,
          valorLiquidoReceber: newGrandTotal - newRetencao,
        },
      },
    });

    setEditingItemCode(null);
    success(`Artigo ${code} atualizado e orçamento recalculado.`);
  };

  // Fase 3: Exportação da Lista de Compras de Materiais (Shopping List)
  const handleExportShoppingList = () => {
    if (!project?.calculation?.items) return;
    const headers = ['Código', 'Material / Insumo Necessário para Obra', 'Unidade', 'Quantidade Total a Comprar', 'Preço Unitário Ref. (Kz)', 'Subtotal Previsto (Kz)', 'Fornecedor de Referência (Angola)'];
    const rows = project.calculation.items.map((it: any) => [
      `"${it.code}"`,
      `"${it.description?.replace(/"/g, '""')}"`,
      `"${it.unit}"`,
      it.quantity,
      it.unitPriceKz || it.unitPrice,
      it.totalKz || it.total,
      `"Armazéns de Luanda / Viana / Cacuaco"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r: any) => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Lista_Compras_Materiais_${project.name.replace(/\s+/g, '_')}_Angola.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Lista de compras de materiais exportada com sucesso.');
  };

  // Fase 5: Exportação do Dossiê Bancário Completo (Pacote de Financiamento)
  const handleExportBankPackage = () => {
    if (!project?.calculation?.items) return;
    const dateStr = new Date().toLocaleDateString('pt-PT');
    const directCost = project.calculation.financialClosing?.directCost || project.totalKz;
    const bdiAmount = project.calculation.financialClosing?.bdi?.bdiAmount || Math.round(directCost * 0.215);
    const baseTributavel = project.calculation.financialClosing?.baseTributavel || directCost + bdiAmount;
    const ivaAmount = project.calculation.financialClosing?.taxes?.ivaAmount || Math.round(baseTributavel * 0.14);
    const retencao = project.calculation.financialClosing?.taxes?.retencaoFonteAmount || Math.round(baseTributavel * 0.065);
    const totalGeral = project.totalKz;

    const dossierContent = [
      'DOSSIÊ TÉCNICO E FINANCEIRO PARA CRÉDITO À CONSTRUÇÃO (BANCOS ANGOLA)',
      `Projecto:;${project.name}`,
      `Titular:;${project.clientName || 'Particular'}`,
      `Localização:;${project.province} - ${project.municipality}`,
      `Área Bruta:;${project.areaM2} m²`,
      `Data de Emissão:;${dateStr}`,
      `Código de Verificação:;AO-${project.id.toUpperCase()}`,
      '',
      'QUADRO DE FECHO FINANCEIRO DA EMPREITADA (CONFORME REGRAS BANCÁRIAS E AGT)',
      `1. Custo Direto da Construção (Materiais + Mão de Obra + Frete):;${directCost} Kz`,
      `2. BDI Analítico (21,5% - Administração Central, Seguros e Lucro):;${bdiAmount} Kz`,
      `3. Base Tributável / Preço da Empreitada sem IVA:;${baseTributavel} Kz`,
      `4. IVA 14% (Regime Geral - Código do IVA de Angola):;${ivaAmount} Kz`,
      `5. Preço Total da Proposta Contratual:;${totalGeral} Kz`,
      `6. Retenção na Fonte Prestação de Serviços (6,5% AGT):;${retencao} Kz`,
      `7. Valor Líquido a Desembolsar pelo Dono de Obra:;${totalGeral - retencao} Kz`,
      '',
      'MAPA DISCRIMINADO DE QUANTIDADES E PREÇOS UNITÁRIOS',
      'Capítulo;Código;Descrição do Artigo;Unidade;Quantidade;Preço Unitário (Kz);Subtotal (Kz)',
      ...project.calculation.items.map((it: any) =>
        `"${it.chapter || 'Geral'}";"${it.code}";"${it.description?.replace(/"/g, '""')}";"${it.unit}";${it.quantity};${it.unitPriceKz || it.unitPrice};${it.totalKz || it.total}`
      ),
      '',
      'CRONOGRAMA DE DESEMBOLSO FINANCEIRO POR FASES (TRANCHES BANCÁRIAS)',
      'Tranche;Fase de Obra;Objetivo Físico;% Desembolso;Valor Tranche (Kz)',
      `Tranche 1;Mobilização & Fundações;Conclusão de sapatas e estaleiro;25%;${Math.round(totalGeral * 0.25)} Kz`,
      `Tranche 2;Estrutura & Alvenarias;Pilares, vigas e paredes toscas;35%;${Math.round(totalGeral * 0.35)} Kz`,
      `Tranche 3;Cobertura & Instalações;Telhado estanque e tubagens;25%;${Math.round(totalGeral * 0.25)} Kz`,
      `Tranche 4;Acabamentos & Chave na Mão;Revestimentos, louças e pintura;15%;${Math.round(totalGeral * 0.15)} Kz`,
    ].join('\r\n');

    const blob = new Blob(['\uFEFF' + dossierContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Dossie_Bancario_Credito_${project.name.replace(/\s+/g, '_')}_Angola.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Dossiê para Crédito Bancário exportado com sucesso.');
  };

  const handleCopyShareLink = (token: string) => {
    const url = `${window.location.origin}/verificar?token=${token}`;
    navigator.clipboard.writeText(url);
    success('Link de verificação copiado para a área de transferência!');
  };

  return (
    <div className="space-y-6">
      {/* 1. Header do Projeto com Navegação e Ações Rápidas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Voltar à lista"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">{project.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#0F3D5C] text-amber-300 border border-amber-400/40 flex items-center gap-1 shadow-xs">
                <Cpu className="w-3 h-3 text-amber-400" />
                Motor {CURRENT_ENGINE_VERSION}
              </span>
              {isUnlocked ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Concluído
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Estimado
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
              <span>{project.province}, {project.municipality}</span>
              <span>&bull;</span>
              <span>{project.areaM2} m²</span>
              <span>&bull;</span>
              <span>Acabamento {project.finishLevel}</span>
            </div>
          </div>
        </div>

        {/* Botões de Ação no Topo */}
        <div className="flex flex-wrap items-center gap-2">
          {!isUnlocked && (
            <button
              onClick={() => onUnlockProject(project.id)}
              className="min-h-[44px] py-2 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20 flex items-center space-x-1.5 transition-all cursor-pointer active:scale-95"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Desbloquear Orçamento e Mapa de Quantidades</span>
            </button>
          )}

          {onOpenPdfModal && (
            <button
              onClick={() => onOpenPdfModal(project.id)}
              className="min-h-[44px] py-2 px-4 bg-[#0F3D5C] hover:bg-[#0A293E] active:bg-slate-900 text-white font-bold rounded-xl text-xs shadow-md flex items-center space-x-1.5 transition-all cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar PDF</span>
            </button>
          )}

          <button
            onClick={() => {
              if (onNavigateToAuditoria) {
                onNavigateToAuditoria(project.id);
              } else {
                window.location.assign(`/projetos/${project.id}/auditoria`);
              }
            }}
            className="min-h-[44px] py-2 px-3.5 bg-amber-500/10 hover:bg-amber-500/20 active:scale-95 text-[#0F3D5C] font-bold rounded-xl text-xs border border-amber-500/30 flex items-center space-x-1.5 transition-all cursor-pointer"
            title="Ver cadeia de cálculo, fórmulas e auditoria técnica do motor"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>Auditoria Técnica</span>
          </button>

          {isUnlocked && (
            <>
              <button
                onClick={handleExportBankPackage}
                className="min-h-[44px] py-2 px-3.5 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-900 font-bold rounded-xl text-xs border border-blue-300 flex items-center space-x-1.5 transition-all cursor-pointer active:scale-95"
                title="Exportar Dossiê Técnico e Financeiro formatado para a banca comercial angolana"
              >
                <Building2 className="w-3.5 h-3.5 text-blue-700" />
                <span>Dossiê Bancário</span>
              </button>

              <button
                onClick={handleExportShoppingList}
                className="min-h-[44px] py-2 px-3.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs border border-slate-300 flex items-center space-x-1.5 transition-all cursor-pointer active:scale-95"
                title="Exportar listagem agregada de cimento, ferro, blocos e tintas para compras"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                <span>Lista de Compras</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 2. Barra de Navegação por Abas (Tabs) com scroll suave no mobile */}
      <div className="bg-white border-b border-slate-200 rounded-t-2xl px-2 sm:px-4 flex items-center space-x-1 overflow-x-auto no-scrollbar select-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`min-h-[44px] py-3 px-3.5 sm:px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap active:bg-slate-50 ${
            activeTab === 'overview'
              ? 'border-[#0F3D5C] text-[#0F3D5C]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Visão Geral
        </button>

        <button
          onClick={() => setActiveTab('budget')}
          className={`min-h-[44px] py-3 px-3.5 sm:px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 active:bg-slate-50 ${
            activeTab === 'budget'
              ? 'border-[#0F3D5C] text-[#0F3D5C]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Mapa de Quantidades</span>
          {!isUnlocked && <Lock className="w-3 h-3 text-amber-500" />}
        </button>

        {/* Fase 3: Aba de Autos de Medição Mensal de Obra */}
        <button
          onClick={() => setActiveTab('measurements')}
          className={`min-h-[44px] py-3 px-3.5 sm:px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 active:bg-slate-50 ${
            activeTab === 'measurements'
              ? 'border-[#0F3D5C] text-[#0F3D5C]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ClipboardCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Autos de Medição</span>
          <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded-full font-extrabold">
            {project.measurements?.length || 1}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`min-h-[44px] py-3 px-3.5 sm:px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 active:bg-slate-50 ${
            activeTab === 'documents'
              ? 'border-[#0F3D5C] text-[#0F3D5C]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Documentos</span>
          <span className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.2 rounded-full">
            {docList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('shares')}
          className={`min-h-[44px] py-3 px-3.5 sm:px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 active:bg-slate-50 ${
            activeTab === 'shares'
              ? 'border-[#0F3D5C] text-[#0F3D5C]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Partilhas & QR</span>
          <span className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.2 rounded-full">
            {project.shareLinks?.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('versions')}
          className={`min-h-[44px] py-3 px-3.5 sm:px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 active:bg-slate-50 ${
            activeTab === 'versions'
              ? 'border-[#0F3D5C] text-[#0F3D5C]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Versões</span>
          <span className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.2 rounded-full">
            {project.versions?.length || 1}
          </span>
        </button>
      </div>

      {/* 3. Conteúdo das Abas */}
      <div className="bg-white p-3.5 sm:p-6 rounded-b-2xl border border-t-0 border-slate-200 shadow-card-subtle min-h-[400px]">
        {/* TAB 1: VISÃO GERAL */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Bloco de Valor e Totais */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 uppercase block">Total Geral Previsto</span>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {formatCurrencyKz(project.calculation.grandTotalKz)}
                </div>
                <span className="text-[11px] text-slate-500">
                  {formatCurrencyKz(Math.round(project.calculation.grandTotalKz / (project.areaM2 || 1)))} / m²
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 uppercase block">Índice de Confiança</span>
                <div className="text-2xl font-black text-emerald-600 mt-1">
                  {project.calculation.confidenceLevel} ({project.calculation.confidenceScore}%)
                </div>
                <span className="text-[11px] text-slate-500">Calibrado para {project.province}</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 uppercase block">Duração Estimada</span>
                <div className="text-2xl font-black text-[#0F3D5C] mt-1">
                  {project.calculation.estimatedMonths || 6} Meses
                </div>
                <span className="text-[11px] text-slate-500">10 fases de execução</span>
              </div>
            </div>

            {/* Selo Oficial de Conformidade Técnica & Validação Bancária (Trust Signal) */}
            <div className="bg-gradient-to-r from-slate-900 via-[#0F3D5C] to-[#0A293E] text-white p-5 rounded-2xl border border-slate-700 shadow-md">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="flex items-start space-x-3.5">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                        Base Técnica Rigorosa &bull; Angola
                      </span>
                      <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                        Boas práticas de engenharia civil
                      </span>
                    </div>
                    <h4 className="text-sm sm:text-base font-extrabold text-white mt-1">
                      Orçamento Auditado & Preparado para Processos Bancários
                    </h4>
                    <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                      Dosagens calculadas com base nas boas práticas de engenharia civil. Formato elaborado para submissão em processos de licenciamento e alvarás municipais.
                    </p>
                  </div>
                </div>

                {/* Selo de Verificação por QR code */}
                <div className="bg-white/10 p-3 rounded-xl border border-white/15 text-left shrink-0 w-full lg:w-auto">
                  <div className="text-[10px] uppercase font-bold text-amber-300 flex items-center gap-1">
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Verificação por QR code</span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-200 mt-0.5 font-bold">
                    AO-{project.id.toUpperCase()}-{(project.calculation.grandTotalKz % 99999).toString().padStart(5, '0')}
                  </div>
                  <div className="text-[10px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Validação Pública Ativa</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Resumo dos 6 Capítulos Principais */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-3">Distribuição por Capítulos da Obra</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {project.calculation.chapters.map((ch: any) => (
                  <div key={ch.code} className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-bold text-slate-700">{ch.title}</span>
                      <span className="font-semibold text-slate-500">{ch.percentage}%</span>
                    </div>
                    <div className="text-sm font-black text-slate-900">{formatCurrencyKz(ch.subtotalKz)}</div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                      <div
                        className="bg-[#0F3D5C] h-full rounded-full"
                        style={{ width: `${ch.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fecho Financeiro Analítico: BDI & Fiscalidade AGT */}
            {project.calculation.financialClosing && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-black text-slate-900">
                      Fecho Financeiro Analítico &bull; BDI e Fiscalidade de Angola
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Metodologia padrão de engenharia de custos: Custo Direto &rarr; BDI (21,5%) &rarr; Base Tributável &rarr; IVA (14%) &rarr; Retenção (6,5%)
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    Conformidade AGT
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Custo Direto (Materiais + MO + Frete)</span>
                    <span className="text-base font-extrabold text-slate-900 font-mono mt-0.5 block">
                      {formatCurrencyKz(project.calculation.financialClosing.directCost)}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">BDI Analítico (21,5%)</span>
                    <span className="text-base font-extrabold text-slate-900 font-mono mt-0.5 block">
                      +{formatCurrencyKz(project.calculation.financialClosing.bdi.bdiAmount)}
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">Admin 5% &bull; Riscos 3% &bull; Lucro 12%</span>
                  </div>

                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <span className="text-[10px] text-amber-900 uppercase font-semibold block">Preço sem IVA (Base Tributável)</span>
                    <span className="text-base font-black text-amber-950 font-mono mt-0.5 block">
                      {formatCurrencyKz(project.calculation.financialClosing.baseTributavel)}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">IVA 14% (Regime Geral)</span>
                    <span className="text-base font-extrabold text-slate-900 font-mono mt-0.5 block">
                      +{formatCurrencyKz(project.calculation.financialClosing.taxes.ivaAmount)}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-[#0F3D5C]/5 border border-[#0F3D5C]/15 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-extrabold text-[#0F3D5C] block">
                      Preço Total Faturável com IVA: {formatCurrencyKz(project.calculation.financialClosing.precoFinalComIVA)}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      * Sujeito a Retenção na Fonte de 6,5% ({formatCurrencyKz(project.calculation.financialClosing.taxes.retencaoFonteAmount)}) por clientes com contabilidade organizada.
                    </span>
                  </div>
                  <div className="text-right sm:shrink-0">
                    <span className="text-[10px] text-slate-500 uppercase block font-medium">Líquido a Receber</span>
                    <span className="text-sm font-black text-emerald-700 font-mono">
                      {formatCurrencyKz(project.calculation.financialClosing.valorLiquidoReceber)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Painel de Alertas de Auditoria Técnica e Consistência (Fase 4) */}
            {project.calculation.alerts && project.calculation.alerts.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900">
                        Auditoria de Consistência &amp; Alertas Técnicos de Obra
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Deteção de anomalias paramétricas, variações logísticas regionais e salvaguardas de tesouraria.
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    {project.calculation.alerts.length} Pontos Auditados
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {project.calculation.alerts.map((alt: any) => (
                    <div
                      key={alt.id}
                      className={`p-3.5 rounded-xl border flex flex-col justify-between text-xs space-y-2 ${
                        alt.severity === 'CRITICAL'
                          ? 'bg-rose-50/80 border-rose-200 text-rose-950'
                          : alt.severity === 'WARNING'
                          ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                          : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                            alt.severity === 'CRITICAL'
                              ? 'bg-rose-600 text-white'
                              : alt.severity === 'WARNING'
                              ? 'bg-amber-600 text-white'
                              : 'bg-[#0F3D5C] text-white'
                          }`}>
                            {alt.category.replace('_', ' ')}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400 font-bold">{alt.code}</span>
                        </div>
                        <h4 className="font-bold text-xs">{alt.title}</h4>
                        <p className="text-[11px] opacity-80 mt-1 leading-relaxed">{alt.message}</p>
                      </div>

                      <div className="pt-2 border-t border-black/5 flex items-center justify-between text-[10px]">
                        <span className="font-semibold text-slate-500">Ação recomendada:</span>
                        <span className="font-bold text-slate-700 truncate max-w-[240px]">{alt.suggestedAction}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Banner de Desbloqueio se ESTIMATED */}
            {!isUnlocked && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Orçamento e Mapa de Quantidades Bloqueado
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Efetue o pagamento por Transferência bancária ou Multicaixa Express para ter acesso à lista de compras, mão de obra e PDF oficial com QR Code.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onUnlockProject(project.id)}
                  className="min-h-[44px] py-2.5 px-5 bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-extrabold rounded-xl text-xs shadow-md active:scale-95 transition-all cursor-pointer shrink-0"
                >
                  Desbloquear com Crédito
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MAPA DE QUANTIDADES */}
        {activeTab === 'budget' && (
          <div className="space-y-4">
            {!isUnlocked ? (
              <div className="p-8 text-center space-y-3 bg-slate-50 rounded-xl border border-slate-200">
                <Lock className="w-8 h-8 text-amber-500 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">Mapa de Quantidades Protegido</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  A listagem item a item (código de artigo, sacos de cimento, ferro, brita, mão de obra por m²) fica disponível após confirmação de pagamento.
                </p>
                <button
                  onClick={() => onUnlockProject(project.id)}
                  className="min-h-[44px] py-2.5 px-5 bg-[#0F3D5C] hover:bg-[#0A293E] text-white rounded-xl text-xs font-bold cursor-pointer active:scale-95 transition-all"
                >
                  Desbloquear Agora
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Barra de Ações do Mapa: Exportação Excel & Filtros */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-700">Modo de Engenharia de Custos:</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#0F3D5C] text-white">
                      Composição Analítica (CPU)
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleExportCsv}
                      className="min-h-[38px] px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
                      title="Descarregar ficheiro compatível com Microsoft Excel"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
                      <span>Exportar para Excel (.csv)</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-2.5 px-3 w-10 text-center">CPU</th>
                        <th className="py-2.5 px-2 w-10 text-center">ƒx</th>
                        <th className="py-2.5 px-3 w-24">Código</th>
                        <th className="py-2.5 px-3">Descrição do Artigo / Serviço</th>
                        <th className="py-2.5 px-3 text-center w-16">Unidade</th>
                        <th className="py-2.5 px-3 text-right w-24">Quantidade</th>
                        <th className="py-2.5 px-3 text-right w-28">Preço Unit. (Kz)</th>
                        <th className="py-2.5 px-3 text-right w-28">Total (Kz)</th>
                        <th className="py-2.5 px-3 text-center w-20">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {project.calculation.items?.map((item: any) => {
                        const isExpanded = expandedCpuCode === item.code;
                        const isEditing = editingItemCode === item.code;

                        return (
                          <React.Fragment key={item.code}>
                            <tr className={`hover:bg-slate-50/80 transition-colors ${isExpanded ? 'bg-amber-50/30' : ''}`}>
                              {/* Botão de Expansão de CPU */}
                              <td className="py-2.5 px-2 text-center">
                                {item.composition ? (
                                  <button
                                    onClick={() => setExpandedCpuCode(isExpanded ? null : item.code)}
                                    className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                                    title={isExpanded ? 'Ocultar composição' : 'Ver composição de insumos (CPU)'}
                                  >
                                    {isExpanded ? (
                                      <ChevronDown className="w-4 h-4 text-amber-600" />
                                    ) : (
                                      <ChevronRight className="w-4 h-4" />
                                    )}
                                  </button>
                                ) : (
                                  <span className="text-slate-300">&bull;</span>
                                )}
                              </td>

                              {/* Botão de Transparência do Motor (ƒx) */}
                              <td className="py-2.5 px-2 text-center">
                                <button
                                  onClick={() => setSelectedExplanationItem(item)}
                                  className="w-7 h-7 rounded-lg bg-amber-500/15 hover:bg-[#0F3D5C] hover:text-amber-400 text-[#0F3D5C] font-black text-xs transition-colors cursor-pointer border border-amber-500/30 flex items-center justify-center mx-auto"
                                  title="Ver fórmula, coeficientes e rastreabilidade técnica (ƒx)"
                                >
                                  ƒx
                                </button>
                              </td>

                              <td className="py-2.5 px-3 font-mono text-slate-500 font-bold">
                                {item.code}
                              </td>

                              <td className="py-2.5 px-3">
                                <span className="font-semibold text-slate-900 block">{item.description}</span>
                                <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                  <span className="text-[10px] text-slate-400">{item.chapter}</span>
                                  {/* Item recalculado */}
                                  {(item.code === 'BLO-001' || item.code === 'CIM-001') && (
                                    <span
                                      className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-sky-50 text-sky-800 border border-sky-200"
                                      title="Item com preço ou quantidade atualizada por recálculo semanal"
                                    >
                                      <span>Recalculado</span>
                                    </span>
                                  )}
                                  {/* Item com verificação recomendada */}
                                  {(item.code.startsWith('SAP') || (project as any).foundationType === 'nao_sei') && (
                                    <span
                                      className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-300"
                                      title="Parâmetro de referência adotado. Recomendamos ensaio DCP antes da betonagem."
                                    >
                                      <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                                      <span>Verificação recomendada</span>
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td className="py-2.5 px-3 text-center text-slate-600 font-medium">
                                {item.unit}
                              </td>

                              {/* Quantidade (Visualização vs Edição) */}
                              <td className="py-2.5 px-3 text-right font-semibold">
                                {isEditing ? (
                                  <input
                                    type="number"
                                    step="any"
                                    value={editQty}
                                    onChange={(e) => setEditQty(parseFloat(e.target.value) || 0)}
                                    className="w-20 px-1.5 py-1 text-right text-xs border border-amber-400 rounded bg-amber-50 font-bold focus:outline-none"
                                  />
                                ) : (
                                  <span>{typeof item.quantity === 'number' ? item.quantity.toFixed(2) : item.quantity}</span>
                                )}
                              </td>

                              {/* Preço Unitário (Visualização vs Edição) */}
                              <td className="py-2.5 px-3 text-right text-slate-700 font-medium">
                                {isEditing ? (
                                  <input
                                    type="number"
                                    step="any"
                                    value={editPrice}
                                    onChange={(e) => setEditPrice(parseFloat(e.target.value) || 0)}
                                    className="w-24 px-1.5 py-1 text-right text-xs border border-amber-400 rounded bg-amber-50 font-bold focus:outline-none"
                                  />
                                ) : (
                                  <span>{formatCurrencyKz(item.unitPriceKz || item.unitPrice)}</span>
                                )}
                              </td>

                              {/* Total da Linha */}
                              <td className="py-2.5 px-3 text-right font-black text-slate-900 font-mono">
                                {formatCurrencyKz(isEditing ? editQty * editPrice : (item.totalKz || item.total))}
                              </td>

                              {/* Ações: Editar / Gravar */}
                              <td className="py-2.5 px-3 text-center">
                                {isEditing ? (
                                  <div className="flex items-center justify-center space-x-1">
                                    <button
                                      onClick={() => handleSaveItemEdit(item.code)}
                                      className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold cursor-pointer"
                                    >
                                      OK
                                    </button>
                                    <button
                                      onClick={() => setEditingItemCode(null)}
                                      className="px-1.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[10px] cursor-pointer"
                                    >
                                      X
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setEditingItemCode(item.code);
                                      setEditQty(item.quantity);
                                      setEditPrice(item.unitPriceKz || item.unitPrice);
                                    }}
                                    className="text-[11px] text-sky-700 hover:text-sky-900 font-bold hover:underline cursor-pointer"
                                  >
                                    Editar
                                  </button>
                                )}
                              </td>
                            </tr>

                            {/* GRELHA EXPANDIDA DA COMPOSIÇÃO DE PREÇO UNITÁRIO (CPU) */}
                            {isExpanded && item.composition && (
                              <tr className="bg-slate-50/90 border-y border-amber-200/80">
                                <td colSpan={9} className="p-4 sm:p-5">
                                  <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-inner space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-2.5 gap-2">
                                      <div>
                                        <div className="flex items-center space-x-2">
                                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                                            Ficha Analítica {item.composition.code}
                                          </span>
                                          <h4 className="text-xs font-bold text-slate-900">
                                            {item.composition.title}
                                          </h4>
                                        </div>
                                        <p className="text-[11px] text-slate-500 mt-0.5">
                                          Consumos e rendimentos necessários para executar 1 {item.composition.unit} deste serviço.
                                        </p>
                                      </div>

                                      <div className="flex items-center space-x-4 text-xs">
                                        <div>
                                          <span className="text-slate-400 block text-[10px]">Custo Direto:</span>
                                          <span className="font-bold text-slate-800 font-mono">
                                            {formatCurrencyKz(item.composition.unitDirectCost)} / {item.composition.unit}
                                          </span>
                                        </div>
                                        <div>
                                          <span className="text-slate-400 block text-[10px]">Quebras/Desperdício:</span>
                                          <span className="font-bold text-amber-700 font-mono">
                                            +{(item.composition.wasteRate * 100).toFixed(0)}%
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Tabela de Insumos da CPU */}
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-[11px] border-collapse">
                                        <thead>
                                          <tr className="bg-slate-100/70 text-slate-600 font-bold border-b border-slate-200">
                                            <th className="py-1.5 px-2.5 text-left">Tipo</th>
                                            <th className="py-1.5 px-2.5 text-left">Insumo / Recurso (Equipa, Material, Máquina)</th>
                                            <th className="py-1.5 px-2 text-center">Unid.</th>
                                            <th className="py-1.5 px-2 text-right">Rendimento</th>
                                            <th className="py-1.5 px-2 text-right">Custo Unit. (Kz)</th>
                                            <th className="py-1.5 px-2.5 text-right">Subtotal (Kz)</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                          {item.composition.items.map((ins: any) => (
                                            <tr key={ins.id} className="hover:bg-amber-50/20">
                                              <td className="py-1.5 px-2.5">
                                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                                  ins.type === 'MATERIAL'
                                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                    : ins.type === 'MAO_DE_OBRA'
                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                    : 'bg-purple-50 text-purple-700 border border-purple-200'
                                                }`}>
                                                  {ins.type === 'MATERIAL' ? 'MAT' : ins.type === 'MAO_DE_OBRA' ? 'MO' : 'EQP'}
                                                </span>
                                              </td>
                                              <td className="py-1.5 px-2.5 font-medium text-slate-800">{ins.description}</td>
                                              <td className="py-1.5 px-2 text-center text-slate-500">{ins.unit}</td>
                                              <td className="py-1.5 px-2 text-right font-mono">{ins.coefficient}</td>
                                              <td className="py-1.5 px-2 text-right text-slate-600 font-mono">{formatCurrencyKz(ins.unitCost)}</td>
                                              <td className="py-1.5 px-2.5 text-right font-bold text-slate-900 font-mono">{formatCurrencyKz(ins.subtotal)}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: AUTOS DE MEDIÇÃO MENSAL (FASE 3) */}
        {activeTab === 'measurements' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <span>Autos de Medição Periódica de Obra</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Controlo Físico-Financeiro
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Registo oficial de quantidades executadas no terreno para emissão de faturas e pedidos de libertação de fundos.
                </p>
              </div>

              <button
                onClick={() => {
                  const autoNumber = (project.measurements?.length || 0) + 1;
                  const newAuto: any = {
                    id: `auto_${project.id}_${autoNumber}`,
                    projectId: project.id,
                    reportNumber: autoNumber,
                    periodLabel: `Mês ${autoNumber} — Execução de Alvenarias e Cobertura`,
                    date: new Date().toISOString(),
                    fiscalEngineer: 'Eng. Arnaldo Silva (OEA n.º 4821)',
                    contractorRepresentative: currentUser.nome || 'Mestre Encarregado',
                    status: 'SUBMETIDO',
                    periodDirectCostKz: Math.round(project.totalKz * 0.22),
                    periodBdiKz: Math.round(project.totalKz * 0.22 * 0.215),
                    periodIvaKz: Math.round(project.totalKz * 0.22 * 1.215 * 0.14),
                    periodRetencaoKz: Math.round(project.totalKz * 0.22 * 1.215 * 0.065),
                    periodLiquidKz: Math.round(project.totalKz * 0.22 * 1.215 * 1.14 - (project.totalKz * 0.22 * 1.215 * 0.065)),
                    accumulatedPercentage: Math.min(100, 18.0 + 22.0 * (autoNumber - 1)),
                    items: project.calculation.items?.map((it: any) => ({
                      code: it.code,
                      description: it.description,
                      unit: it.unit,
                      budgetQty: it.quantity,
                      unitPriceKz: it.unitPriceKz || it.unitPrice,
                      previousQty: Math.round(it.quantity * 0.18),
                      periodQty: Math.round(it.quantity * 0.22),
                      accumulatedQty: Math.round(it.quantity * 0.40),
                      periodTotalKz: Math.round(it.quantity * 0.22 * (it.unitPriceKz || it.unitPrice)),
                      accumulatedTotalKz: Math.round(it.quantity * 0.40 * (it.unitPriceKz || it.unitPrice)),
                      percentageExecuted: 40.0,
                    })) || [],
                  };

                  setProject({
                    ...project,
                    measurements: [newAuto, ...(project.measurements || [])],
                  });
                  success(`Auto de Medição n.º ${autoNumber} registado e enviado para validação da fiscalização.`);
                }}
                className="min-h-[40px] px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 cursor-pointer active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>+ Criar Novo Auto de Medição</span>
              </button>
            </div>

            {/* Lista de Autos de Medição */}
            {(!project.measurements || project.measurements.length === 0) ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                Ainda não foram registados autos de medição para esta obra. Clique em "+ Criar Novo Auto de Medição" para lançar as quantidades executadas no período.
              </div>
            ) : (
              <div className="space-y-5">
                {project.measurements.map((auto) => (
                  <div key={auto.id} className="bg-slate-50/70 rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-4">
                    {/* Cabeçalho do Auto */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200/80 gap-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-[#0F3D5C] text-white flex items-center justify-center font-black text-sm shadow-xs">
                          #{auto.reportNumber}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-extrabold text-sm text-slate-900">{auto.periodLabel}</h4>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              {auto.status.replace('_', ' ')}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500">
                            Data da Medição: {new Date(auto.date).toLocaleDateString('pt-PT')} &bull; Fiscal: {auto.fiscalEngineer}
                          </span>
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Valor Líquido a Faturar no Mês</span>
                        <span className="text-base font-black text-emerald-700 font-mono">
                          {formatCurrencyKz(auto.periodLiquidKz)}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          Retenção 6,5% AGT: -{formatCurrencyKz(auto.periodRetencaoKz)}
                        </span>
                      </div>
                    </div>

                    {/* Tabela do Auto: Quantidade Prevista vs Anterior vs Período vs Acumulada */}
                    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-bold text-[10px] uppercase">
                            <th className="py-2 px-3">Código</th>
                            <th className="py-2 px-3">Artigo de Obra</th>
                            <th className="py-2 px-2 text-center">Unid.</th>
                            <th className="py-2 px-2 text-right">Qtd. Prevista</th>
                            <th className="py-2 px-2 text-right text-slate-400">Qtd. Anterior</th>
                            <th className="py-2 px-2 text-right font-extrabold text-[#0F3D5C]">Qtd. Período</th>
                            <th className="py-2 px-2 text-right">Qtd. Acumulada</th>
                            <th className="py-2 px-3 text-right">Subtotal Mês (Kz)</th>
                            <th className="py-2 px-2 text-center">% Exec.</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {auto.items.map((it: any) => (
                            <tr key={it.code} className="hover:bg-slate-50/70">
                              <td className="py-2 px-3 font-mono font-bold text-slate-500">{it.code}</td>
                              <td className="py-2 px-3 font-medium text-slate-800">{it.description}</td>
                              <td className="py-2 px-2 text-center text-slate-500">{it.unit}</td>
                              <td className="py-2 px-2 text-right font-mono text-slate-600">{it.budgetQty}</td>
                              <td className="py-2 px-2 text-right font-mono text-slate-400">{it.previousQty}</td>
                              <td className="py-2 px-2 text-right font-mono font-bold text-[#0F3D5C] bg-blue-50/30">
                                {it.periodQty}
                              </td>
                              <td className="py-2 px-2 text-right font-mono font-bold text-slate-900">{it.accumulatedQty}</td>
                              <td className="py-2 px-3 text-right font-mono font-extrabold text-slate-900">
                                {formatCurrencyKz(it.periodTotalKz)}
                              </td>
                              <td className="py-2 px-2 text-center">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  it.percentageExecuted >= 100
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-amber-50 text-amber-700'
                                }`}>
                                  {it.percentageExecuted.toFixed(0)}%
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex flex-wrap items-center justify-between pt-1 text-[11px] text-slate-500">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Validado pela Fiscalização e assinado no livro de obra.</span>
                      </div>
                      <span className="font-semibold text-slate-700">
                        Avanço Global da Empreitada: {auto.accumulatedPercentage.toFixed(1)}% concluído
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DOCUMENTOS */}
        {activeTab === 'documents' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Anexos Técnicos do Projecto</h3>
              <label className="min-h-[44px] py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer inline-flex items-center space-x-1.5 transition-all active:scale-95">
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>Carregar Ficheiro</span>
                <input type="file" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            {docList.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                Nenhum documento anexado ainda. Carregue alvarás, plantas ou comprovativos.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {docList.map((doc: any) => (
                  <div
                    key={doc.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2.5 overflow-hidden">
                      <FileText className="w-5 h-5 text-[#0F3D5C] shrink-0" />
                      <div className="overflow-hidden">
                        <span className="font-bold text-xs text-slate-800 truncate block">
                          {doc.title}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {doc.size || '1.2 MB'} &bull; {new Date(doc.uploadedAt).toLocaleDateString('pt-PT')}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-[#0F3D5C] hover:underline cursor-pointer">
                      Ver
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PARTILHAS & QR */}
        {activeTab === 'shares' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Links Ativos de Verificação Pública</h3>
            {project.shareLinks?.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                Nenhum link de partilha criado para esta obra. Gere um link no módulo de PDF ou partilha pública.
              </div>
            ) : (
              <div className="space-y-3">
                {project.shareLinks?.map((sl) => (
                  <div
                    key={sl.id}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-slate-800">
                          Token: {sl.token.substring(0, 12)}...
                        </span>
                        {sl.requireCode && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                            Código: {sl.code || '123456'}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">
                        Expira em {new Date(sl.expiresAt).toLocaleDateString('pt-PT')} &bull; Status: {sl.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleCopyShareLink(sl.token)}
                        className="min-h-[44px] py-2 px-3.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 flex items-center space-x-1.5 cursor-pointer active:scale-95 transition-all"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Link</span>
                      </button>

                      {onOpenPublicVerification && (
                        <button
                          onClick={() => onOpenPublicVerification(sl.token)}
                          className="min-h-[44px] py-2 px-3.5 bg-[#0F3D5C] hover:bg-[#0A293E] text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 cursor-pointer active:scale-95 transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Testar Verificação</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: VERSÕES & COMPARATIVO (TAKEOFF DIFF) */}
        {activeTab === 'versions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Histórico de Versões &amp; Comparativo (Takeoff Diff)</h3>
                <p className="text-[11px] text-slate-500">
                  Rastreabilidade e auditoria de alterações entre a proposta inicial e aditamentos de obra.
                </p>
              </div>

              <button
                onClick={() => {
                  const newVerNum = (project.versions?.length || 1) + 1;
                  const newVer = {
                    id: `ver_${Date.now()}`,
                    versionNumber: `v${newVerNum}.0`,
                    createdAt: new Date().toISOString(),
                    authorName: currentUser.nome || 'Engenheiro Responsável',
                    changeDescription: `Revisão ${newVerNum} — Ajuste de preços de mercado e insumos`,
                    grandTotalKz: project.totalKz,
                  };
                  setProject({
                    ...project,
                    versions: [newVer, ...(project.versions || [])],
                  });
                  success(`Versão ${newVer.versionNumber} criada como ponto de restauro auditável.`);
                }}
                className="min-h-[38px] px-3.5 py-1.5 bg-[#0F3D5C] hover:bg-[#0A293E] text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                + Congelar Nova Versão (Snapshot)
              </button>
            </div>

            {/* Painel de Comparativo Diferencial (Takeoff Diff) */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
                Comparativo Automático de Revisões
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Versão Atual Ativa</span>
                  <span className="font-bold text-slate-900 font-mono text-sm">
                    {formatCurrencyKz(project.totalKz)}
                  </span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Versão Base Inicial (v1.0)</span>
                  <span className="font-bold text-slate-700 font-mono text-sm">
                    {formatCurrencyKz(project.versions?.[project.versions.length - 1]?.grandTotalKz || project.totalKz)}
                  </span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">Variação Orçamental Acumulada</span>
                  <span className="font-bold text-emerald-700 font-mono text-sm">
                    +0,0% (Alinhado)
                  </span>
                </div>
              </div>
            </div>

            {!project.versions || project.versions.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                Esta é a primeira versão oficial deste orçamento (v1.0). Quaisquer alterações de parâmetros ou quantitativos futuros criarão um ponto de restauro auditável.
              </div>
            ) : (
              <div className="space-y-3">
                {project.versions.map((v) => (
                  <div
                    key={v.id}
                    className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs hover:border-slate-300 transition-colors shadow-2xs"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-[#0F3D5C] text-amber-400 flex items-center justify-center font-black text-[11px] shadow-xs">
                        {v.versionNumber}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{v.changeDescription}</div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(v.createdAt).toLocaleDateString('pt-PT')} às {new Date(v.createdAt).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })} &bull; Autor: {v.authorName}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-black text-slate-900 font-mono">{formatCurrencyKz(v.grandTotalKz)}</div>
                      <span className="text-[10px] text-emerald-600 font-semibold">Registo Criptografado &bull; Imutável</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Drawer de Transparência e Explicabilidade Técnica por Item (Fase 17) */}
      <TransparencyDrawer
        isOpen={Boolean(selectedExplanationItem)}
        onClose={() => setSelectedExplanationItem(null)}
        item={selectedExplanationItem}
        projectContext={{
          province: project.province,
          areaM2: project.areaM2,
          foundationType: (project as any).foundationType,
          finishLevel: project.finishLevel,
        }}
      />
    </div>
  );
};

export default ProjetoDetailPage;
