/**
 * @file lib/tours/dashboard.ts
 * Tour do Dashboard (3 passos):
 * 1. Indicadores de Orçamentos e Saldo
 * 2. Criação de Novo Orçamento
 * 3. Projetos Recentes e Exportação
 */

import { TourDefinition } from './types';

export const dashboardTour: TourDefinition = {
  id: 'dashboard',
  name: 'Visão Geral do Painel',
  steps: [
    {
      element: '#tour-dashboard-kpis',
      title: '1. O Seu Resumo Financeiro & Obras',
      description: 'Acompanhe aqui o número de obras em curso, orçamentos gerados e o saldo disponível do seu plano de engenharia.',
      position: 'bottom',
      badge: 'Passo 1 de 3',
    },
    {
      element: '#tour-novo-orcamento-btn',
      title: '2. Criar Novo Orçamento',
      description: 'Clique aqui a qualquer momento para iniciar o cálculo determinístico de uma obra em 7 etapas guiadas.',
      position: 'bottom',
      badge: 'Passo 2 de 3',
    },
    {
      element: '#tour-projetos-recentes',
      title: '3. Projetos Recentes & Ações Rápidas',
      description: 'Consulte os seus rascunhos, pré-visualizações gratuitas e faça o download dos Cadernos de Encargos com selo antifraude.',
      position: 'top',
      badge: 'Passo 3 de 3',
    },
  ],
};
