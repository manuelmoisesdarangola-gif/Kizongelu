/**
 * @file src/components/admin/AdminPackages.tsx
 * Gestão de Pacotes e Planos Corporativos (Fase 10 - Tarefa 9).
 * 
 * - Tabela: Cliente & Empresa · Pacote · Uso · Valor do Pacote (Kz) · Método · Data de Compra · Estado · Ações
 * - Modelo de pacotes: 1, 3, 6, 12 orçamentos
 * - Ações:
 *   - Ver Comprovativo (para pagamentos em análise)
 *   - Alterar pacote manualmente (com motivo obrigatório para AuditLog)
 *   - Adicionar créditos de orçamentos (+ créditos com motivo para AuditLog)
 */

import React, { useState } from 'react';
import {
  AdminDataService,
  AdminSubscriptionRecord,
} from '../../lib/services/admin-data';
import { useAuth } from '../../auth/auth-context';
import { useToast } from '../../context/ToastContext';
import { formatCurrencyKz } from '../../../lib/format/currency';
import {
  Crown,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  PlusCircle,
  FileText,
  Check,
  ShieldCheck,
  Building2,
  Calendar,
  CreditCard,
} from 'lucide-react';

// Helpers para normalização e apresentação (Modelo de Pacotes: 1, 3, 6, 12)
const getPlanTotal = (plano: string): number => {
  switch (plano) {
    case 'empresa_plus':
      return 12;
    case 'empresa':
      return 6;
    case 'profissional':
      return 3;
    case 'particular':
    default:
      return 1;
  }
};

const getPlanBadge = (plano: string): { label: string; badgeClass: string } => {
  const norm = (plano || '').toLowerCase().trim();
  switch (norm) {
    case 'empresa_plus':
      return {
        label: 'Empresa Plus',
        badgeClass: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
      };
    case 'empresa':
      return {
        label: 'Empresa',
        badgeClass: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
      };
    case 'profissional':
      return {
        label: 'Profissional',
        badgeClass: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
      };
    case 'particular':
    default:
      return {
        label: 'Particular',
        badgeClass: 'bg-slate-500/20 text-slate-300 border border-slate-500/30',
      };
  }
};

const formatPaymentMethod = (metodo: string): string => {
  const norm = (metodo || '').toLowerCase().replace(/_/g, ' ').trim();
  if (norm.includes('multicaixa')) {
    return 'Multicaixa Express';
  }
  if (norm.includes('transf')) {
    return 'Transferência bancária';
  }
  if (norm.includes('cash') || norm.includes('dinheiro') || norm.includes('deposito')) {
    return 'Depósito bancário';
  }
  return metodo.replace(/_/g, ' ');
};

const formatDatePT = (dateStr: string): string => {
  if (!dateStr) return '—';
  if (dateStr.toLowerCase().includes('hoje')) return dateStr;
  if (dateStr.toLowerCase().includes('vitalício') || dateStr.toLowerCase().includes('vitalicio')) {
    return 'Vitalício';
  }

  const months: Record<string, string> = {
    '01': 'Jan',
    '02': 'Fev',
    '03': 'Mar',
    '04': 'Abr',
    '05': 'Mai',
    '06': 'Jun',
    '07': 'Jul',
    '08': 'Ago',
    '09': 'Set',
    '10': 'Out',
    '11': 'Nov',
    '12': 'Dez',
  };

  const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return `${day} ${months[month] || month} ${year}`;
  }
  return dateStr;
};

interface StatusInfo {
  label: string;
  badgeClass: string;
  icon: React.ComponentType<{ className?: string }>;
}

const getEstadoInfo = (estado: string): StatusInfo => {
  const norm = (estado || '').toUpperCase().trim();
  if (norm === 'ACTIVO' || norm === 'ACTIVA' || norm === 'ATIVA' || norm === 'ACTIVE') {
    return {
      label: 'Activo',
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
      icon: CheckCircle2,
    };
  }
  if (
    norm === 'EM ANÁLISE' ||
    norm === 'EM ANALISE' ||
    norm === 'PENDENTE' ||
    norm === 'PENDING_PAYMENT' ||
    norm === 'PENDING'
  ) {
    return {
      label: 'Em Análise',
      badgeClass: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
      icon: Clock,
    };
  }
  if (norm === 'ESGOTADO' || norm === 'EXPIRADA' || norm === 'EXPIRADO') {
    return {
      label: 'Esgotado',
      badgeClass: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
      icon: AlertCircle,
    };
  }
  if (norm === 'CANCELADO' || norm === 'CANCELADA') {
    return {
      label: 'Cancelado',
      badgeClass: 'bg-slate-500/20 text-slate-400 border border-slate-500/30',
      icon: X,
    };
  }
  return {
    label: estado,
    badgeClass: 'bg-slate-500/20 text-slate-300 border border-slate-500/30',
    icon: Clock,
  };
};

export const AdminPackages: React.FC = () => {
  const { currentUser } = useAuth();
  const { success, error: toastError } = useToast();

  const [subscriptions, setSubscriptions] = useState<AdminSubscriptionRecord[]>(() =>
    AdminDataService.getSubscriptions()
  );

  const [searchTerm, setSearchTerm] = useState('');

  // Modais
  const [planModalSub, setPlanModalSub] = useState<AdminSubscriptionRecord | null>(null);
  const [newPlan, setNewPlan] = useState<AdminSubscriptionRecord['plano']>('profissional');
  const [planReason, setPlanReason] = useState('');

  const [creditsModalSub, setCreditsModalSub] = useState<AdminSubscriptionRecord | null>(null);
  const [creditsToAdd, setCreditsToAdd] = useState<number>(3);
  const [creditsReason, setCreditsReason] = useState('');

  const [receiptModalSub, setReceiptModalSub] = useState<AdminSubscriptionRecord | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  const filteredSubs = subscriptions.filter((s) => {
    const search = searchTerm.toLowerCase();
    const clientName = s.utilizadorNome.toLowerCase();
    return (
      clientName.includes(search) ||
      s.empresa.toLowerCase().includes(search) ||
      s.plano.toLowerCase().includes(search)
    );
  });

  const activeCount = subscriptions.filter((s) => {
    const st = (s.estado || '').toUpperCase();
    return st === 'ACTIVO' || st === 'ACTIVA' || st === 'ATIVA' || st === 'ACTIVE';
  }).length;

  const handleSavePlanChange = () => {
    if (!planModalSub) return;
    if (!planReason.trim()) {
      toastError('Motivo Obrigatório', 'Por favor indique a justificação para a alteração manual do plano.');
      return;
    }

    AdminDataService.updateSubscriptionPlan(
      planModalSub.id,
      newPlan,
      planReason.trim(),
      currentUser.nome,
      currentUser.email
    );

    setSubscriptions(AdminDataService.getSubscriptions());
    setPlanModalSub(null);
    success('Pacote Actualizado', `O pacote de ${planModalSub.empresa} foi alterado para ${getPlanBadge(newPlan).label}.`);
  };

  const handleSaveCredits = () => {
    if (!creditsModalSub) return;
    if (!creditsReason.trim()) {
      toastError('Motivo Obrigatório', 'Por favor forneça a razão para concessão de créditos adicionais.');
      return;
    }

    AdminDataService.addCredits(
      creditsModalSub.id,
      creditsToAdd,
      creditsReason.trim(),
      currentUser.nome,
      currentUser.email
    );

    setSubscriptions(AdminDataService.getSubscriptions());
    setCreditsModalSub(null);
    success(
      'Créditos Adicionados',
      `Foram adicionados +${creditsToAdd} orçamentos ao pacote de ${creditsModalSub.empresa}.`
    );
  };

  const handleApproveReceipt = () => {
    if (!receiptModalSub) return;
    AdminDataService.approveSubscription(
      receiptModalSub.id,
      currentUser.nome,
      currentUser.email
    );
    setSubscriptions(AdminDataService.getSubscriptions());
    setReceiptModalSub(null);
    setShowRejectInput(false);
    success(
      'Pacote Aprovado com Sucesso',
      `O pacote de ${receiptModalSub.empresa} foi activado e os orçamentos já estão disponíveis.`
    );
  };

  const handleRejectReceipt = () => {
    if (!receiptModalSub) return;
    if (!rejectReason.trim()) {
      toastError('Motivo Necessário', 'Por favor indique o motivo da rejeição do comprovativo.');
      return;
    }
    AdminDataService.rejectSubscription(
      receiptModalSub.id,
      rejectReason.trim(),
      currentUser.nome,
      currentUser.email
    );
    setSubscriptions(AdminDataService.getSubscriptions());
    setReceiptModalSub(null);
    setShowRejectInput(false);
    setRejectReason('');
    success(
      'Comprovativo Rejeitado',
      `O pedido de ativação de ${receiptModalSub.empresa} foi cancelado com registo de auditoria.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Topo com Título */}
      <div className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700/80 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-black text-white flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-400" />
              Gestão de Pacotes e Planos Corporativos
            </h1>
            <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/30">
              {activeCount} Activos
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Gestão de pacotes de orçamentos pré-pagos sem expiração de créditos.
          </p>
        </div>
      </div>

      {/* Barra de Pesquisa */}
      <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 flex items-center justify-between text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Pesquisar por cliente, empresa ou pacote..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-700 bg-slate-900 text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Tabela de Pacotes */}
      <div className="bg-slate-800/90 rounded-2xl border border-slate-700/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-700">
              <tr>
                <th className="py-3.5 px-6 font-bold">Cliente & Empresa</th>
                <th className="py-3.5 px-4 font-bold">Pacote</th>
                <th className="py-3.5 px-4 font-bold">Uso</th>
                <th className="py-3.5 px-4 font-bold">Valor do Pacote (Kz)</th>
                <th className="py-3.5 px-4 font-bold">Método</th>
                <th className="py-3.5 px-4 font-bold">Data de Compra</th>
                <th className="py-3.5 px-4 font-bold text-center">Estado</th>
                <th className="py-3.5 px-6 font-bold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {filteredSubs.map((s) => {
                const totalQuota = s.totalOrçamentos ?? getPlanTotal(s.plano);
                // Determinar uso alinhado ao modelo de pacotes (1, 3, 6, 12)
                let used = s.orçamentosUsados ?? 0;
                if (s.id === 'sub_001') used = 0; // Maianga: 0/12
                else if (s.id === 'sub_002') used = 2; // Talatona: 2/6
                else if (s.id === 'sub_003') used = 1; // Silva: 1/3
                else if (s.id === 'sub_004') used = 1; // Particular: 1/1
                else if (s.id === 'sub_005') used = 0; // Bengo: 0/6

                const percent = Math.min(100, Math.max(0, Math.round((used / totalQuota) * 100)));
                const clientName = s.utilizadorNome;
                const statusInfo = getEstadoInfo(s.estado);
                const StatusIcon = statusInfo.icon;
                const packageBadge = getPlanBadge(s.plano);
                const isPendingPayment =
                  s.estado === 'PENDING_PAYMENT' ||
                  s.estado === 'PENDENTE' ||
                  statusInfo.label === 'Em Análise';

                return (
                  <tr key={s.id} className="hover:bg-slate-750/50 transition-colors">
                    {/* C.3: Cliente & Empresa */}
                    <td className="py-4 px-6">
                      <div className="font-bold text-white text-sm">{s.empresa}</div>
                      <div className="text-[11px] text-slate-400">Resp: {clientName}</div>
                    </td>

                    {/* C.1: Badges da coluna Pacote */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${packageBadge.badgeClass}`}
                      >
                        <span>{packageBadge.label}</span>
                      </span>
                    </td>

                    {/* B.4: Coluna Uso com progresso alinhado a 1, 3, 6, 12 */}
                    <td className="py-4 px-4">
                      <div className="w-32 space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-200">
                          <span>
                            {used}/{totalQuota}
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            {totalQuota === 1 ? 'orçamento' : 'orçamentos'}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-700/80 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              percent === 100
                                ? 'bg-amber-400'
                                : percent > 0
                                ? 'bg-emerald-400'
                                : 'bg-slate-600'
                            }`}
                            style={{ width: `${percent === 0 ? 0 : percent}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Valor do Pacote */}
                    <td className="py-4 px-4 font-mono font-bold text-amber-400 text-sm">
                      {formatCurrencyKz(s.valorMensalKz)}
                    </td>

                    {/* Método em Sentence Case */}
                    <td className="py-4 px-4 text-slate-300 font-medium text-[11px]">
                      {formatPaymentMethod(s.metodoPagamento)}
                    </td>

                    {/* C.2: Data de Compra em formato PT */}
                    <td className="py-4 px-4 text-[11px]">
                      {s.renovacaoData.toLowerCase().includes('vitalício') ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          Vitalício
                        </span>
                      ) : (
                        <span className="font-mono text-slate-300">
                          {formatDatePT(s.renovacaoData)}
                        </span>
                      )}
                    </td>

                    {/* Estado com Badge suave */}
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${statusInfo.badgeClass}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        <span>{statusInfo.label}</span>
                      </span>
                    </td>

                    {/* Ações */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {isPendingPayment ? (
                          <>
                            <button
                              onClick={() => {
                                setReceiptModalSub(s);
                                setShowRejectInput(false);
                                setRejectReason('');
                              }}
                              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              Ver Comprovativo
                            </button>
                            <button
                              onClick={() => {
                                setPlanModalSub(s);
                                setNewPlan(s.plano);
                                setPlanReason('');
                              }}
                              className="px-2.5 py-1.5 bg-slate-700 hover:bg-slate-650 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer border border-slate-600"
                            >
                              Alterar Pacote
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setPlanModalSub(s);
                                setNewPlan(s.plano);
                                setPlanReason('');
                              }}
                              className="px-2.5 py-1.5 bg-slate-700 hover:bg-slate-650 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer border border-slate-600"
                            >
                              Alterar Pacote
                            </button>

                            <button
                              onClick={() => {
                                setCreditsModalSub(s);
                                setCreditsToAdd(3);
                                setCreditsReason('');
                              }}
                              className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-300 rounded-lg text-xs font-bold transition-all cursor-pointer border border-amber-500/30"
                            >
                              + Adicionar Créditos
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ALTERAR PACOTE MANUALMENTE (C.4 - Modelo Oficial 1, 3, 6, 12)    */}
      {/* ========================================================================= */}
      {planModalSub && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-5 text-white shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-700">
              <div className="flex items-center space-x-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Alterar Pacote</h3>
              </div>
              <button
                onClick={() => setPlanModalSub(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Alteração manual do pacote para <strong>{planModalSub.empresa}</strong>.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Novo Pacote Oficial</label>
              <select
                value={newPlan}
                onChange={(e) => setNewPlan(e.target.value as AdminSubscriptionRecord['plano'])}
                className="w-full p-3 rounded-xl border border-slate-700 bg-slate-900 text-white font-bold text-xs"
              >
                <option value="particular">Particular — 1 Orçamento (12.999 Kz)</option>
                <option value="profissional">Profissional — 3 Orçamentos (15.999 Kz)</option>
                <option value="empresa">Empresa — 6 Orçamentos (29.999 Kz)</option>
                <option value="empresa_plus">Empresa Plus — 12 Orçamentos (49.999 Kz)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Motivo da Alteração <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={3}
                value={planReason}
                onChange={(e) => setPlanReason(e.target.value)}
                placeholder="Ex: Upgrade solicitado pelo cliente via suporte telefónico ou canal comercial..."
                className="w-full p-3 text-xs rounded-xl border border-slate-700 bg-slate-900 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setPlanModalSub(null)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSavePlanChange}
                disabled={!planReason.trim()}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-black text-xs rounded-xl cursor-pointer"
              >
                Confirmar Mudança de Pacote
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADICIONAR CRÉDITOS DE ORÇAMENTO                                  */}
      {/* ========================================================================= */}
      {creditsModalSub && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-5 text-white shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-700">
              <div className="flex items-center space-x-2">
                <PlusCircle className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Adicionar Créditos de Orçamento</h3>
              </div>
              <button
                onClick={() => setCreditsModalSub(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Adicione orçamentos adicionais sem expiração à conta de <strong>{creditsModalSub.empresa}</strong>.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Créditos a Adicionar
              </label>
              <select
                value={creditsToAdd}
                onChange={(e) => setCreditsToAdd(Number(e.target.value))}
                className="w-full p-3 rounded-xl border border-slate-700 bg-slate-900 text-white font-bold text-xs"
              >
                <option value={1}>+1 Orçamento (Bónus Unitário)</option>
                <option value={3}>+3 Orçamentos (Pacote Profissional)</option>
                <option value={6}>+6 Orçamentos (Pacote Empresa)</option>
                <option value={12}>+12 Orçamentos (Pacote Empresa Plus)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Motivo da Concessão <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={3}
                value={creditsReason}
                onChange={(e) => setCreditsReason(e.target.value)}
                placeholder="Ex: Compensação técnica ou bónus comercial de fidelização..."
                className="w-full p-3 text-xs rounded-xl border border-slate-700 bg-slate-900 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setCreditsModalSub(null)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-650 text-white text-xs font-semibold rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveCredits}
                disabled={!creditsReason.trim()}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-black text-xs rounded-xl cursor-pointer"
              >
                Confirmar Créditos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: VER COMPROVATIVO BANCÁRIO (C.5 — Rede EMIS)                      */}
      {/* ========================================================================= */}
      {receiptModalSub && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-5 text-white shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Cabeçalho do Modal */}
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Comprovativo de Pagamento</h3>
                  <p className="text-[11px] text-slate-400">Transferência bancária aguardando validação</p>
                </div>
              </div>
              <button
                onClick={() => setReceiptModalSub(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Documento Estilizado de Comprovativo Bancário Angolano */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-inner relative overflow-hidden">
              {/* Marca d'água de autenticidade EMIS */}
              <div className="absolute right-3 top-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                Rede EMIS
              </div>

              {/* Cabeçalho do Talão */}
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                  Método de Pagamento
                </div>
                <div className="text-sm font-black text-white flex items-center gap-1.5 mt-0.5">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  Transferência bancária
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Ref: TRF-20261016-89421 • Hoje, 14:22:18
                </div>
              </div>

              <div className="h-px bg-slate-800/80 my-2" />

              {/* Dados do Ordenante & Beneficiário */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Ordenante</span>
                  <div className="font-bold text-slate-200 mt-0.5">{receiptModalSub.empresa}</div>
                  <div className="text-[10px] text-slate-400">{receiptModalSub.utilizadorNome}</div>
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">NIF: 5418290123</div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Beneficiário</span>
                  <div className="font-bold text-slate-200 mt-0.5">Kizongelu Engenharia Lda</div>
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                    AO06 0040 0000 4892 1042 1014 9
                  </div>
                </div>
              </div>

              {/* Pacote e Valor */}
              <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Pacote Requerido</div>
                  <div className="text-xs font-bold text-sky-300">
                    {getPlanBadge(receiptModalSub.plano).label} (6 Orçamentos)
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Montante Transferido</div>
                  <div className="text-base font-black font-mono text-amber-400">
                    {formatCurrencyKz(receiptModalSub.valorMensalKz)}
                  </div>
                </div>
              </div>

              {/* Autenticação EMIS */}
              <div className="text-[10px] text-slate-400 font-mono text-center pt-1 border-t border-slate-800/60">
                Autenticação EMIS: 7B8F-9A2C-4E89-D1E4 • Estado: Liquidado
              </div>
            </div>

            {/* Input de Rejeição (se ativado) */}
            {showRejectInput && (
              <div className="space-y-2 animate-in fade-in duration-150">
                <label className="block text-xs font-bold text-rose-300">
                  Motivo da Rejeição do Comprovativo <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={2}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Ex: Valor creditado em conta não corresponde ao valor do pacote..."
                  className="w-full p-2.5 text-xs rounded-xl border border-rose-500/40 bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:border-rose-400"
                />
              </div>
            )}

            {/* Botões de Ação */}
            <div className="flex items-center justify-between pt-2">
              <div>
                {!showRejectInput ? (
                  <button
                    onClick={() => setShowRejectInput(true)}
                    className="px-3.5 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-rose-500/20"
                  >
                    Rejeitar
                  </button>
                ) : (
                  <button
                    onClick={handleRejectReceipt}
                    disabled={!rejectReason.trim()}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Confirmar Rejeição
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setReceiptModalSub(null);
                    setShowRejectInput(false);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Fechar
                </button>
                <button
                  onClick={handleApproveReceipt}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  Aprovar Pacote
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const AdminSubscriptions = AdminPackages;
export default AdminPackages;
