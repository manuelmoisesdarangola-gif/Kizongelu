/**
 * @file lib/calculation-engine/formulas/acabamentos.ts
 * Fórmulas de cálculo de Acabamentos (Pavimentos Cerâmicos e Pinturas Interior/Exterior).
 * 
 * Especificação:
 * - Pavimentos:
 *   • Mosaico cerâmico: Área × 1.07 (desperdício 7%)
 *   • Cimento cola: 5 kg/m²
 * - Pintura:
 *   • Interior: Área parede × 2 demãos ÷ 8 m²/L
 *   • Exterior: Área fachada × 2 demãos ÷ 6 m²/L
 * - Mão de obra: 40% do total de materiais de acabamentos
 */

import { CalculationInput, CalculationItem, CoefficientsMap } from '../types';
import {
  calculateArea,
  calculateFacadeArea,
  calculatePerimeter,
  calculateWallArea,
  roundDecimals,
} from '../helpers';
import { getMaterialPrice } from '../prices-provider';

export async function calculateAcabamentos(
  input: CalculationInput,
  coeff: CoefficientsMap
): Promise<CalculationItem[]> {
  const items: CalculationItem[] = [];
  const province = input.province || 'Luanda';
  const totalArea = calculateArea(input);
  const perimeter = calculatePerimeter(input);
  const floors = input.floors || 1;

  // Coeficientes obtidos da BD
  const floorWasteRate = coeff['FLOORING_WASTE_RATE'] ?? 0.07;
  const adhesiveKgPerM2 = coeff['FLOORING_ADHESIVE_KG_PER_M2'] ?? 5.0;
  const paintInteriorCoats = coeff['PAINT_INTERIOR_COATS'] ?? 2.0;
  const paintInteriorCoverage = coeff['PAINT_INTERIOR_COVERAGE_M2_PER_L'] ?? 8.0;
  const paintExteriorCoats = coeff['PAINT_EXTERIOR_COATS'] ?? 2.0;
  const paintExteriorCoverage = coeff['PAINT_EXTERIOR_COVERAGE_M2_PER_L'] ?? 6.0;
  const wallHeightFactor = coeff['MASONRY_WALL_HEIGHT_FACTOR'] ?? 2.8;
  const laborRate = coeff['LABOR_RATE_FINISHES'] ?? 0.40;

  // -------------------------------------------------------------
  // A. PAVIMENTOS (CERÂMICA E CIMENTO COLA)
  // -------------------------------------------------------------
  // 1. Mosaico Cerâmico (escolha do código conforme o nível de acabamento)
  let ceramicCode = 'CER-001'; // 40x40 econômico
  if (input.finishLevel === 'medio') {
    ceramicCode = 'CER-002'; // 60x60 padrão
  } else if (input.finishLevel === 'alto') {
    ceramicCode = 'CER-003'; // Porcelanato retificado 60x120
  }

  const floorAreaWithWaste = roundDecimals(totalArea * (1 + floorWasteRate), 2);
  const ceramicPrice = await getMaterialPrice(ceramicCode, province);
  const ceramicTotal = roundDecimals(floorAreaWithWaste * ceramicPrice.unitPrice, 2);

  items.push({
    code: ceramicCode,
    description: `Pavimento Cerâmico (${ceramicPrice.name})`,
    unit: 'm²',
    quantity: floorAreaWithWaste,
    unitPrice: ceramicPrice.unitPrice,
    total: ceramicTotal,
    chapter: '06. Acabamentos',
    formula: 'AreaUtil * (1 + DesperdicioPavimento)',
    readableFormula: `${totalArea} m² × (1 + ${(floorWasteRate * 100).toFixed(0)}%) = ${floorAreaWithWaste} m²`,
    inputsUsed: { totalArea, floorWasteRate, finishLevel: input.finishLevel },
    sources: {
      material: ceramicCode,
      coefficient: 'FLOORING_WASTE_RATE',
      price: ceramicPrice.source,
    },
  });

  // 2. Cimento Cola Flexível (5 kg/m² em sacos de 25kg)
  const totalAdhesiveKg = totalArea * adhesiveKgPerM2;
  const adhesiveBags = Math.ceil(totalAdhesiveKg / 25);
  const adhesivePrice = await getMaterialPrice('CIM-004', province); // Saco 25kg
  const adhesiveTotal = roundDecimals(adhesiveBags * adhesivePrice.unitPrice, 2);

  items.push({
    code: 'CIM-004',
    description: `Cimento Cola Flexível C2TE 25kg para Assentamento Cerâmico`,
    unit: 'saco',
    quantity: adhesiveBags,
    unitPrice: adhesivePrice.unitPrice,
    total: adhesiveTotal,
    chapter: '06. Acabamentos',
    formula: '(AreaUtil * ConsumoColaKgM2) / 25kg',
    readableFormula: `(${totalArea} m² × ${adhesiveKgPerM2} kg/m²) ÷ 25kg = ${adhesiveBags} sacos (${totalAdhesiveKg} kg)`,
    inputsUsed: { totalArea, adhesiveKgPerM2, totalAdhesiveKg },
    sources: {
      material: 'CIM-004',
      coefficient: 'FLOORING_ADHESIVE_KG_PER_M2',
      price: adhesivePrice.source,
    },
  });

  // -------------------------------------------------------------
  // B. PINTURAS (INTERIOR E EXTERIOR)
  // -------------------------------------------------------------
  // 3. Tinta Plástica Interior: Área parede × 2 demãos ÷ 8 m²/L (Baldes de 15L)
  const wallArea = calculateWallArea(totalArea, wallHeightFactor);
  const interiorLiters = (wallArea * paintInteriorCoats) / paintInteriorCoverage;
  const interiorBuckets = Math.max(1, Math.ceil(interiorLiters / 15)); // Baldes de 15L
  const paintIntPrice = await getMaterialPrice('TIN-001', province); // Balde 15L
  const paintIntTotal = roundDecimals(interiorBuckets * paintIntPrice.unitPrice, 2);

  items.push({
    code: 'TIN-001',
    description: `Tinta Plástica Mate Lavável Interior (Balde 15L)`,
    unit: 'balde',
    quantity: interiorBuckets,
    unitPrice: paintIntPrice.unitPrice,
    total: paintIntTotal,
    chapter: '06. Acabamentos',
    formula: '((AreaParede * DemaosInterior) / RendimentoInterior) / 15L',
    readableFormula: `((${wallArea.toFixed(2)} m² × ${paintInteriorCoats} demãos) ÷ ${paintInteriorCoverage} m²/L) ÷ 15L = ${interiorBuckets} baldes (${interiorLiters.toFixed(1)} L)`,
    inputsUsed: { wallArea, paintInteriorCoats, paintInteriorCoverage, interiorLiters },
    sources: {
      material: 'TIN-001',
      coefficient: 'PAINT_INTERIOR_COATS, PAINT_INTERIOR_COVERAGE_M2_PER_L',
      price: paintIntPrice.source,
    },
  });

  // 4. Tinta Acrílica Exterior (Fachadas): Área fachada × 2 demãos ÷ 6 m²/L (Baldes de 15L)
  const facadeArea = calculateFacadeArea(perimeter, floors, wallHeightFactor);
  const exteriorLiters = (facadeArea * paintExteriorCoats) / paintExteriorCoverage;
  const exteriorBuckets = Math.max(1, Math.ceil(exteriorLiters / 15));
  const paintExtPrice = await getMaterialPrice('TIN-002', province); // Balde 15L
  const paintExtTotal = roundDecimals(exteriorBuckets * paintExtPrice.unitPrice, 2);

  items.push({
    code: 'TIN-002',
    description: `Tinta Acrílica 100% Anti-Fungos para Fachada Exterior (Balde 15L)`,
    unit: 'balde',
    quantity: exteriorBuckets,
    unitPrice: paintExtPrice.unitPrice,
    total: paintExtTotal,
    chapter: '06. Acabamentos',
    formula: '((AreaFachada * DemaosExterior) / RendimentoExterior) / 15L',
    readableFormula: `((${facadeArea.toFixed(2)} m² × ${paintExteriorCoats} demãos) ÷ ${paintExteriorCoverage} m²/L) ÷ 15L = ${exteriorBuckets} baldes (${exteriorLiters.toFixed(1)} L)`,
    inputsUsed: { perimeter, facadeArea, paintExteriorCoats, paintExteriorCoverage, exteriorLiters },
    sources: {
      material: 'TIN-002',
      coefficient: 'PAINT_EXTERIOR_COATS, PAINT_EXTERIOR_COVERAGE_M2_PER_L',
      price: paintExtPrice.source,
    },
  });

  // -------------------------------------------------------------
  // C. MÃO DE OBRA DE ACABAMENTOS (40% dos materiais de acabamentos)
  // -------------------------------------------------------------
  const materialsSubtotal = ceramicTotal + adhesiveTotal + paintIntTotal + paintExtTotal;
  const laborTotal = roundDecimals(materialsSubtotal * laborRate, 2);

  items.push({
    code: 'MO-ACA',
    description: `Mão de Obra de Ladrilhadores e Pintores Especializados (${(laborRate * 100).toFixed(0)}% dos materiais)`,
    unit: 'vg',
    quantity: 1,
    unitPrice: laborTotal,
    total: laborTotal,
    chapter: '07. Mão de Obra',
    formula: 'SubtotalMateriaisAcabamentos * FatorMaoDeObra',
    readableFormula: `${materialsSubtotal.toLocaleString()} Kz × ${(laborRate * 100).toFixed(0)}% = ${laborTotal.toLocaleString()} Kz`,
    inputsUsed: { materialsSubtotal, laborRate },
    sources: {
      coefficient: 'LABOR_RATE_FINISHES',
      price: 'Taxa Paramétrica Oficial da BD',
    },
  });

  return items;
}
