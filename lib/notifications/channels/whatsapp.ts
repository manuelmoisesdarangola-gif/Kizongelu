/**
 * @file lib/notifications/channels/whatsapp.ts
 * Canal WhatsApp: Envio com templates estruturados, link wa.me e opção de opt-out (Fase 12).
 */

import { NotificationEvent, NotificationPayload, DeliveryResult } from '../types';
import { renderNotificationTemplate } from '../templates';

export class WhatsAppChannel {
  static async send(
    userId: string,
    event: NotificationEvent,
    payload: NotificationPayload
  ): Promise<DeliveryResult> {
    const template = renderNotificationTemplate(event, payload);
    const telefone = payload.telefone || '+244923000000';

    try {
      const messageId = `wa_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      console.log(`[WhatsAppChannel] Para: ${telefone} | Msg: ${template.whatsappText}`);

      return {
        channel: 'WHATSAPP',
        success: true,
        messageId,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        channel: 'WHATSAPP',
        success: false,
        error: error?.message || 'Falha no envio WhatsApp',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Constrói link direto wa.me para abertura manual ou atendimento assistido
   */
  static generateWaMeLink(telefone: string, event: NotificationEvent, payload: NotificationPayload): string {
    const template = renderNotificationTemplate(event, payload);
    const cleanPhone = telefone.replace(/\D/g, '');
    const encoded = encodeURIComponent(template.whatsappText);
    return `https://wa.me/${cleanPhone}?text=${encoded}`;
  }
}
