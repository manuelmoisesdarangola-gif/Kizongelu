/**
 * @file lib/notifications/channels/in-app.ts
 * Canal In-App: Regista a notificação na lista local e persistente do utilizador.
 */

import { InAppNotificationRecord, NotificationEvent, NotificationPayload, DeliveryResult } from '../types';
import { getEventCategory } from '../preferences';
import { renderNotificationTemplate } from '../templates';

const IN_APP_STORAGE_KEY = 'kizongelu_in_app_notifications';

export class InAppChannel {
  static async send(
    userId: string,
    event: NotificationEvent,
    payload: NotificationPayload
  ): Promise<DeliveryResult> {
    try {
      const template = renderNotificationTemplate(event, payload);
      const record: InAppNotificationRecord = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId,
        event,
        category: getEventCategory(event),
        title: template.title,
        body: template.body,
        link: payload.link,
        read: false,
        channel: 'IN_APP',
        createdAt: new Date().toISOString(),
        metadata: payload,
      };

      // Guarda no armazenamento local/memória do navegador
      if (typeof window !== 'undefined') {
        const existing = this.getNotifications(userId);
        const updated = [record, ...existing].slice(0, 50); // Mantém as 50 mais recentes
        localStorage.setItem(`${IN_APP_STORAGE_KEY}_${userId}`, JSON.stringify(updated));

        // Dispara evento para atualização instantânea dos componentes React
        window.dispatchEvent(new CustomEvent('kizongelu:notification:received', { detail: record }));
      }

      return {
        channel: 'IN_APP',
        success: true,
        messageId: record.id,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        channel: 'IN_APP',
        success: false,
        error: error?.message || 'Falha ao guardar notificação in-app',
        timestamp: new Date().toISOString(),
      };
    }
  }

  static getNotifications(userId: string): InAppNotificationRecord[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(`${IN_APP_STORAGE_KEY}_${userId}`);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Erro ao ler notificações in-app:', e);
    }
    // Notificações padrão de demonstração para a carteira
    return [
      {
        id: 'notif_init_1',
        userId,
        event: 'approved',
        category: 'PAYMENT',
        title: 'Comprovativo Multicaixa Express Validado 🎉',
        body: 'O pagamento da obra "Moradia T3 no Kilamba" foi aprovado pela equipa financeira.',
        link: '/projetos',
        read: false,
        channel: 'IN_APP',
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      },
      {
        id: 'notif_init_2',
        userId,
        event: 'calculation_ready',
        category: 'PROJECT',
        title: 'Cálculo Orçamental Concluído',
        body: 'O caderno técnico e mapa de quantidades de "Moradia T3 no Kilamba" está disponível.',
        link: '/projetos',
        read: true,
        channel: 'IN_APP',
        createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
      },
    ];
  }

  static markAsRead(userId: string, notificationId: string): void {
    if (typeof window === 'undefined') return;
    try {
      const list = this.getNotifications(userId);
      const updated = list.map((n) =>
        n.id === notificationId ? { ...n, read: true, readAt: new Date().toISOString() } : n
      );
      localStorage.setItem(`${IN_APP_STORAGE_KEY}_${userId}`, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('kizongelu:notification:updated'));
    } catch (e) {
      console.error('Erro ao marcar notificação como lida:', e);
    }
  }

  static markAllAsRead(userId: string): void {
    if (typeof window === 'undefined') return;
    try {
      const list = this.getNotifications(userId);
      const updated = list.map((n) => ({ ...n, read: true, readAt: new Date().toISOString() }));
      localStorage.setItem(`${IN_APP_STORAGE_KEY}_${userId}`, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('kizongelu:notification:updated'));
    } catch (e) {
      console.error('Erro ao marcar todas como lidas:', e);
    }
  }
}
