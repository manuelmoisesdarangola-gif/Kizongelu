/**
 * @file lib/tours/paywall.ts
 * Tour do Paywall / Desbloqueio de Obra (1 passo):
 * 1. Pagamento Seguro e Comprovativo Multicaixa Express
 */

import { TourDefinition } from './types';

export const paywallTour: TourDefinition = {
  id: 'paywall',
  name: 'Desbloqueio Seguro Multicaixa Express',
  steps: [
    {
      element: '#tour-paywall-modal',
      title: 'Desbloqueio com Pagamento Multicaixa Express ou Transferência bancária',
      description: 'Envie o comprovativo pelo formulário para aprovação rápida pela tesouraria em até 15 minutos, ou use um dos orçamentos do seu plano.',
      position: 'center',
      badge: 'Passo Único',
    },
  ],
};
