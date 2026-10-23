/**
 * @file lib/tours/index.ts
 * Gestão de Tours Contextuais e Persistência de `toursSeen` por utilizador.
 */

import { TourName, TourDefinition } from './types';
import { dashboardTour } from './dashboard';
import { wizardTour } from './wizard';
import { previewTour } from './preview';
import { paywallTour } from './paywall';

export * from './types';
export { dashboardTour, wizardTour, previewTour, paywallTour };

export const TOURS_REGISTRY: Record<TourName, TourDefinition> = {
  dashboard: dashboardTour,
  wizard: wizardTour,
  preview: previewTour,
  paywall: paywallTour,
};

const TOURS_STORAGE_KEY = 'kizongelu_tours_seen';

/**
 * Retorna os tours já vistos pelo utilizador
 */
export function getUserToursSeen(userId: string): Record<TourName, boolean> {
  if (typeof window === 'undefined') {
    return { dashboard: false, wizard: false, preview: false, paywall: false };
  }
  try {
    const raw = localStorage.getItem(`${TOURS_STORAGE_KEY}_${userId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Erro ao ler tours vistos:', e);
  }
  return { dashboard: false, wizard: false, preview: false, paywall: false };
}

/**
 * Marca um tour como visto
 */
export function markTourSeen(userId: string, tour: TourName): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getUserToursSeen(userId);
    const updated = { ...current, [tour]: true };
    localStorage.setItem(`${TOURS_STORAGE_KEY}_${userId}`, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('kizongelu:tour:updated', { detail: { tour, seen: true } }));
  } catch (e) {
    console.error('Erro ao guardar tour visto:', e);
  }
}

/**
 * Reinicia todos os tours (para o botão "Rever tour" em Definições -> Ajuda)
 */
export function resetUserTours(userId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const resetState = { dashboard: false, wizard: false, preview: false, paywall: false };
    localStorage.setItem(`${TOURS_STORAGE_KEY}_${userId}`, JSON.stringify(resetState));
    window.dispatchEvent(new CustomEvent('kizongelu:tour:updated', { detail: { reset: true } }));
  } catch (e) {
    console.error('Erro ao reiniciar tours:', e);
  }
}
