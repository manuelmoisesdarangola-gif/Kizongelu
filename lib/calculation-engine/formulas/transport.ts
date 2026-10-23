/**
 * @file lib/calculation-engine/formulas/transport.ts
 * Fórmulas de cálculo de Frete, Transporte e Logística de Obra por Província.
 * 
 * Especificação:
 * - Aplicar factor por província (configurável na tabela Coefficient):
 *   • Luanda: 3%
 *   • Malanje: 15%
 *   • Benguela: 6%
 *   • Huíla: 10%
 *   • Huambo: 12%
 *   • Cabinda: 20%
 *   • Lunda Norte: 22%
 *   • Lunda Sul: 25%
 */

import { CalculationInput, CalculationItem, CoefficientsMap } from '../types';
import { roundDecimals } from '../helpers';
import { normalizeProvinceName } from '../prices-provider';

export function calculateTransport(
  input: CalculationInput,
  coeff: CoefficientsMap,
  materialsSubtotal: number
): CalculationItem {
  const normProvince = normalizeProvinceName(input.province);

  // Mapeamento do código do coeficiente conforme a província
  const provinceCoefficientKeys: Record<string, string> = {
    'Luanda': 'TRANSPORT_RATE_LUANDA',
    'Benguela': 'TRANSPORT_RATE_BENGUELA',
    'Cuanza Sul': 'TRANSPORT_RATE_CUANZA_SUL',
    'Huíla': 'TRANSPORT_RATE_HUILA',
    'Huambo': 'TRANSPORT_RATE_HUAMBO',
    'Malanje': 'TRANSPORT_RATE_MALANJE',
    'Cabinda': 'TRANSPORT_RATE_CABINDA',
    'Lunda Norte': 'TRANSPORT_RATE_LUNDA_NORTE',
    'Lunda Sul': 'TRANSPORT_RATE_LUNDA_SUL',
    'Moxico': 'TRANSPORT_RATE_MOXICO',
  };

  const coeffKey = provinceCoefficientKeys[normProvince] || 'TRANSPORT_RATE_OUTRAS';
  const defaultRate = normProvince === 'Luanda' ? 0.00 : 0.15;
  const transportRate = coeff[coeffKey] ?? defaultRate;

  const transportTotal = roundDecimals(materialsSubtotal * transportRate, 2);

  const isCabinda = normProvince === 'Cabinda';
  const transportDesc = isCabinda
    ? `Frete Marítimo de Cabotagem / Aéreo, Carga e Descarga Portuária (Cabinda - ${(transportRate * 100).toFixed(0)}%)`
    : `Transporte Rodoviário, Carga e Descarga de Materiais (${normProvince} - ${(transportRate * 100).toFixed(0)}%)`;

  return {
    code: `TRP-${normProvince.toUpperCase().replace(/\s+/g, '_')}`,
    description: transportDesc,
    unit: 'verba',
    quantity: 1,
    unitPrice: transportTotal,
    total: transportTotal,
    chapter: '08. Transporte e Logística',
    formula: 'SubtotalMateriais * FatorTransporteProvincial',
    readableFormula: `${materialsSubtotal.toLocaleString()} Kz × ${(transportRate * 100).toFixed(0)}% = ${transportTotal.toLocaleString()} Kz`,
    inputsUsed: {
      province: normProvince,
      materialsSubtotal,
      transportRate,
      coeffKey,
    },
    sources: {
      coefficient: coeffKey,
      price: isCabinda
        ? 'Tarifa Mista de Cabotagem Marítima e Manuseamento Portuário'
        : `Tarifa Paramétrica Oficial Provincial (${normProvince})`,
    },
  };
}
