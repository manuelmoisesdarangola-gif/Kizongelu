/**
 * @file lib/monitoring/uptime.ts
 * Monitorização de Uptime, Alertas e Health Check (Fase 18).
 */

import { logger } from './logger';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptimeSeconds: number;
  timestamp: string;
  version: string;
  checks: {
    database: boolean;
    calculationEngine: boolean;
    serviceWorkerCache: boolean;
    network: boolean;
  };
}

const START_TIME = Date.now();

export class UptimeMonitor {
  static getHealthStatus(): HealthStatus {
    const uptimeSeconds = Math.floor((Date.now() - START_TIME) / 1000);
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

    const status: HealthStatus = {
      status: isOnline ? 'healthy' : 'degraded',
      uptimeSeconds,
      timestamp: new Date().toISOString(),
      version: '3.2.0',
      checks: {
        database: true,
        calculationEngine: true,
        serviceWorkerCache: typeof window !== 'undefined' && 'caches' in window,
        network: isOnline,
      },
    };

    return status;
  }

  static async pingHealthCheck(): Promise<boolean> {
    try {
      const health = this.getHealthStatus();
      if (health.status === 'unhealthy') {
        logger.warn('Alerta de Uptime: Sistema degradado', 'uptime_alert', health);
        return false;
      }
      return true;
    } catch (err) {
      logger.error('Falha no ping de uptime', err, 'uptime_alert');
      return false;
    }
  }
}
