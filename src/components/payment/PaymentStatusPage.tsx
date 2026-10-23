/**
 * @file src/components/payment/PaymentStatusPage.tsx
 * Página de Acompanhamento do Estado de Pagamento e Desbloqueio .
 * Timeline visual de 4 passos, polling em tempo real a cada 30s,
 * aviso de pendência >24h, botões de suporte WhatsApp e download desbloqueado.
 */

import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Circle,
  XCircle,
  AlertTriangle,
  FileDown,
  Share2,
  RefreshCw,
  ArrowLeft,
  MessageSquare,
  ShieldCheck,
  Building2,
  FileText,
  ExternalLink,
  Sparkles,
  Unlock,
} from 'lucide-react';
import {
  getPaymentStatus,
  reviewPayment,
  PaymentStatusResponse,
  PaymentTimelineStep,
  ADMIN_BANK_CONFIG,
} from '../../../lib/actions/payment';

interface PaymentStatusPageProps {
  projectId: string;
  onBackToDashboard?: () => void;
  onNavigateToUnlock?: () => void;
  onDownloadPdf?: () => void;
}

export const PaymentStatusPage: React.FC<PaymentStatusPageProps> = ({
  projectId,
  onBackToDashboard,
  onNavigateToUnlock,
  onDownloadPdf,
}) => {
  const [data, setData] = useState<PaymentStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [adminSimulating, setAdminSimulating] = useState(false);
  const [adminMessage, setAdminMessage] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await getPaymentStatus(projectId);
      setData(res);
    } catch (err) {
      console.error('Erro ao consultar estado de pagamento:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatus();

    // Polling a cada 30 segundos
    const interval = setInterval(() => {
      fetchStatus();
    }, 30000);

    return () => clearInterval(interval);
  }, [projectId]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    fetchStatus();
  };

  const handleAdminApprove = async () => {
    if (!data?.payment) return;
    setAdminSimulating(true);
    setAdminMessage(null);
    try {
      const res = await reviewPayment({
        paymentId: data.payment.id,
        action: 'APPROVE',
        adminId: 'usr_admin_review',
      });
      setAdminMessage(res.message);
      await fetchStatus();
    } catch (e: any) {
      setAdminMessage(e.message || 'Erro ao aprovar.');
    } finally {
      setAdminSimulating(false);
    }
  };

  const handleAdminReject = async () => {
    if (!data?.payment) return;
    setAdminSimulating(true);
    setAdminMessage(null);
    try {
      const res = await reviewPayment({
        paymentId: data.payment.id,
        action: 'REJECT',
        adminId: 'usr_admin_review',
        rejectionReason: 'Montante divergente do valor tabelado de 12.999 Kz ou comprovativo cortado.',
      });
      setAdminMessage(res.message);
      await fetchStatus();
    } catch (e: any) {
      setAdminMessage(e.message || 'Erro ao rejeitar.');
    } finally {
      setAdminSimulating(false);
    }
  };

  const handleSendWhatsApp = () => {
    const text = encodeURIComponent(
      `Olá Kizongelu, preciso de apoio com a validação do comprovativo do meu projeto ${projectId} (Ref: ${
        data?.payment?.reference || 'N/A'
      }).`
    );
    window.open(`https://wa.me/244923000111?text=${text}`, '_blank');
  };

  const handleShareWhatsAppUnlocked = () => {
    const text = encodeURIComponent(
      `Partilho o Orçamento Completo e Mapa de Quantidades do projeto ${projectId}, aprovado e verificado pela Kizongelu.`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 text-slate-500 font-sans">
        <div className="flex flex-col items-center space-y-3">
          <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
          <p className="text-sm font-medium">A carregar estado do pagamento...</p>
        </div>
      </div>
    );
  }

  const { payment, isUnlocked, isPendingOver24h, timeline } = data;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16 font-['Inter',sans-serif]">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {onBackToDashboard && (
              <button
                onClick={onBackToDashboard}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Voltar ao painel"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Estado do Pagamento
                </span>
                <span className="text-xs text-slate-400">Ref: {payment?.reference || 'Pendente'}</span>
              </div>
              <h1 className="text-lg font-bold text-slate-900 mt-0.5">Validação e Desbloqueio de Obra</h1>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
              title="Atualizar em tempo real"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-600' : ''}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Banner de Pendência >24h (se aplicável) */}
        {isPendingOver24h && (
          <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-fadeIn">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-amber-950">
                  O seu comprovativo está em análise há mais de 24h
                </h3>
                <p className="text-xs text-amber-800 mt-0.5">
                  A nossa equipa financeira foi notificada com prioridade alta. Pode acelerar a validação imediata enviando uma mensagem para o nosso suporte oficial.
                </p>
              </div>
            </div>
            <button
              onClick={handleSendWhatsApp}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shrink-0 flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Acelerar no WhatsApp</span>
            </button>
          </div>
        )}

        {/* Card Principal de Estado */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          {isUnlocked ? (
            <div className="flex items-center space-x-4 pb-6 border-b border-slate-100 text-emerald-800">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Pagamento Aprovado
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-1">
                  Orçamento e Mapa de Quantidades Concluídos!
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  O seu projecto foi emitido e concluído com sucesso. Pode agora descarregar o PDF com código QR ou partilhar com os seus parceiros.
                </p>
              </div>
            </div>
          ) : payment?.status === 'REJECTED' ? (
            <div className="flex items-center space-x-4 pb-6 border-b border-slate-100 text-rose-800">
              <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  Comprovativo Não Aprovado
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-1">
                  Validação Não Concluída
                </h2>
                <p className="text-xs text-rose-700 mt-0.5">
                  Motivo: {payment.rejectionReason || 'Comprovativo não identificado ou valor incorreto.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4 pb-6 border-b border-slate-100 text-amber-800">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Em Análise Financeira
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-1">
                  Comprovativo Recebido — Em Validação
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  A nossa equipa de tesouraria está a verificar o crédito em conta. O desbloqueio ocorre normalmente entre 15 min a poucas horas.
                </p>
              </div>
            </div>
          )}

          {/* Timeline Visual de 4 Passos */}
          <div className="py-8">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-6">
              Etapas do Processo de Desbloqueio
            </h3>

            <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {timeline.map((step) => {
                const isCompleted = step.status === 'COMPLETED';
                const isInProgress = step.status === 'IN_PROGRESS';
                const isRejected = step.status === 'REJECTED';

                return (
                  <div key={step.step} className="relative flex items-start space-x-4">
                    {/* Indicador circular */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-all ${
                        isCompleted
                          ? 'bg-emerald-600 text-white ring-4 ring-emerald-50'
                          : isInProgress
                          ? 'bg-amber-500 text-slate-900 ring-4 ring-amber-100 animate-pulse'
                          : isRejected
                          ? 'bg-rose-600 text-white ring-4 ring-rose-100'
                          : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : isInProgress ? (
                        <Clock className="w-4 h-4" />
                      ) : isRejected ? (
                        <XCircle className="w-4 h-4" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 fill-current" />
                      )}
                    </div>

                    {/* Texto da etapa */}
                    <div className="flex-1 pt-0.5">
                      <div className="flex items-baseline justify-between">
                        <h4
                          className={`text-sm font-bold ${
                            isCompleted
                              ? 'text-emerald-900'
                              : isInProgress
                              ? 'text-amber-900'
                              : isRejected
                              ? 'text-rose-900'
                              : 'text-slate-400'
                          }`}
                        >
                          {step.label}
                        </h4>
                        {step.date && (
                          <span className="text-[11px] text-slate-400 font-mono">{step.date}</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dados do Comprovativo Submetido */}
          {payment && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                <span className="font-semibold text-slate-500">Referência do Pagamento:</span>
                <span className="font-mono font-bold text-slate-900">{payment.reference}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                <span className="font-semibold text-slate-500">Valor Cobrado:</span>
                <span className="font-bold text-slate-900">{payment.amount.toLocaleString('pt-PT')} Kz</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                <span className="font-semibold text-slate-500">Método Escolhido:</span>
                <span className="font-medium text-slate-800">
                  {payment.method === 'TRANSFERENCIA' ? 'Transferência bancária' : 'Multicaixa Express'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Ficheiro Enviado:</span>
                <span className="font-mono text-slate-800">{payment.fileName}</span>
              </div>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
            {isUnlocked ? (
              <>
                <button
                  type="button"
                  onClick={onDownloadPdf}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-sm cursor-pointer transition-all"
                >
                  <FileDown className="w-4 h-4" />
                  <span>↓ Baixar PDF Oficial com QR</span>
                </button>

                <button
                  type="button"
                  onClick={handleShareWhatsAppUnlocked}
                  className="w-full sm:w-auto py-3 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm flex items-center justify-center space-x-2 cursor-pointer transition-all"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Enviar por WhatsApp</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-sm cursor-pointer transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Falar com suporte (WhatsApp)</span>
                </button>

                {onBackToDashboard && (
                  <button
                    type="button"
                    onClick={onBackToDashboard}
                    className="w-full sm:w-auto py-3 px-5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-sm cursor-pointer transition-all"
                  >
                    Voltar ao painel
                  </button>
                )}

                {payment?.status === 'REJECTED' && onNavigateToUnlock && (
                  <button
                    type="button"
                    onClick={onNavigateToUnlock}
                    className="w-full sm:w-auto py-3 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-sm cursor-pointer transition-all"
                  >
                    Re-enviar comprovativo
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* ================= PAINEL DE SIMULAÇÃO ADMIN (FASE 7 & 10) ================= */}
        <div className="bg-slate-900 text-slate-200 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Painel do Administrador (Simulação de Auditoria)
              </span>
            </div>
            <span className="text-[11px] text-slate-400">Ação imediata para testes</span>
          </div>

          <p className="text-xs text-slate-300">
            Como administrador do sistema, pode simular a revisão bancária deste comprovativo e verificar em tempo real o desbloqueio do PDF e o registo de auditoria.
          </p>

          {adminMessage && (
            <div className="p-2.5 bg-slate-800 rounded-lg text-xs font-mono text-emerald-400 border border-slate-700">
              ✓ {adminMessage}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              disabled={adminSimulating || isUnlocked}
              onClick={handleAdminApprove}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
                isUnlocked
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isUnlocked ? 'Já Aprovado' : 'Aprovar Comprovativo (Desbloquear PDF)'}</span>
            </button>

            <button
              type="button"
              disabled={adminSimulating || isUnlocked}
              onClick={handleAdminReject}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-900/50 hover:bg-rose-800 text-rose-200 border border-rose-700/50 flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Recusar Comprovativo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
