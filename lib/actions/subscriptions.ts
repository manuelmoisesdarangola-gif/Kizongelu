/**
 * @file lib/actions/subscriptions.ts
 * Gestão Completa de Subscrições, Faturação e Limites Mensais (Fase 13).
 *
 * Server Actions requeridas:
 * - subscribe(userId, planId) — cria Subscription + Invoice + Payment (manual).
 * - upgrade(userId, newPlanId) — calcula prorrata + cria Payment.
 * - downgrade(userId, newPlanId) — agenda para próxima renovação.
 * - cancel(userId, reason) — marca cancelledAt, activo até renewalDate.
 * - reactivate(userId) — cancela cancelamento agendado.
 * - renew(userId) — estende renewalDate por 30 dias + cria Invoice.
 *
 * Contador mensal de orçamentos:
 * - Cada cálculo concluído incrementa Subscription.usageCount.
 * - Reset automático na data de renovação.
 * - Se usageCount >= limit -> bloqueia novo cálculo com modal.
 *
 * Gestão de Equipa e Convites (Empresas):
 * - Tabela/Entidade Invitation (email, role, token, expiresAt, acceptedAt).
 * - Aceitação de convites com validação de token e expiração.
 */

import { logAuditEvent } from '../audit';
import { sendNotification } from '../notifications';
import { prisma } from '../db/prisma';
import { z } from 'zod';

export const subscribeSchema = z.object({
  userId: z.string().min(1, 'ID do utilizador obrigatório'),
  planId: z.enum(['particular', 'profissional', 'empresa', 'empresa_plus']),
});

export const upgradePlanSchema = z.object({
  userId: z.string().min(1, 'ID do utilizador obrigatório'),
  newPlanId: z.enum(['particular', 'profissional', 'empresa', 'empresa_plus']),
});

export const cancelSubscriptionSchema = z.object({
  userId: z.string().min(1, 'ID do utilizador obrigatório'),
  reason: z.string().optional(),
});

export const sendTeamInvitationSchema = z.object({
  companyId: z.string().min(1, 'ID da empresa obrigatório'),
  email: z.string().email('Email inválido'),
  role: z.enum(['COMPANY_ADMIN', 'COMPANY_MEMBER']),
});

export type SubscriptionPlanId = 'particular' | 'profissional' | 'empresa' | 'empresa_plus';

export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface PlanDefinition {
  id: SubscriptionPlanId;
  name: string;
  priceMonthlyKz: number;
  monthlyLimit: number;
  description: string;
  recommended?: boolean;
  features: PlanFeature[];
}

export const PLANS_CATALOG: PlanDefinition[] = [
  {
    id: 'profissional',
    name: 'Profissional',
    priceMonthlyKz: 15999,
    monthlyLimit: 3,
    description: 'Para arquitectos, engenheiros civis e orçamentistas independentes.',
    features: [
      { text: '3 orçamentos completos', included: true },
      { text: '1 utilizador', included: true },
      { text: 'PDF profissional + QR', included: true },
      { text: 'Logótipo da sua empresa no PDF', included: true },
      { text: 'Acesso permanente', included: true },
      { text: 'Suporte por WhatsApp em horário laboral', included: true },
      { text: 'Gestão multi-utilizador e equipa', included: false },
    ],
  },
  {
    id: 'empresa',
    name: 'Empresa',
    priceMonthlyKz: 29999,
    monthlyLimit: 6,
    recommended: true,
    description: 'Para gabinetes de engenharia, arquitectura e pequenas construtoras.',
    features: [
      { text: '6 orçamentos completos', included: true },
      { text: '2 utilizadores', included: true },
      { text: 'PDF com logótipo da sua empresa', included: true },
      { text: 'Margens configuráveis', included: true },
      { text: 'Exportação Excel (.xlsx)', included: true },
      { text: 'Gestor de conta dedicado', included: true },
    ],
  },
  {
    id: 'empresa_plus',
    name: 'Empresa Plus',
    priceMonthlyKz: 49999,
    monthlyLimit: 12,
    description: 'Para médias construtoras, promotores e gabinetes em crescimento.',
    features: [
      { text: '12 orçamentos completos', included: true },
      { text: 'Até 5 utilizadores', included: true },
      { text: 'Tudo do pacote Empresa', included: true },
      { text: 'Dossiê técnico para processos de crédito', included: true },
      { text: 'Gestor de conta com engenheiro dedicado', included: true },
      { text: 'Suporte telefónico directo', included: true },
    ],
  },
];

export const SUBSCRIPTION_PLANS = PLANS_CATALOG;

export type SubscriptionStatus =
  | 'ACTIVE'
  | 'RENEWING'
  | 'OVERDUE'
  | 'SUSPENDED'
  | 'CANCELLED'
  | 'EXPIRED';

export interface SubscriptionRecord {
  id: string;
  userId: string;
  planId: SubscriptionPlanId;
  status: SubscriptionStatus;
  startDate: string;
  renewalDate: string; // ISO string
  usageCount: number;
  monthlyLimit: number;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
  scheduledDowngradePlanId?: SubscriptionPlanId | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionInvoice {
  id: string;
  userId: string;
  subscriptionId: string;
  number: string;
  periodStart: string;
  periodEnd: string;
  amountKz: number;
  status: 'PAID' | 'PENDING' | 'VOID' | 'OVERDUE';
  method: string;
  planName: string;
  pdfUrl?: string;
  createdAt: string;
  proofUrl?: string;
}

export interface SubscriptionPayment {
  id: string;
  subscriptionId: string;
  userId: string;
  amountKz: number;
  method: 'MULTICAIXA_EXPRESS' | 'TRANSFERENCIA_BANCARIA';
  status: 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED';
  reference: string;
  proofUrl?: string;
  notes?: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface InvitationRecord {
  id: string;
  companyId: string;
  companyName: string;
  email: string;
  role: 'COMPANY_ADMIN' | 'COMPANY_MEMBER';
  token: string;
  expiresAt: string; // 7 dias
  acceptedAt?: string | null;
  createdAt: string;
}

export interface TeamMemberRecord {
  id: string;
  companyId: string;
  userId: string;
  nome: string;
  email: string;
  role: 'Administrador da Organização' | 'Orçamentista Sénior' | 'Medidor de Obra' | 'Técnico';
  status: 'Ativo' | 'Pendente';
  joinedAt: string;
}

// Armazenamento em memória com sincronização com localStorage
const STORAGE_SUB_KEY = 'kizongelu_user_subscriptions';
const STORAGE_INV_KEY = 'kizongelu_user_invoices';
const STORAGE_PAY_KEY = 'kizongelu_sub_payments';
const STORAGE_INVITE_KEY = 'kizongelu_company_invitations';
const STORAGE_TEAM_KEY = 'kizongelu_team_members';

const inMemoryFallback: Record<string, any> = {};

function getMemoryStore<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return inMemoryFallback[key] !== undefined ? inMemoryFallback[key] : defaultValue;
  }
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn(`Erro ao ler ${key}:`, e);
  }
  return inMemoryFallback[key] !== undefined ? inMemoryFallback[key] : defaultValue;
}

function setMemoryStore<T>(key: string, value: T): void {
  inMemoryFallback[key] = value;
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Erro ao salvar ${key}:`, e);
  }
}

/**
 * Retorna o plano e subscrição atual do utilizador.
 * Inicializa automaticamente com base no papel do utilizador caso não exista.
 */
export async function getSubscription(
  userId: string,
  userRole: string = 'particular'
): Promise<{
  subscription: SubscriptionRecord;
  plan: PlanDefinition;
  invoices: SubscriptionInvoice[];
  payments: SubscriptionPayment[];
  canCalculate: boolean;
}> {
  const allSubs = getMemoryStore<Record<string, SubscriptionRecord>>(STORAGE_SUB_KEY, {});
  let sub = allSubs[userId];

  // Se não existir, gera o estado padrão com base no role
  if (!sub) {
    const defaultPlanId: SubscriptionPlanId =
      userRole === 'empresa_plus'
        ? 'empresa_plus'
        : userRole === 'empresa'
        ? 'empresa'
        : 'profissional';

    const planDef = PLANS_CATALOG.find((p) => p.id === defaultPlanId) || PLANS_CATALOG[0];
    const now = new Date();
    const renewal = new Date(now.getTime() + 30 * 24 * 3600 * 1000);

    sub = {
      id: `sub_${userId}_${Date.now()}`,
      userId,
      planId: defaultPlanId,
      status: 'ACTIVE',
      startDate: now.toISOString(),
      renewalDate: renewal.toISOString(),
      usageCount: 1, // 1 já utilizado no mês atual para demonstração realista
      monthlyLimit: planDef.monthlyLimit,
      cancelledAt: null,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    allSubs[userId] = sub;
    setMemoryStore(STORAGE_SUB_KEY, allSubs);
  }

  // Verifica se a subscrição ultrapassou a data de renovação para reset de usageCount
  const now = new Date();
  if (new Date(sub.renewalDate) <= now && sub.status === 'ACTIVE') {
    // Se há downgrade agendado, executa-o
    if (sub.scheduledDowngradePlanId) {
      sub.planId = sub.scheduledDowngradePlanId;
      const newPlan = PLANS_CATALOG.find((p) => p.id === sub.planId);
      if (newPlan) sub.monthlyLimit = newPlan.monthlyLimit;
      sub.scheduledDowngradePlanId = null;
    }
    // Novo ciclo de 30 dias
    sub.usageCount = 0;
    sub.renewalDate = new Date(now.getTime() + 30 * 24 * 3600 * 1000).toISOString();
    sub.updatedAt = now.toISOString();
    allSubs[userId] = sub;
    setMemoryStore(STORAGE_SUB_KEY, allSubs);
  }

  const plan = PLANS_CATALOG.find((p) => p.id === sub.planId) || PLANS_CATALOG[0];

  // Obter faturas
  let allInvoices = getMemoryStore<SubscriptionInvoice[]>(STORAGE_INV_KEY, []);
  let userInvoices = allInvoices.filter((inv) => inv.userId === userId);

  if (userInvoices.length === 0) {
    // Fatura inicial
    const initialInvoice: SubscriptionInvoice = {
      id: `inv_${Date.now()}_1`,
      userId,
      subscriptionId: sub.id,
      number: `FAT-2025-${Math.floor(1000 + Math.random() * 9000)}`,
      periodStart: sub.startDate,
      periodEnd: sub.renewalDate,
      amountKz: plan.priceMonthlyKz,
      status: 'PAID',
      method: 'MULTICAIXA Express',
      planName: plan.name,
      createdAt: sub.startDate,
    };
    allInvoices = [initialInvoice, ...allInvoices];
    setMemoryStore(STORAGE_INV_KEY, allInvoices);
    userInvoices = [initialInvoice];
  }

  // Obter pagamentos
  const allPayments = getMemoryStore<SubscriptionPayment[]>(STORAGE_PAY_KEY, []);
  const userPayments = allPayments.filter((p) => p.userId === userId);

  const canCalculate = sub.status === 'ACTIVE' && sub.usageCount < sub.monthlyLimit;

  return {
    subscription: sub,
    plan,
    invoices: userInvoices,
    payments: userPayments,
    canCalculate,
  };
}

/**
 * subscribe(userId, planId) — cria Subscription + Invoice + Payment (manual).
 */
export async function subscribe(
  userId: string,
  planId: SubscriptionPlanId
): Promise<{ success: boolean; subscription: SubscriptionRecord; invoice: SubscriptionInvoice; payment: SubscriptionPayment }> {
  const validated = subscribeSchema.safeParse({ userId, planId });
  if (!validated.success) throw new Error(validated.error.issues[0]?.message || 'Plano inválido selecionado.');

  const plan = PLANS_CATALOG.find((p) => p.id === planId);
  if (!plan) throw new Error('Plano inválido selecionado.');

  const now = new Date();
  const renewal = new Date(now.getTime() + 30 * 24 * 3600 * 1000);

  const subscription: SubscriptionRecord = {
    id: `sub_${userId}_${Date.now()}`,
    userId,
    planId,
    status: 'ACTIVE',
    startDate: now.toISOString(),
    renewalDate: renewal.toISOString(),
    usageCount: 0,
    monthlyLimit: plan.monthlyLimit,
    cancelledAt: null,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  const invoice: SubscriptionInvoice = {
    id: `inv_${Date.now()}`,
    userId,
    subscriptionId: subscription.id,
    number: `FAT-2025-${Math.floor(1000 + Math.random() * 9000)}`,
    periodStart: now.toISOString(),
    periodEnd: renewal.toISOString(),
    amountKz: plan.priceMonthlyKz,
    status: 'PAID',
    method: 'MULTICAIXA Express',
    planName: plan.name,
    createdAt: now.toISOString(),
  };

  const payment: SubscriptionPayment = {
    id: `sub_pay_${Date.now()}`,
    subscriptionId: subscription.id,
    userId,
    amountKz: plan.priceMonthlyKz,
    method: 'MULTICAIXA_EXPRESS',
    status: 'APPROVED',
    reference: `MCX-${Date.now().toString().slice(-6)}`,
    createdAt: now.toISOString(),
    reviewedAt: now.toISOString(),
  };

  // Persistência
  const allSubs = getMemoryStore<Record<string, SubscriptionRecord>>(STORAGE_SUB_KEY, {});
  allSubs[userId] = subscription;
  setMemoryStore(STORAGE_SUB_KEY, allSubs);

  const allInvoices = getMemoryStore<SubscriptionInvoice[]>(STORAGE_INV_KEY, []);
  setMemoryStore(STORAGE_INV_KEY, [invoice, ...allInvoices]);

  const allPayments = getMemoryStore<SubscriptionPayment[]>(STORAGE_PAY_KEY, []);
  setMemoryStore(STORAGE_PAY_KEY, [payment, ...allPayments]);

  if (prisma && process.env.DATABASE_URL) {
    try {
      const planRecord = await prisma.plan.findFirst({
        where: { name: { contains: plan.name, mode: 'insensitive' } },
        select: { id: true },
      });
      if (planRecord) {
        await prisma.subscription.create({
          data: {
            id: subscription.id,
            userId,
            planId: planRecord.id,
            status: 'ACTIVE',
            startDate: now,
            renewalDate: renewal,
          },
          select: {
            id: true,
            status: true,
          },
        });
      }
    } catch (e) {
      console.warn('[Subscriptions] Erro ao sincronizar com Prisma:', e);
    }
  }

  await logAuditEvent({
    event: 'SUBSCRIPTION_CREATED',
    userId,
    details: { planId, amountKz: plan.priceMonthlyKz, invoiceNumber: invoice.number },
  });

  await sendNotification(userId, 'subscription_renewed', {
    nome: 'Estimado Cliente',
    projectName: `Subscrição ${plan.name}`,
    valor: `${plan.priceMonthlyKz.toLocaleString('pt-PT')} Kz`,
    link: '/plano',
  }).catch(() => {});

  return { success: true, subscription, invoice, payment };
}

/**
 * upgrade(userId, newPlanId) — calcula prorrata + cria Payment.
 */
export async function upgrade(
  userId: string,
  newPlanId: SubscriptionPlanId
): Promise<{ success: boolean; prorataKz: number; payment: SubscriptionPayment; message: string }> {
  const { subscription, plan: currentPlan } = await getSubscription(userId);
  const newPlan = PLANS_CATALOG.find((p) => p.id === newPlanId);
  if (!newPlan) throw new Error('Novo plano inválido.');

  if (newPlan.priceMonthlyKz <= currentPlan.priceMonthlyKz) {
    throw new Error('O novo plano deve ter valor superior para upgrade. Use downgrade para planos inferiores.');
  }

  // Cálculo da prorrata: dias restantes até à renovação
  const now = new Date();
  const renewal = new Date(subscription.renewalDate);
  const diffMs = Math.max(0, renewal.getTime() - now.getTime());
  const remainingDays = Math.ceil(diffMs / (24 * 3600 * 1000));
  const dailyDiff = (newPlan.priceMonthlyKz - currentPlan.priceMonthlyKz) / 30;
  const prorataKz = Math.round(dailyDiff * Math.min(30, Math.max(1, remainingDays)));

  // Atualiza subscrição imediatamente para os novos limites
  subscription.planId = newPlanId;
  subscription.monthlyLimit = newPlan.monthlyLimit;
  subscription.updatedAt = now.toISOString();
  subscription.cancelledAt = null; // reativa caso estivesse pendente de cancelamento

  const allSubs = getMemoryStore<Record<string, SubscriptionRecord>>(STORAGE_SUB_KEY, {});
  allSubs[userId] = subscription;
  setMemoryStore(STORAGE_SUB_KEY, allSubs);

  // Cria registo de pagamento do acerto prorrata
  const payment: SubscriptionPayment = {
    id: `sub_pay_upg_${Date.now()}`,
    subscriptionId: subscription.id,
    userId,
    amountKz: prorataKz,
    method: 'MULTICAIXA_EXPRESS',
    status: 'APPROVED',
    reference: `UPG-${Date.now().toString().slice(-6)}`,
    notes: `Upgrade de ${currentPlan.name} para ${newPlan.name} (${remainingDays} dias restantes)`,
    createdAt: now.toISOString(),
    reviewedAt: now.toISOString(),
  };

  const allPayments = getMemoryStore<SubscriptionPayment[]>(STORAGE_PAY_KEY, []);
  setMemoryStore(STORAGE_PAY_KEY, [payment, ...allPayments]);

  // Cria fatura da prorrata
  const invoice: SubscriptionInvoice = {
    id: `inv_upg_${Date.now()}`,
    userId,
    subscriptionId: subscription.id,
    number: `FAT-UPG-${Math.floor(1000 + Math.random() * 9000)}`,
    periodStart: now.toISOString(),
    periodEnd: subscription.renewalDate,
    amountKz: prorataKz,
    status: 'PAID',
    method: 'MULTICAIXA Express',
    planName: `Upgrade: ${newPlan.name} (Prorrata)`,
    createdAt: now.toISOString(),
  };

  const allInvoices = getMemoryStore<SubscriptionInvoice[]>(STORAGE_INV_KEY, []);
  setMemoryStore(STORAGE_INV_KEY, [invoice, ...allInvoices]);

  await logAuditEvent({
    event: 'SUBSCRIPTION_UPGRADED',
    userId,
    details: { fromPlan: currentPlan.id, toPlan: newPlan.id, prorataKz, remainingDays },
  });

  return {
    success: true,
    prorataKz,
    payment,
    message: `Upgrade concluído! Prorrata de ${prorataKz.toLocaleString('pt-PT')} Kz calculada para ${remainingDays} dias. Limite aumentado para ${newPlan.monthlyLimit} orçamentos.`,
  };
}

/**
 * downgrade(userId, newPlanId) — agenda para a próxima renovação.
 */
export async function downgrade(
  userId: string,
  newPlanId: SubscriptionPlanId
): Promise<{ success: boolean; effectiveDate: string; message: string }> {
  const { subscription } = await getSubscription(userId);
  const newPlan = PLANS_CATALOG.find((p) => p.id === newPlanId);
  if (!newPlan) throw new Error('Novo plano inválido.');

  subscription.scheduledDowngradePlanId = newPlanId;
  subscription.updatedAt = new Date().toISOString();

  const allSubs = getMemoryStore<Record<string, SubscriptionRecord>>(STORAGE_SUB_KEY, {});
  allSubs[userId] = subscription;
  setMemoryStore(STORAGE_SUB_KEY, allSubs);

  const effectiveDate = new Date(subscription.renewalDate).toLocaleDateString('pt-PT');

  await logAuditEvent({
    event: 'SUBSCRIPTION_DOWNGRADE_SCHEDULED',
    userId,
    details: { newPlanId, effectiveDate },
  });

  return {
    success: true,
    effectiveDate,
    message: `Downgrade para o plano ${newPlan.name} agendado com sucesso. Entrará em vigor na próxima data de renovação (${effectiveDate}).`,
  };
}

/**
 * cancel(userId, reason) — marca cancelledAt, mantém activo até renewalDate.
 */
export async function cancel(
  userId: string,
  reason: string
): Promise<{ success: boolean; activeUntil: string; message: string }> {
  const validated = cancelSubscriptionSchema.safeParse({ userId, reason });
  if (!validated.success) throw new Error(validated.error.issues[0]?.message || 'Dados inválidos.');

  const { subscription } = await getSubscription(userId);
  const now = new Date();

  subscription.cancelledAt = now.toISOString();
  subscription.cancellationReason = reason;
  subscription.updatedAt = now.toISOString();

  const allSubs = getMemoryStore<Record<string, SubscriptionRecord>>(STORAGE_SUB_KEY, {});
  allSubs[userId] = subscription;
  setMemoryStore(STORAGE_SUB_KEY, allSubs);

  if (prisma && process.env.DATABASE_URL) {
    try {
      await prisma.subscription.updateMany({
        where: { userId, status: 'ACTIVE' },
        data: {
          cancelledAt: now,
        },
      });
    } catch (_) {}
  }

  const activeUntil = new Date(subscription.renewalDate).toLocaleDateString('pt-PT');

  await logAuditEvent({
    event: 'SUBSCRIPTION_CANCELLED',
    userId,
    details: { reason, activeUntil },
  });

  await sendNotification(userId, 'subscription_cancelled', {
    nome: 'Estimado Cliente',
    projectName: 'Subscrição Kizongelu',
    data: activeUntil,
    link: '/plano',
  }).catch(() => {});

  return {
    success: true,
    activeUntil,
    message: `A sua subscrição foi cancelada. Continuará com acesso total e limites vigentes até ${activeUntil}.`,
  };
}

/**
 * reactivate(userId) — cancela cancelamento agendado.
 */
export async function reactivate(userId: string): Promise<{ success: boolean; message: string }> {
  const { subscription } = await getSubscription(userId);

  subscription.cancelledAt = null;
  subscription.cancellationReason = null;
  subscription.scheduledDowngradePlanId = null;
  subscription.updatedAt = new Date().toISOString();

  const allSubs = getMemoryStore<Record<string, SubscriptionRecord>>(STORAGE_SUB_KEY, {});
  allSubs[userId] = subscription;
  setMemoryStore(STORAGE_SUB_KEY, allSubs);

  await logAuditEvent({
    event: 'SUBSCRIPTION_REACTIVATED',
    userId,
    details: { planId: subscription.planId },
  });

  return {
    success: true,
    message: 'Subscrição reativada com sucesso! A renovação automática continua ativa.',
  };
}

/**
 * renew(userId) — estende renewalDate por 30 dias + cria Invoice.
 */
export async function renew(
  userId: string,
  paymentDetails?: { method: 'MULTICAIXA_EXPRESS' | 'TRANSFERENCIA_BANCARIA'; proofUrl?: string }
): Promise<{ success: boolean; invoice: SubscriptionInvoice; message: string }> {
  const { subscription, plan } = await getSubscription(userId);
  const currentRenewal = new Date(subscription.renewalDate);
  const newRenewal = new Date(currentRenewal.getTime() + 30 * 24 * 3600 * 1000);

  subscription.renewalDate = newRenewal.toISOString();
  subscription.usageCount = 0; // reset do contador de orçamentos
  subscription.status = 'ACTIVE';
  subscription.cancelledAt = null;
  subscription.updatedAt = new Date().toISOString();

  const allSubs = getMemoryStore<Record<string, SubscriptionRecord>>(STORAGE_SUB_KEY, {});
  allSubs[userId] = subscription;
  setMemoryStore(STORAGE_SUB_KEY, allSubs);

  const invoice: SubscriptionInvoice = {
    id: `inv_ren_${Date.now()}`,
    userId,
    subscriptionId: subscription.id,
    number: `FAT-${newRenewal.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    periodStart: currentRenewal.toISOString(),
    periodEnd: newRenewal.toISOString(),
    amountKz: plan.priceMonthlyKz,
    status: 'PAID',
    method: paymentDetails?.method === 'TRANSFERENCIA_BANCARIA' ? 'Transferência bancária' : 'MULTICAIXA Express',
    planName: plan.name,
    proofUrl: paymentDetails?.proofUrl,
    createdAt: new Date().toISOString(),
  };

  const allInvoices = getMemoryStore<SubscriptionInvoice[]>(STORAGE_INV_KEY, []);
  setMemoryStore(STORAGE_INV_KEY, [invoice, ...allInvoices]);

  await logAuditEvent({
    event: 'SUBSCRIPTION_RENEWED',
    userId,
    details: { newRenewalDate: newRenewal.toISOString(), invoiceNumber: invoice.number },
  });

  await sendNotification(userId, 'subscription_renewed', {
    nome: 'Estimado Cliente',
    projectName: plan.name,
    valor: `${plan.priceMonthlyKz.toLocaleString('pt-PT')} Kz`,
    data: newRenewal.toLocaleDateString('pt-PT'),
    link: '/plano',
  }).catch(() => {});

  return {
    success: true,
    invoice,
    message: `Subscrição renovada com sucesso até ${newRenewal.toLocaleDateString('pt-PT')}! O seu limite de ${plan.monthlyLimit} orçamentos foi restaurado.`,
  };
}

/**
 * Incrementa o contador de orçamentos calculados no mês.
 * Disparado ao concluir o cálculo de um novo orçamento no Wizard.
 */
export async function incrementBudgetUsage(userId: string): Promise<{ usageCount: number; monthlyLimit: number; canCalculateNext: boolean }> {
  const { subscription } = await getSubscription(userId);

  subscription.usageCount += 1;
  subscription.updatedAt = new Date().toISOString();

  const allSubs = getMemoryStore<Record<string, SubscriptionRecord>>(STORAGE_SUB_KEY, {});
  allSubs[userId] = subscription;
  setMemoryStore(STORAGE_SUB_KEY, allSubs);

  const canCalculateNext = subscription.usageCount < subscription.monthlyLimit;

  return {
    usageCount: subscription.usageCount,
    monthlyLimit: subscription.monthlyLimit,
    canCalculateNext,
  };
}

/**
 * Valida a quota de orçamentos e incrementa uso se permitido.
 */
export async function checkAndIncrementUsage(userId: string): Promise<{
  allowed: boolean;
  message?: string;
  usageCount: number;
  limit: number;
}> {
  const { subscription, plan, canCalculate } = await getSubscription(userId);

  if (!canCalculate) {
    const renewalFormatted = new Date(subscription.renewalDate).toLocaleDateString('pt-PT');
    return {
      allowed: false,
      message: `Atingiu o limite de orçamentos do seu plano (${plan.name} - ${plan.monthlyLimit} orçamentos/mês). Faça upgrade ou aguarde o reset a ${renewalFormatted}.`,
      usageCount: subscription.usageCount,
      limit: subscription.monthlyLimit,
    };
  }

  const result = await incrementBudgetUsage(userId);
  return {
    allowed: true,
    usageCount: result.usageCount,
    limit: result.monthlyLimit,
  };
}

// ==========================================
// GESTÃO DE EQUIPA E CONVITES (Plano Empresa)
// ==========================================

export async function getTeamMembers(companyId: string): Promise<TeamMemberRecord[]> {
  const members = getMemoryStore<TeamMemberRecord[]>(STORAGE_TEAM_KEY, []);
  const companyMembers = members.filter((m) => m.companyId === companyId);

  if (companyMembers.length === 0) {
    const initialTeam: TeamMemberRecord[] = [
      {
        id: 'team_01',
        companyId,
        userId: 'user_master',
        nome: 'Dra. Teresa Van-Dúnem',
        email: 'diretoria@chelasul.co.ao',
        role: 'Administrador da Organização',
        status: 'Ativo',
        joinedAt: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(),
      },
      {
        id: 'team_02',
        companyId,
        userId: 'user_m_bento',
        nome: 'Eng. Manuel Bento',
        email: 'm.bento@empresa.co.ao',
        role: 'Orçamentista Sénior',
        status: 'Ativo',
        joinedAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
      },
      {
        id: 'team_03',
        companyId,
        userId: 'user_c_dala',
        nome: 'Técnico Carlos Dala',
        email: 'c.dala@empresa.co.ao',
        role: 'Medidor de Obra',
        status: 'Ativo',
        joinedAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
      },
    ];
    setMemoryStore(STORAGE_TEAM_KEY, [...initialTeam, ...members]);
    return initialTeam;
  }

  return companyMembers;
}

export async function createInvitation(params: {
  companyId: string;
  companyName: string;
  email: string;
  role: 'COMPANY_ADMIN' | 'COMPANY_MEMBER';
}): Promise<{ success: boolean; invitation: InvitationRecord; inviteUrl: string }> {
  const { companyId, companyName, email, role } = params;

  const token = `inv_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString(36)}`;
  const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();

  const invitation: InvitationRecord = {
    id: `invite_${Date.now()}`,
    companyId,
    companyName,
    email,
    role,
    token,
    expiresAt,
    createdAt: new Date().toISOString(),
  };

  const allInvites = getMemoryStore<InvitationRecord[]>(STORAGE_INVITE_KEY, []);
  setMemoryStore(STORAGE_INVITE_KEY, [invitation, ...allInvites]);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://kizongelu.ao';
  const inviteUrl = `${origin}/convite/${token}`;

  await logAuditEvent({
    event: 'TEAM_INVITATION_SENT',
    userId: companyId,
    details: { email, role, token, expiresAt },
  });

  return { success: true, invitation, inviteUrl };
}

export async function getInvitationByToken(token: string): Promise<InvitationRecord | null> {
  const allInvites = getMemoryStore<InvitationRecord[]>(STORAGE_INVITE_KEY, []);
  const invite = allInvites.find((i) => i.token === token);
  if (!invite) return null;
  return invite;
}

export async function acceptInvitation(
  token: string,
  user: { id: string; nome: string; email: string }
): Promise<{ success: boolean; message: string }> {
  const allInvites = getMemoryStore<InvitationRecord[]>(STORAGE_INVITE_KEY, []);
  const inviteIndex = allInvites.findIndex((i) => i.token === token);

  if (inviteIndex === -1) {
    throw new Error('Convite não encontrado ou expirado.');
  }

  const invite = allInvites[inviteIndex];
  if (invite.acceptedAt) {
    throw new Error('Este convite já foi utilizado anteriormente.');
  }

  if (new Date(invite.expiresAt) < new Date()) {
    throw new Error('Este convite expirou (validade de 7 dias excedida).');
  }

  invite.acceptedAt = new Date().toISOString();
  allInvites[inviteIndex] = invite;
  setMemoryStore(STORAGE_INVITE_KEY, allInvites);

  // Adiciona o utilizador à lista da equipa
  const newMember: TeamMemberRecord = {
    id: `member_${Date.now()}`,
    companyId: invite.companyId,
    userId: user.id,
    nome: user.nome,
    email: user.email,
    role: invite.role === 'COMPANY_ADMIN' ? 'Administrador da Organização' : 'Orçamentista Sénior',
    status: 'Ativo',
    joinedAt: new Date().toISOString(),
  };

  const allMembers = getMemoryStore<TeamMemberRecord[]>(STORAGE_TEAM_KEY, []);
  setMemoryStore(STORAGE_TEAM_KEY, [...allMembers, newMember]);

  return {
    success: true,
    message: `Bem-vindo à equipa de ${invite.companyName}! Já pode aceder aos orçamentos partilhados.`,
  };
}

export async function updateTeamMemberRole(
  memberId: string,
  newRole: TeamMemberRecord['role']
): Promise<{ success: boolean }> {
  const allMembers = getMemoryStore<TeamMemberRecord[]>(STORAGE_TEAM_KEY, []);
  const idx = allMembers.findIndex((m) => m.id === memberId);
  if (idx !== -1) {
    allMembers[idx].role = newRole;
    setMemoryStore(STORAGE_TEAM_KEY, allMembers);
  }
  return { success: true };
}

export async function removeTeamMember(memberId: string): Promise<{ success: boolean }> {
  const allMembers = getMemoryStore<TeamMemberRecord[]>(STORAGE_TEAM_KEY, []);
  const filtered = allMembers.filter((m) => m.id !== memberId);
  setMemoryStore(STORAGE_TEAM_KEY, filtered);
  return { success: true };
}

// ==========================================
// CRON RUNNER (Inngest Simulator)
// ==========================================

export async function runSubscriptionCronChecks(): Promise<{
  expiringNotified: number;
  overdueCount: number;
  suspendedCount: number;
}> {
  const allSubs = getMemoryStore<Record<string, SubscriptionRecord>>(STORAGE_SUB_KEY, {});
  const now = new Date();
  let expiringNotified = 0;
  let overdueCount = 0;
  let suspendedCount = 0;

  for (const userId of Object.keys(allSubs)) {
    const sub = allSubs[userId];
    const renewal = new Date(sub.renewalDate);
    const diffDays = Math.ceil((renewal.getTime() - now.getTime()) / (24 * 3600 * 1000));

    // 1. Notifica se expira em 7 dias
    if (diffDays <= 7 && diffDays > 0 && sub.status === 'ACTIVE') {
      expiringNotified++;
      sendNotification(userId, 'subscription_renewing', {
        nome: 'Estimado Cliente',
        projectName: 'Renovação de Subscrição',
        data: renewal.toLocaleDateString('pt-PT'),
        link: '/plano/renovar',
      }).catch(() => {});
    }

    // 2. Verifica overdue
    if (diffDays <= 0 && diffDays > -15 && sub.status === 'ACTIVE') {
      sub.status = 'OVERDUE';
      sub.updatedAt = now.toISOString();
      overdueCount++;
      sendNotification(userId, 'subscription_overdue', {
        nome: 'Estimado Cliente',
        projectName: 'Aviso de Renovação em Atraso',
        data: renewal.toLocaleDateString('pt-PT'),
        link: '/plano/renovar',
      }).catch(() => {});
    }

    // 3. Suspenso após 15 dias de atraso
    if (diffDays <= -15 && sub.status === 'OVERDUE') {
      sub.status = 'SUSPENDED';
      sub.updatedAt = now.toISOString();
      suspendedCount++;
      sendNotification(userId, 'subscription_suspended', {
        nome: 'Estimado Cliente',
        projectName: 'Subscrição Suspensa',
        link: '/plano/renovar',
      }).catch(() => {});
    }
  }

  setMemoryStore(STORAGE_SUB_KEY, allSubs);
  return { expiringNotified, overdueCount, suspendedCount };
}
