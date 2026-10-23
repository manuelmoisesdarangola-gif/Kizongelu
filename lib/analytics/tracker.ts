/**
 * @file lib/analytics/tracker.ts
 * Gestão de Google Analytics 4 (GA4) e Eventos de Conversão (Fase 15).
 * Respeita a privacidade com consentimento explícito prévio via cookie banner.
 *
 * Eventos obrigatórios da especificação:
 * - cta_click
 * - wizard_start
 * - wizard_step_complete
 * - preview_view
 * - paywall_view
 * - payment_proof_upload
 * - payment_approved
 * - pdf_download
 * - whatsapp_share
 * - province_selector_change
 */

export type AnalyticsEventName =
  | 'cta_click'
  | 'wizard_start'
  | 'wizard_step_complete'
  | 'preview_view'
  | 'paywall_view'
  | 'payment_proof_upload'
  | 'payment_approved'
  | 'pdf_download'
  | 'whatsapp_share'
  | 'province_selector_change';

const CONSENT_STORAGE_KEY = 'kizongelu_ga_consent_accepted';
const GA_MEASUREMENT_ID = 'G-KZGL2026AO'; // ID canónico para Kizongelu Angola

/**
 * Verifica se o utilizador já deu consentimento para analytics.
 */
export function hasAnalyticsConsent(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(CONSENT_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Guarda o consentimento do utilizador e inicializa a tag do GA4.
 */
export function grantAnalyticsConsent(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, 'true');
    initGA4();
  } catch (e) {
    console.warn('Erro ao guardar consentimento GA4:', e);
  }
}

/**
 * Revoga o consentimento.
 */
export function revokeAnalyticsConsent(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, 'false');
  } catch (e) {
    console.warn('Erro ao revogar consentimento:', e);
  }
}

/**
 * Inicializa a tag do Google Analytics 4 de forma assíncrona caso haja consentimento.
 */
export function initGA4(): void {
  if (typeof window === 'undefined') return;
  if (!hasAnalyticsConsent()) return;

  // Evita duplicar script
  if (document.getElementById('ga4-script')) return;

  const script = document.createElement('script');
  script.id = 'ga4-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(args);
  }
  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, {
    anonymize_ip: true,
    send_page_view: true,
  });
}

/**
 * Dispara um evento de tracking para o GA4 e para o registo local.
 */
export function trackEvent(
  eventName: AnalyticsEventName,
  parameters: Record<string, any> = {}
): void {
  const timestamp = new Date().toISOString();

  // Sempre faz log local para auditoria e depuração
  console.debug(`[Analytics 🇦🇴] Event: ${eventName}`, parameters);

  if (typeof window !== 'undefined' && hasAnalyticsConsent() && (window as any).gtag) {
    try {
      (window as any).gtag('event', eventName, {
        ...parameters,
        app_country: 'AO',
        currency: 'AOA',
        event_timestamp: timestamp,
      });
    } catch (e) {
      console.warn('Erro ao disparar evento no GA4:', e);
    }
  }
}

// Declaração de tipos globais para window.dataLayer
declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}
