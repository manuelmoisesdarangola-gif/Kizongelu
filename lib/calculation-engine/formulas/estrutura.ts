/**
 * @file lib/calculation-engine/formulas/estrutura.ts
 * Fórmulas de cálculo de Estrutura de Betão Armado.
 * 
 * Especificação:
 * - Volume betão ≈ Área × 0.15 m (laje)
 * - Cimento: 350 kg/m³ (C25/30)
 * - Areia: 0.5 m³/m³
 * - Brita: 0.8 m³/m³
 * - Aço: 80 kg/m³ (laje), 120 kg/m³ (vigas/pilares)
 * - Desperdício aço: 10%
 * - Mão de obra: 30% do total de materiais de estrutura
 */

import { CalculationInput, CalculationItem, CoefficientsMap } from '../types';
import { calculateArea, roundDecimals } from '../helpers';
import { getMaterialPrice } from '../prices-provider';

export async function calculateEstrutura(
  input: CalculationInput,
  coeff: CoefficientsMap
): Promise<CalculationItem[]> {
  const items: CalculationItem[] = [];
  const province = input.province || 'Luanda';

  // Coeficientes obtidos da BD
  const slabThickness = coeff['CONCRETE_SLAB_THICKNESS'] ?? 0.15;
  const cementKgPerM3 = coeff['CONCRETE_CEMENT_KG_PER_M3'] ?? 350.0;
  const sandM3PerM3 = coeff['CONCRETE_SAND_M3_PER_M3'] ?? 0.5;
  const gravelM3PerM3 = coeff['CONCRETE_GRAVEL_M3_PER_M3'] ?? 0.8;
  const steelSlabKgPerM3 = coeff['STEEL_SLAB_KG_PER_M3'] ?? 80.0;
  const steelBeamsKgPerM3 = coeff['STEEL_BEAMS_COLUMNS_KG_PER_M3'] ?? 120.0;
  const steelWasteRate = coeff['STEEL_WASTE_RATE'] ?? 0.10;
  const laborRate = coeff['LABOR_RATE_STRUCTURE'] ?? 0.30;

  const totalArea = calculateArea(input);
  const concreteVolumeM3 = roundDecimals(totalArea * slabThickness, 2);

  // 1. Cimento para Betão Estrutural C25/30 (Sacos de 50kg)
  const totalCementKg = concreteVolumeM3 * cementKgPerM3;
  const cementBags = Math.ceil(totalCementKg / 50);
  const cementPrice = await getMaterialPrice('CIM-001', province);
  const cementTotal = roundDecimals(cementBags * cementPrice.unitPrice, 2);

  items.push({
    code: 'CIM-001-EST',
    description: `Cimento Portland Tipo I 42.5R 50kg (Betão Estrutural C25/30)`,
    unit: 'saco',
    quantity: cementBags,
    unitPrice: cementPrice.unitPrice,
    total: cementTotal,
    chapter: '02. Estrutura',
    formula: '(VolumeBetao * DosagemCimentoKg) / 50',
    readableFormula: `(${concreteVolumeM3} m³ × ${cementKgPerM3} kg/m³) ÷ 50kg = ${cementBags} sacos`,
    inputsUsed: {
      totalArea,
      slabThickness,
      concreteVolumeM3,
      cementKgPerM3,
    },
    sources: {
      material: 'CIM-001',
      coefficient: 'CONCRETE_SLAB_THICKNESS, CONCRETE_CEMENT_KG_PER_M3',
      price: cementPrice.source,
    },
  });

  // 2. Areia para Betão
  const sandVolumeM3 = roundDecimals(concreteVolumeM3 * sandM3PerM3, 2);
  const sandPrice = await getMaterialPrice('ARE-001', province);
  const sandTotal = roundDecimals(sandVolumeM3 * sandPrice.unitPrice, 2);

  items.push({
    code: 'ARE-001-EST',
    description: `Areia Média/Grossa Lavada para Betão Estrutural`,
    unit: 'm³',
    quantity: sandVolumeM3,
    unitPrice: sandPrice.unitPrice,
    total: sandTotal,
    chapter: '02. Estrutura',
    formula: 'VolumeBetao * ConsumoAreia',
    readableFormula: `${concreteVolumeM3} m³ × ${sandM3PerM3} = ${sandVolumeM3.toFixed(2)} m³`,
    inputsUsed: {
      concreteVolumeM3,
      sandM3PerM3,
    },
    sources: {
      material: 'ARE-001',
      coefficient: 'CONCRETE_SAND_M3_PER_M3',
      price: sandPrice.source,
    },
  });

  // 3. Brita nº 1 para Betão
  const gravelVolumeM3 = roundDecimals(concreteVolumeM3 * gravelM3PerM3, 2);
  const gravelPrice = await getMaterialPrice('BRI-001', province);
  const gravelTotal = roundDecimals(gravelVolumeM3 * gravelPrice.unitPrice, 2);

  items.push({
    code: 'BRI-001-EST',
    description: `Brita Granítica nº 1 (10-20mm) para Betão Estrutural`,
    unit: 'm³',
    quantity: gravelVolumeM3,
    unitPrice: gravelPrice.unitPrice,
    total: gravelTotal,
    chapter: '02. Estrutura',
    formula: 'VolumeBetao * ConsumoBrita',
    readableFormula: `${concreteVolumeM3} m³ × ${gravelM3PerM3} = ${gravelVolumeM3.toFixed(2)} m³`,
    inputsUsed: {
      concreteVolumeM3,
      gravelM3PerM3,
    },
    sources: {
      material: 'BRI-001',
      coefficient: 'CONCRETE_GRAVEL_M3_PER_M3',
      price: gravelPrice.source,
    },
  });

  // 4. Aço Estrutural Nervurado A400 (Lajes: 80 kg/m³, Vigas/Pilares: 120 kg/m³ + 10% desperdício)
  const steelTotalDensity = steelSlabKgPerM3 + steelBeamsKgPerM3; // 200 kg/m³
  const steelKgRaw = concreteVolumeM3 * steelTotalDensity * (1 + steelWasteRate);
  const steelKg = Math.ceil(steelKgRaw);
  const steelPrice = await getMaterialPrice('ACO-004', province); // Ø12mm de referência
  const steelTotal = roundDecimals(steelKg * steelPrice.unitPrice, 2);

  items.push({
    code: 'ACO-004-EST',
    description: `Varão de Aço Nervurado A400 (Armaduras Lajes, Vigas e Pilares)`,
    unit: 'kg',
    quantity: steelKg,
    unitPrice: steelPrice.unitPrice,
    total: steelTotal,
    chapter: '02. Estrutura',
    formula: 'VolumeBetao * (DensidadeLaje + DensidadeVigasPilares) * (1 + DesperdicioAco)',
    readableFormula: `${concreteVolumeM3} m³ × (${steelSlabKgPerM3} + ${steelBeamsKgPerM3}) kg/m³ × (1 + ${(steelWasteRate * 100).toFixed(0)}%) = ${steelKg.toLocaleString()} kg`,
    inputsUsed: {
      concreteVolumeM3,
      steelSlabKgPerM3,
      steelBeamsKgPerM3,
      steelWasteRate,
    },
    sources: {
      material: 'ACO-004',
      coefficient: 'STEEL_SLAB_KG_PER_M3, STEEL_BEAMS_COLUMNS_KG_PER_M3, STEEL_WASTE_RATE',
      price: steelPrice.source,
    },
  });

  // 5. Madeira de Cofragem (tábuas de pinho e escoras)
  const timberPrice = await getMaterialPrice('MAD-001', province);
  const timberUnits = Math.ceil(totalArea * 0.4); // ~0.4 tábua por m² de laje
  const timberTotal = roundDecimals(timberUnits * timberPrice.unitPrice, 2);

  items.push({
    code: 'MAD-001-EST',
    description: `Tábua de Madeira de Pinho Tratado para Cofragem de Lajes e Vigas`,
    unit: 'un',
    quantity: timberUnits,
    unitPrice: timberPrice.unitPrice,
    total: timberTotal,
    chapter: '02. Estrutura',
    formula: 'AreaLaje * FatorCofragem',
    readableFormula: `${totalArea} m² × 0.40 un/m² = ${timberUnits} tábuas`,
    inputsUsed: { totalArea },
    sources: {
      material: 'MAD-001',
      coefficient: 'CONCRETE_SLAB_THICKNESS',
      price: timberPrice.source,
    },
  });

  // 6. Mão de Obra de Estrutura: 30% do total de materiais desta categoria
  const materialsSubtotal = cementTotal + sandTotal + gravelTotal + steelTotal + timberTotal;
  const laborTotal = roundDecimals(materialsSubtotal * laborRate, 2);

  items.push({
    code: 'MO-EST',
    description: `Mão de Obra de Estruturas de Betão Armado (${(laborRate * 100).toFixed(0)}% dos materiais)`,
    unit: 'vg',
    quantity: 1,
    unitPrice: laborTotal,
    total: laborTotal,
    chapter: '07. Mão de Obra',
    formula: 'SubtotalMateriaisEstrutura * FatorMaoDeObra',
    readableFormula: `${materialsSubtotal.toLocaleString()} Kz × ${(laborRate * 100).toFixed(0)}% = ${laborTotal.toLocaleString()} Kz`,
    inputsUsed: {
      materialsSubtotal,
      laborRate,
    },
    sources: {
      coefficient: 'LABOR_RATE_STRUCTURE',
      price: 'Taxa Paramétrica Oficial da BD',
    },
  });

  return items;
}
