/**
 * @file __tests__/calculation-engine/engine.test.ts
 * Testes unitários para o Motor de Cálculo Determinístico do Kizongelu.
 */

import { calculate } from '../../lib/calculation-engine';
import { CalculationInput } from '../../lib/calculation-engine/types';

export async function runEngineTests(): Promise<{ passed: boolean; message: string; results: any[] }> {
  const results: any[] = [];

  console.log('\n======================================================');
  console.log('--- EXECUTANDO TESTES UNITÁRIOS DO MOTOR DE CÁLCULO ---');
  console.log('======================================================\n');

  // -------------------------------------------------------------
  // TESTE 1: Casa T3 200m² em Luanda com Acabamento Médio
  // -------------------------------------------------------------
  const t3Input: CalculationInput = {
    type: 'NOVA',
    province: 'Luanda',
    municipality: 'Talatona',
    area: 200,
    length: 20,
    width: 10,
    floors: 1,
    bedrooms: 3,
    bathrooms: 2,
    hasLivingRoom: true,
    hasKitchen: true,
    hasGarage: true,
    hasBalcony: true,
    hasAnnex: false,
    foundation: 'sapata_corrida',
    structure: 'betao_armado',
    roof: 'chapa',
    finishLevel: 'medio',
    electrical: 'intermedia',
    plumbing: 'intermedia',
  };

  const result1 = await calculate(t3Input, 'v1.0');

  // Validação 1: Existência de itens em todos os capítulos essenciais
  const hasItems = result1.items.length >= 15;
  results.push({
    test: 'Teste 1.1: Geração de itens de obra',
    passed: hasItems,
    detail: `Gerados ${result1.items.length} itens orçamentários detalhados.`,
  });

  // Validação 2: Todos os totais somam perfeitamente sem discrepâncias
  const calculatedSum = Math.round((result1.materialsTotal + result1.laborTotal + result1.transportTotal) * 100) / 100;
  const matchesGrandTotal = Math.abs(calculatedSum - result1.grandTotal) < 0.05;
  results.push({
    test: 'Teste 1.2: Soma matemática consistente dos totais',
    passed: matchesGrandTotal,
    detail: `Materiais (${result1.materialsTotal.toLocaleString()} Kz) + Mão de Obra (${result1.laborTotal.toLocaleString()} Kz) + Transporte (${result1.transportTotal.toLocaleString()} Kz) = ${result1.grandTotal.toLocaleString()} Kz`,
  });

  // Validação 3: Nenhum valor monetário ou quantitativo negativo
  let anyNegative = false;
  for (const it of result1.items) {
    if (it.quantity < 0 || it.unitPrice < 0 || it.total < 0) {
      anyNegative = true;
      break;
    }
  }
  results.push({
    test: 'Teste 1.3: Não-negatividade absoluta dos valores',
    passed: !anyNegative,
    detail: 'Todas as quantidades, preços unitários e subtotais são estritamente maiores ou iguais a zero.',
  });

  // Validação 4: Coerência do Índice de Confiança (HIGH)
  const isHighConfidence = result1.confidence.level === 'HIGH';
  results.push({
    test: 'Teste 1.4: Índice de Confiança HIGH para inputs completos',
    passed: isHighConfidence,
    detail: `Nível obtido: ${result1.confidence.level} (Score: ${result1.confidence.score}/100)`,
  });

  // -------------------------------------------------------------
  // TESTE 2: Validação de Incerteza ("não sei") -> Confiança LOW
  // -------------------------------------------------------------
  const uncertainInput: CalculationInput = {
    type: 'NOVA',
    province: 'Benguela',
    area: 120,
    hasLivingRoom: true,
    hasKitchen: true,
    hasGarage: false,
    hasBalcony: false,
    hasAnnex: false,
    foundation: 'nao_sei',
    structure: 'nao_sei',
    roof: 'chapa',
    finishLevel: 'economico',
    electrical: 'basica',
    plumbing: 'basica',
  };

  const result2 = await calculate(uncertainInput, 'v1.0');
  const isLowConfidence = result2.confidence.level === 'LOW';
  results.push({
    test: 'Teste 2: Confiança LOW ao selecionar "não sei" em estrutura/fundação',
    passed: isLowConfidence,
    detail: `Nível obtido: ${result2.confidence.level} (Motivos: ${result2.confidence.reasons.length})`,
  });

  // -------------------------------------------------------------
  // TESTE 3: Comparação Logística entre Luanda (3%) e Malanje (15%)
  // -------------------------------------------------------------
  const malanjeInput = { ...t3Input, province: 'Malanje' };
  const resultMalanje = await calculate(malanjeInput, 'v1.0');
  const transportIncreased = resultMalanje.transportTotal > result1.transportTotal;

  results.push({
    test: 'Teste 3: Coeficiente de transporte regional (Malanje > Luanda)',
    passed: transportIncreased,
    detail: `Transporte Luanda: ${result1.transportTotal.toLocaleString()} Kz (3%) vs Malanje: ${resultMalanje.transportTotal.toLocaleString()} Kz (15%)`,
  });

  const allPassed = results.every((r) => r.passed);

  console.log('\n--- RESULTADOS DOS TESTES UNITÁRIOS ---');
  for (const r of results) {
    console.log(`${r.passed ? '✅ [PASS]' : '❌ [FAIL]'} ${r.test}: ${r.detail}`);
  }
  console.log('======================================================\n');

  return {
    passed: allPassed,
    message: allPassed ? 'Todos os testes unitários passaram com sucesso!' : 'Alguns testes falharam.',
    results,
  };
}

// Execução direta se corrido com tsx/node
if (typeof process !== 'undefined' && Array.isArray(process.argv) && process.argv[1]?.includes('engine.test.ts')) {
  runEngineTests()
    .then((res) => {
      if (!res.passed) {
        process.exit(1);
      }
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
