/**
 * @file lib/calculation-engine/typology-benchmarks.ts
 * Tabela de referência oficial de intervalos de custo por tipologia de obra em Angola (base Luanda 2026).
 * Recolha com base em pesquisa de mercado com empreiteiros e metodologia imobiliária.
 */

import { PROVINCE_FACTORS } from '../../prisma/seed-prices';
import { normalizeProvinceName } from './prices-provider';

export interface TypologyBenchmark {
  id: string;
  name: string;
  unit: 'm²' | 'm';
  minKz: number; // Base Luanda
  maxKz: number; // Base Luanda
  isDirectMeasurement?: boolean;
  description: string;
}

export const TYPOLOGY_BENCHMARKS: Record<string, TypologyBenchmark> = {
  moradia_unifamiliar: {
    id: 'moradia_unifamiliar',
    name: 'Moradia Unifamiliar (T2-T5)',
    unit: 'm²',
    minKz: 180000,
    maxKz: 280000,
    description: 'Acabamento médio, T2 a T5 em Luanda',
  },
  predio_multifamiliar: {
    id: 'predio_multifamiliar',
    name: 'Prédio Multifamiliar (3 pisos)',
    unit: 'm²',
    minKz: 150000,
    maxKz: 230000,
    description: 'Edifício habitacional com economia de escala (-15 a -20%)',
  },
  nave_industrial_armazem: {
    id: 'nave_industrial_armazem',
    name: 'Nave Industrial / Armazém',
    unit: 'm²',
    minKz: 140000,
    maxKz: 200000,
    description: 'Estrutura metálica de grandes vãos e acabamento simples',
  },
  anexo_secundaria: {
    id: 'anexo_secundaria',
    name: 'Anexo / Construção Secundária',
    unit: 'm²',
    minKz: 160000,
    maxKz: 230000,
    description: 'Construção secundária ou suíte exterior',
  },
  muro_vedacao: {
    id: 'muro_vedacao',
    name: 'Muro de Vedação (por metro linear)',
    unit: 'm',
    minKz: 45000,
    maxKz: 65000,
    description: 'Muro perimetral h=2.0m com bloco 15 vibrado e reboco',
  },
  remodelacao_ampliacao: {
    id: 'remodelacao_ampliacao',
    name: 'Remodelação & Ampliação',
    unit: 'm²',
    minKz: 0,
    maxKz: 0,
    isDirectMeasurement: true,
    description: 'Sob medição directa',
  },
};

export interface CrossValidationResult {
  typologyId: string;
  typologyName: string;
  unit: string;
  dimension: number;
  calculatedCostPerUnitKz: number;
  expectedMinKz: number;
  expectedMaxKz: number;
  province: string;
  provinceFactor: number;
  status: 'OPTIMAL' | 'BELOW_MINIMUM' | 'ABOVE_MAXIMUM' | 'DIRECT_MEASUREMENT';
  deviationPercent: number;
  message: string;
  isValid: boolean;
}

/**
 * Validação cruzada do orçamento calculado contra os intervalos de referência de mercado.
 * Ajusta os limites mínimo e máximo pelo factor logístico da província.
 */
export function validateBudgetCrossCheck(
  typologyKey: string,
  dimension: number, // área em m² ou comprimento linear em metros
  totalCalculatedKz: number,
  province: string = 'Luanda'
): CrossValidationResult {
  const normProvince = normalizeProvinceName(province);
  const factorData = PROVINCE_FACTORS[normProvince] || PROVINCE_FACTORS['Outras'] || { factor: 1.0 };
  const factor = factorData.factor;

  // Normalização da chave da tipologia
  const cleanKey = (typologyKey || 'moradia_unifamiliar').toLowerCase().replace(/[\s-]/g, '_');
  let benchmark = TYPOLOGY_BENCHMARKS[cleanKey];

  if (!benchmark) {
    if (cleanKey.includes('muro')) benchmark = TYPOLOGY_BENCHMARKS.muro_vedacao;
    else if (cleanKey.includes('predio') || cleanKey.includes('multifamiliar')) benchmark = TYPOLOGY_BENCHMARKS.predio_multifamiliar;
    else if (cleanKey.includes('nave') || cleanKey.includes('armazem')) benchmark = TYPOLOGY_BENCHMARKS.nave_industrial_armazem;
    else if (cleanKey.includes('anexo')) benchmark = TYPOLOGY_BENCHMARKS.anexo_secundaria;
    else if (cleanKey.includes('remodel') || cleanKey.includes('amplia')) benchmark = TYPOLOGY_BENCHMARKS.remodelacao_ampliacao;
    else benchmark = TYPOLOGY_BENCHMARKS.moradia_unifamiliar;
  }

  if (benchmark.isDirectMeasurement) {
    return {
      typologyId: benchmark.id,
      typologyName: benchmark.name,
      unit: benchmark.unit,
      dimension,
      calculatedCostPerUnitKz: dimension > 0 ? Math.round(totalCalculatedKz / dimension) : 0,
      expectedMinKz: 0,
      expectedMaxKz: 0,
      province: normProvince,
      provinceFactor: factor,
      status: 'DIRECT_MEASUREMENT',
      deviationPercent: 0,
      message: 'Tipologia sob medição directa detalhada por artigo.',
      isValid: true,
    };
  }

  const costPerUnit = dimension > 0 ? Math.round(totalCalculatedKz / dimension) : 0;
  const expectedMin = Math.round(benchmark.minKz * factor);
  const expectedMax = Math.round(benchmark.maxKz * factor);

  let status: 'OPTIMAL' | 'BELOW_MINIMUM' | 'ABOVE_MAXIMUM' = 'OPTIMAL';
  let deviationPercent = 0;
  let message = `O custo unitário (${costPerUnit.toLocaleString('pt-AO')} Kz/${benchmark.unit}) está dentro do intervalo de mercado para ${normProvince} (${expectedMin.toLocaleString('pt-AO')} a ${expectedMax.toLocaleString('pt-AO')} Kz/${benchmark.unit}).`;
  let isValid = true;

  if (costPerUnit < expectedMin) {
    status = 'BELOW_MINIMUM';
    deviationPercent = Math.round(((expectedMin - costPerUnit) / expectedMin) * 100);
    message = `Aviso: Custo unitário (${costPerUnit.toLocaleString('pt-AO')} Kz/${benchmark.unit}) ${deviationPercent}% abaixo do mínimo de referência para ${normProvince} (${expectedMin.toLocaleString('pt-AO')} Kz/${benchmark.unit}). Verifique se faltam artigos de acabamento ou estrutura.`;
    isValid = false;
  } else if (costPerUnit > expectedMax) {
    status = 'ABOVE_MAXIMUM';
    deviationPercent = Math.round(((costPerUnit - expectedMax) / expectedMax) * 100);
    message = `Aviso: Custo unitário (${costPerUnit.toLocaleString('pt-AO')} Kz/${benchmark.unit}) ${deviationPercent}% acima do máximo de referência para ${normProvince} (${expectedMax.toLocaleString('pt-AO')} Kz/${benchmark.unit}). Verifique se há sobreespecificação de materiais ou margem BDI elevada.`;
    isValid = false;
  }

  return {
    typologyId: benchmark.id,
    typologyName: benchmark.name,
    unit: benchmark.unit,
    dimension,
    calculatedCostPerUnitKz: costPerUnit,
    expectedMinKz: expectedMin,
    expectedMaxKz: expectedMax,
    province: normProvince,
    provinceFactor: factor,
    status,
    deviationPercent,
    message,
    isValid,
  };
}

export interface CalculationInputForCrossValidation {
  total: number;
  marketReferencePrice: number;
  [key: string]: any;
}

export interface CrossValidationAlert {
  alert: boolean;
  message?: string;
  divergencia?: number;
  divergenciaPercent?: number;
  custoDirecto?: number;
  custoEstimadoViaImob?: number;
}

/**
 * Método de validação cruzada entre o cálculo directo e a referência imobiliária.
 * Custo estimado via imobiliária = precoVendaMercado / 1.3
 * Emite alerta se a divergência for superior a 20%.
 */
export function crossValidate(calculation: CalculationInputForCrossValidation): CrossValidationAlert {
  const custoDirecto = calculation.total;
  const precoVendaMercado = calculation.marketReferencePrice;
  const custoEstimadoViaImob = precoVendaMercado / 1.3;
  const divergencia = Math.abs(
    (custoDirecto - custoEstimadoViaImob) / custoEstimadoViaImob
  );
  if (divergencia > 0.20) {
    return {
      alert: true,
      message: 'Divergência >20% entre cálculo directo e referência imobiliária. Rever parâmetros.',
      divergencia,
      divergenciaPercent: Math.round(divergencia * 100),
      custoDirecto,
      custoEstimadoViaImob,
    };
  }
  return {
    alert: false,
    divergencia,
    divergenciaPercent: Math.round(divergencia * 100),
    custoDirecto,
    custoEstimadoViaImob,
  };
}

