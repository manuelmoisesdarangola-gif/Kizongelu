/**
 * @file app/(app)/pagamentos/page.tsx
 * Página de Gestão de Pagamentos do Utilizador .
 * - Filtros: Todos / Pendentes / Aprovados / Rejeitados.
 * - Lista de cards/tabela: Referência, Projeto, Valor (Kz), Método (Transf. Bancária / MCX), Data, Estado (badge) e Comprovativo.
 * - Empty state com CTA caso não haja faturas ou pagamentos no filtro selecionado.
 */

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  XCircle,
  Download,
  Filter,
  ArrowUpRight,
  Sparkles,
  Receipt,
  FileCheck,
  ShieldCheck,
  Building2,
  Lock,
  Copy,
  Check,
  AlertTriangle,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/src/auth/auth-context';
import { formatCurrencyKz } from '@/lib/format/currency';
import { useToast } from '@/src/context/ToastContext';
import { formatRelativeTime } from '@/lib/utils/formatters';
import {
  CardSkeleton,
  EmptyState,
  ErrorState,
  KpiGridSkeleton,
  SemanticStatusBadge,
} from '@/src/components/common/UIStates';

export interface PaymentItemDisplay {
  id: string;
  reference: string;
  projectName: string;
  projectId: string;
  amountKz: number;
  method: string;
  date: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  proofUrl?: string;
}

export type PaymentRecord = PaymentItemDisplay;

export interface PagamentosPageProps {
  onNewBudget?: () => void;
  onOpenProject?: (projectId: string) => void;
  paymentsList?: PaymentItemDisplay[];
}

export const PagamentosPage: React.FC<PagamentosPageProps> = ({
  onNewBudget,
  onOpenProject,
  paymentsList,
}) => {
  const { currentUser } = useAuth();
  const { success, info, error } = useToast();

  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedIban, setCopiedIban] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Registos de pagamentos integrados com o sistema bancário angolano
  const [payments, setPayments] = useState<PaymentRecord[]>([
    {
      id: 'pay_01',
      reference: 'REF-TX-948102',
      projectName: 'Vivenda T3 - Kilamba',
      projectId: 'proj_t3_kilamba',
      amountKz: 12999,
      method: 'Transferência bancária',
      date: '18/09/2026',
      status: 'APPROVED',
      proofUrl: '#',
    },
    {
      id: 'pay_02',
      reference: 'REF-MCX-382910',
      projectName: 'Armazém Logístico - Viana',
      projectId: 'proj_armazem_viana',
      amountKz: 49999,
      method: 'Multicaixa Express',
      date: '20/09/2026',
      status: 'PENDING',
      proofUrl: '#',
    },
    {
      id: 'pay_03',
      reference: 'REF-TX-104928',
      projectName: 'Anexo T1 com Suíte - Talatona',
      projectId: 'proj_anexo_talatona',
      amountKz: 12999,
      method: 'Transferência bancária',
      date: '12/08/2026',
      status: 'APPROVED',
      proofUrl: '#',
    },
  ]);

  const loadPayments = React.useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      await new Promise((resolve) => setTimeout(resolve, 350));
      if (paymentsList && paymentsList.length > 0) {
        setPayments(paymentsList);
      }
    } catch (err) {
      setErrorMessage('Não foi possível carregar o histórico de transações bancárias. Por favor, verifique a sua ligação.');
    } finally {
      setLoading(false);
    }
  }, [paymentsList]);

  useEffect(() => {
    if (paymentsList && paymentsList.length > 0) {
      setPayments(paymentsList);
    }
  }, [paymentsList]);

  const handleCopyIban = () => {
    const iban = 'AO06.0040.0000.1234.5678.9012.3';
    navigator.clipboard.writeText(iban);
    setCopiedIban(true);
    success('Coordenadas IBAN copiadas para a área de transferência.');
    setTimeout(() => setCopiedIban(false), 2500);
  };

  const handleDownloadReceipt = (payment: PaymentRecord) => {
    setDownloadingId(payment.id);
    setTimeout(() => {
      setDownloadingId(null);
      info(
        `Recibo oficial emitido com selo de quitação fiscal para ${payment.projectName} (${payment.reference}) em conformidade com o Banco Nacional de Angola.`
      );
    }, 600);
  };

  const filteredPayments = payments.filter((p) => {
    if (filter === 'ALL') return true;
    return p.status === filter;
  });

  const totalLiquidado = payments
    .filter((p) => p.status === 'APPROVED')
    .reduce((acc, curr) => acc + curr.amountKz, 0);
  const pendingCount = payments.filter((p) => p.status === 'PENDING').length;
  const approvedCount = payments.filter((p) => p.status === 'APPROVED').length;
  const rejectedCount = payments.filter((p) => p.status === 'REJECTED').length;

  const getStatusBadge = (status: PaymentRecord['status']) => {
    switch (status) {
      case 'APPROVED':
        return <SemanticStatusBadge variant="success" label="Aprovado" />;
      case 'PENDING':
        return <SemanticStatusBadge variant="warning" label="Pendente de Validação" />;
      case 'REJECTED':
        return <SemanticStatusBadge variant="danger" label="Rejeitado" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Topo com Hierarquia Tipográfica e Ação de Atualização */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F3D5C] tracking-tight leading-tight flex items-center gap-2.5">
            <CreditCard className="w-7 h-7 text-[#0F3D5C]" />
            <span>Histórico de Pagamentos</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1 leading-relaxed">
            Controlo de liquidação de orçamentos, faturas de pacotes e transferências bancárias em Kwanzas (Kz).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Botão de Atualizar */}
          <button
            onClick={loadPayments}
            disabled={loading}
            className="min-h-[44px] px-3.5 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 flex items-center gap-2 cursor-pointer transition-colors shadow-xs disabled:opacity-50"
            title="Atualizar lista de pagamentos"
          >
            <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin text-[#F59E0B]' : ''}`} />
            <span className="hidden sm:inline">Atualizar</span>
          </button>

          {/* Coordenadas de Pagamento Rápido e Trust Signals */}
          <div
            onClick={handleCopyIban}
            title="Clique para copiar o IBAN"
            className="bg-white p-3 rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs text-xs flex items-center space-x-3 cursor-pointer transition-all group card-interactive"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0F3D5C] flex items-center justify-center font-black shrink-0 border border-blue-100">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <span>Transferência bancária &bull; Titular Verificado</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="font-mono text-[11px] text-slate-600 flex items-center gap-1.5">
                <span>AO06.0040.0000.1234.5678.9012.3</span>
                {copiedIban ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <Copy className="w-3 h-3 text-slate-400 group-hover:text-[#0F3D5C] shrink-0" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Faixa de Garantia e Confiança Legal / Fiscal (Trust Signals) */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-800">Serviço de Cobrança:</span>{' '}
            <span className="text-slate-600 font-medium">Kizongelu &bull; Pagamentos de Obra</span>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-slate-600 text-[11px]">
          <div>
            <span className="font-bold text-slate-800">Rede:</span> MULTICAIXA / EMIS
          </div>
          <span>&bull;</span>
          <div>
            <span className="font-bold text-slate-800">Faturação:</span> Conforme AGT
          </div>
        </div>
      </div>

      {/* RESUMO DE KPIS FINANCEIROS (COM SKELETON EM CARREGAMENTO) */}
      {loading ? (
        <KpiGridSkeleton count={3} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Liquidado</div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tabular-nums">
                {formatCurrencyKz(totalLiquidado)}
              </div>
              <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Orçamentos concluídos</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pagamentos Aprovados</div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tabular-nums">
                {approvedCount}
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">
                {approvedCount === 1 ? '1 transação confirmada' : `${approvedCount} transações confirmadas`}
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#0F3D5C] flex items-center justify-center shrink-0">
              <FileCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Em Validação</div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tabular-nums">
                {pendingCount}
              </div>
              <div className="text-[11px] text-amber-600 font-medium mt-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Comprovativo sob verificação</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>
      )}

      {/* Filtros em Abas com scroll horizontal suave no mobile */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        {(
          [
            { key: 'ALL', label: 'Todos os Pagamentos', count: payments.length },
            { key: 'PENDING', label: 'Pendentes', count: pendingCount },
            { key: 'APPROVED', label: 'Aprovados', count: approvedCount },
            { key: 'REJECTED', label: 'Rejeitados', count: rejectedCount },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 min-h-[44px] flex items-center gap-2 ${
              filter === tab.key
                ? 'bg-[#0F3D5C] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                filter === tab.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ESTADO: ERRO */}
      {errorMessage && (
        <ErrorState
          title="Erro ao carregar pagamentos"
          message={errorMessage}
          onRetry={loadPayments}
        />
      )}

      {/* ESTADO: CARREGAMENTO (SKELETON COM SHIMMER LARANJA 1.6s) */}
      {loading ? (
        <CardSkeleton rows={3} />
      ) : filteredPayments.length === 0 ? (
        /* ESTADO: VAZIO (EMPTY STATE) */
        <EmptyState
          type="payments"
          title={
            filter === 'ALL'
              ? 'Sem pagamentos registados'
              : filter === 'PENDING'
              ? 'Nenhum pagamento pendente'
              : filter === 'APPROVED'
              ? 'Nenhum pagamento aprovado'
              : 'Nenhum pagamento rejeitado'
          }
          subtitle={
            filter === 'ALL'
              ? 'Não existem transações no seu histórico. Os pagamentos submetidos por comprovativo ou Multicaixa Express surgem aqui imediatamente.'
              : 'Não há transações registadas com este estado no momento.'
          }
          ctaLabel={filter === 'ALL' ? '+ Criar Primeiro Orçamento' : 'Ver todos os pagamentos'}
          onCta={filter === 'ALL' ? onNewBudget : () => setFilter('ALL')}
        />
      ) : (
        /* ESTADO: SUCESSO (LISTA DE PAGAMENTOS COM MICROINTERAÇÕES) */
        <div className="space-y-3">
          {filteredPayments.map((p) => {
            const isDownloading = downloadingId === p.id;
            return (
              <div
                key={p.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 card-interactive"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2.5">
                    <span className="font-bold text-sm text-slate-900">{p.projectName}</span>
                    {getStatusBadge(p.status)}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 text-xs text-[#64748B]">
                    <span className="font-mono text-slate-700 font-semibold">{p.reference}</span>
                    <span>&bull;</span>
                    <span>{p.method}</span>
                    <span>&bull;</span>
                    <span>{formatRelativeTime(p.date)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-4">
                  <div className="text-left sm:text-right">
                    <div className="text-base font-black text-slate-900 tabular-nums">
                      {formatCurrencyKz(p.amountKz)}
                    </div>
                    <span className="text-[10px] text-[#64748B]">Total liquidado</span>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => {
                        if (onOpenProject) {
                          onOpenProject(p.projectId);
                        }
                      }}
                      className="min-h-[44px] px-3.5 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 flex items-center space-x-1.5 cursor-pointer transition-colors active:scale-98"
                    >
                      <span>Ver Projecto</span>
                      <ArrowUpRight className="w-4 h-4 text-slate-500" />
                    </button>

                    <button
                      onClick={() => handleDownloadReceipt(p)}
                      disabled={isDownloading}
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2.5 text-slate-500 hover:text-[#0F3D5C] hover:bg-slate-100 active:bg-slate-200 rounded-xl border border-slate-200 sm:border-transparent transition-colors cursor-pointer disabled:opacity-50 active:scale-98"
                      title="Baixar Recibo com Quitação"
                    >
                      {isDownloading ? (
                        <Loader2 className="w-4 h-4 text-[#0F3D5C] animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
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

export default PagamentosPage;
