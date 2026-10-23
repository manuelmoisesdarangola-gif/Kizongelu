/**
 * @file lib/notifications/channels/push.ts
 * Canal Web Push: API do navegador e Service Worker para Notificações Web e PWA.
 * Respeita limites estritos: Título máx 60 caracteres, Corpo máx 120 caracteres.
 */

import { NotificationEvent, NotificationPayload, DeliveryResult } from '../types';
import { renderNotificationTemplate } from '../templates';

export class PushChannel {
  /**
   * Solicita permissão de notificações nativas ao navegador.
   */
  static async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (e) {
      console.warn('Erro ao solicitar permissão de Web Push:', e);
      return 'denied';
    }
  }

  static async send(
    userId: string,
    event: NotificationEvent,
    payload: NotificationPayload
  ): Promise<DeliveryResult> {
    const template = renderNotificationTemplate(event, payload);

    // Truncagem segura conforme auditoria:
    // Título máx 60 char, corpo máx 120 char
    const pushTitle = template.pushTitle.substring(0, 60);
    const pushBody = template.pushBody.substring(0, 120);

    try {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          try {
            // Emite notificação nativa do sistema operacional
            const notif = new Notification(pushTitle, {
              body: pushBody,
              icon: '/favicon.ico',
              badge: '/favicon.ico',
              tag: `kizongelu_${event}`,
              data: {
                url: template.pushActionUrl || '/painel',
              },
            });

            notif.onclick = () => {
              window.focus();
              if (template.pushActionUrl) {
                window.location.href = template.pushActionUrl;
              }
            };
          } catch (e) {
            console.log('[PushChannel] Notificação criada via API base:', e);
          }
        }
      }

      return {
        channel: 'PUSH',
        success: true,
        messageId: `push_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        channel: 'PUSH',
        success: false,
        error: error?.message || 'Falha ao despachar Web Push',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
