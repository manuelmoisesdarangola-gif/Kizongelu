/**
 * @file lib/calculation-engine/formulas/cobertura.ts
 * Fórmulas de cálculo de Coberturas e Estruturas de Telhado.
 * 
 * Especificação:
 * - Chapa: Área × 1.1 (inclinação + sobreposição)
 * - Telha: Área × 1.15
 * - Estrutura madeira: Área × 3.5 m linear/m²
 * - Parafusos: 12/m²
 */

import { CalculationInput, CalculationItem, CoefficientsMap } from '../types';
import { calculateFootprintArea, roundDecimals } from '../helpers';
import { getMaterialPrice } from '../prices-provider';

export async function calculateCobertura(
  input: CalculationInput,
  coeff: CoefficientsMap
): Promise<CalculationItem[]> {
  const items: CalculationItem[] = [];
  const province = input.province || 'Luanda';

  // Coeficientes obtidos da BD
  const sheetFactor = coeff['ROOF_SHEET_FACTOR'] ?? 1.10;
  const tileFactor = coeff['ROOF_TILE_FACTOR'] ?? 1.15;
  const timberLinearMPerM2 = coeff['ROOF_TIMBER_LINEAR_M_PER_M2'] ?? 3.5;
  const screwsPerM2 = coeff['ROOF_SCREWS_PER_M2'] ?? 12.0;

  const footprintArea = calculateFootprintArea(input);
  const roofType = input.roof || 'chapa';

  // 1. Material de Cobertura (Chapa vs Telha vs Laje)
  if (roofType === 'telha') {
    const tileArea = roundDecimals(footprintArea * tileFactor, 2);
    // Consumo típico de telhas lusas em Angola: ~15 telhas/m²
    const tilesCount = Math.ceil(tileArea * 15);
    const tilePrice = await getMaterialPrice('CKZ-003', province);
    const tileTotal = roundDecimals(tilesCount * tilePrice.unitPrice, 2);

    items.push({
      code: 'CKZ-003',
      description: `Telha Cerâmica Vermelha Tipo Lusa (${tilePrice.name})`,
      unit: 'un',
      quantity: tilesCount,
      unitPrice: tilePrice.unitPrice,
      total: tileTotal,
      chapter: '04. Cobertura',
      formula: 'AreaImplantacao * FatorTelha * 15 un/m²',
      readableFormula: `${footprintArea} m² × ${tileFactor} × 15 telhas/m² = ${tilesCount.toLocaleString()} telhas`,
      inputsUsed: { footprintArea, tileFactor, tileArea },
      sources: {
        material: 'CKZ-003',
        coefficient: 'ROOF_TILE_FACTOR',
        price: tilePrice.source,
      },
    });
  } else if (roofType === 'laje') {
    // Cobertura em laje plana impermeabilizada com tela asfáltica
    const roofWaterproofingArea = roundDecimals(footprintArea * 1.1, 2);
    const wpPrice = await getMaterialPrice('TIN-004', province); // Verniz/Membrana
    const wpTotal = roundDecimals(roofWaterproofingArea * wpPrice.unitPrice, 2);

    items.push({
      code: 'CKZ-LAJE',
      description: `Impermeabilização e Proteção de Laje de Cobertura Plana`,
      unit: 'm²',
      quantity: roofWaterproofingArea,
      unitPrice: wpPrice.unitPrice,
      total: wpTotal,
      chapter: '04. Cobertura',
      formula: 'AreaImplantacao * 1.10',
      readableFormula: `${footprintArea} m² × 1.10 = ${roofWaterproofingArea} m²`,
      inputsUsed: { footprintArea },
      sources: {
        material: 'CKZ-LAJE',
        coefficient: 'ROOF_SHEET_FACTOR',
        price: wpPrice.source,
      },
    });
  } else {
    // Chapa de Aço Zincada Ondulada / Trapezoidal (Default 'chapa', 'inclinada', 'outra')
    const sheetArea = roundDecimals(footprintArea * sheetFactor, 2);
    // 1 chapa ondulada padrão 0,40 mm × 3 m cobre cerca de 2,2 m² úteis
    const sheetsCount = Math.ceil(sheetArea / 2.2);
    const sheetPrice = await getMaterialPrice('CKZ-001', province);
    const sheetTotal = roundDecimals(sheetsCount * sheetPrice.unitPrice, 2);

    items.push({
      code: 'CKZ-001',
      description: `Chapa de Aço Zincada Ondulada 0,40 mm × 3 m (${sheetPrice.name})`,
      unit: 'un',
      quantity: sheetsCount,
      unitPrice: sheetPrice.unitPrice,
      total: sheetTotal,
      chapter: '04. Cobertura',
      formula: '(AreaImplantacao * FatorChapa) / AreaUtilChapa',
      readableFormula: `(${footprintArea} m² × ${sheetFactor}) ÷ 2.2 m²/chapa = ${sheetsCount} chapas`,
      inputsUsed: { footprintArea, sheetFactor, sheetArea },
      sources: {
        material: 'CKZ-001',
        coefficient: 'ROOF_SHEET_FACTOR',
        price: sheetPrice.source,
      },
    });
  }

  // Se não for laje plana, inclui estrutura de madeira e parafusos de fixação
  if (roofType !== 'laje') {
    // 2. Estrutura de Madeira: Área × 3.5 m linear/m²
    const timberLinearM = roundDecimals(footprintArea * timberLinearMPerM2, 2);
    // Barrões/Sarrafos em barras de 4 metros
    const timberUnits = Math.ceil(timberLinearM / 4);
    const timberPrice = await getMaterialPrice('MAD-003', province); // Barrote 7x7cm x 4m
    const timberTotal = roundDecimals(timberUnits * timberPrice.unitPrice, 2);

    items.push({
      code: 'MAD-003-COB',
      description: `Barrotes e Sarrafos de Madeira para Asnas e Vigamento de Cobertura`,
      unit: 'un',
      quantity: timberUnits,
      unitPrice: timberPrice.unitPrice,
      total: timberTotal,
      chapter: '04. Cobertura',
      formula: '(AreaImplantacao * MetrosLinearesMadeiraPorM2) / 4m',
      readableFormula: `(${footprintArea} m² × ${timberLinearMPerM2} m/m²) ÷ 4m = ${timberUnits} vigas de 4m (${timberLinearM} metros lineares)`,
      inputsUsed: { footprintArea, timberLinearMPerM2, timberLinearM },
      sources: {
        material: 'MAD-003',
        coefficient: 'ROOF_TIMBER_LINEAR_M_PER_M2',
        price: timberPrice.source,
      },
    });

    // 3. Parafusos Auto-Broquantes com Vedante EPDM: 12 un/m²
    const totalScrews = Math.ceil(footprintArea * screwsPerM2);
    const screwBoxes = Math.ceil(totalScrews / 100); // Caixas de cento (100 un)
    const screwPrice = await getMaterialPrice('CKZ-006', province);
    const screwTotal = roundDecimals(screwBoxes * screwPrice.unitPrice, 2);

    items.push({
      code: 'CKZ-006',
      description: `Parafusos Auto-Broquantes com Vedante EPDM (Centos de 100 un)`,
      unit: 'cento',
      quantity: screwBoxes,
      unitPrice: screwPrice.unitPrice,
      total: screwTotal,
      chapter: '04. Cobertura',
      formula: '(AreaImplantacao * ParafusosPorM2) / 100',
      readableFormula: `(${footprintArea} m² × ${screwsPerM2} un/m²) ÷ 100 = ${screwBoxes} centos (${totalScrews} parafusos)`,
      inputsUsed: { footprintArea, screwsPerM2, totalScrews },
      sources: {
        material: 'CKZ-006',
        coefficient: 'ROOF_SCREWS_PER_M2',
        price: screwPrice.source,
      },
    });
  }

  return items;
}
