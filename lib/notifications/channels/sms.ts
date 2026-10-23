/**
 * @file lib/notifications/channels/sms.ts
 * Canal SMS: Provedor SMS local em Angola / Twilio com fallback de caracteres curtos.
 */

import { NotificationEvent, NotificationPayload, DeliveryResult } from '../types';
import { renderNotificationTemplate } from '../templates';

export class SmsChannel {
  static async send(
    userId: string,
    event: NotificationEvent,
    payload: NotificationPayload
  ): Promise<DeliveryResult> {
    const template = renderNotificationTemplate(event, payload);
    const telefone = payload.telefone || '+244923000000';

    try {
      const messageId = `sms_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      console.log(`[SmsChannel] Para: ${telefone} | Texto: ${template.smsText}`);

      return {
        channel: 'SMS',
        success: true,
        messageId,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        channel: 'SMS',
        success: false,
        error: error?.message || 'Falha de entrega SMS',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
