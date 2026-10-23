/**
 * @file lib/calculation-engine/formulas/instalacoes.ts
 * Fórmulas de cálculo de Instalações Elétricas, Telecomunicações e Hidráulicas/Canalização.
 * 
 * Especificação:
 * - Elétrica:
 *   • Cabo: Área × 8 m (básica) / 12 m (intermédia) / 18 m (completa)
 *   • Tomadas: Área ÷ 12 (básica) / ÷ 8 (intermédia) / ÷ 6 (completa)
 *   • Quadros: 1 (básica) / 2 (intermédia) / 3 (completa)
 * - Canalização:
 *   • Tubos: Área × 1.5 m
 *   • Pontos água: quartos + cozinha + WC × 2
 *   • Louças: 1 sanita + 1 lavatório por WC + 1 lava-loiça
 * - Mão de obra: 35% do total de materiais de instalações
 */

import { CalculationInput, CalculationItem, CoefficientsMap } from '../types';
import { calculateArea, roundDecimals } from '../helpers';
import { getMaterialPrice } from '../prices-provider';

export async function calculateInstalacoes(
  input: CalculationInput,
  coeff: CoefficientsMap
): Promise<CalculationItem[]> {
  const items: CalculationItem[] = [];
  const province = input.province || 'Luanda';
  const totalArea = calculateArea(input);

  const electricalLevel = input.electrical || 'intermedia';
  const plumbingLevel = input.plumbing || 'intermedia';
  const laborRate = coeff['LABOR_RATE_INSTALLATIONS'] ?? 0.35;

  // -------------------------------------------------------------
  // A. INSTALAÇÕES ELÉTRICAS
  // -------------------------------------------------------------
  let cableMultiplier = coeff['ELECTRICAL_CABLE_INTERMEDIATE_M_PER_M2'] ?? 12.0;
  let outletDivisor = coeff['ELECTRICAL_OUTLETS_AREA_DIVISOR_INTERMEDIATE'] ?? 8.0;
  let boardsCount = coeff['ELECTRICAL_BOARDS_INTERMEDIATE'] ?? 2;

  if (electricalLevel === 'basica') {
    cableMultiplier = coeff['ELECTRICAL_CABLE_BASIC_M_PER_M2'] ?? 8.0;
    outletDivisor = coeff['ELECTRICAL_OUTLETS_AREA_DIVISOR_BASIC'] ?? 12.0;
    boardsCount = coeff['ELECTRICAL_BOARDS_BASIC'] ?? 1;
  } else if (electricalLevel === 'completa') {
    cableMultiplier = coeff['ELECTRICAL_CABLE_COMPLETE_M_PER_M2'] ?? 18.0;
    outletDivisor = coeff['ELECTRICAL_OUTLETS_AREA_DIVISOR_COMPLETE'] ?? 6.0;
    boardsCount = coeff['ELECTRICAL_BOARDS_COMPLETE'] ?? 3;
  }

  // 1. Cabo Elétrico (Rolos de 100m - H07V-K 2.5 mm² de referência)
  const totalCableM = roundDecimals(totalArea * cableMultiplier, 1);
  const cableRolls = Math.max(1, Math.ceil(totalCableM / 100));
  const cablePrice = await getMaterialPrice('CAB-002', province); // Rolo 100m
  const cableTotal = roundDecimals(cableRolls * cablePrice.unitPrice, 2);

  items.push({
    code: 'CAB-002',
    description: `Cabo Elétrico Flexível 2.5 mm² (${cablePrice.name})`,
    unit: 'rolo',
    quantity: cableRolls,
    unitPrice: cablePrice.unitPrice,
    total: cableTotal,
    chapter: '05. Instalações',
    formula: '(Area * FatorCaboM2) / 100m',
    readableFormula: `(${totalArea} m² × ${cableMultiplier} m/m²) ÷ 100m = ${cableRolls} rolos (${totalCableM} metros)`,
    inputsUsed: { totalArea, electricalLevel, cableMultiplier, totalCableM },
    sources: {
      material: 'CAB-002',
      coefficient: `ELECTRICAL_CABLE_${electricalLevel.toUpperCase()}_M_PER_M2`,
      price: cablePrice.source,
    },
  });

  // 2. Tomadas e Interruptores
  const outletsCount = Math.max(4, Math.ceil(totalArea / outletDivisor));
  const outletUnitPrice = 2400; // Kz por mecanismo completo c/ espelho
  const outletsTotal = roundDecimals(outletsCount * outletUnitPrice, 2);

  items.push({
    code: 'ELE-TOM',
    description: `Pontos de Tomadas e Aparelhagem Elétrica de Embutir`,
    unit: 'un',
    quantity: outletsCount,
    unitPrice: outletUnitPrice,
    total: outletsTotal,
    chapter: '05. Instalações',
    formula: 'Area / DivisorPontosTomada',
    readableFormula: `${totalArea} m² ÷ ${outletDivisor} = ${outletsCount} aparelhos`,
    inputsUsed: { totalArea, outletDivisor, electricalLevel },
    sources: {
      coefficient: `ELECTRICAL_OUTLETS_AREA_DIVISOR_${electricalLevel.toUpperCase()}`,
      price: 'Cotação Padrão Mercado Angola',
    },
  });

  // 3. Quadros Elétricos de Distribuição
  const boardUnitPrice = 28000; // Kz por quadro equipado c/ disjuntores
  const boardsTotal = roundDecimals(boardsCount * boardUnitPrice, 2);

  items.push({
    code: 'ELE-QDR',
    description: `Quadro Elétrico de Distribuição Geral c/ Disjuntores Modulares`,
    unit: 'un',
    quantity: boardsCount,
    unitPrice: boardUnitPrice,
    total: boardsTotal,
    chapter: '05. Instalações',
    formula: 'FatorNivelQuadros',
    readableFormula: `${boardsCount} quadro(s) elétrico(s) para nível ${electricalLevel}`,
    inputsUsed: { electricalLevel, boardsCount },
    sources: {
      coefficient: `ELECTRICAL_BOARDS_${electricalLevel.toUpperCase()}`,
      price: 'Cotação Padrão Mercado Angola',
    },
  });

  // -------------------------------------------------------------
  // B. CANALIZAÇÃO E REDE HIDROSSANITÁRIA
  // -------------------------------------------------------------
  const pipeMultiplier = coeff['PLUMBING_PIPES_M_PER_M2'] ?? 1.5;
  const waterPointsPerWc = coeff['PLUMBING_WATER_POINTS_PER_WC'] ?? 2;

  // 4. Tubagem Hidráulica (Tubos PPR / PVC em barras de 4m)
  const totalPipeM = roundDecimals(totalArea * pipeMultiplier, 1);
  const pipeBars = Math.max(1, Math.ceil(totalPipeM / 4));
  const pipePrice = await getMaterialPrice('TUB-005', province); // Tubo PPR 25mm barra 4m
  const pipeTotal = roundDecimals(pipeBars * pipePrice.unitPrice, 2);

  items.push({
    code: 'TUB-005',
    description: `Tubo de Água Quente/Fria PPR Ø25mm barra 4m (${pipePrice.name})`,
    unit: 'barra',
    quantity: pipeBars,
    unitPrice: pipePrice.unitPrice,
    total: pipeTotal,
    chapter: '05. Instalações',
    formula: '(Area * FatorTubosM2) / 4m',
    readableFormula: `(${totalArea} m² × ${pipeMultiplier} m/m²) ÷ 4m = ${pipeBars} barras (${totalPipeM} metros lineares)`,
    inputsUsed: { totalArea, pipeMultiplier, totalPipeM },
    sources: {
      material: 'TUB-005',
      coefficient: 'PLUMBING_PIPES_M_PER_M2',
      price: pipePrice.source,
    },
  });

  // 5. Pontos de Água e Esgoto
  const bedrooms = input.bedrooms ?? 2;
  const bathrooms = Math.max(1, input.bathrooms ?? 1);
  const hasKitchen = input.hasKitchen !== false;
  // Pontos água = quartos + cozinha (1 se houver) + WC × 2
  const waterPoints = bedrooms + (hasKitchen ? 1 : 0) + bathrooms * waterPointsPerWc;
  const waterPointUnitPrice = 8500; // Kz (conexões, torneiras de segurança, sifões)
  const waterPointsTotal = roundDecimals(waterPoints * waterPointUnitPrice, 2);

  items.push({
    code: 'CAN-PNT',
    description: `Acessórios de Ligação de Pontos de Consumo de Água e Esgoto`,
    unit: 'un',
    quantity: waterPoints,
    unitPrice: waterPointUnitPrice,
    total: waterPointsTotal,
    chapter: '05. Instalações',
    formula: 'Quartos + Cozinha + (WC * 2)',
    readableFormula: `${bedrooms} quartos + ${hasKitchen ? 1 : 0} cozinha + (${bathrooms} WC × ${waterPointsPerWc}) = ${waterPoints} pontos`,
    inputsUsed: { bedrooms, bathrooms, hasKitchen, waterPointsPerWc },
    sources: {
      coefficient: 'PLUMBING_WATER_POINTS_PER_WC',
      price: 'Cotação Padrão Mercado Angola',
    },
  });

  // 6. Louças Sanitárias
  // 1 sanita + 1 lavatório por WC + 1 lava-loiça
  const toiletCount = bathrooms;
  const sinkCount = bathrooms;
  const kitchenSinkCount = hasKitchen ? 1 : 0;

  const toiletUnitPrice = 48000; // Kz
  const sinkUnitPrice = 26000; // Kz
  const kitchenSinkUnitPrice = 35000; // Kz

  const sanitaryTotal = roundDecimals(
    toiletCount * toiletUnitPrice + sinkCount * sinkUnitPrice + kitchenSinkCount * kitchenSinkUnitPrice,
    2
  );

  items.push({
    code: 'SAN-CONJ',
    description: `Conjunto de Louças Sanitárias (${toiletCount} Sanitas, ${sinkCount} Lavatórios, ${kitchenSinkCount} Lava-Loiça)`,
    unit: 'conjunto',
    quantity: 1,
    unitPrice: sanitaryTotal,
    total: sanitaryTotal,
    chapter: '05. Instalações',
    formula: '(NumWC * PrecoSanita) + (NumWC * PrecoLavatorio) + (Cozinha * PrecoLavaLoica)',
    readableFormula: `(${toiletCount} × ${toiletUnitPrice.toLocaleString()} Kz) + (${sinkCount} × ${sinkUnitPrice.toLocaleString()} Kz) + (${kitchenSinkCount} × ${kitchenSinkUnitPrice.toLocaleString()} Kz) = ${sanitaryTotal.toLocaleString()} Kz`,
    inputsUsed: { bathrooms, hasKitchen, toiletCount, sinkCount, kitchenSinkCount },
    sources: {
      price: 'Cotação Média de Mercado Angola',
    },
  });

  // -------------------------------------------------------------
  // C. MÃO DE OBRA DE INSTALAÇÕES (35% dos materiais de instalações)
  // -------------------------------------------------------------
  const materialsSubtotal =
    cableTotal + outletsTotal + boardsTotal + pipeTotal + waterPointsTotal + sanitaryTotal;
  const laborTotal = roundDecimals(materialsSubtotal * laborRate, 2);

  items.push({
    code: 'MO-INS',
    description: `Mão de Obra de Eletricistas e Canalizadores Qualificados (${(laborRate * 100).toFixed(0)}% dos materiais)`,
    unit: 'vg',
    quantity: 1,
    unitPrice: laborTotal,
    total: laborTotal,
    chapter: '07. Mão de Obra',
    formula: 'SubtotalMateriaisInstalacoes * FatorMaoDeObra',
    readableFormula: `${materialsSubtotal.toLocaleString()} Kz × ${(laborRate * 100).toFixed(0)}% = ${laborTotal.toLocaleString()} Kz`,
    inputsUsed: { materialsSubtotal, laborRate },
    sources: {
      coefficient: 'LABOR_RATE_INSTALLATIONS',
      price: 'Taxa Paramétrica Oficial da BD',
    },
  });

  return items;
}
