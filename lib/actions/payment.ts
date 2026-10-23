/**
 * @file lib/actions/payment.ts
 * Server Action e gestão de pagamentos, envio de comprovativos e auditoria .
 * Suporta rate limiting (5 tentativas/hora/projeto), validação de anexos (JPG, PNG, PDF até 10MB),
 * persistência de pagamentos, notificações admin/user e aprovação de desbloqueio.
 */

import { checkRateLimit } from '../rate-limit';
import { logAuditEvent } from '../audit';
import { unlockProject } from './preview';
import { getProjectDraft } from './wizard';
import { prisma } from '../db/prisma';
import { generateOrcamentoPdf } from '../pdf/generate-orcamento';
import { sendNotification } from '../notifications';
import { z } from 'zod';

export const submitPaymentSchema = z.object({
  projectId: z.string().min(1, 'ID do projeto obrigatório'),
  userId: z.string().optional().default('usr_particular_default'),
  reference: z.string().optional(),
  method: z.enum(['TRANSFERENCIA', 'MULTICAIXA_EXPRESS']).optional().default('TRANSFERENCIA'),
  fileUrl: z.string().min(1, 'Comprovativo obrigatório'),
  fileName: z.string().min(1, 'Nome do ficheiro obrigatório'),
  fileSize: z.number().max(10 * 1024 * 1024, 'Ficheiro não pode exceder 10MB'),
  fileType: z.string().min(1),
  notes: z.string().max(500).optional(),
});

export const reviewPaymentSchema = z.object({
  paymentId: z.string().min(1, 'ID do pagamento obrigatório'),
  action: z.enum(['APPROVE', 'REJECT']),
  adminId: z.string().min(1, 'ID do administrador obrigatório'),
  reason: z.string().optional(),
});

export interface BankConfig {
  banco: string;
  iban: string;
  titular: string;
  nif?: string;
  mcxTelefone: string;
  suporteWhatsapp: string;
  suporteTelefone: string;
  valorPadraoKz: number;
}

export const ADMIN_BANK_CONFIG: BankConfig = {
  banco: 'Transferência bancária',
  iban: 'AO06 0040 0000 4892 1042 1014 9',
  titular: 'Kizongelu',
  mcxTelefone: '+244 923 000 111',
  suporteWhatsapp: '+244 923 000 111',
  suporteTelefone: '+244 923 000 111',
  valorPadraoKz: 12999,
};

export type PaymentMethod = 'TRANSFERENCIA' | 'MULTICAIXA_EXPRESS';
export type PaymentStatusType = 'PENDING' | 'PROOF_RECEIVED' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface PaymentRecord {
  id: string;
  projectId: string;
  projectName?: string;
  userId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatusType;
  reference: string;
  proofUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  notes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InAppNotification {
  id: string;
  userId: string;
  recipientRole: 'USER' | 'ADMIN';
  type: 'PAYMENT_PROOF_RECEIVED' | 'PAYMENT_APPROVED' | 'PAYMENT_REJECTED' | 'PROJECT_UNLOCKED' | 'PDF_READY';
  title: string;
  message: string;
  projectId?: string;
  paymentId?: string;
  read: boolean;
  createdAt: string;
}

// Armazenamento em memória para pagamentos e notificações
const MEMORY_PAYMENTS = new Map<string, PaymentRecord>();
const MEMORY_NOTIFICATIONS: InAppNotification[] = [];

/**
 * Gera uma referência bancária de pagamento auto-gerada no formato KZ-2025-XXXX
 */
export function generatePaymentReference(projectId: string): string {
  const currentYear = new Date().getFullYear();
  // Cria código determinístico a partir do ID do projeto
  let hash = 0;
  for (let i = 0; i < projectId.length; i++) {
    hash = (hash << 5) - hash + projectId.charCodeAt(i);
    hash |= 0;
  }
  const positiveNum = Math.abs(hash) % 9000 + 1000;
  return `KZ-${currentYear}-${positiveNum}`;
}

/**
 * Obtém os dados bancários e referência de pagamento para o projeto
 */
export function getPaymentInstructions(projectId: string) {
  const reference = generatePaymentReference(projectId);
  return {
    ...ADMIN_BANK_CONFIG,
    referencia: reference,
    textoCopiaTudo: `Dados de Pagamento Kizongelu:\nModalidade: Transferência bancária\nIBAN: ${ADMIN_BANK_CONFIG.iban}\nTitular: ${ADMIN_BANK_CONFIG.titular}\nNIF: ${ADMIN_BANK_CONFIG.nif}\nReferência: ${reference}\nValor: ${ADMIN_BANK_CONFIG.valorPadraoKz.toLocaleString('pt-PT')} Kz`,
  };
}

export interface SubmitPaymentProofInput {
  projectId: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  notes?: string;
  method?: PaymentMethod;
  userId?: string;
}

/**
 * Submete o comprovativo de pagamento (Server Action)
 * Aplica rate limiting (máx 5 por hora por projeto), valida ficheiro e notifica admin e utilizador.
 */
export async function submitPaymentProof(
  input: SubmitPaymentProofInput
): Promise<{ success: boolean; payment?: PaymentRecord; error?: string }> {
  const validated = submitPaymentSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0]?.message || 'Dados de pagamento inválidos.' };
  }

  const {
    projectId,
    fileUrl,
    fileName,
    fileSize,
    fileType,
    notes = '',
    method = 'TRANSFERENCIA',
    userId = 'usr_particular_default',
  } = validated.data;

  // 1. Rate Limiting: Máximo 5 tentativas de upload por projeto por hora (3600 segundos)
  const rateLimitCheck = await checkRateLimit(`upload_proof:${projectId}`, 5, 3600);
  if (!rateLimitCheck.success) {
    return {
      success: false,
      error: `Limite de tentativas excedido (máximo 5 envios por hora). Por favor, aguarde ${Math.ceil(
        rateLimitCheck.resetInSeconds / 60
      )} minutos antes de tentar novamente.`,
    };
  }

  // 2. Validação do arquivo
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  if (fileType && !allowedTypes.includes(fileType.toLowerCase()) && !fileName.match(/\.(jpg|jpeg|png|pdf)$/i)) {
    return { success: false, error: 'Formato não suportado. Envie comprovativo em JPG, PNG ou PDF.' };
  }

  const now = new Date().toISOString();
  const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const reference = generatePaymentReference(projectId);

  const newPayment: PaymentRecord = {
    id: paymentId,
    projectId,
    userId,
    amount: ADMIN_BANK_CONFIG.valorPadraoKz,
    currency: 'Kz',
    method: method as PaymentMethod,
    status: 'PROOF_RECEIVED',
    reference,
    proofUrl: fileUrl,
    fileName,
    fileSize,
    fileType,
    notes: notes.trim(),
    createdAt: now,
    updatedAt: now,
  };

  // 3. Persistência em memória e localStorage
  MEMORY_PAYMENTS.set(paymentId, newPayment);
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(`Kizongelu_payment_${projectId}`, JSON.stringify(newPayment));
      const allPaymentsRaw = window.localStorage.getItem('Kizongelu_all_payments') || '[]';
      const allPayments: PaymentRecord[] = JSON.parse(allPaymentsRaw);
      allPayments.unshift(newPayment);
      window.localStorage.setItem('Kizongelu_all_payments', JSON.stringify(allPayments.slice(0, 50)));
    } catch (_) {}
  }

  // Tenta persistir no Prisma se configurado
  try {
    if (prisma && process.env.DATABASE_URL) {
      await prisma.payment.create({
        data: {
          id: paymentId,
          userId,
          projectId,
          amount: newPayment.amount,
          method,
          status: 'PROOF_RECEIVED',
          proofUrl: fileUrl,
          notes: notes.trim() || null,
        },
        select: {
          id: true,
          status: true,
          amount: true,
        },
      });
    }
  } catch (err) {
    console.warn('[Payment] Aviso ao salvar no Prisma (ignorado para fallback):', err);
  }

  // 4. Registo de Auditoria
  await logAuditEvent({
    event: 'PAYMENT_PROOF_SUBMITTED',
    userId,
    details: {
      projectId,
      paymentId,
      reference,
      amount: newPayment.amount,
      method,
      fileName,
      fileSize,
    },
  });

  // 5. Notificação ao Administrador (in-app + email)
  const adminNotif: InAppNotification = {
    id: `notif_admin_${Date.now()}`,
    userId: 'admin',
    recipientRole: 'ADMIN',
    type: 'PAYMENT_PROOF_RECEIVED',
    title: 'Novo Comprovativo de Pagamento',
    message: `O cliente submeteu o comprovativo de ${newPayment.amount.toLocaleString(
      'pt-PT'
    )} Kz para o projeto ${projectId} (Ref: ${reference}).`,
    projectId,
    paymentId,
    read: false,
    createdAt: now,
  };
  MEMORY_NOTIFICATIONS.unshift(adminNotif);

  // 6. Notificação ao Utilizador
  const userNotif: InAppNotification = {
    id: `notif_user_${Date.now()}`,
    userId,
    recipientRole: 'USER',
    type: 'PAYMENT_PROOF_RECEIVED',
    title: 'Comprovativo Recebido',
    message: 'Comprovativo recebido com sucesso — a nossa equipa financeira está em análise.',
    projectId,
    paymentId,
    read: false,
    createdAt: now,
  };
  MEMORY_NOTIFICATIONS.unshift(userNotif);

  return {
    success: true,
    payment: newPayment,
  };
}

export interface PaymentTimelineStep {
  step: number;
  label: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | 'REJECTED';
  date?: string;
  description: string;
}

export interface PaymentStatusResponse {
  hasPayment: boolean;
  payment: PaymentRecord | null;
  projectStatus: 'DRAFT' | 'ESTIMATED' | 'UNLOCKED';
  isUnlocked: boolean;
  hoursPending: number;
  isPendingOver24h: boolean;
  timeline: PaymentTimelineStep[];
}

/**
 * Consulta o estado atual do pagamento de um projeto
 */
export async function getPaymentStatus(projectId: string): Promise<PaymentStatusResponse> {
  let payment: PaymentRecord | null = null;

  // Procura em memória
  for (const p of MEMORY_PAYMENTS.values()) {
    if (p.projectId === projectId) {
      payment = p;
      break;
    }
  }

  // Fallback do localStorage se no browser
  if (!payment && typeof window !== 'undefined' && window.localStorage) {
    const raw = window.localStorage.getItem(`Kizongelu_payment_${projectId}`);
    if (raw) {
      try {
        payment = JSON.parse(raw);
      } catch (_) {}
    }
  }

  // Verifica se o projeto está desbloqueado no localStorage
  let isUnlocked = false;
  if (typeof window !== 'undefined' && window.localStorage) {
    isUnlocked = window.localStorage.getItem(`Kizongelu_unlocked_${projectId}`) === 'true';
  }

  // Consulta à base de dados relacional via Prisma com select explícito
  if (!payment && prisma && process.env.DATABASE_URL) {
    try {
      const dbP = await prisma.payment.findFirst({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          projectId: true,
          userId: true,
          amount: true,
          method: true,
          status: true,
          proofUrl: true,
          reviewedBy: true,
          reviewedAt: true,
          notes: true,
          createdAt: true,
          project: {
            select: { name: true, status: true },
          },
        },
      });
      if (dbP) {
        payment = {
          id: dbP.id,
          projectId: dbP.projectId || projectId,
          projectName: dbP.project?.name,
          userId: dbP.userId,
          amount: Number(dbP.amount),
          currency: 'Kz',
          method: (dbP.method as PaymentMethod) || 'TRANSFERENCIA',
          status: dbP.status as PaymentStatusType,
          reference: generatePaymentReference(dbP.projectId || projectId),
          proofUrl: dbP.proofUrl || '',
          fileName: 'comprovativo.pdf',
          fileSize: 1024,
          fileType: 'application/pdf',
          notes: dbP.notes || undefined,
          reviewedBy: dbP.reviewedBy || undefined,
          reviewedAt: dbP.reviewedAt ? dbP.reviewedAt.toISOString() : undefined,
          createdAt: dbP.createdAt.toISOString(),
          updatedAt: dbP.createdAt.toISOString(),
        };
        if (dbP.project?.status === 'UNLOCKED') {
          isUnlocked = true;
        }
      }
    } catch (_) {}
  }

  const projectDraft = await getProjectDraft(projectId);
  const projectStatus = isUnlocked
    ? 'UNLOCKED'
    : projectDraft?.status === 'ESTIMATED'
    ? 'ESTIMATED'
    : 'DRAFT';

  if (!payment) {
    return {
      hasPayment: false,
      payment: null,
      projectStatus,
      isUnlocked,
      hoursPending: 0,
      isPendingOver24h: false,
      timeline: [
        {
          step: 1,
          label: 'Comprovativo enviado',
          status: 'PENDING',
          description: 'Aguardando o envio do comprovativo de pagamento.',
        },
        {
          step: 2,
          label: 'Em análise',
          status: 'PENDING',
          description: 'Validação da transferência pela equipa de tesouraria.',
        },
        {
          step: 3,
          label: 'Aprovação',
          status: 'PENDING',
          description: 'Confirmação do crédito e emissão do recibo.',
        },
        {
          step: 4,
          label: 'Documento concluído',
          status: isUnlocked ? 'COMPLETED' : 'PENDING',
          description: 'Acesso imediato ao mapa de quantidades e download em PDF.',
        },
      ],
    };
  }

  const createdAtMs = new Date(payment.createdAt).getTime();
  const nowMs = Date.now();
  const hoursPending = Math.max(0, (nowMs - createdAtMs) / (1000 * 60 * 60));
  const isPendingOver24h = (payment.status === 'PROOF_RECEIVED' || payment.status === 'IN_REVIEW') && hoursPending >= 24;

  const isApproved = payment.status === 'APPROVED' || isUnlocked;
  const isRejected = payment.status === 'REJECTED';

  const timeline: PaymentTimelineStep[] = [
    {
      step: 1,
      label: 'Comprovativo enviado',
      status: 'COMPLETED',
      date: new Date(payment.createdAt).toLocaleString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      description: `Ficheiro "${payment.fileName}" recebido com sucesso via ${
        payment.method === 'TRANSFERENCIA' ? 'Transferência Bancária' : 'MULTICAIXA Express'
      }.`,
    },
    {
      step: 2,
      label: 'Em análise',
      status: isApproved ? 'COMPLETED' : isRejected ? 'REJECTED' : 'IN_PROGRESS',
      description: isApproved
        ? 'Verificação financeira concluída com sucesso.'
        : isRejected
        ? 'Validação recusada pela equipa de tesouraria.'
        : 'A nossa equipa financeira está a conferir o crédito em conta.',
    },
    {
      step: 3,
      label: 'Aprovação',
      status: isApproved ? 'COMPLETED' : isRejected ? 'REJECTED' : 'PENDING',
      date: payment.reviewedAt
        ? new Date(payment.reviewedAt).toLocaleString('pt-PT', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })
        : undefined,
      description: isApproved
        ? 'Pagamento de 12.999 Kz aprovado pelo administrador.'
        : isRejected
        ? `Recusado: ${payment.rejectionReason || 'Comprovativo ilegível.'}`
        : 'Confirmação do crédito e ativação de privilégios.',
    },
    {
      step: 4,
      label: 'Documento concluído',
      status: isApproved ? 'COMPLETED' : 'PENDING',
      description: isApproved
        ? 'Orçamento completo, mapa de quantidades e PDF liberados para acesso vitalício.'
        : 'Download e partilha protegidos por paywall.',
    },
  ];

  return {
    hasPayment: true,
    payment,
    projectStatus: isApproved ? 'UNLOCKED' : projectStatus,
    isUnlocked: isApproved,
    hoursPending: Math.round(hoursPending * 10) / 10,
    isPendingOver24h,
    timeline,
  };
}

/**
 * Ação de Admin: Aprovação ou Rejeição de Comprovativo de Pagamento
 */
export async function reviewPayment(params: {
  paymentId: string;
  action: 'APPROVE' | 'REJECT';
  adminId?: string;
  rejectionReason?: string;
}): Promise<{ success: boolean; message: string; payment?: PaymentRecord }> {
  const validation = reviewPaymentSchema.safeParse({
    paymentId: params.paymentId,
    action: params.action,
    adminId: params.adminId || 'usr_admin_master',
    reason: params.rejectionReason,
  });
  if (!validation.success) {
    return { success: false, message: validation.error.issues[0]?.message || 'Parâmetros de validação inválidos.' };
  }

  const { paymentId, action, adminId, reason: rejectionReason } = validation.data;

  let payment = MEMORY_PAYMENTS.get(paymentId);
  if (!payment && typeof window !== 'undefined' && window.localStorage) {
    const rawAll = window.localStorage.getItem('Kizongelu_all_payments');
    if (rawAll) {
      try {
        const list: PaymentRecord[] = JSON.parse(rawAll);
        payment = list.find((p) => p.id === paymentId);
      } catch (_) {}
    }
  }

  if (!payment && prisma && process.env.DATABASE_URL) {
    try {
      const dbP = await prisma.payment.findUnique({
        where: { id: paymentId },
        select: {
          id: true,
          projectId: true,
          userId: true,
          amount: true,
          method: true,
          status: true,
          proofUrl: true,
          reviewedBy: true,
          reviewedAt: true,
          notes: true,
          createdAt: true,
          project: {
            select: { name: true },
          },
        },
      });
      if (dbP) {
        payment = {
          id: dbP.id,
          projectId: dbP.projectId || '',
          projectName: dbP.project?.name,
          userId: dbP.userId,
          amount: Number(dbP.amount),
          currency: 'Kz',
          method: (dbP.method as PaymentMethod) || 'TRANSFERENCIA',
          status: dbP.status as PaymentStatusType,
          reference: generatePaymentReference(dbP.projectId || 'proj'),
          proofUrl: dbP.proofUrl || '',
          fileName: 'comprovativo.pdf',
          fileSize: 1024,
          fileType: 'application/pdf',
          notes: dbP.notes || undefined,
          reviewedBy: dbP.reviewedBy || undefined,
          reviewedAt: dbP.reviewedAt ? dbP.reviewedAt.toISOString() : undefined,
          createdAt: dbP.createdAt.toISOString(),
          updatedAt: dbP.createdAt.toISOString(),
        };
      }
    } catch (_) {}
  }

  if (!payment) {
    return { success: false, message: 'Registo de pagamento não encontrado.' };
  }

  const now = new Date().toISOString();
  payment.updatedAt = now;
  payment.reviewedAt = now;
  payment.reviewedBy = adminId;

  if (action === 'APPROVE') {
    payment.status = 'APPROVED';
    MEMORY_PAYMENTS.set(paymentId, payment);

    // Persistência atómica via transação Prisma quando em ambiente com Base de Dados
    if (prisma && process.env.DATABASE_URL) {
      try {
        await prisma.$transaction([
          prisma.payment.update({
            where: { id: paymentId },
            data: {
              status: 'APPROVED',
              reviewedBy: adminId,
              reviewedAt: new Date(),
            },
            select: {
              id: true,
              status: true,
            },
          }),
          prisma.project.update({
            where: { id: payment.projectId },
            data: {
              status: 'UNLOCKED',
              updatedAt: new Date(),
            },
            select: {
              id: true,
              status: true,
            },
          }),
        ]);
      } catch (err) {
        console.warn('[Payment] Aviso ao aprovar com prisma.$transaction:', err);
      }
    }

    // Desbloqueia o projeto oficialmente
    await unlockProject(payment.projectId, 'PARTICULAR', false);

    // Persiste no storage
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(`Kizongelu_payment_${payment.projectId}`, JSON.stringify(payment));
      window.localStorage.setItem(`Kizongelu_unlocked_${payment.projectId}`, 'true');
    }

    // Registo de auditoria
    await logAuditEvent({
      event: 'PAYMENT_APPROVED',
      userId: adminId,
      details: {
        paymentId,
        projectId: payment.projectId,
        amount: payment.amount,
        reference: payment.reference,
      },
    });

    // Notificações ao Utilizador via Sistema Multicanal (Fase 12)
    sendNotification(payment.userId, 'approved', {
      nome: 'Estimado(a) Cliente',
      projectName: payment.projectName || 'Projeto de Construção',
      valor: `${payment.amount.toLocaleString('pt-PT')} Kz`,
      id: paymentId,
      data: now,
      link: `/projetos/${payment.projectId}`,
    }).catch((err) => console.warn('[Notification] Aviso no envio multicanal:', err));

    MEMORY_NOTIFICATIONS.unshift({
      id: `notif_appr_${Date.now()}`,
      userId: payment.userId,
      recipientRole: 'USER',
      type: 'PAYMENT_APPROVED',
      title: 'Pagamento Aprovado! 🎉',
      message: 'O seu orçamento completo e mapa de quantidades foram emitidos com sucesso. Já pode baixar o PDF oficial.',
      projectId: payment.projectId,
      paymentId,
      read: false,
      createdAt: now,
    });

    // Geração assíncrona inicial em background do PDF e notificação de conclusão
    const projId = payment.projectId;
    const usrId = payment.userId;
    generateOrcamentoPdf(projId, { userId: usrId })
      .then((pdfResult) => {
        MEMORY_NOTIFICATIONS.unshift({
          id: `notif_pdf_ready_${Date.now()}`,
          userId: usrId,
          recipientRole: 'USER',
          type: 'PDF_READY',
          title: 'PDF Oficial com QR Pronto! 📄',
          message: 'O seu Orçamento e Mapa de Quantidades com código QR de verificação já foi gerado e está pronto para descarregar ou partilhar.',
          projectId: projId,
          read: false,
          createdAt: new Date().toISOString(),
        });
      })
      .catch((err) => {
        console.warn('[PDF] Aviso na geração em background:', err);
      });

    return {
      success: true,
      message: 'Pagamento aprovado com sucesso e projeto concluído.',
      payment,
    };
  } else {
    payment.status = 'REJECTED';
    payment.rejectionReason = rejectionReason || 'Comprovativo não identificado ou valor incorreto.';
    MEMORY_PAYMENTS.set(paymentId, payment);

    if (prisma && process.env.DATABASE_URL) {
      try {
        await prisma.payment.update({
          where: { id: paymentId },
          data: {
            status: 'REJECTED',
            reviewedBy: adminId,
            reviewedAt: new Date(),
            notes: payment.rejectionReason,
          },
          select: {
            id: true,
            status: true,
          },
        });
      } catch (err) {
        console.warn('[Payment] Aviso ao rejeitar no Prisma:', err);
      }
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(`Kizongelu_payment_${payment.projectId}`, JSON.stringify(payment));
    }

    // Registo de auditoria
    await logAuditEvent({
      event: 'PAYMENT_REJECTED',
      userId: adminId,
      details: {
        paymentId,
        projectId: payment.projectId,
        reason: payment.rejectionReason,
      },
      status: 'WARNING',
    });

    // Notificação ao utilizador via Sistema Multicanal (Fase 12)
    sendNotification(payment.userId, 'rejected', {
      nome: 'Estimado(a) Cliente',
      projectName: payment.projectName || 'Projeto de Construção',
      valor: `${payment.amount.toLocaleString('pt-PT')} Kz`,
      id: paymentId,
      data: now,
      motivo: payment.rejectionReason,
      link: `/projetos/${payment.projectId}/desbloquear`,
    }).catch((err) => console.warn('[Notification] Aviso no envio multicanal de rejeição:', err));

    MEMORY_NOTIFICATIONS.unshift({
      id: `notif_rej_${Date.now()}`,
      userId: payment.userId,
      recipientRole: 'USER',
      type: 'PAYMENT_REJECTED',
      title: 'Comprovativo Recusado',
      message: `O seu comprovativo foi recusado. Motivo: ${payment.rejectionReason}`,
      projectId: payment.projectId,
      paymentId,
      read: false,
      createdAt: now,
    });

    return {
      success: true,
      message: 'Comprovativo recusado com sucesso.',
      payment,
    };
  }
}

/**
 * Retorna as notificações em memória
 */
export function getNotifications(userId?: string): InAppNotification[] {
  if (!userId) return [...MEMORY_NOTIFICATIONS];
  return MEMORY_NOTIFICATIONS.filter((n) => n.userId === userId || n.recipientRole === 'ADMIN');
}

/**
 * Marca notificação como lida
 */
export function markNotificationAsRead(notificationId: string): void {
  const notif = MEMORY_NOTIFICATIONS.find((n) => n.id === notificationId);
  if (notif) {
    notif.read = true;
  }
}

/**
 * Limpa todos os pagamentos em memória (para testes unitários)
 */
export function clearPaymentsStore(): void {
  MEMORY_PAYMENTS.clear();
  MEMORY_NOTIFICATIONS.length = 0;
}
