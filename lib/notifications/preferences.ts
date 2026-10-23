/**
 * @file lib/notifications/preferences.ts
 * Gestão de Preferências de Notificação e Validação de Opt-in.
 * 
 * Regra Obrigatória da Auditoria (Fase 12):
 * - Notificações de Segurança (ACCOUNT: verify_email, reset_password, password_changed, new_device_login)
 *   e confirmações financeiras críticas (PAYMENT: approved, rejected) são SEMPRE ON (não desativáveis).
 */

import { NotificationEvent, NotificationChannel, UserNotificationPreferences, NotificationCategory } from './types';

// Eventos de Segurança e Auditoria Crítica (Não desativáveis)
export const CRITICAL_SECURITY_EVENTS: ReadonlySet<NotificationEvent> = new Set([
  'verify_email',
  'reset_password',
  'password_changed',
  'new_device_login',
  'account_deactivated',
  'account_deleted',
  'approved',
  'rejected',
]);

export function getEventCategory(event: NotificationEvent): NotificationCategory {
  if (['welcome', 'verify_email', 'reset_password', 'password_changed', 'new_device_login', 'account_deactivated', 'account_deleted'].includes(event)) {
    return 'ACCOUNT';
  }
  if (['proof_received', 'approved', 'rejected', 'subscription_renewing', 'subscription_overdue', 'subscription_suspended', 'subscription_renewed', 'subscription_cancelled'].includes(event)) {
    return 'PAYMENT';
  }
  if (['calculation_ready', 'unlocked', 'version_updated', 'expiring_soon'].includes(event)) {
    return 'PROJECT';
  }
  if (['document_shared', 'document_opened', 'document_downloaded'].includes(event)) {
    return 'SHARE';
  }
  if (['day_1', 'day_3', 'day_7'].includes(event)) {
    return 'ONBOARDING';
  }
  return 'REENGAGEMENT';
}

const PREFERENCES_STORAGE_KEY = 'kizongelu_user_notif_prefs';

export function getDefaultPreferences(userId: string): UserNotificationPreferences {
  return {
    userId,
    channels: {
      IN_APP: true,
      EMAIL: true,
      PUSH: true,
      WHATSAPP: true,
      SMS: false, // SMS desligado por omissão para economia de custos
    },
    events: {},
  };
}

export function getUserPreferences(userId: string): UserNotificationPreferences {
  if (typeof window === 'undefined') {
    return getDefaultPreferences(userId);
  }
  try {
    const raw = localStorage.getItem(`${PREFERENCES_STORAGE_KEY}_${userId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Erro ao carregar preferências de notificação:', e);
  }
  return getDefaultPreferences(userId);
}

export function saveUserPreferences(preferences: UserNotificationPreferences): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      `${PREFERENCES_STORAGE_KEY}_${preferences.userId}`,
      JSON.stringify(preferences)
    );
  } catch (e) {
    console.error('Erro ao guardar preferências de notificação:', e);
  }
}

/**
 * Valida se o utilizador deu opt-in para receber o evento pelo canal selecionado.
 * Notificações de segurança ignoram desativações.
 */
export function isChannelOptedIn(
  preferences: UserNotificationPreferences,
  event: NotificationEvent,
  channel: NotificationChannel
): boolean {
  // Notificações de segurança e alertas bancários são SEMPRE ON
  if (CRITICAL_SECURITY_EVENTS.has(event)) {
    if (channel === 'IN_APP' || channel === 'EMAIL') {
      return true;
    }
  }

  // 1. Verifica toggle global do canal
  if (!preferences.channels[channel]) {
    return false;
  }

  // 2. Verifica se existe restrição por evento específico
  const eventConfig = preferences.events?.[event];
  if (eventConfig && typeof eventConfig[channel] === 'boolean') {
    return eventConfig[channel];
  }

  return true;
}
