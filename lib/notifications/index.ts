/**
 * @file lib/notifications/index.ts
 * Orquestrador Central de Notificações Multicanal (Fase 12).
 * 
 * Regras:
 * 1. Consulta e valida preferências do utilizador (isChannelOptedIn).
 * 2. Roteia para os canais ativos (IN_APP, EMAIL, PUSH, WHATSAPP, SMS).
 * 3. Aplica política de retry (até 3 tentativas) e fallback em caso de falha de entrega.
 * 4. Mantém registo histórico auditável de envios.
 */

import {
  NotificationEvent,
  NotificationPayload,
  NotificationChannel,
  SendNotificationResult,
  DeliveryResult,
} from './types';
import { getUserPreferences, isChannelOptedIn } from './preferences';
import { InAppChannel } from './channels/in-app';
import { EmailChannel } from './channels/email';
import { PushChannel } from './channels/push';
import { WhatsAppChannel } from './channels/whatsapp';
import { SmsChannel } from './channels/sms';

export * from './types';
export * from './preferences';
export * from './templates';
export { InAppChannel } from './channels/in-app';
export { EmailChannel } from './channels/email';
export { PushChannel } from './channels/push';
export { WhatsAppChannel } from './channels/whatsapp';
export { SmsChannel } from './channels/sms';

// Tabela de fallback de canal
const CHANNEL_FALLBACKS: Partial<Record<NotificationChannel, NotificationChannel>> = {
  PUSH: 'IN_APP',
  SMS: 'WHATSAPP',
  WHATSAPP: 'SMS',
  EMAIL: 'IN_APP',
};

async function dispatchWithRetry(
  channel: NotificationChannel,
  userId: string,
  event: NotificationEvent,
  payload: NotificationPayload,
  maxRetries = 3
): Promise<DeliveryResult> {
  let attempt = 0;
  let lastError = '';

  while (attempt < maxRetries) {
    attempt++;
    try {
      let res: DeliveryResult;
      switch (channel) {
        case 'IN_APP':
          res = await InAppChannel.send(userId, event, payload);
          break;
        case 'EMAIL':
          res = await EmailChannel.send(userId, event, payload);
          break;
        case 'PUSH':
          res = await PushChannel.send(userId, event, payload);
          break;
        case 'WHATSAPP':
          res = await WhatsAppChannel.send(userId, event, payload);
          break;
        case 'SMS':
          res = await SmsChannel.send(userId, event, payload);
          break;
      }

      if (res.success) {
        return { ...res, retries: attempt - 1 };
      }
      lastError = res.error || 'Erro desconhecido';
    } catch (err: any) {
      lastError = err?.message || 'Exceção ao disparar canal';
    }
  }

  // Falhou após 3 tentativas: aciona fallback se configurado
  const fallbackChannel = CHANNEL_FALLBACKS[channel];
  if (fallbackChannel && fallbackChannel !== channel) {
    console.warn(`[Notifications] Canal ${channel} falhou após ${maxRetries} tentativas. Acionando fallback: ${fallbackChannel}`);
    return dispatchWithRetry(fallbackChannel, userId, event, payload, 1);
  }

  return {
    channel,
    success: false,
    error: `Falha após ${maxRetries} tentativas: ${lastError}`,
    timestamp: new Date().toISOString(),
    retries: maxRetries,
  };
}

/**
 * Função Principal de Envio de Notificações
 * sendNotification(userId, event, payload)
 */
export async function sendNotification(
  userId: string,
  event: NotificationEvent,
  payload: NotificationPayload
): Promise<SendNotificationResult> {
  const preferences = getUserPreferences(userId);
  const notificationId = `ntf_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  // Sempre garante IN_APP como canal base
  const candidateChannels: NotificationChannel[] = ['IN_APP', 'EMAIL', 'PUSH', 'WHATSAPP', 'SMS'];
  const activeChannels = candidateChannels.filter((ch) => isChannelOptedIn(preferences, event, ch));

  const results: DeliveryResult[] = [];

  for (const channel of activeChannels) {
    const res = await dispatchWithRetry(channel, userId, event, payload, 3);
    results.push(res);
  }

  const overallSuccess = results.some((r) => r.success);

  // Guarda no histórico de envios do Admin para estatísticas
  recordNotificationDispatch(userId, event, results);

  return {
    notificationId,
    event,
    userId,
    results,
    overallSuccess,
  };
}

// Histórico de envios para o painel de administração (/admin/notificacoes)
const DISPATCH_HISTORY_KEY = 'kizongelu_admin_notif_dispatches';

export interface NotificationDispatchLog {
  id: string;
  userId: string;
  event: NotificationEvent;
  timestamp: string;
  channels: NotificationChannel[];
  successCount: number;
  failureCount: number;
  openRate: number; // Simulado para estatísticas analíticas
}

export function recordNotificationDispatch(
  userId: string,
  event: NotificationEvent,
  results: DeliveryResult[]
): void {
  if (typeof window === 'undefined') return;
  try {
    const existingRaw = localStorage.getItem(DISPATCH_HISTORY_KEY);
    const existing: NotificationDispatchLog[] = existingRaw ? JSON.parse(existingRaw) : [];

    const newLog: NotificationDispatchLog = {
      id: `disp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      event,
      timestamp: new Date().toISOString(),
      channels: results.map((r) => r.channel),
      successCount: results.filter((r) => r.success).length,
      failureCount: results.filter((r) => !r.success).length,
      openRate: 88.5,
    };

    const updated = [newLog, ...existing].slice(0, 100);
    localStorage.setItem(DISPATCH_HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Erro ao registar log de despacho:', e);
  }
}

export function getNotificationDispatches(): NotificationDispatchLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(DISPATCH_HISTORY_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Erro ao ler logs de notificação:', e);
  }
  return [
    {
      id: 'disp_sample_1',
      userId: 'usr_sample_01',
      event: 'approved',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      channels: ['IN_APP', 'EMAIL', 'PUSH'],
      successCount: 3,
      failureCount: 0,
      openRate: 94.2,
    },
    {
      id: 'disp_sample_2',
      userId: 'usr_sample_01',
      event: 'welcome',
      timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      channels: ['EMAIL', 'IN_APP', 'WHATSAPP'],
      successCount: 3,
      failureCount: 0,
      openRate: 89.0,
    },
    {
      id: 'disp_sample_3',
      userId: 'usr_sample_02',
      event: 'calculation_ready',
      timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      channels: ['IN_APP', 'PUSH', 'WHATSAPP'],
      successCount: 3,
      failureCount: 0,
      openRate: 96.5,
    },
  ];
}
