/**
 * @file lib/tours/preview.ts
 * Tour da Pré-visualização do Orçamento (2 passos):
 * 1. Resumo e 3 Primeiros Capítulos Abertos
 * 2. Desbloqueio dos Capítulos Finais e Exportação
 */

import { TourDefinition } from './types';

export const previewTour: TourDefinition = {
  id: 'preview',
  name: 'Navegação pela Pré-visualização',
  steps: [
    {
      element: '#tour-preview-chapters',
      title: '1. Capítulos Iniciais Abertos',
      description: 'Pode consultar livremente os artigos de Estaleiro, Fundações e Estruturas para validar os coeficientes da sua obra.',
      position: 'bottom',
      badge: 'Passo 1 de 2',
    },
    {
      element: '#tour-preview-unlock-cta',
      title: '2. Desbloqueio Integral & Mapa em Excel',
      description: 'Desbloqueie para aceder a Coberturas, Eletricidade, Águas e exportar o PDF oficial com autenticação por QR Code.',
      position: 'top',
      badge: 'Passo 2 de 2',
    },
  ],
};
