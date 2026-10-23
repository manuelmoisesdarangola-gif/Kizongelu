/**
 * @file lib/audit.ts
 * Registo de logs de auditoria para ações de autenticação e segurança.
 * Suporta persistência na tabela AuditLog do Prisma e cache em memória para visualização rápida.
 */

import { prisma } from './db/prisma';

export type AuthAuditEvent =
  | 'USER_REGISTERED'
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'PASSWORD_RESET_REQUESTED'
  | 'PASSWORD_RESET_COMPLETED'
  | 'USER_LOGOUT'
  | 'EMAIL_CONFIRMED'
  | 'ROLE_ACCESS_DENIED'
  | 'PRICE_CREATED'
  | 'PRICE_UPDATED'
  | 'PRICES_BULK_DUPLICATED'
  | 'PRICE_DEACTIVATED'
  | 'PRICES_CSV_IMPORTED'
  | 'CALCULATION_SAVED'
  | 'PROJECT_CREATED'
  | 'PAYMENT_PROOF_SUBMITTED'
  | 'PAYMENT_APPROVED'
  | 'PAYMENT_REJECTED'
  | 'PAYMENT_STATUS_CHANGED'
  | 'PROJECT_UNLOCKED'
  | 'PDF_GENERATED'
  | 'PDF_DOWNLOADED'
  | 'SHARE_LINK_CREATED'
  | 'SHARE_LINK_REVOKED'
  | 'DOCUMENT_VERIFIED'
  | 'PROJECT_UPDATED'
  | 'USER_UPDATED'
  | 'SUBSCRIPTION_CREATED'
  | 'SUBSCRIPTION_UPGRADED'
  | 'SUBSCRIPTION_DOWNGRADE_SCHEDULED'
  | 'SUBSCRIPTION_CANCELLED'
  | 'SUBSCRIPTION_REACTIVATED'
  | 'SUBSCRIPTION_RENEWED'
  | 'TEAM_INVITATION_SENT'
  | 'PACKAGE_PURCHASED'
  | 'PACKAGE_CREDIT_CONSUMED'
  | 'PACKAGE_UPGRADED'
  | 'PACKAGE_EXHAUSTED';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  event: AuthAuditEvent;
  userId?: string;
  userEmail?: string;
  ip?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
  status: 'SUCCESS' | 'WARNING' | 'ERROR';
}

// Histórico em memória recente para inspecção na UI e testes
const recentAuditLogs: AuditLogEntry[] = [];

/**
 * Cria uma entrada de log de auditoria.
 */
export async function logAuditEvent(params: {
  event: AuthAuditEvent;
  userId?: string;
  userEmail?: string;
  ip?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
  status?: 'SUCCESS' | 'WARNING' | 'ERROR';
}): Promise<AuditLogEntry> {
  const entry: AuditLogEntry = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    event: params.event,
    userId: params.userId,
    userEmail: params.userEmail,
    ip: params.ip || '127.0.0.1',
    userAgent: params.userAgent || 'App-Client',
    details: params.details || {},
    status: params.status || 'SUCCESS',
  };

  // Armazena na memória recente (máx 100)
  recentAuditLogs.unshift(entry);
  if (recentAuditLogs.length > 100) {
    recentAuditLogs.pop();
  }

  // Tenta persistir no Prisma se userId válido estiver presente e DATABASE_URL configurada
  try {
    if (process.env.DATABASE_URL && params.userId) {
      await prisma.auditLog.create({
        data: {
          adminId: params.userId,
          action: params.event,
          entity: 'AUTH',
          entityId: params.userId,
          after: {
            userEmail: params.userEmail,
            ip: entry.ip,
            userAgent: entry.userAgent,
            ...params.details,
          },
          reason: `Ação de segurança: ${params.event}`,
        },
        select: {
          id: true,
        },
      });
    }
  } catch (err) {
    // Falha silenciosa de BD para não bloquear a operação de autenticação
    console.warn('[AuditLog] Aviso ao persistir na BD (ignorado):', err);
  }

  return entry;
}

/**
 * Retorna os logs de auditoria recentes.
 */
export function getRecentAuditLogs(): AuditLogEntry[] {
  return [...recentAuditLogs];
}

/**
 * Limpa os logs de auditoria (útil para reinicialização em testes).
 */
export function clearAuditLogs(): void {
  recentAuditLogs.length = 0;
}
