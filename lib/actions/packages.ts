/**
 * @file lib/actions/packages.ts
 * Gestão Central de Pacotes de Orçamentos e Créditos Permanentes (Bloco 4).
 *
 * Modelo de Pacotes Únicos (Sem Expiração):
 * - Particular: 12.999 Kz (1 orçamento, 1 utilizador)
 * - Profissional: 15.999 Kz (3 orçamentos, 1 utilizador)
 * - Empresa: 29.999 Kz (6 orçamentos, 2 utilizadores)
 * - Empresa Plus: 49.999 Kz (12 orçamentos, 5 utilizadores)
 *
 * Funções Implementadas:
 * 1. getActivePackages(userId)
 * 2. getUserCredits(userId)
 * 3. hasActiveCredits(userId)
 * 4. consumeCredit(userId, projectId)
 * 5. getUpgradeQuote(userId, newPlanId)
 * 6. upgradePackage(userId, newPlanId, paymentId)
 * 7. purchasePackage(userId, planId, paymentId)
 * 8. getPackageHistory(userId)
 */

import { prisma } from '../db/prisma';
import { logAuditEvent } from '../audit';
import { sendNotification } from '../notifications';

export type PackageStatusType = 'PENDING_PAYMENT' | 'ACTIVE' | 'EXHAUSTED' | 'EXPIRED' | 'CANCELLED';

export interface PackagePlanDetails {
  id: string;
  name: string;
  displayName: string;
  price: number;
  credits: number;
  maxUsers: number;
  badge?: string | null;
  features?: any;
}

export interface PackageRecord {
  id: string;
  userId: string;
  planId: string;
  totalCredits: number;
  usedCredits: number;
  remainingCredits: number;
  status: PackageStatusType;
  purchasedAt: string;
  exhaustedAt?: string | null;
  expiresAt?: string | null;
  purchaseAmount: number;
  paymentId?: string | null;
  paymentMethod?: string | null;
  proofUrl?: string | null;
  createdBy?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  plan?: PackagePlanDetails;
}

export const PACKAGES_CATALOG: Record<string, PackagePlanDetails> = {
  particular: {
    id: 'plan_particular',
    name: 'particular',
    displayName: 'Particular',
    price: 12999,
    credits: 1,
    maxUsers: 1,
    badge: null,
    features: {
      orcamentos: 1,
      utilizadores: 1,
      pdfQR: true,
      acessoPermanente: true,
    },
  },
  profissional: {
    id: 'plan_profissional',
    name: 'profissional',
    displayName: 'Profissional',
    price: 15999,
    credits: 3,
    maxUsers: 1,
    badge: null,
    features: {
      orcamentos: 3,
      utilizadores: 1,
      pdfQR: true,
      suporteWhatsApp: true,
    },
  },
  empresa: {
    id: 'plan_empresa',
    name: 'empresa',
    displayName: 'Empresa',
    price: 29999,
    credits: 6,
    maxUsers: 2,
    badge: 'recommended',
    features: {
      orcamentos: 6,
      utilizadores: 2,
      pdfQR: true,
      logotipo: true,
      configMargens: true,
      exportacaoExcel: true,
    },
  },
  empresa_plus: {
    id: 'plan_empresa_plus',
    name: 'empresa_plus',
    displayName: 'Empresa Plus',
    price: 49999,
    credits: 12,
    maxUsers: 5,
    badge: 'best_value',
    features: {
      orcamentos: 12,
      utilizadores: 5,
      pdfQR: true,
      logotipo: true,
      configMargens: true,
      exportacaoExcel: true,
      dossieCredito: true,
      gestorEngenheiro: true,
    },
  },
};

const STORAGE_PACKAGES_KEY = 'kizongelu_user_packages';

const inMemoryPackagesStore: Record<string, PackageRecord[]> = {
  // 1. Carlos Neto (Empresa Plus) - 12 créditos
  'usr_carlos_neto': [
    {
      id: 'pkg_seed_carlos_neto',
      userId: 'usr_carlos_neto',
      planId: 'plan_empresa_plus',
      totalCredits: 12,
      usedCredits: 0,
      remainingCredits: 12,
      status: 'ACTIVE',
      purchasedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      exhaustedAt: null,
      expiresAt: null,
      purchaseAmount: 49999,
      createdBy: 'seed-official',
      notes: 'Pacote Empresa Plus com 12 orçamentos permanentes',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      plan: PACKAGES_CATALOG.empresa_plus,
    },
  ],
  'user-plus-01': [
    {
      id: 'pkg_seed_user_plus_01',
      userId: 'user-plus-01',
      planId: 'plan_empresa_plus',
      totalCredits: 12,
      usedCredits: 0,
      remainingCredits: 12,
      status: 'ACTIVE',
      purchasedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      exhaustedAt: null,
      expiresAt: null,
      purchaseAmount: 49999,
      createdBy: 'seed-official',
      notes: 'Pacote Empresa Plus com 12 orçamentos permanentes',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      plan: PACKAGES_CATALOG.empresa_plus,
    },
  ],

  // 2. Dra. Teresa Van-Dúnem (Empresa) - 6 créditos
  'usr_teresa_vandunem': [
    {
      id: 'pkg_seed_teresa_vandunem',
      userId: 'usr_teresa_vandunem',
      planId: 'plan_empresa',
      totalCredits: 6,
      usedCredits: 0,
      remainingCredits: 6,
      status: 'ACTIVE',
      purchasedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      exhaustedAt: null,
      expiresAt: null,
      purchaseAmount: 29999,
      createdBy: 'seed-official',
      notes: 'Pacote Empresa com 6 orçamentos permanentes',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      plan: PACKAGES_CATALOG.empresa,
    },
  ],
  'user-empresa-01': [
    {
      id: 'pkg_seed_user_empresa_01',
      userId: 'user-empresa-01',
      planId: 'plan_empresa',
      totalCredits: 6,
      usedCredits: 0,
      remainingCredits: 6,
      status: 'ACTIVE',
      purchasedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      exhaustedAt: null,
      expiresAt: null,
      purchaseAmount: 29999,
      createdBy: 'seed-official',
      notes: 'Pacote Empresa com 6 orçamentos permanentes',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      plan: PACKAGES_CATALOG.empresa,
    },
  ],

  // 3. Eng. Arnaldo Silva (Profissional) - 3 créditos
  'usr_arnaldo_silva': [
    {
      id: 'pkg_seed_arnaldo_silva',
      userId: 'usr_arnaldo_silva',
      planId: 'plan_profissional',
      totalCredits: 3,
      usedCredits: 0,
      remainingCredits: 3,
      status: 'ACTIVE',
      purchasedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
      exhaustedAt: null,
      expiresAt: null,
      purchaseAmount: 15999,
      createdBy: 'seed-official',
      notes: 'Pacote Profissional com 3 orçamentos permanentes',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      plan: PACKAGES_CATALOG.profissional,
    },
  ],
  'user-prof-01': [
    {
      id: 'pkg_seed_user_prof_01',
      userId: 'user-prof-01',
      planId: 'plan_profissional',
      totalCredits: 3,
      usedCredits: 0,
      remainingCredits: 3,
      status: 'ACTIVE',
      purchasedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
      exhaustedAt: null,
      expiresAt: null,
      purchaseAmount: 15999,
      createdBy: 'seed-official',
      notes: 'Pacote Profissional com 3 orçamentos permanentes',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      plan: PACKAGES_CATALOG.profissional,
    },
  ],

  // 4. Manuel Kiala (Particular) - 1 crédito
  'user-particular-01': [
    {
      id: 'pkg_seed_manuel_kiala',
      userId: 'user-particular-01',
      planId: 'plan_particular',
      totalCredits: 1,
      usedCredits: 0,
      remainingCredits: 1,
      status: 'ACTIVE',
      purchasedAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      exhaustedAt: null,
      expiresAt: null,
      purchaseAmount: 12999,
      createdBy: 'seed-official',
      notes: 'Pacote Particular com 1 orçamento permanente',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      plan: PACKAGES_CATALOG.particular,
    },
  ],
  'usr_manuel_kiala': [
    {
      id: 'pkg_seed_usr_manuel_kiala',
      userId: 'usr_manuel_kiala',
      planId: 'plan_particular',
      totalCredits: 1,
      usedCredits: 0,
      remainingCredits: 1,
      status: 'ACTIVE',
      purchasedAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      exhaustedAt: null,
      expiresAt: null,
      purchaseAmount: 12999,
      createdBy: 'seed-official',
      notes: 'Pacote Particular com 1 orçamento permanente',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      plan: PACKAGES_CATALOG.particular,
    },
  ],
  'usr_particular_seed': [
    {
      id: 'pkg_seed_particular_seed',
      userId: 'usr_particular_seed',
      planId: 'plan_particular',
      totalCredits: 1,
      usedCredits: 0,
      remainingCredits: 1,
      status: 'ACTIVE',
      purchasedAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      exhaustedAt: null,
      expiresAt: null,
      purchaseAmount: 12999,
      createdBy: 'seed-official',
      notes: 'Pacote Particular com 1 orçamento permanente',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      plan: PACKAGES_CATALOG.particular,
    },
  ],

  // 5. Admin Kizongelu - Acesso Ilimitado
  'user-admin-01': [
    {
      id: 'pkg_seed_admin',
      userId: 'user-admin-01',
      planId: 'plan_empresa_plus',
      totalCredits: 999999,
      usedCredits: 0,
      remainingCredits: 999999,
      status: 'ACTIVE',
      purchasedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      exhaustedAt: null,
      expiresAt: null,
      purchaseAmount: 0,
      createdBy: 'admin-unlimited',
      notes: 'Acesso Administrativo Ilimitado',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      plan: PACKAGES_CATALOG.empresa_plus,
    },
  ],
};

function getSeedFallback(userId: string): PackageRecord[] {
  if (userId.includes('carlos') || userId === 'user-plus-01') {
    return inMemoryPackagesStore['usr_carlos_neto'];
  }
  if (userId.includes('teresa') || userId === 'user-empresa-01') {
    return inMemoryPackagesStore['usr_teresa_vandunem'];
  }
  if (userId.includes('arnaldo') || userId === 'user-prof-01') {
    return inMemoryPackagesStore['usr_arnaldo_silva'];
  }
  if (userId.includes('kiala') || userId === 'user-particular-01' || userId === 'usr_particular_seed') {
    return inMemoryPackagesStore['usr_manuel_kiala'] || inMemoryPackagesStore['user-particular-01'];
  }
  if (userId === 'user-admin-01' || userId === 'usr_admin_master' || userId.includes('admin')) {
    return inMemoryPackagesStore['user-admin-01'];
  }
  return [];
}

function getPackagesStore(userId: string): PackageRecord[] {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(`${STORAGE_PACKAGES_KEY}_${userId}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const totalRemaining = parsed.reduce((acc: number, p: any) => acc + (p.remainingCredits || 0), 0);
          const seedFallback = inMemoryPackagesStore[userId] || getSeedFallback(userId);
          if (totalRemaining === 0 && seedFallback && seedFallback.length > 0) {
            return seedFallback;
          }
          return parsed;
        }
      }
    } catch (e) {
      console.warn(`[Packages] Erro ao carregar pacotes para ${userId}:`, e);
    }
  }
  return inMemoryPackagesStore[userId] || getSeedFallback(userId);
}

function setPackagesStore(userId: string, packages: PackageRecord[]): void {
  inMemoryPackagesStore[userId] = packages;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`${STORAGE_PACKAGES_KEY}_${userId}`, JSON.stringify(packages));
      window.dispatchEvent(new CustomEvent('kizongelu_packages_updated', { detail: { userId, packages } }));
    } catch (e) {
      console.warn(`[Packages] Erro ao gravar pacotes para ${userId}:`, e);
    }
  }
}

/**
 * 1. getActivePackages(userId)
 * Retorna os pacotes activos do utilizador ordenados por data de compra (FIFO).
 */
export async function getActivePackages(userId: string): Promise<PackageRecord[]> {
  if (process.env.DATABASE_URL) {
    try {
      const dbPackages = await (prisma as any).package?.findMany({
        where: {
          userId,
          status: 'ACTIVE',
          remainingCredits: { gt: 0 },
        },
        include: { plan: true },
        orderBy: { purchasedAt: 'asc' },
      });

      if (dbPackages && dbPackages.length > 0) {
        return dbPackages.map((p: any) => ({
          ...p,
          purchaseAmount: Number(p.purchaseAmount),
          purchasedAt: p.purchasedAt instanceof Date ? p.purchasedAt.toISOString() : p.purchasedAt,
          createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
          updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : p.updatedAt,
        }));
      }
    } catch (err) {
      // Fallback gracioso para store local
    }
  }

  const local = getPackagesStore(userId);
  return local
    .filter((p) => p.status === 'ACTIVE' && p.remainingCredits > 0)
    .sort((a, b) => new Date(a.purchasedAt).getTime() - new Date(b.purchasedAt).getTime());
}

/**
 * 2. getUserCredits(userId)
 * Soma de créditos disponíveis em todos os pacotes activos do utilizador.
 */
export async function getUserCredits(userId: string, userRole?: string): Promise<number> {
  const normalizedRole = (userRole || '').toUpperCase();

  // Admin: acesso irrestrito
  if (normalizedRole === 'ADMIN' || userId === 'user-admin-01' || userId === 'usr_admin_master' || userId.includes('admin')) {
    return 999999;
  }

  const active = await getActivePackages(userId);
  const sum = active.reduce((acc, pkg) => acc + (pkg.remainingCredits || 0), 0);
  if (sum > 0) return sum;

  // Fallback dinâmico com base no perfil (role) do utilizador
  if (normalizedRole) {
    if (normalizedRole === 'EMPRESA_PLUS') return 12;
    if (['EMPRESA', 'COMPANY_OWNER', 'COMPANY_ADMIN'].includes(normalizedRole)) return 6;
    if (normalizedRole === 'PROFISSIONAL') return 3;
    if (normalizedRole === 'PARTICULAR') return 0;
  }

  // Fallback baseado no store em memória se existirem pacotes atribuídos
  const seedPackages = getSeedFallback(userId);
  if (seedPackages && seedPackages.length > 0) {
    const seedSum = seedPackages.reduce((acc, p) => acc + (p.remainingCredits || 0), 0);
    return seedSum;
  }

  return 0;
}

/**
 * 3. hasActiveCredits(userId)
 * Verificação rápida para guards e bloqueios no wizard.
 */
export async function hasActiveCredits(userId: string): Promise<boolean> {
  const credits = await getUserCredits(userId);
  return credits > 0;
}

/**
 * 4. consumeCredit(userId, projectId)
 * Consome 1 crédito ao criar um orçamento com idempotência, FIFO e auditoria.
 */
export async function consumeCredit(userId: string, projectId: string): Promise<PackageRecord> {
  const activePackages = await getActivePackages(userId);

  if (!activePackages || activePackages.length === 0) {
    throw new Error('NO_CREDITS_AVAILABLE');
  }

  // 1. Encontra pacote activo mais antigo (FIFO)
  const activePackage = activePackages[0];

  // 2. Verificar idempotência (evitar debitar crédito repetido se o utilizador submeter o mesmo projecto)
  const allUserPackages = getPackagesStore(userId);
  const alreadyConsumed = allUserPackages.some(
    (p) => p.notes && p.notes.includes(projectId)
  );

  if (alreadyConsumed) {
    throw new Error('CREDIT_ALREADY_CONSUMED_FOR_PROJECT');
  }

  // 3. Decrementar
  const newRemaining = activePackage.remainingCredits - 1;
  const isExhausted = newRemaining === 0;
  const now = new Date();

  const noteAppend = `Usado em projecto ${projectId} em ${now.toISOString()}`;
  const updatedNotes = activePackage.notes ? `${activePackage.notes}\n${noteAppend}` : noteAppend;

  const updatedPackage: PackageRecord = {
    ...activePackage,
    usedCredits: activePackage.usedCredits + 1,
    remainingCredits: newRemaining,
    status: isExhausted ? 'EXHAUSTED' : 'ACTIVE',
    exhaustedAt: isExhausted ? now.toISOString() : null,
    notes: updatedNotes,
    updatedAt: now.toISOString(),
  };

  // Grava na persistência local
  const existsInLocal = allUserPackages.some((p) => p.id === activePackage.id);
  const updatedList = existsInLocal
    ? allUserPackages.map((p) => (p.id === activePackage.id ? updatedPackage : p))
    : [updatedPackage, ...allUserPackages];
  setPackagesStore(userId, updatedList);

  // Tenta persistir no Prisma
  if (process.env.DATABASE_URL) {
    try {
      await (prisma as any).package?.update({
        where: { id: activePackage.id },
        data: {
          usedCredits: { increment: 1 },
          remainingCredits: newRemaining,
          status: isExhausted ? 'EXHAUSTED' : 'ACTIVE',
          exhaustedAt: isExhausted ? now : null,
          notes: updatedNotes,
        },
      });
    } catch (e) {
      // Fallback seguro
    }
  }

  // 4. Notificações automáticas
  try {
    if (newRemaining === 1) {
      await sendNotification(userId, 'package_nearly_exhausted', {
        nome: 'Utilizador Kizongelu',
        link: '/plano',
      });
    } else if (newRemaining === 0) {
      await sendNotification(userId, 'package_exhausted', {
        nome: 'Utilizador Kizongelu',
        link: '/plano',
      });
    }
  } catch (notifErr) {
    console.warn('[Packages] Erro no envio de notificação:', notifErr);
  }

  // 5. Auditoria
  await logAuditEvent({
    event: 'PACKAGE_CREDIT_CONSUMED',
    userId,
    details: {
      projectId,
      packageId: activePackage.id,
      remainingCredits: newRemaining,
      status: updatedPackage.status,
    },
    status: 'SUCCESS',
  });

  return updatedPackage;
}

/**
 * 5. getUpgradeQuote(userId, newPlanId)
 * Calcula a prorrata de um upgrade (sem executar).
 * O valor restante dos créditos actuais é descontado do preço do novo pacote.
 */
export async function getUpgradeQuote(
  userId: string,
  newPlanId: string
): Promise<{
  currentCredits: number;
  currentValue: number;
  newPlanPrice: number;
  newPlanCredits: number;
  creditValue: number;
  amountToPay: number;
  creditsToAdd: number;
  newTotalCredits: number;
}> {
  const activePackages = await getActivePackages(userId);
  const activePackage = activePackages[0];

  const planKey = newPlanId.replace(/^plan_/, '');
  const newPlan = PACKAGES_CATALOG[planKey] || PACKAGES_CATALOG[newPlanId];

  if (!newPlan) {
    throw new Error('PLAN_NOT_FOUND');
  }

  // Sem pacote actual — preço integral
  if (!activePackage) {
    return {
      currentCredits: 0,
      currentValue: 0,
      newPlanPrice: newPlan.price,
      newPlanCredits: newPlan.credits,
      creditValue: 0,
      amountToPay: newPlan.price,
      creditsToAdd: newPlan.credits,
      newTotalCredits: newPlan.credits,
    };
  }

  // Valor por crédito do pacote actual
  const creditValue = activePackage.purchaseAmount / (activePackage.totalCredits || 1);
  const remainingValue = creditValue * activePackage.remainingCredits;
  const amountToPay = Math.max(0, newPlan.price - remainingValue);

  return {
    currentCredits: activePackage.remainingCredits,
    currentValue: Math.round(remainingValue),
    newPlanPrice: newPlan.price,
    newPlanCredits: newPlan.credits,
    creditValue: Math.round(creditValue),
    amountToPay: Math.round(amountToPay),
    creditsToAdd: newPlan.credits,
    newTotalCredits: newPlan.credits, // pacote é substituído, não somado
  };
}

/**
 * 6. upgradePackage(userId, newPlanId, paymentId)
 * Executa o upgrade arquivando o pacote anterior e criando o novo pacote com desconto de prorrata.
 */
export async function upgradePackage(
  userId: string,
  newPlanId: string,
  paymentId?: string
): Promise<{ upgraded: boolean; newPackage: PackageRecord }> {
  const quote = await getUpgradeQuote(userId, newPlanId);
  const planKey = newPlanId.replace(/^plan_/, '');
  const newPlan = PACKAGES_CATALOG[planKey] || PACKAGES_CATALOG[newPlanId];

  if (!newPlan) throw new Error('PLAN_NOT_FOUND');

  const now = new Date();
  const allUserPackages = getPackagesStore(userId);

  // 1. Arquivar pacote actual (se existir)
  const updatedOldPackages = allUserPackages.map((p) => {
    if (p.status === 'ACTIVE') {
      return {
        ...p,
        status: 'CANCELLED' as PackageStatusType,
        notes: `${p.notes || ''}\nSubstituído por upgrade para ${newPlan.displayName} em ${now.toISOString()}`,
        updatedAt: now.toISOString(),
      };
    }
    return p;
  });

  // 2. Criar novo pacote
  const newPackage: PackageRecord = {
    id: `pkg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId,
    planId: newPlan.id,
    totalCredits: newPlan.credits,
    usedCredits: 0,
    remainingCredits: newPlan.credits,
    status: 'ACTIVE',
    purchasedAt: now.toISOString(),
    exhaustedAt: null,
    expiresAt: null,
    purchaseAmount: quote.amountToPay,
    paymentId: paymentId || `pay_upgrade_${Date.now()}`,
    createdBy: 'upgrade',
    notes: `Upgrade para ${newPlan.displayName}. Créditos anteriores (${quote.currentCredits}) convertidos em desconto de ${quote.currentValue} Kz.`,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    plan: newPlan,
  };

  updatedOldPackages.unshift(newPackage);
  setPackagesStore(userId, updatedOldPackages);

  // Tenta persistir no Prisma
  if (process.env.DATABASE_URL) {
    try {
      await (prisma as any).package?.updateMany({
        where: { userId, status: 'ACTIVE' },
        data: {
          status: 'CANCELLED',
        },
      });

      await (prisma as any).package?.create({
        data: {
          id: newPackage.id,
          userId: newPackage.userId,
          planId: newPackage.planId,
          totalCredits: newPackage.totalCredits,
          usedCredits: 0,
          remainingCredits: newPackage.remainingCredits,
          status: 'ACTIVE',
          purchaseAmount: newPackage.purchaseAmount,
          paymentId: newPackage.paymentId,
          notes: newPackage.notes,
        },
      });
    } catch (e) {
      // Fallback
    }
  }

  // 3. Auditoria
  await logAuditEvent({
    event: 'PACKAGE_UPGRADED',
    userId,
    details: {
      newPlanId: newPlan.id,
      amountToPay: quote.amountToPay,
      credits: newPlan.credits,
    },
    status: 'SUCCESS',
  });

  return { upgraded: true, newPackage };
}

export interface PurchasePackageOptions {
  paymentId?: string;
  paymentMethod?: 'MULTICAIXA_EXPRESS' | 'REFERENCIA' | 'TRANSFERENCIA' | string;
  proofUrl?: string;
  notes?: string;
  status?: PackageStatusType;
}

/**
 * 7. purchasePackage(userId, planId, optionsOrPaymentId)
 * Compra de um novo pacote de orçamentos (com suporte a PENDING_PAYMENT e proofUrl).
 */
export async function purchasePackage(
  userId: string,
  planId: string,
  optionsOrPaymentId?: string | PurchasePackageOptions
): Promise<PackageRecord> {
  const options: PurchasePackageOptions =
    typeof optionsOrPaymentId === 'string'
      ? { paymentId: optionsOrPaymentId }
      : optionsOrPaymentId || {};

  const planKey = planId.replace(/^plan_/, '');
  const plan = PACKAGES_CATALOG[planKey] || PACKAGES_CATALOG[planId];

  if (!plan) throw new Error('PLAN_NOT_FOUND');

  const now = new Date();
  const initialStatus: PackageStatusType =
    options.status ||
    (options.proofUrl || options.paymentMethod === 'TRANSFERENCIA' ? 'PENDING_PAYMENT' : 'ACTIVE');
  const initialRemainingCredits = initialStatus === 'PENDING_PAYMENT' ? 0 : plan.credits;

  const pkg: PackageRecord = {
    id: `pkg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId,
    planId: plan.id,
    totalCredits: plan.credits,
    usedCredits: 0,
    remainingCredits: initialRemainingCredits,
    status: initialStatus,
    purchasedAt: now.toISOString(),
    exhaustedAt: null,
    expiresAt: null,
    purchaseAmount: plan.price,
    paymentId: options.paymentId || `pay_${Date.now()}`,
    paymentMethod: options.paymentMethod || 'TRANSFERENCIA',
    proofUrl: options.proofUrl || null,
    createdBy: 'purchase',
    notes:
      options.notes ||
      (initialStatus === 'PENDING_PAYMENT'
        ? `Aquisição do pacote ${plan.displayName} a aguardar validação de comprovativo bancário.`
        : `Compra de pacote ${plan.displayName} com ${plan.credits} orçamentos permanentes.`),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    plan,
  };

  const existing = getPackagesStore(userId);
  setPackagesStore(userId, [pkg, ...existing]);

  if (process.env.DATABASE_URL) {
    try {
      await (prisma as any).package?.create({
        data: {
          id: pkg.id,
          userId: pkg.userId,
          planId: pkg.planId,
          totalCredits: pkg.totalCredits,
          usedCredits: 0,
          remainingCredits: pkg.remainingCredits,
          status: pkg.status,
          purchaseAmount: pkg.purchaseAmount,
          paymentId: pkg.paymentId,
          proofUrl: pkg.proofUrl,
          notes: pkg.notes,
        },
      });
    } catch (e) {
      // Fallback
    }
  }

  try {
    await sendNotification(userId, 'package_purchased', {
      nome: 'Utilizador Kizongelu',
      valor: plan.price,
      link: '/plano',
    });
  } catch (notifErr) {
    // Fallback
  }

  await logAuditEvent({
    event: 'PACKAGE_PURCHASED',
    userId,
    details: {
      packageId: pkg.id,
      planId: plan.id,
      credits: plan.credits,
      price: plan.price,
      status: pkg.status,
      proofUrl: pkg.proofUrl,
      paymentMethod: pkg.paymentMethod,
    },
    status: 'SUCCESS',
  });

  return pkg;
}

/**
 * 8. approvePackagePurchase(packageId, adminId)
 * Aprova pacote pendente, ativando os créditos e notificando o utilizador.
 */
export async function approvePackagePurchase(
  packageId: string,
  adminId: string = 'usr_admin_master'
): Promise<PackageRecord> {
  let targetPkg: PackageRecord | null = null;
  let targetUserId: string | null = null;

  for (const [uid, list] of Object.entries(inMemoryPackagesStore)) {
    const found = list.find((p) => p.id === packageId);
    if (found) {
      targetPkg = found;
      targetUserId = uid;
      break;
    }
  }

  if (!targetPkg && typeof window !== 'undefined') {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_PACKAGES_KEY)) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const list: PackageRecord[] = JSON.parse(raw);
            const found = list.find((p) => p.id === packageId);
            if (found) {
              targetPkg = found;
              targetUserId = found.userId;
              break;
            }
          }
        }
      }
    } catch (_) {}
  }

  const now = new Date();

  if (targetPkg && targetUserId) {
    targetPkg.status = 'ACTIVE';
    targetPkg.remainingCredits = targetPkg.totalCredits - targetPkg.usedCredits;
    targetPkg.updatedAt = now.toISOString();
    targetPkg.notes = `${targetPkg.notes || ''} [Aprovado pelo admin ${adminId} em ${now.toLocaleString('pt-AO')}]`;

    const store = getPackagesStore(targetUserId);
    const updatedStore = store.map((p) => (p.id === packageId ? targetPkg! : p));
    setPackagesStore(targetUserId, updatedStore);
  }

  if (process.env.DATABASE_URL) {
    try {
      const dbUpdated = await (prisma as any).package?.update({
        where: { id: packageId },
        data: {
          status: 'ACTIVE',
          remainingCredits: {
            set: targetPkg ? targetPkg.totalCredits - targetPkg.usedCredits : undefined,
          },
          updatedAt: now,
        },
        include: { plan: true },
      });
      if (dbUpdated) {
        targetPkg = {
          ...dbUpdated,
          purchaseAmount: Number(dbUpdated.purchaseAmount),
          purchasedAt:
            dbUpdated.purchasedAt instanceof Date ? dbUpdated.purchasedAt.toISOString() : dbUpdated.purchasedAt,
          createdAt: dbUpdated.createdAt instanceof Date ? dbUpdated.createdAt.toISOString() : dbUpdated.createdAt,
          updatedAt: dbUpdated.updatedAt instanceof Date ? dbUpdated.updatedAt.toISOString() : dbUpdated.updatedAt,
        };
        targetUserId = dbUpdated.userId;
      }
    } catch (e) {
      // Fallback
    }
  }

  if (!targetPkg) {
    throw new Error('PACKAGE_NOT_FOUND');
  }

  if (targetUserId) {
    try {
      await sendNotification(targetUserId, 'package_approved' as any, {
        nome: 'Utilizador Kizongelu',
        valor: targetPkg.purchaseAmount,
        link: '/plano',
      });
    } catch (_) {}

    await logAuditEvent({
      event: 'PACKAGE_APPROVED' as any,
      userId: targetUserId,
      details: {
        packageId: targetPkg.id,
        planId: targetPkg.planId,
        credits: targetPkg.remainingCredits,
        adminId,
      },
      status: 'SUCCESS',
    });
  }

  return targetPkg;
}

/**
 * 9. rejectPackagePurchase(packageId, adminId, reason)
 * Rejeita compra de pacote e cancela o pacote pendente.
 */
export async function rejectPackagePurchase(
  packageId: string,
  adminId: string = 'usr_admin_master',
  reason: string = 'Comprovativo ilegível ou não correspondente'
): Promise<PackageRecord> {
  let targetPkg: PackageRecord | null = null;
  let targetUserId: string | null = null;

  for (const [uid, list] of Object.entries(inMemoryPackagesStore)) {
    const found = list.find((p) => p.id === packageId);
    if (found) {
      targetPkg = found;
      targetUserId = uid;
      break;
    }
  }

  const now = new Date();

  if (targetPkg && targetUserId) {
    targetPkg.status = 'CANCELLED';
    targetPkg.remainingCredits = 0;
    targetPkg.updatedAt = now.toISOString();
    targetPkg.notes = `${targetPkg.notes || ''} [Rejeitado pelo admin ${adminId}: ${reason}]`;

    const store = getPackagesStore(targetUserId);
    const updatedStore = store.map((p) => (p.id === packageId ? targetPkg! : p));
    setPackagesStore(targetUserId, updatedStore);
  }

  if (process.env.DATABASE_URL) {
    try {
      await (prisma as any).package?.update({
        where: { id: packageId },
        data: {
          status: 'CANCELLED',
          remainingCredits: 0,
          notes: `${reason}`,
          updatedAt: now,
        },
      });
    } catch (e) {
      // Fallback
    }
  }

  if (!targetPkg) {
    throw new Error('PACKAGE_NOT_FOUND');
  }

  return targetPkg;
}

/**
 * 10. getPackageHistory(userId)
 * Retorna todos os pacotes comprados pelo utilizador ordenados por data decrescente.
 */
export async function getPackageHistory(userId: string): Promise<PackageRecord[]> {
  if (process.env.DATABASE_URL) {
    try {
      const dbPackages = await (prisma as any).package?.findMany({
        where: { userId },
        include: { plan: true, payment: true },
        orderBy: { purchasedAt: 'desc' },
      });

      if (dbPackages && dbPackages.length > 0) {
        return dbPackages.map((p: any) => ({
          ...p,
          purchaseAmount: Number(p.purchaseAmount),
          purchasedAt: p.purchasedAt instanceof Date ? p.purchasedAt.toISOString() : p.purchasedAt,
          createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
          updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : p.updatedAt,
        }));
      }
    } catch (err) {
      // Fallback
    }
  }

  return getPackagesStore(userId).sort(
    (a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime()
  );
}

/**
 * Utilitário de isolamento para suites de teste
 */
export function _resetPackagesStore(userId?: string): void {
  if (userId) {
    delete inMemoryPackagesStore[userId];
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`${STORAGE_PACKAGES_KEY}_${userId}`);
      } catch (_) {}
    }
  } else {
    for (const key of Object.keys(inMemoryPackagesStore)) {
      delete inMemoryPackagesStore[key];
    }
  }
}

