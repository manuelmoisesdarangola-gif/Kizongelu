/**
 * @file app/(app)/plano/page.tsx
 * Página /plano — Os Meus Pacotes de Orçamentos (Bloco 6.4 + CORRECÇÕES URGENTES).
 *
 * Reformulação completa para o Modelo de Pacotes Únicos (Sem Expiração):
 * - Secção 1: Resumo de créditos disponíveis em destaque (topo) com alerta de pacotes pendentes de validação.
 * - Secção 2: Os meus pacotes & histórico de aquisições (progresso, estado ACTIVE, PENDING_PAYMENT, EXHAUSTED).
 * - Secção 3: Catálogo dos 4 pacotes para compra rápida (Particular, Profissional, Empresa, Empresa Plus).
 * - Modal interativo de checkout:
 *   - Transferência bancária genérica (sem referir nomes de bancos comerciais específicos).
 *   - Upload de comprovativo bancário (JPG, PNG, PDF).
 *   - Estado PENDING_PAYMENT enquanto a equipa de tesouraria valida o pagamento.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Package,
  Sparkles,
  Check,
  ArrowRight,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  FileText,
  ChevronRight,
  X,
  Loader2,
  Smartphone,
  CreditCard,
  Building,
  Coins,
  RefreshCw,
  UploadCloud,
  FileCheck,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/src/auth/auth-context';
import { useToast } from '@/src/context/ToastContext';
import { formatCurrencyKz } from '@/lib/format/currency';
import {
  getUserCredits,
  getPackageHistory,
  purchasePackage,
  PackageRecord,
  PACKAGES_CATALOG,
} from '@/lib/actions/packages';

export interface PlanoPageProps {
  onNavigatePlanos?: () => void;
  onNavigateRenovar?: () => void;
  onNavigateInvoiceDetail?: (invoiceId: string) => void;
}

export const PlanoPage: React.FC<PlanoPageProps> = ({
  onNavigatePlanos,
  onNavigateInvoiceDetail,
}) => {
  const { currentUser } = useAuth();
  const { success, warning, info } = useToast();

  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState<number>(0);
  const [packagesHistory, setPackagesHistory] = useState<PackageRecord[]>([]);

  // Estado do Modal de Compra / Pagamento
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedPlanKey, setSelectedPlanKey] = useState<string>('profissional');
  const [paymentMethod, setPaymentMethod] = useState<'MCX' | 'REF' | 'IBAN'>('IBAN');
  const [phoneNumber, setPhoneNumber] = useState('923 000 000');
  const [isProcessingPurchase, setIsProcessingPurchase] = useState(false);

  // Estados de upload de comprovativo para transferência bancária
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreviewUrl, setProofPreviewUrl] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const userId = currentUser?.id || 'usr-default';

  const loadPackagesData = async () => {
    setLoading(true);
    try {
      const [userCredits, history] = await Promise.all([
        getUserCredits(userId),
        getPackageHistory(userId),
      ]);
      setCredits(userCredits);
      setPackagesHistory(history);
    } catch (e: any) {
      console.warn('Erro ao carregar dados de pacotes:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPackagesData();
  }, [userId]);

  const handleOpenCheckout = (planKey: string) => {
    setSelectedPlanKey(planKey);
    setProofFile(null);
    setProofPreviewUrl(null);
    setNotes('');
    setIsCheckoutOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|pdf)$/i)) {
      warning('Formato Inválido', 'Envie comprovativo em formato JPG, PNG ou PDF.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      warning('Ficheiro Demasiado Grande', 'O tamanho máximo permitido é 10MB.');
      return;
    }

    setProofFile(file);

    // Cria preview local se for imagem
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setProofPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setProofPreviewUrl(null);
    }
  };

  const handleConfirmPurchase = async () => {
    setIsProcessingPurchase(true);
    try {
      const chosenPlan = PACKAGES_CATALOG[selectedPlanKey];

      // Caso seja transferência bancária, valida ou simula o upload do comprovativo
      let proofUrl: string | undefined = undefined;
      if (paymentMethod === 'IBAN') {
        if (proofPreviewUrl) {
          proofUrl = proofPreviewUrl;
        } else if (proofFile) {
          proofUrl = `https://storage.kizongelu.ao/comprovativos/${userId}_${proofFile.name}`;
        }
      }

      const isTransfer = paymentMethod === 'IBAN';

      const pkg = await purchasePackage(userId, selectedPlanKey, {
        paymentId: `pay_${paymentMethod.toLowerCase()}_${Date.now()}`,
        paymentMethod:
          paymentMethod === 'IBAN'
            ? 'TRANSFERENCIA'
            : paymentMethod === 'MCX'
            ? 'MULTICAIXA_EXPRESS'
            : 'REFERENCIA',
        proofUrl,
        notes: notes.trim() || undefined,
        status: isTransfer ? 'PENDING_PAYMENT' : 'ACTIVE',
      });

      // Atualiza o estado local
      await loadPackagesData();
      setIsCheckoutOpen(false);

      if (isTransfer) {
        success(
          'Comprovativo Enviado com Sucesso!',
          `O pacote ${chosenPlan?.displayName} está em análise. Os ${chosenPlan?.credits} orçamentos serão ativados após validação da transferência.`
        );
      } else {
        success(
          'Pacote Adquirido com Sucesso!',
          `Foram adicionados ${chosenPlan?.credits || 1} orçamentos à sua conta Kizongelu.`
        );
      }
    } catch (err: any) {
      warning('Falha ao processar pagamento', err.message || 'Tente novamente.');
    } finally {
      setIsProcessingPurchase(false);
    }
  };

  const formatDatePt = (isoString?: string | null) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return new Intl.DateTimeFormat('pt-AO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(d);
    } catch {
      return isoString;
    }
  };

  const selectedPlanDetails = PACKAGES_CATALOG[selectedPlanKey] || PACKAGES_CATALOG.profissional;
  const pendingPackages = packagesHistory.filter((p) => p.status === 'PENDING_PAYMENT');

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16 px-4 sm:px-6">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0F3D5C] text-white flex items-center justify-center shadow-md shadow-[#0F3D5C]/15">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Os meus pacotes
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Gerir pacotes de orçamentos e créditos disponíveis
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => loadPackagesData()}
          disabled={loading}
          className="inline-flex items-center justify-center space-x-2 px-3.5 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#0F3D5C]' : ''}`} />
          <span>Atualizar saldo</span>
        </button>
      </div>

      {/* Alerta de Pacotes Pendentes de Validação (se houver) */}
      {pendingPackages.length > 0 && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-amber-900 flex items-start space-x-3 shadow-xs">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <div className="font-bold text-amber-950">
              Tem {pendingPackages.length} {pendingPackages.length === 1 ? 'pacote' : 'pacotes'} a aguardar validação de comprovativo
            </div>
            <p className="text-amber-800">
              A nossa tesouraria está a verificar a transferência bancária. Os créditos correspondentes serão creditados de imediato após a confirmação.
            </p>
          </div>
        </div>
      )}

      {/* SECÇÃO 1 — RESUMO DE CRÉDITOS (DESTAQUE NO TOPO) */}
      <section aria-labelledby="section-resumo-creditos">
        <div
          className={`rounded-3xl p-6 sm:p-8 transition-all relative overflow-hidden border shadow-card-subtle ${
            credits === 0
              ? 'bg-gradient-to-br from-amber-500/10 via-amber-50/60 to-white border-amber-300'
              : 'bg-gradient-to-br from-[#0F3D5C] to-[#0A263B] text-white border-[#0F3D5C]'
          }`}
        >
          {/* Decoração de fundo */}
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span
                  className={`inline-flex items-center space-x-1 text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                    credits === 0
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-white/15 text-amber-300 border border-white/10'
                  }`}
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>Créditos Disponíveis</span>
                </span>
                {credits > 0 && (
                  <span className="text-[11px] font-semibold text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                    Ativo
                  </span>
                )}
              </div>

              <div className="flex items-baseline space-x-3">
                <span
                  className={`text-4xl sm:text-6xl font-black tracking-tight ${
                    credits === 0 ? 'text-amber-800' : 'text-white'
                  }`}
                >
                  {credits}
                </span>
                <span
                  className={`text-sm sm:text-base font-semibold ${
                    credits === 0 ? 'text-amber-700' : 'text-slate-200'
                  }`}
                >
                  orçamentos sem expiração
                </span>
              </div>

              <p
                className={`text-xs sm:text-sm max-w-xl leading-relaxed ${
                  credits === 0 ? 'text-amber-800/90' : 'text-slate-300'
                }`}
              >
                {credits === 0 ? (
                  <span className="flex items-center space-x-1.5 font-medium">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      Não tem créditos disponíveis para emitir novos orçamentos. Escolha um pacote
                      abaixo para começar a calcular imediatamente.
                    </span>
                  </span>
                ) : (
                  'Os seus créditos nunca expiram. São descontados apenas ao concluir e gerar o dossiê orçamental completo com preços das 21 províncias de Angola.'
                )}
              </p>
            </div>

            {/* CTA para Comprar */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
              <button
                onClick={() => handleOpenCheckout('empresa')}
                className={`px-6 py-3.5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all active:scale-95 shadow-lg cursor-pointer ${
                  credits === 0
                    ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/30'
                    : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-400/20'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Comprar novo pacote &rarr;</span>
              </button>

              <a
                href="#catalogo-pacotes"
                className={`text-xs text-center font-bold underline-offset-4 hover:underline py-1 ${
                  credits === 0 ? 'text-amber-800' : 'text-slate-300 hover:text-white'
                }`}
              >
                Ver todos os pacotes
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SECÇÃO 2 — OS MEUS PACOTES & HISTÓRICO DE AQUISIÇÕES */}
      <section aria-labelledby="section-meus-pacotes" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 id="section-meus-pacotes" className="text-base sm:text-lg font-black text-slate-900">
              Histórico de Pacotes Adquiridos
            </h2>
            <p className="text-xs text-slate-500">
              Acompanhe o consumo e a validade permanente de cada pacote
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {packagesHistory.length} {packagesHistory.length === 1 ? 'pacote' : 'pacotes'}
          </span>
        </div>

        {packagesHistory.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              Nenhum pacote adquirido anteriormente
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Quando adquirir pacotes de orçamentos, o histórico de transações e créditos consumidos aparecerá aqui.
            </p>
            <button
              onClick={() => handleOpenCheckout('particular')}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#0F3D5C] hover:bg-[#0A293E] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              <span>Adquirir primeiro pacote</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {packagesHistory.map((pkg) => {
              const isPending = pkg.status === 'PENDING_PAYMENT';
              const isExhausted = pkg.remainingCredits === 0 || pkg.status === 'EXHAUSTED';

              const planMeta =
                pkg.plan ||
                PACKAGES_CATALOG[pkg.planId.replace(/^plan_/, '')] ||
                PACKAGES_CATALOG.profissional;

              return (
                <div
                  key={pkg.id}
                  className={`bg-white rounded-2xl border p-5 transition-all shadow-card-subtle flex flex-col justify-between ${
                    isPending
                      ? 'border-amber-300 bg-amber-50/20'
                      : isExhausted
                      ? 'border-slate-200 bg-slate-50/40 opacity-80'
                      : 'border-slate-200 hover:border-[#0F3D5C]/40'
                  }`}
                >
                  <div className="space-y-3.5">
                    {/* Header do Card */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 tracking-tight flex items-center space-x-1.5">
                        <Package className="w-3.5 h-3.5 text-[#0F3D5C]" />
                        <span>{planMeta.displayName || pkg.planId}</span>
                      </span>

                      {isPending ? (
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300 flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>Em Análise</span>
                        </span>
                      ) : isExhausted ? (
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                          Esgotado
                        </span>
                      ) : (
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          Ativo
                        </span>
                      )}
                    </div>

                    {/* Barra de Progresso dos Créditos */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">
                          {isPending
                            ? `${pkg.totalCredits} orçamentos (pendentes)`
                            : `${pkg.remainingCredits} de ${pkg.totalCredits} restantes`}
                        </span>
                        <span className="text-slate-400 font-mono text-[11px]">
                          {isPending ? 'aguarda validação' : `${pkg.usedCredits} usados`}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isPending
                              ? 'bg-amber-400 animate-pulse'
                              : isExhausted
                              ? 'bg-slate-300'
                              : pkg.remainingCredits === 1
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{
                            width: isPending
                              ? '100%'
                              : `${Math.max(5, (pkg.remainingCredits / pkg.totalCredits) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Metadados do Pacote */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Valor:</span>
                        <span className="font-bold text-slate-800 font-mono">
                          {formatCurrencyKz(pkg.purchaseAmount)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Método:</span>
                        <span className="font-medium text-slate-700">
                          {pkg.paymentMethod === 'MULTICAIXA_EXPRESS'
                            ? 'Multicaixa Express'
                            : pkg.paymentMethod === 'REFERENCIA'
                            ? 'Referência MCX'
                            : 'Transferência bancária'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Data do pedido:</span>
                        <span>{formatDatePt(pkg.purchasedAt)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Expiração:</span>
                        <span className="font-medium text-emerald-600">Sem expiração</span>
                      </div>
                    </div>
                  </div>

                  {/* Rodapé do Card */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-mono truncate max-w-[150px]">Ref: {pkg.id}</span>
                    {onNavigateInvoiceDetail && pkg.paymentId && !isPending && (
                      <button
                        onClick={() => onNavigateInvoiceDetail(pkg.paymentId || pkg.id)}
                        className="text-[#0F3D5C] hover:underline font-bold flex items-center space-x-0.5 cursor-pointer"
                      >
                        <span>Recibo</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SECÇÃO 3 — CATÁLOGO DE PACOTES PARA COMPRA RÁPIDA */}
      <section id="catalogo-pacotes" aria-labelledby="section-catalogo" className="space-y-6 pt-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[11px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Adquirir Novo Pacote
          </span>
          <h2 id="section-catalogo" className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Pacotes de Orçamentos
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Escolha o pacote certo para a sua escala de projectos. Pagamento único, sem custos ocultos e sem mensalidades.
          </p>
        </div>

        {/* Grade de 4 Cards Oficiais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
          {/* Card 1 — PARTICULAR */}
          <div className="rounded-3xl border border-slate-200 p-6 flex flex-col justify-between bg-slate-50/60 shadow-xs hover:border-slate-300 transition-all">
            <div>
              <h3 className="font-bold text-base text-slate-800">Particular</h3>
              <p className="text-xs text-slate-500 mt-1 min-h-[32px]">
                Para quem vai construir ou remodelar a sua própria casa.
              </p>
              <div className="mt-4 mb-6">
                <span className="text-3xl font-black text-slate-900">12.999 Kz</span>
                <span className="text-xs text-slate-500 block mt-0.5">Pagamento único</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>1 orçamento completo</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>1 utilizador</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>PDF profissional + QR</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Acesso permanente</span>
                </li>
              </ul>
            </div>
            <div className="mt-6">
              <button
                onClick={() => handleOpenCheckout('particular')}
                className="w-full py-3 bg-[#0F3D5C] hover:bg-[#0A293E] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Comprar pacote &rarr;
              </button>
              <p className="text-[11px] text-slate-400 text-center mt-2">Sem expiração · Use quando quiser</p>
            </div>
          </div>

          {/* Card 2 — PROFISSIONAL */}
          <div className="rounded-3xl border border-slate-200 p-6 flex flex-col justify-between bg-slate-50/60 shadow-xs hover:border-slate-300 transition-all">
            <div>
              <h3 className="font-bold text-base text-slate-900">Profissional</h3>
              <p className="text-xs text-slate-500 mt-1 min-h-[32px]">
                Para engenheiros civis, arquitectos e orçamentistas independentes.
              </p>
              <div className="mt-4 mb-6">
                <span className="text-3xl font-black text-slate-900">15.999 Kz</span>
                <span className="text-xs text-slate-500 block mt-0.5">Pacote único</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">3 orçamentos completos</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>1 utilizador</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>PDF profissional + QR</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Suporte por WhatsApp</span>
                </li>
              </ul>
            </div>
            <div className="mt-6">
              <button
                onClick={() => handleOpenCheckout('profissional')}
                className="w-full py-3 bg-[#0F3D5C] hover:bg-[#0A293E] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Comprar pacote &rarr;
              </button>
              <p className="text-[11px] text-slate-400 text-center mt-2">Sem expiração · Use quando quiser</p>
            </div>
          </div>

          {/* Card 3 — EMPRESA (RECOMENDADO) */}
          <div className="rounded-3xl border-2 border-[#0F3D5C] p-6 flex flex-col justify-between bg-white shadow-xl relative hover:border-[#0F3D5C] transition-all">
            <span className="absolute -top-3 right-4 bg-[#0F3D5C] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
              Recomendado
            </span>
            <div>
              <h3 className="font-black text-base text-slate-900">Empresa</h3>
              <p className="text-xs text-slate-500 mt-1 min-h-[32px]">
                Para pequenas e médias construtoras com equipas técnicas.
              </p>
              <div className="mt-4 mb-6">
                <span className="text-3xl font-black text-[#0F3D5C]">29.999 Kz</span>
                <span className="text-xs text-slate-500 block mt-0.5">Pacote corporativo</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-center space-x-2 font-bold text-slate-900">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>6 orçamentos completos</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>2 utilizadores na conta</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>PDF com logotipo da empresa</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Margens configuráveis</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Exportação para Excel</span>
                </li>
              </ul>
            </div>
            <div className="mt-6">
              <button
                onClick={() => handleOpenCheckout('empresa')}
                className="w-full py-3.5 bg-[#0F3D5C] hover:bg-[#0A293E] text-white font-extrabold rounded-xl text-xs transition-colors shadow-md shadow-[#0F3D5C]/20 cursor-pointer"
              >
                Comprar pacote &rarr;
              </button>
              <p className="text-[11px] text-slate-400 text-center mt-2">Sem expiração · Ativação imediata</p>
            </div>
          </div>

          {/* Card 4 — EMPRESA PLUS (MELHOR VALOR) */}
          <div className="rounded-3xl border-2 border-amber-400 p-6 flex flex-col justify-between bg-amber-50/20 shadow-md relative hover:border-amber-500 transition-all">
            <span className="absolute -top-3 right-4 bg-amber-400 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
              Melhor Valor
            </span>
            <div>
              <h3 className="font-black text-base text-slate-900">Empresa Plus</h3>
              <p className="text-xs text-slate-500 mt-1 min-h-[32px]">
                Para construtoras com múltiplos projectos e empreiteiros gerais.
              </p>
              <div className="mt-4 mb-6">
                <span className="text-3xl font-black text-amber-700">49.999 Kz</span>
                <span className="text-xs text-slate-500 block mt-0.5">Pacote completo</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-center space-x-2 font-bold text-slate-900">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>12 orçamentos completos</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>5 utilizadores na equipa</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>PDF + QR + Logotipo</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Margens e Excel incluídos</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Dossiê bancário completo</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Gestor de conta dedicado</span>
                </li>
              </ul>
            </div>
            <div className="mt-6">
              <button
                onClick={() => handleOpenCheckout('empresa_plus')}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-xl text-xs transition-colors shadow-md shadow-amber-500/20 cursor-pointer"
              >
                Comprar pacote &rarr;
              </button>
              <p className="text-[11px] text-slate-400 text-center mt-2">Sem expiração · Ativação imediata</p>
            </div>
          </div>
        </div>
      </section>

      {/* MODAL DE CHECKOUT / PAGAMENTO ANGOLANO */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Fechar */}
            <button
              onClick={() => !isProcessingPurchase && setIsCheckoutOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Cabeçalho do Modal */}
            <div className="space-y-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                Pagamento Único
              </span>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Adquirir Pacote {selectedPlanDetails.displayName}
              </h3>
              <p className="text-xs text-slate-500">
                {selectedPlanDetails.credits} orçamentos permanentes sem expiração
              </p>
            </div>

            {/* Resumo do Valor */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 block">Total a liquidar:</span>
                <span className="text-2xl font-black text-slate-900">
                  {formatCurrencyKz(selectedPlanDetails.price)}
                </span>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
                Sem renovação mensal
              </span>
            </div>

            {/* Seleção do Método de Pagamento */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Escolha o método de pagamento:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('IBAN')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-1 ${
                    paymentMethod === 'IBAN'
                      ? 'border-[#0F3D5C] bg-[#0F3D5C]/5 text-[#0F3D5C] font-bold ring-1 ring-[#0F3D5C]'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <Building className="w-4 h-4" />
                  <span className="text-[11px]">Transf. bancária</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('MCX')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-1 ${
                    paymentMethod === 'MCX'
                      ? 'border-[#0F3D5C] bg-[#0F3D5C]/5 text-[#0F3D5C] font-bold ring-1 ring-[#0F3D5C]'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span className="text-[11px]">MCX Express</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('REF')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-1 ${
                    paymentMethod === 'REF'
                      ? 'border-[#0F3D5C] bg-[#0F3D5C]/5 text-[#0F3D5C] font-bold ring-1 ring-[#0F3D5C]'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span className="text-[11px]">Referência</span>
                </button>
              </div>
            </div>

            {/* Detalhes do Método */}
            {paymentMethod === 'MCX' && (
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-600">
                  Número de Telemóvel Multicaixa Express:
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="9xx xxx xxx"
                  className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-[#0F3D5C]"
                />
                <p className="text-[10px] text-slate-400">
                  Irá receber uma notificação de pagamento na aplicação Multicaixa Express.
                </p>
              </div>
            )}

            {paymentMethod === 'REF' && (
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Entidade:</span>
                  <span className="font-mono font-bold text-slate-800">00123 (Kizongelu Tech)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Referência:</span>
                  <span className="font-mono font-bold text-slate-800">928 471 002</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Valor:</span>
                  <span className="font-mono font-bold text-[#0F3D5C]">
                    {formatCurrencyKz(selectedPlanDetails.price)}
                  </span>
                </div>
              </div>
            )}

            {paymentMethod === 'IBAN' && (
              <div className="space-y-4">
                {/* Coordenadas Bancárias Oficiais Sem Referir Banco Específico */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Titular da Conta:</span>
                    <span className="font-bold text-slate-800">Kizongelu Engenharia Lda</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">IBAN Oficial:</span>
                    <span className="font-mono font-bold text-slate-800 text-[11px]">
                      AO06 0040 0000 4892 1042 1014 9
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-1.5">
                    <span className="text-slate-500">Valor exato:</span>
                    <span className="font-mono font-bold text-[#0F3D5C]">
                      {formatCurrencyKz(selectedPlanDetails.price)}
                    </span>
                  </div>
                </div>

                {/* Upload de Comprovativo Bancário */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Comprovativo de Transferência:</span>
                    <span className="text-[10px] text-slate-400 font-normal">JPG, PNG ou PDF (máx. 10MB)</span>
                  </label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {proofFile ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2 truncate">
                        <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-bold text-emerald-900 truncate">
                          {proofFile.name}
                        </span>
                        <span className="text-[10px] text-emerald-600">
                          ({(proofFile.size / 1024).toFixed(0)} KB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setProofFile(null);
                          setProofPreviewUrl(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="text-emerald-700 hover:text-emerald-900 text-[11px] font-bold p-1 cursor-pointer"
                      >
                        Alterar
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-slate-300 hover:border-[#0F3D5C] rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-1 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <UploadCloud className="w-6 h-6 text-slate-400" />
                      <span className="text-xs font-bold text-slate-700">
                        Carregar comprovativo bancário
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Clique aqui para selecionar o talão de transferência ou PDF
                      </span>
                    </button>
                  )}

                  {/* Observações opcionais */}
                  <div className="pt-1">
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="N.º de transação ou nota adicional (opcional)"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-[#0F3D5C] text-slate-800 placeholder-slate-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Botão de Confirmação */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleConfirmPurchase}
                disabled={isProcessingPurchase}
                className="w-full py-3.5 bg-[#0F3D5C] hover:bg-[#0A293E] text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-slate-900/10 flex items-center justify-center space-x-2 transition-all active:scale-95 cursor-pointer disabled:opacity-60"
              >
                {isProcessingPurchase ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>A processar aquisição...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>
                      {paymentMethod === 'IBAN'
                        ? 'Submeter Comprovativo de Transferência'
                        : 'Confirmar e Ativar Pacote'}
                    </span>
                  </>
                )}
              </button>
              <p className="text-[11px] text-center text-slate-400">
                {paymentMethod === 'IBAN'
                  ? 'Os créditos ficam pendentes até validação pelo departamento financeiro'
                  : 'Ativação imediata dos créditos de orçamentos permanentes'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanoPage;
