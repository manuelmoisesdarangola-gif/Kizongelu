/**
 * @file lib/calculation-engine/formulas/alvenaria.ts
 * Fórmulas de cálculo de Alvenarias e Paredes.
 * 
 * Especificação:
 * - Blocos: Área parede ÷ Área bloco × (1 + desperdício)
 * - Área parede ≈ Área útil × 2.8 (pé-direito 2.8m)
 * - Área bloco padrão 0.08 m² (20×40 cm)
 * - Desperdício 5%
 * - Argamassa: 0.02 m³/m² parede
 * - Cimento argamassa: 350 kg/m³
 * - Areia argamassa: 0.5 m³/m³
 * - Mão de obra: 25% do total de materiais de alvenaria
 */

import { CalculationInput, CalculationItem, CoefficientsMap } from '../types';
import { calculateArea, calculateWallArea, roundDecimals } from '../helpers';
import { getMaterialPrice } from '../prices-provider';

export async function calculateAlvenaria(
  input: CalculationInput,
  coeff: CoefficientsMap
): Promise<CalculationItem[]> {
  const items: CalculationItem[] = [];
  const province = input.province || 'Luanda';

  // Coeficientes obtidos da BD
  const wallHeightFactor = coeff['MASONRY_WALL_HEIGHT_FACTOR'] ?? 2.8;
  const blockArea = coeff['MASONRY_BLOCK_AREA'] ?? 0.08;
  const wasteRate = coeff['MASONRY_WASTE_RATE'] ?? 0.05;
  const mortarPerM2 = coeff['MORTAR_VOLUME_PER_M2'] ?? 0.02;
  const cementKgPerM3Mortar = coeff['MORTAR_CEMENT_KG_PER_M3'] ?? 350.0;
  const sandM3PerM3Mortar = coeff['MORTAR_SAND_M3_PER_M3'] ?? 0.5;
  const laborRate = coeff['LABOR_RATE_MASONRY'] ?? 0.25;

  const totalArea = calculateArea(input);
  const wallArea = calculateWallArea(totalArea, wallHeightFactor);

  // 1. Blocos de Betão (20x20x40 ou 15x20x40 conforme espessura)
  const blockCountRaw = (wallArea / blockArea) * (1 + wasteRate);
  const blockCount = Math.ceil(blockCountRaw);
  const blockPrice = await getMaterialPrice('BLO-001', province);
  const blockTotal = roundDecimals(blockCount * blockPrice.unitPrice, 2);

  items.push({
    code: 'BLO-001',
    description: `Bloco de Betão 20x20x40 cm (${blockPrice.name})`,
    unit: 'un',
    quantity: blockCount,
    unitPrice: blockPrice.unitPrice,
    total: blockTotal,
    chapter: '03. Alvenaria',
    formula: 'AreaParede / AreaBloco * (1 + Desperdicio)',
    readableFormula: `${wallArea.toFixed(2)} m² ÷ ${blockArea} m² × (1 + ${(wasteRate * 100).toFixed(0)}%) = ${blockCount.toLocaleString()} blocos`,
    inputsUsed: {
      totalArea,
      wallArea,
      blockArea,
      wasteRate,
    },
    sources: {
      material: 'BLO-001',
      coefficient: 'MASONRY_BLOCK_AREA, MASONRY_WASTE_RATE, MASONRY_WALL_HEIGHT_FACTOR',
      price: blockPrice.source,
    },
  });

  // 2. Argamassa de Assentamento: Cimento e Areia
  const totalMortarM3 = roundDecimals(wallArea * mortarPerM2, 3);
  const totalCementKg = totalMortarM3 * cementKgPerM3Mortar;
  const cementBags = Math.ceil(totalCementKg / 50); // sacos de 50kg
  const cementPrice = await getMaterialPrice('CIM-001', province);
  const cementTotal = roundDecimals(cementBags * cementPrice.unitPrice, 2);

  items.push({
    code: 'CIM-001',
    description: `Cimento Portland Tipo I 42.5R 50kg (Argamassa de Assentamento)`,
    unit: 'saco',
    quantity: cementBags,
    unitPrice: cementPrice.unitPrice,
    total: cementTotal,
    chapter: '03. Alvenaria',
    formula: '(AreaParede * ConsumoArgamassaM3 * DosagemCimentoKg) / 50',
    readableFormula: `(${wallArea.toFixed(2)} m² × ${mortarPerM2} m³/m² × ${cementKgPerM3Mortar} kg/m³) ÷ 50kg = ${cementBags} sacos`,
    inputsUsed: {
      wallArea,
      mortarPerM2,
      totalMortarM3,
      cementKgPerM3Mortar,
    },
    sources: {
      material: 'CIM-001',
      coefficient: 'MORTAR_VOLUME_PER_M2, MORTAR_CEMENT_KG_PER_M3',
      price: cementPrice.source,
    },
  });

  // 3. Areia para Argamassa
  const sandM3 = roundDecimals(totalMortarM3 * sandM3PerM3Mortar, 2);
  const sandPrice = await getMaterialPrice('ARE-001', province);
  const sandTotal = roundDecimals(sandM3 * sandPrice.unitPrice, 2);

  items.push({
    code: 'ARE-001',
    description: `Areia Média Lavada de Rio (Argamassa de Alvenaria)`,
    unit: 'm³',
    quantity: sandM3,
    unitPrice: sandPrice.unitPrice,
    total: sandTotal,
    chapter: '03. Alvenaria',
    formula: 'VolumeArgamassa * FatorAreia',
    readableFormula: `${totalMortarM3.toFixed(3)} m³ × ${sandM3PerM3Mortar} = ${sandM3.toFixed(2)} m³`,
    inputsUsed: {
      totalMortarM3,
      sandM3PerM3Mortar,
    },
    sources: {
      material: 'ARE-001',
      coefficient: 'MORTAR_SAND_M3_PER_M3',
      price: sandPrice.source,
    },
  });

  // 4. Mão de Obra de Alvenaria: 25% do custo dos materiais desta categoria
  const materialsSubtotal = blockTotal + cementTotal + sandTotal;
  const laborTotal = roundDecimals(materialsSubtotal * laborRate, 2);

  items.push({
    code: 'MO-ALV',
    description: `Mão de Obra Especializada para Elevação de Alvenaria (${(laborRate * 100).toFixed(0)}% dos materiais)`,
    unit: 'vg',
    quantity: 1,
    unitPrice: laborTotal,
    total: laborTotal,
    chapter: '07. Mão de Obra',
    formula: 'SubtotalMateriaisAlvenaria * FatorMaoDeObra',
    readableFormula: `${materialsSubtotal.toLocaleString()} Kz × ${(laborRate * 100).toFixed(0)}% = ${laborTotal.toLocaleString()} Kz`,
    inputsUsed: {
      materialsSubtotal,
      laborRate,
    },
    sources: {
      coefficient: 'LABOR_RATE_MASONRY',
      price: 'Taxa Paramétrica Oficial da BD',
    },
  });

  return items;
}
