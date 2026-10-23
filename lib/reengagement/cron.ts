/**
 * @file lib/reengagement/cron.ts
 * Sistema de Re-engagement Automático (Fase 14) — Inngest / Cron Runner.
 * 
 * Regras Obrigatórias da Auditoria:
 * 1. Rascunho abandonado há mais de 24h -> Notificação (IN_APP + PUSH).
 * 2. Rascunho abandonado há mais de 7 dias -> Email de reativação.
 * 3. Pré-visualização não desbloqueada há mais de 24h -> Notificação (IN_APP + PUSH).
 * 4. Pré-visualização não desbloqueada há mais de 3 dias -> Email com incentivo.
 * 5. Ausência do utilizador há mais de 30 dias -> Email "Sentimos a sua falta".
 * 
 * RATE LIMIT OBRIGATÓRIO:
 * - Máximo de 3 notificações por utilizador a cada 7 dias.
 */

import { sendNotification, NotificationEvent } from '../notifications';

interface ReengagementLog {
  userId: string;
  event: NotificationEvent;
  timestamp: string;
}

const REENGAGEMENT_LOG_KEY = 'kizongelu_reengagement_logs';

export function getReengagementLogs(userId: string): ReengagementLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`${REENGAGEMENT_LOG_KEY}_${userId}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
}

/**
 * Valida o Rate Limit: Máx 3 notificações nos últimos 7 dias
 */
export function canSendReengagement(userId: string): boolean {
  const logs = getReengagementLogs(userId);
  const sevenDaysAgo = Date.now() - 7 * 24 * 3600 * 1000;
  const recentLogs = logs.filter((l) => new Date(l.timestamp).getTime() > sevenDaysAgo);
  return recentLogs.length < 3;
}

export function recordReengagementSent(userId: string, event: NotificationEvent): void {
  if (typeof window === 'undefined') return;
  try {
    const logs = getReengagementLogs(userId);
    const updated = [
      { userId, event, timestamp: new Date().toISOString() },
      ...logs,
    ].slice(0, 20);
    localStorage.setItem(`${REENGAGEMENT_LOG_KEY}_${userId}`, JSON.stringify(updated));
  } catch (e) {}
}

export interface ReengagementCandidate {
  userId: string;
  userName: string;
  userEmail: string;
  projectId?: string;
  projectName?: string;
  lastActivityHoursAgo: number;
  type: 'DRAFT_24H' | 'DRAFT_7D' | 'PREVIEW_24H' | 'PREVIEW_3D' | 'ABSENCE_30D';
}

/**
 * Executa o ciclo de verificação de re-engagement (simulado/cron)
 */
export async function runReengagementCheck(
  candidate: ReengagementCandidate
): Promise<{ triggered: boolean; reason?: string }> {
  const { userId, userName, userEmail, projectName, type } = candidate;

  // 1. Aplica o Rate Limit estrito
  if (!canSendReengagement(userId)) {
    return {
      triggered: false,
      reason: 'Rate limit atingido (máximo 3 notificações em 7 dias).',
    };
  }

  let eventToSend: NotificationEvent;

  switch (type) {
    case 'DRAFT_24H':
      eventToSend = 'draft_24h';
      break;
    case 'DRAFT_7D':
      eventToSend = 'draft_7d';
      break;
    case 'PREVIEW_24H':
      eventToSend = 'preview_24h';
      break;
    case 'PREVIEW_3D':
      eventToSend = 'preview_3d';
      break;
    case 'ABSENCE_30D':
      eventToSend = 'absence_30d';
      break;
    default:
      return { triggered: false, reason: 'Tipo desconhecido' };
  }

  try {
    await sendNotification(userId, eventToSend, {
      nome: userName,
      email: userEmail,
      projectName: projectName || 'Projeto de Obra',
      link: typeof window !== 'undefined' ? `${window.location.origin}/painel` : 'https://kizongelu.ao/painel',
    });

    recordReengagementSent(userId, eventToSend);

    return { triggered: true };
  } catch (error: any) {
    return { triggered: false, reason: error?.message || 'Falha no disparo' };
  }
}
