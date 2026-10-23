/**
 * @file lib/tours/wizard.ts
 * Tour do Wizard de Orçamentação (3 passos):
 * 1. Barra de 7 Etapas LNEC
 * 2. Seleção de Província e Ajustes Regionais
 * 3. Cálculo Determinístico Instantâneo
 */

import { TourDefinition } from './types';

export const wizardTour: TourDefinition = {
  id: 'wizard',
  name: 'Como Funciona o Cálculo de Obras',
  steps: [
    {
      element: '#tour-wizard-stepper',
      title: '1. As 7 Etapas Normativas',
      description: 'O processo segue a ordem cronológica de obra: do tipo de imóvel aos acabamentos finos. O seu progresso é gravado automaticamente.',
      position: 'bottom',
      badge: 'Passo 1 de 3',
    },
    {
      element: '#tour-wizard-provincia',
      title: '2. Calibração Regional para Angola',
      description: 'Ao selecionar a província (ex.: Luanda, Benguela, Huíla), calibramos automaticamente o frete rodoviário e salários da construção.',
      position: 'right',
      badge: 'Passo 2 de 3',
    },
    {
      element: '#tour-wizard-calcular',
      title: '3. Motor Determinístico de Engenharia',
      description: 'Sem aproximações grosseiras: a nossa matriz decompõe betão, aço e mão de obra em conformidade com as normas LNEC.',
      position: 'top',
      badge: 'Passo 3 de 3',
    },
  ],
};
