/**
 * @file lib/tours/types.ts
 * Definições de Tipos e Interfaces para os Tours Contextuais (Fase 14).
 * Suporta Tours com driver.js / modal overlays contextuais em ecrãs-chave:
 * - dashboard (3 passos)
 * - wizard (3 passos)
 * - preview (2 passos)
 * - paywall (1 passo)
 */

export type TourName = 'dashboard' | 'wizard' | 'preview' | 'paywall';

export interface TourStep {
  element?: string; // seletor CSS (ex: '#kpi-grid', '#btn-novo-orcamento')
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  badge?: string;
}

export interface TourDefinition {
  id: TourName;
  name: string;
  steps: TourStep[];
}
