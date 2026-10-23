/**
 * @file lib/monitoring/sentry.ts
 * Integração e Captura de Erros Sentry para Produção (Fase 18).
 * Funciona de forma resiliente tanto com Sentry SDK oficial como fallback seguro sem crash.
 */

import { logger } from './logger';

export interface SentryConfig {
  dsn?: string;
  environment?: string;
  release?: string;
  tracesSampleRate?: number;
}

class SentryClient {
  private isInitialized = false;
  private dsn: string | undefined;

  init(config?: SentryConfig) {
    this.dsn = config?.dsn || process.env.VITE_SENTRY_DSN || process.env.SENTRY_DSN;
    const environment = config?.environment || process.env.NODE_ENV || 'production';
    const release = config?.release || 'kizongelu@3.2.0';

    if (this.dsn) {
      this.isInitialized = true;
      logger.info(`Sentry inicializado no ambiente: ${environment}`, 'sentry', { release });
    } else {
      logger.info('Sentry DSN não configurado (modo local/preview resiliente)', 'sentry');
    }
  }

  captureException(error: Error | unknown, context?: Record<string, any>) {
    logger.error('Exceção capturada para o Sentry', error, 'sentry_capture', context);

    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, { extra: context });
    }
  }

  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', extra?: Record<string, any>) {
    logger.write(level === 'error' ? 'ERROR' : level === 'warning' ? 'WARN' : 'INFO', message, 'sentry_message', extra);

    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureMessage(message, level);
    }
  }

  setUser(user: { id: string; email?: string; role?: string } | null) {
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.setUser(user);
    }
  }
}

export const sentry = new SentryClient();
