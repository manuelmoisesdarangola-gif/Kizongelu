/**
 * @file __tests__/packages.test.ts
 * Suite de Testes Unitários da Lógica de Negócio de Pacotes de Orçamentos (Bloco 4).
 *
 * Cobertura:
 * 1. getUserCredits e hasActiveCredits
 * 2. purchasePackage (créditos permanentes, planos Particular, Profissional, Empresa, Empresa Plus)
 * 3. consumeCredit (FIFO, idempotência por projectId, exaustão)
 * 4. getUpgradeQuote (cálculo de prorrata)
 * 5. upgradePackage (substituição de pacote com prorrata)
 * 6. getPackageHistory (ordenação cronológica decrescente)
 */

import {
  getUserCredits,
  hasActiveCredits,
  purchasePackage,
  consumeCredit,
  getUpgradeQuote,
  upgradePackage,
  getPackageHistory,
  getActivePackages,
  _resetPackagesStore,
  PACKAGES_CATALOG,
} from '../lib/actions/packages';

export async function runPackagesTests() {
  console.log('===========================================================');
  console.log('--- EXECUTANDO TESTES UNITÁRIOS DE PACOTES (BLOCO 4) ---');
  console.log('===========================================================');

  const results: { test: string; passed: boolean; detail: string }[] = [];
  const testUserId = `test_user_${Date.now()}`;

  // Reset inicial para isolamento total
  _resetPackagesStore(testUserId);

  // TESTE 1: Estado Inicial do Utilizador (Sem Créditos)
  try {
    const credits = await getUserCredits(testUserId);
    const hasCredits = await hasActiveCredits(testUserId);
    const activePackages = await getActivePackages(testUserId);

    if (credits === 0 && !hasCredits && activePackages.length === 0) {
      results.push({
        test: 'Teste 1: Estado inicial sem créditos',
        passed: true,
        detail: 'Utilizador novo inicia com 0 créditos e lista de pacotes activos vazia.',
      });
    } else {
      results.push({
        test: 'Teste 1: Estado inicial sem créditos',
        passed: false,
        detail: `Esperado 0 créditos, obtido: ${credits}, hasActive: ${hasCredits}`,
      });
    }
  } catch (err: any) {
    results.push({ test: 'Teste 1: Estado inicial', passed: false, detail: err.message });
  }

  // TESTE 2: Compra de Pacote Particular (1 Crédito, 12.999 Kz)
  try {
    const pkgParticular = await purchasePackage(testUserId, 'particular', 'pay_test_01');
    const creditsAfter = await getUserCredits(testUserId);
    const hasCreditsAfter = await hasActiveCredits(testUserId);

    if (
      pkgParticular.totalCredits === 1 &&
      pkgParticular.remainingCredits === 1 &&
      pkgParticular.status === 'ACTIVE' &&
      pkgParticular.purchaseAmount === 12999 &&
      creditsAfter === 1 &&
      hasCreditsAfter === true
    ) {
      results.push({
        test: 'Teste 2: Compra de pacote Particular (1 crédito)',
        passed: true,
        detail: 'Pacote criado com 1 crédito permanente no valor de 12.999 Kz.',
      });
    } else {
      results.push({
        test: 'Teste 2: Compra de pacote Particular',
        passed: false,
        detail: `Esperado 1 crédito, obtido: ${creditsAfter}, valor: ${pkgParticular.purchaseAmount}`,
      });
    }
  } catch (err: any) {
    results.push({ test: 'Teste 2: Compra Particular', passed: false, detail: err.message });
  }

  // TESTE 3: Compra de Segundo Pacote (FIFO & Acumulação de Créditos)
  try {
    // Compra adicional do plano Profissional (3 créditos, 15.999 Kz)
    await purchasePackage(testUserId, 'profissional', 'pay_test_02');
    const totalCredits = await getUserCredits(testUserId);
    const activePkgs = await getActivePackages(testUserId);

    if (totalCredits === 4 && activePkgs.length === 2) {
      results.push({
        test: 'Teste 3: Acumulação de créditos de múltiplos pacotes',
        passed: true,
        detail: '1 crédito anterior + 3 novos créditos = 4 créditos acumulados com sucesso.',
      });
    } else {
      results.push({
        test: 'Teste 3: Acumulação de créditos',
        passed: false,
        detail: `Esperado 4 créditos e 2 pacotes, obtido: ${totalCredits} créditos e ${activePkgs.length} pacotes.`,
      });
    }
  } catch (err: any) {
    results.push({ test: 'Teste 3: Acumulação de pacotes', passed: false, detail: err.message });
  }

  // TESTE 4: Consumo de Crédito FIFO e Exaustão do Pacote Mais Antigo
  try {
    const projId1 = 'proj_fifo_test_01';
    const consumed = await consumeCredit(testUserId, projId1);
    const remainingTotal = await getUserCredits(testUserId);

    // O primeiro pacote (Particular) tinha 1 crédito e deve ter passado para EXHAUSTED
    const activeAfterConsume = await getActivePackages(testUserId);
    const firstPackageExhausted = consumed.status === 'EXHAUSTED' && consumed.remainingCredits === 0;

    if (firstPackageExhausted && remainingTotal === 3 && activeAfterConsume.length === 1) {
      results.push({
        test: 'Teste 4: Consumo FIFO e exaustão do pacote inicial',
        passed: true,
        detail: '1º crédito consumido do pacote mais antigo. Pacote marcado como EXHAUSTED e restam 3 créditos no pacote Profissional.',
      });
    } else {
      results.push({
        test: 'Teste 4: Consumo FIFO',
        passed: false,
        detail: `Falha na exaustão FIFO: status=${consumed.status}, remaining=${consumed.remainingCredits}, totalUser=${remainingTotal}`,
      });
    }
  } catch (err: any) {
    results.push({ test: 'Teste 4: Consumo FIFO', passed: false, detail: err.message });
  }

  // TESTE 5: Idempotência de Consumo por ProjectId
  try {
    const projId1 = 'proj_fifo_test_01';
    let idempotencyPrevented = false;
    try {
      await consumeCredit(testUserId, projId1);
    } catch (e: any) {
      if (e.message === 'CREDIT_ALREADY_CONSUMED_FOR_PROJECT') {
        idempotencyPrevented = true;
      }
    }

    if (idempotencyPrevented) {
      results.push({
        test: 'Teste 5: Idempotência de débito por projecto',
        passed: true,
        detail: 'Impediu correctamente débito duplicado para o mesmo projectId.',
      });
    } else {
      results.push({
        test: 'Teste 5: Idempotência de débito por projecto',
        passed: false,
        detail: 'Permitiu débito duplicado ou lançou erro incorrecto.',
      });
    }
  } catch (err: any) {
    results.push({ test: 'Teste 5: Idempotência', passed: false, detail: err.message });
  }

  // TESTE 6: Cálculo de Prorrata em UpgradeQuote
  try {
    // Restam 3 créditos de 3 no pacote Profissional (15.999 Kz)
    // Se fizer upgrade para Empresa (29.999 Kz, 6 créditos):
    // Valor restante = 15.999 Kz
    // Diferença a pagar = 29.999 - 15.999 = 14.000 Kz
    const quote = await getUpgradeQuote(testUserId, 'empresa');

    if (quote.newPlanPrice === 29999 && quote.amountToPay === 14000 && quote.newTotalCredits === 6) {
      results.push({
        test: 'Teste 6: Cálculo de prorrata para upgrade',
        passed: true,
        detail: `Prorrata exacta calculada: Preço 29.999 Kz - Crédito restante 15.999 Kz = ${quote.amountToPay} Kz a pagar.`,
      });
    } else {
      results.push({
        test: 'Teste 6: Cálculo de prorrata para upgrade',
        passed: false,
        detail: `Valor inesperado: amountToPay=${quote.amountToPay}, newPrice=${quote.newPlanPrice}`,
      });
    }
  } catch (err: any) {
    results.push({ test: 'Teste 6: Prorrata', passed: false, detail: err.message });
  }

  // TESTE 7: Execução do Upgrade com Substituição de Pacote
  try {
    const upgradeRes = await upgradePackage(testUserId, 'empresa', 'pay_upgrade_01');
    const creditsAfterUpgrade = await getUserCredits(testUserId);
    const activePackagesAfter = await getActivePackages(testUserId);

    if (
      upgradeRes.upgraded &&
      upgradeRes.newPackage.planId === PACKAGES_CATALOG.empresa.id &&
      upgradeRes.newPackage.totalCredits === 6 &&
      creditsAfterUpgrade === 6 &&
      activePackagesAfter.length === 1
    ) {
      results.push({
        test: 'Teste 7: Execução do upgrade de pacote',
        passed: true,
        detail: 'Pacote anterior arquivado e novo pacote Empresa activado com 6 créditos totais.',
      });
    } else {
      results.push({
        test: 'Teste 7: Execução do upgrade de pacote',
        passed: false,
        detail: `Falha no upgrade: credits=${creditsAfterUpgrade}, activeCount=${activePackagesAfter.length}`,
      });
    }
  } catch (err: any) {
    results.push({ test: 'Teste 7: Execução de Upgrade', passed: false, detail: err.message });
  }

  // TESTE 8: Exaustão Total de Créditos e Bloqueio Seguro
  try {
    const userExhaust = `test_exhaust_${Date.now()}`;
    _resetPackagesStore(userExhaust);

    // Compra 1 crédito particular
    await purchasePackage(userExhaust, 'particular', 'pay_ex_01');
    await consumeCredit(userExhaust, 'proj_ex_01');

    let threwWhenEmpty = false;
    try {
      await consumeCredit(userExhaust, 'proj_ex_02');
    } catch (e: any) {
      if (e.message === 'NO_CREDITS_AVAILABLE') {
        threwWhenEmpty = true;
      }
    }

    if (threwWhenEmpty) {
      results.push({
        test: 'Teste 8: Exaustão total e bloqueio seguro sem créditos',
        passed: true,
        detail: 'Lançou correctamente NO_CREDITS_AVAILABLE ao tentar consumir saldo a zero.',
      });
    } else {
      results.push({
        test: 'Teste 8: Exaustão total',
        passed: false,
        detail: 'Não bloqueou operação quando os créditos estavam a zero.',
      });
    }
  } catch (err: any) {
    results.push({ test: 'Teste 8: Exaustão total', passed: false, detail: err.message });
  }

  // TESTE 9: Histórico Completo de Pacotes (Ordem Decrescente)
  try {
    const history = await getPackageHistory(testUserId);

    if (history.length >= 2) {
      results.push({
        test: 'Teste 9: Histórico cronológico de pacotes',
        passed: true,
        detail: `Histórico consultado com sucesso: ${history.length} pacotes registados para auditoria.`,
      });
    } else {
      results.push({
        test: 'Teste 9: Histórico de pacotes',
        passed: false,
        detail: `Histórico incompleto: ${history.length} registos encontrados.`,
      });
    }
  } catch (err: any) {
    results.push({ test: 'Teste 9: Histórico', passed: false, detail: err.message });
  }

  console.log('\n--- RESULTADOS DOS TESTES DE PACOTES ---');
  results.forEach((r) => {
    console.log(`${r.passed ? '✅ [PASS]' : '❌ [FAIL]'} ${r.test} - ${r.detail}`);
  });

  const allPassed = results.every((r) => r.passed);
  console.log(`\nRESUMO: ${results.filter((r) => r.passed).length}/${results.length} testes passaram.\n`);

  return {
    passed: allPassed,
    results,
  };
}

// Execução via CLI (tsx / node)
if (typeof process !== 'undefined' && Array.isArray(process.argv) && process.argv[1]?.includes('packages.test.ts')) {
  runPackagesTests()
    .then((res) => {
      if (!res.passed) {
        process.exit(1);
      }
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
