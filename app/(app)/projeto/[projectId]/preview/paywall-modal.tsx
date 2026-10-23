/**
 * @file app/(app)/projeto/[projectId]/preview/paywall-modal.tsx
 * Modal de Desbloqueio e Paywall Adaptativo com Pacotes de Orçamentos (Créditos Sem Expiração).
 */

import React, { useState, useEffect } from 'react';
import { unlockProject } from '../../../../../lib/actions/preview';
import {
  getUserCredits,
  consumeCredit,
  purchasePackage,
  PACKAGES_CATALOG,
} from '../../../../../lib/actions/packages';
import { useAuth } from '../../../../../src/auth/auth-context';
import {
  Lock,
  CheckCircle2,
  Smartphone,
  CreditCard,
  Building,
  ShieldCheck,
  Zap,
  X,
  Loader2,
  ArrowRight,
  Coins,
  AlertCircle,
} from 'lucide-react';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  userType?: 'PARTICULAR' | 'PROFISSIONAL';
  hasActiveSubscription?: boolean;
  onUnlocked: () => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  onClose,
  projectId,
  userType = 'PARTICULAR',
  onUnlocked,
}) => {
  const { currentUser, consumirOrcamento } = useAuth();
  const userId = currentUser?.id || 'usr-default';

  const [availableCredits, setAvailableCredits] = useState<number | null>(null);
  const [isLoadingCredits, setIsLoadingCredits] = useState<boolean>(true);
  const [paymentMethod, setPaymentMethod] = useState<'MCX' | 'REF' | 'IBAN'>('MCX');
  const [phoneNumber, setPhoneNumber] = useState('923 000 000');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<string>('particular');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Carregar saldo de créditos do utilizador em tempo real
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoadingCredits(true);
    setErrorMsg(null);

    const loadCredits = async () => {
      try {
        const credits = await getUserCredits(userId, currentUser?.role);
        if (isMounted) {
          setAvailableCredits(credits);
          setIsLoadingCredits(false);
        }
      } catch (err) {
        console.warn('Erro ao carregar créditos:', err);
        if (isMounted) {
          setAvailableCredits(0);
          setIsLoadingCredits(false);
        }
      }
    };

    loadCredits();

    const handlePackagesUpdated = (e: any) => {
      if (!e?.detail?.userId || e.detail.userId === userId) {
        loadCredits();
      }
    };

    window.addEventListener('kizongelu_packages_updated', handlePackagesUpdated);
    return () => {
      isMounted = false;
      window.removeEventListener('kizongelu_packages_updated', handlePackagesUpdated);
    };
  }, [isOpen, userId, currentUser?.role]);

  if (!isOpen) return null;

  // Desbloqueio imediato consumindo 1 crédito do pacote activo
  const handleUnlockWithCredit = async () => {
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      await consumeCredit(userId, projectId);
      await unlockProject(projectId, userType);
      consumirOrcamento();
      setAvailableCredits((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
      setIsProcessing(false);
      onUnlocked();
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.message === 'CREDIT_ALREADY_CONSUMED_FOR_PROJECT') {
        await unlockProject(projectId, userType);
        setIsProcessing(false);
        onUnlocked();
        onClose();
        return;
      }
      if (err.message === 'NO_CREDITS_AVAILABLE') {
        setAvailableCredits(0);
        setErrorMsg('Não tem créditos disponíveis no seu pacote. Adquira um novo pacote para continuar.');
      } else {
        setErrorMsg('Erro ao processar desbloqueio. Tente novamente.');
      }
      setIsProcessing(false);
    }
  };

  // Compra directa de pacote no modal e subsequente desbloqueio
  const handlePurchaseAndUnlock = async () => {
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      // Simulação rápida de liquidação da transacção
      await new Promise((resolve) => setTimeout(resolve, 800));

      // 1. Efectua a compra do pacote
      await purchasePackage(userId, selectedPackageId);

      // 2. Consome 1 crédito para desbloquear este orçamento
      await consumeCredit(userId, projectId);

      // 3. Marca o projecto como desbloqueado
      await unlockProject(projectId, userType);
      consumirOrcamento();

      setIsProcessing(false);
      onUnlocked();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Ocorreu um erro no processamento do pagamento. Por favor, tente novamente.');
      setIsProcessing(false);
    }
  };

  const hasCredits = (availableCredits !== null && availableCredits > 0) && !errorMsg?.includes('Não tem créditos');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative max-h-[92vh] flex flex-col">
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-4 top-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/25 flex-shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">
                {hasCredits
                  ? `${availableCredits} Crédito${availableCredits === 1 ? '' : 's'} Disponíveis`
                  : '0 Créditos Disponíveis'}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {hasCredits ? 'Desbloquear com Crédito' : 'Adquira um Pacote de Orçamentos'}
              </h3>
            </div>
          </div>

          {errorMsg && !errorMsg.includes('Não tem créditos') && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isLoadingCredits ? (
            <div className="py-12 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
              <span className="text-xs font-medium">A verificar os seus créditos...</span>
            </div>
          ) : hasCredits ? (
            /* CASO 1: UTILIZADOR TEM CRÉDITOS DISPONÍVEIS */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-emerald-600" />
                    <span className="text-xs font-black uppercase text-emerald-800 tracking-wider">
                      Saldo da sua Conta
                    </span>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-600 text-white font-black text-xs rounded-full">
                    {availableCredits} {availableCredits === 1 ? 'crédito' : 'créditos'}
                  </span>
                </div>
                <p className="mt-2 text-xs text-emerald-900 leading-relaxed font-medium">
                  Tem créditos válidos que não expiram. Ao desbloquear este projecto, será debitado 1 crédito do seu pacote.
                </p>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Mapa de quantidades com todos os 6 capítulos abertos</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Exportação em PDF profissional com QR Code de autenticidade</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Cronograma físico-financeiro detalhado das 10 fases da obra</span>
                </div>
              </div>

              <button
                onClick={handleUnlockWithCredit}
                disabled={isProcessing}
                className="w-full mt-4 min-h-[52px] bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>A desbloquear projecto...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    <span>Desbloquear Agora (1 Crédito)</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* CASO 2: SEM CRÉDITOS — ADQUIRIR PACOTE ÚNICO */
            <div className="space-y-4">
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-950">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-rose-600" />
                    <span className="text-xs font-black uppercase text-rose-800 tracking-wider">
                      Saldo da sua Conta
                    </span>
                  </div>
                  <span className="px-2.5 py-1 bg-rose-600 text-white font-black text-xs rounded-full">
                    0 créditos
                  </span>
                </div>
                <p className="mt-2 text-xs text-rose-900 leading-relaxed font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  Não tem créditos disponíveis no seu pacote.
                </p>
                <p className="mt-1 text-[11px] text-rose-800">
                  Adquira um pacote abaixo para desbloquear o orçamento completo, mapas analíticos e exportação oficial em PDF e Excel.
                </p>
              </div>

              {/* Grelha dos 4 Novos Pacotes */}
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  {
                    id: 'particular',
                    title: 'Particular',
                    price: '12.999 Kz',
                    credits: '1 orçamento',
                    badge: null,
                  },
                  {
                    id: 'profissional',
                    title: 'Profissional',
                    price: '15.999 Kz',
                    credits: '3 orçamentos',
                    badge: null,
                  },
                  {
                    id: 'empresa',
                    title: 'Empresa',
                    price: '29.999 Kz',
                    credits: '6 orçamentos',
                    badge: 'Recomendado',
                  },
                  {
                    id: 'empresa_plus',
                    title: 'Empresa Plus',
                    price: '49.999 Kz',
                    credits: '12 orçamentos',
                    badge: 'Melhor Valor',
                  },
                ].map((pkg) => {
                  const isSelected = selectedPackageId === pkg.id;
                  return (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => setSelectedPackageId(pkg.id)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-400/30'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      {pkg.badge && (
                        <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-amber-500 text-slate-950">
                          {pkg.badge}
                        </span>
                      )}
                      <span className="text-xs font-bold text-slate-900 block">{pkg.title}</span>
                      <span className="text-sm font-black text-amber-700 block mt-0.5">{pkg.price}</span>
                      <span className="text-[11px] font-semibold text-slate-600 block mt-0.5">
                        {pkg.credits}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Meios de Pagamento Locais (Angola) */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Forma de Pagamento
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('MCX')}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      paymentMethod === 'MCX'
                        ? 'border-amber-500 bg-amber-50 text-slate-950 ring-2 ring-amber-400/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-amber-600" />
                    <span>MCX Express</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('REF')}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      paymentMethod === 'REF'
                        ? 'border-amber-500 bg-amber-50 text-slate-950 ring-2 ring-amber-400/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-amber-600" />
                    <span>Referência</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('IBAN')}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      paymentMethod === 'IBAN'
                        ? 'border-amber-500 bg-amber-50 text-slate-950 ring-2 ring-amber-400/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Building className="w-4 h-4 text-amber-600" />
                    <span>Transf. IBAN</span>
                  </button>
                </div>

                {paymentMethod === 'MCX' && (
                  <div className="mt-3">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Nº de Telemóvel para autorização MCX Express
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>
                )}
              </div>

              {/* Botões de Acção */}
              <div className="flex gap-2.5 pt-2">
                <a
                  href="/plano"
                  className="flex-1 min-h-[50px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center text-center px-2"
                >
                  Ver todos os pacotes
                </a>
                <button
                  onClick={handlePurchaseAndUnlock}
                  disabled={isProcessing}
                  className="flex-2 min-h-[50px] bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded-xl transition-all shadow-md shadow-amber-500/20 flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>A processar...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      <span>Comprar e Desbloquear</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaywallModal;
