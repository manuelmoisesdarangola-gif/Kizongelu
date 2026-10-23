/**
 * @file lib/monitoring/analytics.ts
 * Monitorização de Vercel Analytics & Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1).
 */

import { logger } from './logger';

export interface WebVitalsMetrics {
  LCP?: number; // Largest Contentful Paint (< 2500ms)
  FID?: number; // First Input Delay (< 100ms)
  CLS?: number; // Cumulative Layout Shift (< 0.1)
  TTFB?: number; // Time to First Byte (< 800ms)
  FCP?: number; // First Contentful Paint (< 1800ms)
}

class AnalyticsManager {
  private metrics: WebVitalsMetrics = {};

  constructor() {
    if (typeof window !== 'undefined') {
      this.initPerformanceObserver();
    }
  }

  private initPerformanceObserver() {
    try {
      // 1. LCP (Largest Contentful Paint)
      if ('PerformanceObserver' in window && PerformanceObserver.supportedEntryTypes?.includes('largest-contentful-paint')) {
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            this.metrics.LCP = Math.round(lastEntry.startTime);
            this.reportMetric('LCP', this.metrics.LCP, 2500);
          }
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      }

      // 2. CLS (Cumulative Layout Shift)
      if ('PerformanceObserver' in window && PerformanceObserver.supportedEntryTypes?.includes('layout-shift')) {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          this.metrics.CLS = parseFloat(clsValue.toFixed(3));
          this.reportMetric('CLS', this.metrics.CLS, 0.1);
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });
      }

      // 3. FID (First Input Delay)
      if ('PerformanceObserver' in window && PerformanceObserver.supportedEntryTypes?.includes('first-input')) {
        const fidObserver = new PerformanceObserver((entryList) => {
          const firstInput = entryList.getEntries()[0];
          if (firstInput) {
            const fid = Math.round((firstInput as any).processingStart - firstInput.startTime);
            this.metrics.FID = fid;
            this.reportMetric('FID', fid, 100);
          }
        });
        fidObserver.observe({ type: 'first-input', buffered: true });
      }
    } catch (e) {
      // PerformanceObserver pode não estar totalmente disponível em WebViews antigas
    }
  }

  private reportMetric(name: keyof WebVitalsMetrics, value: number, threshold: number) {
    const isPassing = value <= threshold;
    logger.info(`[Web Vitals] ${name}: ${value} (${isPassing ? 'PASSA' : 'ATENÇÃO'}, Limite: ${threshold})`, 'performance', {
      metric: name,
      value,
      threshold,
      isPassing,
    });

    // Enviar para Vercel Analytics se script presente
    if (typeof window !== 'undefined' && (window as any).va) {
      (window as any).va('event', {
        name: `web-vital-${name}`,
        data: { value, isPassing },
      });
    }
  }

  trackEvent(eventName: string, properties?: Record<string, any>) {
    logger.info(`[Analytics Event] ${eventName}`, 'user_action', properties);

    if (typeof window !== 'undefined' && (window as any).va) {
      (window as any).va('event', { name: eventName, data: properties });
    }
  }

  getMetrics(): WebVitalsMetrics {
    return { ...this.metrics };
  }
}

export const analytics = new AnalyticsManager();
