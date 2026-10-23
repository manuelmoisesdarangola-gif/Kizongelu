/**
 * @file lib/notifications/types.ts
 * Definições de Tipos e Interfaces para o Sistema de Notificações Multicanal (Fase 12).
 */

export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'PUSH' | 'WHATSAPP' | 'SMS';

export type NotificationCategory = 'ACCOUNT' | 'PAYMENT' | 'PROJECT' | 'SHARE' | 'ONBOARDING' | 'REENGAGEMENT';

export type NotificationEvent =
  // ACCOUNT
  | 'welcome'
  | 'verify_email'
  | 'reset_password'
  | 'password_changed'
  | 'new_device_login'
  | 'account_deactivated'
  | 'account_deleted'
  // PAYMENT
  | 'proof_received'
  | 'approved'
  | 'rejected'
  | 'subscription_renewing'
  | 'subscription_overdue'
  | 'subscription_suspended'
  | 'subscription_renewed'
  | 'subscription_cancelled'
  | 'package_nearly_exhausted'
  | 'package_exhausted'
  | 'package_purchased'
  // PROJECT
  | 'calculation_ready'
  | 'unlocked'
  | 'version_updated'
  | 'expiring_soon'
  // SHARE
  | 'document_shared'
  | 'document_opened'
  | 'document_downloaded'
  // ONBOARDING
  | 'day_1'
  | 'day_3'
  | 'day_7'
  // REENGAGEMENT
  | 'draft_24h'
  | 'draft_7d'
  | 'preview_24h'
  | 'preview_3d'
  | 'weekly_summary'
  | 'absence_30d';

export interface NotificationPayload {
  nome: string;
  email?: string;
  telefone?: string;
  id?: string;
  valor?: number | string;
  data?: string;
  link?: string;
  projectName?: string;
  motivo?: string;
  dispositivo?: string;
  ip?: string;
  diasRestantes?: number;
  [key: string]: any;
}

export interface UserNotificationPreferences {
  userId: string;
  channels: {
    IN_APP: boolean;
    EMAIL: boolean;
    PUSH: boolean;
    WHATSAPP: boolean;
    SMS: boolean;
  };
  events: Partial<Record<NotificationEvent, {
    IN_APP: boolean;
    EMAIL: boolean;
    PUSH: boolean;
    WHATSAPP: boolean;
    SMS: boolean;
  }>>;
}

export interface InAppNotificationRecord {
  id: string;
  userId: string;
  event: NotificationEvent;
  category: NotificationCategory;
  title: string;
  body: string;
  link?: string;
  read: boolean;
  channel: NotificationChannel;
  createdAt: string;
  readAt?: string;
  metadata?: Record<string, any>;
}

export interface DeliveryResult {
  channel: NotificationChannel;
  success: boolean;
  messageId?: string;
  error?: string;
  timestamp: string;
  retries?: number;
}

export interface SendNotificationResult {
  notificationId: string;
  event: NotificationEvent;
  userId: string;
  results: DeliveryResult[];
  overallSuccess: boolean;
}
