/**
 * @file lib/calculation-engine/formulas/fundacoes.ts
 * Fórmulas de cálculo de Fundações e Infraestruturas.
 * 
 * Especificação:
 * - Sapata corrida: Perímetro × 0.6 m × 0.4 m
 * - Sapata isolada: Nº pilares × 1.2 m × 1.2 m × 0.4 m
 * - Laje (Radier): Área de implantação × 0.25 m
 */

import { CalculationInput, CalculationItem, CoefficientsMap } from '../types';
import { calculateFootprintArea, calculatePerimeter, estimatePillarsCount, roundDecimals } from '../helpers';
import { getMaterialPrice } from '../prices-provider';

export async function calculateFundacoes(
  input: CalculationInput,
  coeff: CoefficientsMap
): Promise<CalculationItem[]> {
  const items: CalculationItem[] = [];
  const province = input.province || 'Luanda';

  // Coeficientes obtidos da BD
  const contWidth = coeff['FOUNDATION_CONTINUOUS_WIDTH'] ?? 0.6;
  const contDepth = coeff['FOUNDATION_CONTINUOUS_DEPTH'] ?? 0.4;
  const isoWidth = coeff['FOUNDATION_ISOLATED_WIDTH'] ?? 1.2;
  const isoLength = coeff['FOUNDATION_ISOLATED_LENGTH'] ?? 1.2;
  const isoDepth = coeff['FOUNDATION_ISOLATED_DEPTH'] ?? 0.4;
  const cementKgPerM3 = coeff['CONCRETE_CEMENT_KG_PER_M3'] ?? 350.0;
  const sandM3PerM3 = coeff['CONCRETE_SAND_M3_PER_M3'] ?? 0.5;
  const gravelM3PerM3 = coeff['CONCRETE_GRAVEL_M3_PER_M3'] ?? 0.8;

  const footprintArea = calculateFootprintArea(input);
  const perimeter = calculatePerimeter(input);
  const pillarsCount = estimatePillarsCount(footprintArea);

  let foundationVolumeM3 = 0;
  let formulaDesc = '';
  let readableDesc = '';

  const foundationType = input.foundation || 'sapata_corrida';

  if (foundationType === 'sapata_isolada') {
    foundationVolumeM3 = roundDecimals(pillarsCount * isoWidth * isoLength * isoDepth, 2);
    formulaDesc = 'NumPilares * Largura * Comprimento * Altura';
    readableDesc = `${pillarsCount} pilares × ${isoWidth}m × ${isoLength}m × ${isoDepth}m = ${foundationVolumeM3} m³ de betão`;
  } else if (foundationType === 'laje') {
    // Radier geral
    const slabThickness = 0.25;
    foundationVolumeM3 = roundDecimals(footprintArea * slabThickness, 2);
    formulaDesc = 'AreaImplantacao * EspessuraRadier';
    readableDesc = `${footprintArea} m² × ${slabThickness}m = ${foundationVolumeM3} m³ de betão`;
  } else {
    // 'sapata_corrida', 'outra', 'nao_sei'
    foundationVolumeM3 = roundDecimals(perimeter * contWidth * contDepth, 2);
    formulaDesc = 'Perimetro * Largura * Profundidade';
    readableDesc = `${perimeter}m × ${contWidth}m × ${contDepth}m = ${foundationVolumeM3} m³ de betão`;
  }

  // 1. Cimento para Betão de Fundação (Sacos de 50kg)
  const cementKg = foundationVolumeM3 * cementKgPerM3;
  const cementBags = Math.ceil(cementKg / 50);
  const cementPrice = await getMaterialPrice('CIM-001', province);
  const cementTotal = roundDecimals(cementBags * cementPrice.unitPrice, 2);

  items.push({
    code: 'CIM-001-FND',
    description: `Cimento Portland Tipo I 42.5R 50kg (Betão de Fundações)`,
    unit: 'saco',
    quantity: cementBags,
    unitPrice: cementPrice.unitPrice,
    total: cementTotal,
    chapter: '01. Fundações',
    formula: '(VolumeFundacao * DosagemCimentoKg) / 50',
    readableFormula: `(${foundationVolumeM3} m³ × ${cementKgPerM3} kg/m³) ÷ 50kg = ${cementBags} sacos`,
    inputsUsed: {
      foundationType,
      foundationVolumeM3,
      cementKgPerM3,
    },
    sources: {
      material: 'CIM-001',
      coefficient: 'CONCRETE_CEMENT_KG_PER_M3',
      price: cementPrice.source,
    },
  });

  // 2. Areia para Fundações
  const sandVolumeM3 = roundDecimals(foundationVolumeM3 * sandM3PerM3, 2);
  const sandPrice = await getMaterialPrice('ARE-001', province);
  const sandTotal = roundDecimals(sandVolumeM3 * sandPrice.unitPrice, 2);

  items.push({
    code: 'ARE-001-FND',
    description: `Areia Média Lavada de Rio (Betão de Fundações)`,
    unit: 'm³',
    quantity: sandVolumeM3,
    unitPrice: sandPrice.unitPrice,
    total: sandTotal,
    chapter: '01. Fundações',
    formula: 'VolumeFundacao * ConsumoAreia',
    readableFormula: `${foundationVolumeM3} m³ × ${sandM3PerM3} = ${sandVolumeM3.toFixed(2)} m³`,
    inputsUsed: {
      foundationVolumeM3,
      sandM3PerM3,
    },
    sources: {
      material: 'ARE-001',
      coefficient: 'CONCRETE_SAND_M3_PER_M3',
      price: sandPrice.source,
    },
  });

  // 3. Brita nº 1/nº 2 para Fundações
  const gravelVolumeM3 = roundDecimals(foundationVolumeM3 * gravelM3PerM3, 2);
  const gravelPrice = await getMaterialPrice('BRI-001', province);
  const gravelTotal = roundDecimals(gravelVolumeM3 * gravelPrice.unitPrice, 2);

  items.push({
    code: 'BRI-001-FND',
    description: `Brita Granítica para Betão de Fundações`,
    unit: 'm³',
    quantity: gravelVolumeM3,
    unitPrice: gravelPrice.unitPrice,
    total: gravelTotal,
    chapter: '01. Fundações',
    formula: 'VolumeFundacao * ConsumoBrita',
    readableFormula: `${foundationVolumeM3} m³ × ${gravelM3PerM3} = ${gravelVolumeM3.toFixed(2)} m³`,
    inputsUsed: {
      foundationVolumeM3,
      gravelM3PerM3,
    },
    sources: {
      material: 'BRI-001',
      coefficient: 'CONCRETE_GRAVEL_M3_PER_M3',
      price: gravelPrice.source,
    },
  });

  // 4. Aço para Armaduras de Fundações (~65 kg/m³)
  const steelDensity = 65.0; // kg/m³
  const steelKg = Math.ceil(foundationVolumeM3 * steelDensity * 1.1); // com 10% perda
  const steelPrice = await getMaterialPrice('ACO-003', province); // Ø10mm
  const steelTotal = roundDecimals(steelKg * steelPrice.unitPrice, 2);

  items.push({
    code: 'ACO-003-FND',
    description: `Varão de Aço Nervurado A400 para Sapatas e Vigas de Fundação`,
    unit: 'kg',
    quantity: steelKg,
    unitPrice: steelPrice.unitPrice,
    total: steelTotal,
    chapter: '01. Fundações',
    formula: 'VolumeFundacao * TaxaAco * 1.10',
    readableFormula: `${foundationVolumeM3} m³ × ${steelDensity} kg/m³ × 1.10 = ${steelKg} kg`,
    inputsUsed: {
      foundationVolumeM3,
      steelDensity,
      formulaDesc,
      readableDesc,
    },
    sources: {
      material: 'ACO-003',
      coefficient: 'STEEL_WASTE_RATE',
      price: steelPrice.source,
    },
  });

  return items;
}
