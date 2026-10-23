/**
 * @file lib/calculation-engine/index.ts
 * Ponto de entrada do Motor de Cálculo Determinístico do Kizongelu.
 * 
 * Orquestra a execução das fórmulas versionadas por categoria,
 * cálculo de transporte, agregação de custos e persistência com auditoria.
 */

import { prisma } from '../db/prisma';
import { logAuditEvent } from '../audit';
import {
  CalculationChapterSummary,
  CalculationInput,
  CalculationItem,
  CalculationResult,
} from './types';
import { calculateConfidence } from './confidence';
import { loadEngineCoefficients } from './coefficients';
import { roundDecimals } from './helpers';
import { runEngineAudit } from './audit-alerts';

// Fórmulas especializadas por categoria
import { calculateFundacoes } from './formulas/fundacoes';
import { calculateEstrutura } from './formulas/estrutura';
import { calculateAlvenaria } from './formulas/alvenaria';
import { calculateCobertura } from './formulas/cobertura';
import { calculateInstalacoes } from './formulas/instalacoes';
import { calculateAcabamentos } from './formulas/acabamentos';
import { calculateTransport } from './formulas/transport';

export * from './types';
export * from './helpers';
export * from './confidence';
export * from './coefficients';
export * from './prices-provider';
export * from './typology-benchmarks';

/**
 * Função principal do motor de cálculo.
 * Executa todas as fórmulas determinísticas para os dados do projeto fornecidos.
 */
export async function calculate(
  projectInput: CalculationInput,
  engineVersion: string = 'v1.0'
): Promise<CalculationResult> {
  // 1. Carrega os coeficientes paramétricos a partir da BD para a versão solicitada
  const coefficients = await loadEngineCoefficients(engineVersion);

  // 2. Executa as fórmulas de cada uma das categorias
  const [
    fundacoesItems,
    estruturaItems,
    alvenariaItems,
    coberturaItems,
    instalacoesItems,
    acabamentosItems,
  ] = await Promise.all([
    calculateFundacoes(projectInput, coefficients),
    calculateEstrutura(projectInput, coefficients),
    calculateAlvenaria(projectInput, coefficients),
    calculateCobertura(projectInput, coefficients),
    calculateInstalacoes(projectInput, coefficients),
    calculateAcabamentos(projectInput, coefficients),
  ]);

  // Agrupa os itens de materiais e mão de obra
  const baseCategoryItems = [
    ...fundacoesItems,
    ...estruturaItems,
    ...alvenariaItems,
    ...coberturaItems,
    ...instalacoesItems,
    ...acabamentosItems,
  ];

  const materialItems = baseCategoryItems.filter((i) => i.chapter !== '07. Mão de Obra');
  const laborItems = baseCategoryItems.filter((i) => i.chapter === '07. Mão de Obra');

  const materialsTotal = roundDecimals(
    materialItems.reduce((acc, curr) => acc + curr.total, 0),
    2
  );
  const laborTotal = roundDecimals(
    laborItems.reduce((acc, curr) => acc + curr.total, 0),
    2
  );

  // 3. Calcula o Transporte e Logística com base no subtotal de materiais
  const transportItem = calculateTransport(projectInput, coefficients, materialsTotal);
  const transportTotal = transportItem.total;

  // Lista consolidada de todos os itens do orçamento
  const allItems: CalculationItem[] = [...materialItems, ...laborItems, transportItem];

  // Validação estrita de não-negatividade
  for (const item of allItems) {
    if (item.quantity < 0 || item.unitPrice < 0 || item.total < 0) {
      throw new Error(`Item ${item.code} gerou valor negativo no cálculo determinístico.`);
    }
  }

  // 4. Fecho Financeiro Profissional (BDI Analítico e Fiscalidade de Angola)
  const directCost = roundDecimals(materialsTotal + laborTotal + transportTotal, 2);

  // Parâmetros de BDI (configuráveis ou carregados de coeficientes)
  const adminCentralRate = coefficients['BDI_ADMIN_CENTRAL'] ?? 0.05; // 5% Administração Central
  const riscosImprevistosRate = coefficients['BDI_RISCOS_IMPREVISTOS'] ?? 0.03; // 3% Riscos e Imprevistos
  const segurosGarantiasRate = coefficients['BDI_SEGUROS_GARANTIAS'] ?? 0.015; // 1.5% Seguros de Obra
  const margemLucroRate = coefficients['BDI_MARGEM_LUCRO'] ?? 0.12; // 12% Lucro Bruto Operacional
  const totalBDIRate = roundDecimals(
    adminCentralRate + riscosImprevistosRate + segurosGarantiasRate + margemLucroRate,
    4
  );
  const bdiAmount = roundDecimals(directCost * totalBDIRate, 2);
  const baseTributavel = roundDecimals(directCost + bdiAmount, 2);

  // Fiscalidade Angolana (Lei do IVA + Retenção na Fonte Prestação de Serviços Construção Civil)
  const taxRegime: 'GERAL' | 'SIMPLIFICADO' | 'ISENTO' = 'GERAL';
  const ivaRate = 0.14; // 14% IVA Geral em Angola
  const ivaAmount = roundDecimals(baseTributavel * ivaRate, 2);

  const retencaoFonteRate = 0.065; // 6,5% Retenção na Fonte AGT para Construção Civil
  const retencaoFonteAmount = roundDecimals(baseTributavel * retencaoFonteRate, 2);

  // Encargo patronal INSS sobre mão de obra (8% patronal obrigatório em Angola)
  const inssPatronalRate = 0.08;
  const inssPatronalAmount = roundDecimals(laborTotal * inssPatronalRate, 2);

  const precoFinalComIVA = roundDecimals(baseTributavel + ivaAmount, 2);
  const valorLiquidoReceber = roundDecimals(precoFinalComIVA - retencaoFonteAmount, 2);

  const financialClosing = {
    directCost,
    bdi: {
      adminCentralRate,
      riscosImprevistosRate,
      segurosGarantiasRate,
      margemLucroRate,
      totalBDIRate,
      bdiAmount,
    },
    baseTributavel,
    taxes: {
      taxRegime,
      ivaRate,
      ivaAmount,
      retencaoFonteRate,
      retencaoFonteAmount,
      inssPatronalRate,
      inssPatronalAmount,
    },
    precoFinalComIVA,
    valorLiquidoReceber,
  };

  const grandTotal = precoFinalComIVA;

  // 5. Sumário agregado por capítulo da obra
  const chapterNames = [
    '01. Fundações',
    '02. Estrutura',
    '03. Alvenaria',
    '04. Cobertura',
    '05. Instalações',
    '06. Acabamentos',
    '07. Mão de Obra',
    '08. Transporte e Logística',
  ];

  const chapters: CalculationChapterSummary[] = chapterNames.map((name) => {
    const chapterItems = allItems.filter((i) => i.chapter === name);
    const subtotal = roundDecimals(
      chapterItems.reduce((acc, curr) => acc + curr.total, 0),
      2
    );
    const chapterMaterials = name === '07. Mão de Obra' || name === '08. Transporte e Logística'
      ? 0
      : subtotal;
    const chapterLabor = name === '07. Mão de Obra' ? subtotal : 0;

    return {
      chapter: name,
      materialsTotal: chapterMaterials,
      laborTotal: chapterLabor,
      subtotal,
      itemsCount: chapterItems.length,
    };
  });

  // 6. Avalia o índice de confiança dos dados de entrada
  const confidence = calculateConfidence(projectInput);

  // 7. Fase 4: Executa o motor de auditoria de consistência e alertas técnicos
  const alerts = runEngineAudit(projectInput, allItems, directCost, totalBDIRate);

  return {
    engineVersion,
    calculatedAt: new Date().toISOString(),
    input: projectInput,
    confidence,
    items: allItems,
    chapters,
    materialsTotal,
    laborTotal,
    transportTotal,
    directCost,
    financialClosing,
    alerts,
    grandTotal,
    currency: 'Kz',
  };
}

/**
 * Persiste o resultado do cálculo na base de dados (tabelas Calculation e CalculationItem).
 * Incrementa a versão caso já exista um cálculo para este projeto e regista o log de auditoria.
 */
export async function saveCalculation(
  projectId: string,
  items: CalculationItem[],
  engineVersion: string = 'v1.0',
  userId?: string
) {
  // 1. Calcula o total somado dos itens
  const grandTotal = roundDecimals(
    items.reduce((acc, item) => acc + item.total, 0),
    2
  );

  // 2. Determina a próxima versão do cálculo para este projeto
  if (process.env.DATABASE_URL) {
    try {
      const previousCalculations = await prisma.calculation.findMany({
        where: { projectId },
        select: { version: true },
        orderBy: { version: 'desc' },
        take: 1,
      });

      const nextVersion = previousCalculations.length > 0 ? previousCalculations[0].version + 1 : 1;

      // 3. Cria o registo de Calculation com os seus CalculationItems em transação
      const calculation = await prisma.calculation.create({
        data: {
          projectId,
          engineVersion,
          version: nextVersion,
          total: grandTotal,
          confidence: 'HIGH', // Valor padrão do enum
          items: {
            create: items.map((item) => ({
              code: item.code,
              description: item.description,
              unit: item.unit,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.total,
              formula: item.formula,
              inputsUsed: item.inputsUsed,
              sources: item.sources,
            })),
          },
        },
        select: {
          id: true,
          projectId: true,
          engineVersion: true,
          version: true,
          total: true,
          confidence: true,
          createdAt: true,
          items: {
            select: {
              id: true,
              code: true,
              description: true,
              unit: true,
              quantity: true,
              unitPrice: true,
              total: true,
            },
          },
        },
      });

      // 4. Registo de Auditoria
      await logAuditEvent({
        event: 'CALCULATION_SAVED',
        userId,
        status: 'SUCCESS',
        details: {
          calculationId: calculation.id,
          projectId,
          version: calculation.version,
          engineVersion,
          grandTotal,
          itemsCount: items.length,
        },
      });

      return calculation;
    } catch (err) {
      console.warn('[saveCalculation] Erro ao persistir na BD, a criar fallback simulado:', err);
    }
  }

  // Fallback simulado para modo offline / desenvolvimento
  const simulatedCalculation = {
    id: `calc-${Date.now()}`,
    projectId,
    engineVersion,
    version: 1,
    total: grandTotal,
    confidence: 'HIGH' as const,
    createdAt: new Date(),
    items: items.map((item, idx) => ({
      id: `item-${idx + 1}`,
      calculationId: `calc-${Date.now()}`,
      code: item.code,
      description: item.description,
      unit: item.unit,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.total,
      formula: item.formula,
      inputsUsed: item.inputsUsed,
      sources: item.sources,
    })),
  };

  await logAuditEvent({
    event: 'CALCULATION_SAVED',
    userId,
    status: 'SUCCESS',
    details: {
      calculationId: simulatedCalculation.id,
      projectId,
      version: simulatedCalculation.version,
      engineVersion,
      grandTotal,
      itemsCount: items.length,
      mode: 'OFFLINE_SIMULATED',
    },
  });

  return simulatedCalculation;
}
