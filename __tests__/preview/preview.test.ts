/**
 * @file __tests__/preview/preview.test.ts
 * Suite de Testes Unitários da Preview, Confiança e Paywall.
 */

import { getPreview, unlockProject, UNLOCK_PRICE_KZ } from '../../lib/actions/preview';

export async function runPreviewTests() {
  console.log('======================================================');
  console.log('--- EXECUTANDO TESTES UNITÁRIOS DE PREVIEW (FASE 6) ---');
  console.log('======================================================');

  const results: { test: string; passed: boolean; detail: string }[] = [];

  // TESTE 1: Estrutura Segura do Preview (Capítulos e Amostras)
  try {
    const preview = await getPreview('proj_test_preview_01');
    const first3Unlocked = preview.chapters.slice(0, 3).every((c) => !c.isLocked);
    const last3Locked = preview.chapters.slice(3).every((c) => c.isLocked);
    const lockedHaveNoSample = preview.chapters.slice(3).every((c) => c.sampleItems === undefined);

    if (first3Unlocked && last3Locked && lockedHaveNoSample && preview.chapters.length === 6) {
      results.push({
        test: 'Teste 1: Estrutura segura de capítulos (3 visíveis, 3 bloqueados)',
        passed: true,
        detail: 'Capítulos 1 a 3 abertos com itens amostra; Capítulos 4 a 6 estritamente bloqueados e sem itens vazados.',
      });
    } else {
      results.push({
        test: 'Teste 1: Estrutura de capítulos',
        passed: false,
        detail: 'Falha no isolamento de capítulos bloqueados.',
      });
    }
  } catch (err: any) {
    results.push({ test: 'Teste 1', passed: false, detail: err.message });
  }

  // TESTE 2: Cronograma das 10 Fases e Custo Acumulado
  try {
    const preview = await getPreview('proj_test_preview_01');
    const has10Phases = preview.phases.length === 10;
    const finalAccumulatedMatches =
      preview.phases[9].accumulatedCost === preview.totals.grandTotal;
    const firstPhaseUnlockedOnly =
      !preview.phases[0].isLocked && preview.phases.slice(1).every((p) => p.isLocked);

    if (has10Phases && finalAccumulatedMatches && firstPhaseUnlockedOnly) {
      results.push({
        test: 'Teste 2: Cronograma vertical de 10 fases com custos acumulados',
        passed: true,
        detail: `10 fases geradas. Acumulado final (${preview.phases[9].accumulatedCost.toLocaleString('pt-PT')} Kz) bate com o Total Geral.`,
      });
    } else {
      results.push({
        test: 'Teste 2: Cronograma de 10 fases',
        passed: false,
        detail: 'Inconsistência nos acumulados ou fases bloqueadas.',
      });
    }
  } catch (err: any) {
    results.push({ test: 'Teste 2', passed: false, detail: err.message });
  }

  // TESTE 3: Cálculo do Marco da Cobertura (Fases 1 a 5)
  try {
    const preview = await getPreview('proj_test_preview_01');
    const { coberturaCost, coberturaPercentage, coberturaMessage } = preview.milestoneCoverage;
    const manualSum5 = preview.phases.slice(0, 5).reduce((acc, p) => acc + p.cost, 0);

    if (coberturaCost === manualSum5 && coberturaPercentage > 0 && coberturaMessage.includes('Cobertura')) {
      results.push({
        test: 'Teste 3: Cálculo do marco "Quanto preciso para chegar à cobertura?"',
        passed: true,
        detail: `Custo até à cobertura calculado: ${coberturaCost.toLocaleString('pt-PT')} Kz (${coberturaPercentage}% da obra).`,
      });
    } else {
      results.push({
        test: 'Teste 3: Marco da cobertura',
        passed: false,
        detail: 'Cálculo do marco da cobertura incorreto.',
      });
    }
  } catch (err: any) {
    results.push({ test: 'Teste 3', passed: false, detail: err.message });
  }

  // TESTE 4: Comparação Orçamental com Orçamento do Cliente
  try {
    const preview = await getPreview('proj_test_preview_01');
    const comp = preview.budgetComparison;

    if (comp.estimatedTotal > 0 && comp.status !== 'UNKNOWN' && comp.message.length > 10) {
      results.push({
        test: 'Teste 4: Comparação lado a lado entre estimativa e orçamento do cliente',
        passed: true,
        detail: `Status: ${comp.status} | Diferença: ${comp.difference.toLocaleString('pt-PT')} Kz | Mensagem gerada com clareza.`,
      });
    } else {
      results.push({
        test: 'Teste 4: Comparação orçamental',
        passed: false,
        detail: 'Falha ao comparar orçamento indicado com estimativa.',
      });
    }
  } catch (err: any) {
    results.push({ test: 'Teste 4', passed: false, detail: err.message });
  }

  // TESTE 5: Desbloqueio Paywall Adaptativo (Particular vs Profissional com Subscrição)
  try {
    // Particular paga 27.000 Kz
    const particularUnlock = await unlockProject('proj_particular_test', 'PARTICULAR', false);
    // Profissional com subscrição paga 0 Kz
    const proUnlock = await unlockProject('proj_pro_test', 'PROFISSIONAL', true);

    if (
      particularUnlock.success &&
      particularUnlock.amountCharged === UNLOCK_PRICE_KZ &&
      proUnlock.success &&
      proUnlock.amountCharged === 0
    ) {
      results.push({
        test: 'Teste 5: Desbloqueio adaptativo (Particular 27.000 Kz vs Profissional 0 Kz)',
        passed: true,
        detail: `Particular cobrado ${particularUnlock.amountCharged.toLocaleString('pt-PT')} Kz; Profissional cobrado ${proUnlock.amountCharged} Kz.`,
      });
    } else {
      results.push({
        test: 'Teste 5: Desbloqueio adaptativo',
        passed: false,
        detail: 'Falha nas regras de cobrança por tipo de utilizador.',
      });
    }
  } catch (err: any) {
    results.push({ test: 'Teste 5', passed: false, detail: err.message });
  }

  console.log('\n--- RESULTADOS DOS TESTES UNITÁRIOS DE PREVIEW ---');
  for (const r of results) {
    console.log(`${r.passed ? '✅ [PASS]' : '❌ [FAIL]'} ${r.test}: ${r.detail}`);
  }
  console.log('======================================================\n');

  const allPassed = results.every((r) => r.passed);
  return {
    passed: allPassed,
    message: allPassed ? 'Todos os testes de Preview passaram com sucesso!' : 'Alguns testes falharam.',
    results,
  };
}

// Execução direta se chamado via CLI
if (typeof process !== 'undefined' && Array.isArray(process.argv) && process.argv[1]?.includes('preview.test.ts')) {
  runPreviewTests()
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
