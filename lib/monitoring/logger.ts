/**
 * @file lib/monitoring/logger.ts
 * Sistema de Logs Estruturados em JSON para Produção (Fase 18).
 * Suporta níveis INFO, WARN, ERROR e AUDIT com metadados de contexto.
 */

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'AUDIT';

export interface StructuredLogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  userId?: string;
  metadata?: Record<string, any>;
  environment: string;
}

class StructuredLogger {
  private environment: string;

  constructor() {
    this.environment = process.env.NODE_ENV || 'production';
  }

  write(level: LogLevel, message: string, context?: string, metadata?: Record<string, any>, userId?: string) {
    const entry: StructuredLogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      userId,
      metadata,
      environment: this.environment,
    };

    const formatted = JSON.stringify(entry);

    if (level === 'ERROR') {
      console.error(formatted);
    } else if (level === 'WARN') {
      console.warn(formatted);
    } else {
      console.log(formatted);
    }

    return entry;
  }

  info(message: string, context?: string, metadata?: Record<string, any>) {
    return this.write('INFO', message, context, metadata);
  }

  warn(message: string, context?: string, metadata?: Record<string, any>) {
    return this.write('WARN', message, context, metadata);
  }

  error(message: string, error?: Error | unknown, context?: string, metadata?: Record<string, any>) {
    const errMeta = error instanceof Error
      ? { ...metadata, errorName: error.name, errorMessage: error.message, stack: error.stack }
      : { ...metadata, error };
    return this.write('ERROR', message, context, errMeta);
  }

  audit(action: string, userId: string, details: Record<string, any>) {
    return this.write('AUDIT', `[AUDITORIA] ${action}`, 'security_audit', details, userId);
  }
}

export const logger = new StructuredLogger();
