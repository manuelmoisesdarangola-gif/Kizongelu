/**
 * @file app/(app)/documentos/page.tsx
 * Página de Gestão Central de Documentos, Cadernos de Encargos e PDFs de Angola.
 */

import React, { useState, useEffect } from 'react';
import {
  FileStack,
  Download,
  FileText,
  Search,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { listProjects, ProjectListItem } from '@/lib/actions/projects';
import { generateOrcamentoPdfBlob } from '@/lib/pdf/generate-orcamento';
import { useToast } from '@/src/context/ToastContext';
import { useAuth } from '@/src/auth/auth-context';
import { formatRelativeTime } from '@/lib/utils/formatters';
import {
  TableSkeleton,
  EmptyState,
  ErrorState,
  SemanticStatusBadge,
} from '@/src/components/common/UIStates';

export interface DocumentosPageProps {
  onOpenProject: (id: string) => void;
  onNewBudget?: () => void;
}

export const DocumentosPage: React.FC<DocumentosPageProps> = ({
  onOpenProject,
  onNewBudget,
}) => {
  const { currentUser } = useAuth();
  const { success, error: toastError } = useToast();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchDocuments = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await listProjects(currentUser.id, currentUser.role);
      setProjects(res);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        'Não foi possível carregar o arquivo de documentos técnicos. Verifique a sua ligação e tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [currentUser.id, currentUser.role]);

  const handleDownloadPdf = async (projectId: string, title: string) => {
    setDownloadingId(projectId);
    try {
      const { blob } = await generateOrcamentoPdfBlob(projectId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Orcamento_Mapa_Quantidades_${projectId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      success(
        'PDF Descarregado com Sucesso',
        `O Orçamento e Mapa de Quantidades de "${title}" foi gerado e guardado.`
      );
    } catch {
      toastError(
        'Erro ao Descarregar PDF',
        'Não foi possível compilar o documento PDF oficial. Tente novamente em instantes.'
      );
    } finally {
      setDownloadingId(null);
    }
  };

  const filtered = projects.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.province.toLowerCase().includes(search.toLowerCase()) ||
      b.municipality.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Página com Hierarquia Tipográfica Rigorosa */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F3D5C] tracking-tight leading-tight">
            Arquivo Central de Documentos Técnicos
          </h1>
          <p className="text-sm text-slate-500 mt-1 leading-relaxed">
            Orçamentos, mapas de quantidades e certificados digitais emitidos com QR Code de autenticidade.
          </p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filtrar por obra ou local..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0F3D5C] w-full sm:w-64 transition-all"
          />
        </div>
      </div>

      {/* ESTADO DE ERRO COM RECUPERAÇÃO */}
      {errorMessage && (
        <ErrorState
          title="Erro ao carregar documentos"
          message={errorMessage}
          onRetry={fetchDocuments}
        />
      )}

      {/* TABELA / CARD CONTAINER */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={4} cols={5} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            type="documents"
            title={
              search
                ? 'Nenhum documento encontrado'
                : 'Ainda não tem documentos técnicos'
            }
            subtitle={
              search
                ? `Nenhum resultado corresponde à pesquisa "${search}". Tente limpar o filtro.`
                : 'Os documentos com mapas de quantidades e QR Codes oficiais aparecerão aqui após criar o seu primeiro orçamento.'
            }
            ctaLabel={search ? 'Limpar filtro' : '+ Criar primeiro orçamento'}
            onCta={search ? () => setSearch('') : onNewBudget}
          />
        ) : (
          <div>
            {/* VISTA MOBILE: CARDS VERTICAIS (Tabelas horizontais proibidas em mobile) */}
            <div className="md:hidden divide-y divide-slate-100">
              {filtered.map((b) => (
                <div key={b.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{b.name}</h3>
                      <div className="text-[11px] text-[#64748B] mt-0.5">
                        Ref: <span className="font-mono">{b.id}</span> &bull;{' '}
                        <span>{formatRelativeTime(b.createdAt)}</span>
                      </div>
                    </div>
                    <SemanticStatusBadge
                      variant={b.status === 'UNLOCKED' ? 'success' : 'warning'}
                      label={
                        b.status === 'UNLOCKED'
                          ? 'Assinado'
                          : 'Rascunho'
                      }
                    />
                  </div>

                  <div className="text-xs text-slate-600 flex items-center space-x-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#0F3D5C] shrink-0" />
                    <span>Orçamento e Mapa de Quantidades</span>
                  </div>

                  <div className="text-xs text-slate-500">
                    {b.province}, {b.municipality}
                  </div>

                  <div className="flex items-center space-x-2 pt-1 border-t border-slate-100">
                    <button
                      onClick={() => onOpenProject(b.id)}
                      className="flex-1 h-12 text-xs font-bold text-[#0F3D5C] bg-slate-100 hover:bg-slate-200 active:scale-98 rounded-xl flex items-center justify-center transition-all cursor-pointer"
                    >
                      Ver Detalhes
                    </button>
                    <button
                      onClick={() => handleDownloadPdf(b.id, b.name)}
                      disabled={downloadingId === b.id}
                      className="flex-1 h-12 bg-[#0F3D5C] hover:bg-[#0A293E] active:scale-98 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Download className="w-4 h-4" />
                      <span>{downloadingId === b.id ? 'A gerar...' : 'Descarregar PDF'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* VISTA DESKTOP: TABELA HORIZONTAL COM SCROLL */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-[#F8FAFC] text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Documento / Projecto</th>
                    <th className="px-6 py-4">Tipo</th>
                    <th className="px-6 py-4">Localidade</th>
                    <th className="px-6 py-4">Certificação QR</th>
                    <th className="px-6 py-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((b) => (
                    <tr
                      key={b.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 group-hover:text-[#0F3D5C] transition-colors">
                          {b.name}
                        </div>
                        <div className="text-[11px] text-[#64748B] mt-0.5">
                          Ref: <span className="font-mono">{b.id}</span> &bull;{' '}
                          <span>{formatRelativeTime(b.createdAt)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center space-x-1.5 font-semibold text-slate-700">
                          <FileText className="w-3.5 h-3.5 text-[#0F3D5C] shrink-0" />
                          <span>Orçamento e Mapa de Quantidades</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-medium">
                        {b.province}, {b.municipality}
                      </td>
                      <td className="px-6 py-4">
                        <SemanticStatusBadge
                          variant={b.status === 'UNLOCKED' ? 'success' : 'warning'}
                          label={
                            b.status === 'UNLOCKED'
                              ? 'Assinado Digitalmente'
                              : 'Orçamento Rascunho'
                          }
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => onOpenProject(b.id)}
                            className="px-3 py-1.5 text-xs font-bold text-[#0F3D5C] hover:bg-slate-100 rounded-lg cursor-pointer transition-colors active:scale-98"
                          >
                            Ver Detalhes
                          </button>
                          <button
                            onClick={() => handleDownloadPdf(b.id, b.name)}
                            disabled={downloadingId === b.id}
                            className="px-3.5 py-1.5 bg-[#0F3D5C] hover:bg-[#0A293E] text-white font-bold text-xs rounded-lg flex items-center space-x-1.5 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>{downloadingId === b.id ? 'A gerar...' : 'PDF'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
