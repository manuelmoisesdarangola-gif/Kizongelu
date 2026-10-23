/**
 * @file tests/unit/subscriptions.test.ts
 * Testes Unitários e de Integração para a Fase 13 (Subscrições e Faturação).
 *
 * Cenários Obrigatórios da Especificação:
 * 1. Subscrever -> uso de 5 orçamentos -> 6º bloqueado.
 * 2. Upgrade -> prorrata calculada corretamente.
 * 3. Cancelar -> mantém activo até renewalDate.
 */

import {
  subscribe,
  upgrade,
  cancel,
  reactivate,
  renew,
  incrementBudgetUsage,
  getSubscription,
  PLANS_CATALOG,
} from '../../lib/actions/subscriptions';

export async function runSubscriptionTests(): Promise<{
  passed: boolean;
  results: { testName: string; success: boolean; details?: string }[];
}> {
  const results: { testName: string; success: boolean; details?: string }[] = [];
  const testUserId = `test_user_${Date.now()}`;

  try {
    // -------------------------------------------------------------
    // Teste 1: Subscrever -> uso de 5 orçamentos -> 6º bloqueado
    // -------------------------------------------------------------
    const subRes = await subscribe(testUserId, 'profissional');
    if (!subRes.success || subRes.subscription.monthlyLimit !== 5) {
      throw new Error('Falha na criação da subscrição Profissional (limite esperado: 5).');
    }

    // Consome 5 orçamentos
    for (let i = 1; i <= 5; i++) {
      const usage = await incrementBudgetUsage(testUserId);
      if (usage.usageCount !== i) {
        throw new Error(`Contador de orçamentos incorreto: esperado ${i}, obtido ${usage.usageCount}`);
      }
    }

    // Verifica se o 6º cálculo é bloqueado (canCalculateNext === false)
    const checkSub = await getSubscription(testUserId);
    const isBlocked = checkSub.canCalculate === false && checkSub.subscription.usageCount >= 5;

    results.push({
      testName: 'Subscrever Profissional (5 orçamentos) -> 6º cálculo bloqueado',
      success: isBlocked,
      details: `Usados: ${checkSub.subscription.usageCount}/5 | Pode calcular: ${checkSub.canCalculate}`,
    });

    // -------------------------------------------------------------
    // Teste 2: Upgrade -> prorrata calculada corretamente
    // -------------------------------------------------------------
    // De Profissional (15.000 Kz) para Empresa (35.000 Kz)
    // Diferença mensal = 20.000 Kz -> prorrata deve ser positiva e limite sobe para 15
    const upgradeRes = await upgrade(testUserId, 'empresa');
    const hasProrata = upgradeRes.prorataKz > 0 && upgradeRes.payment.amountKz === upgradeRes.prorataKz;

    const subAfterUpgrade = await getSubscription(testUserId);
    const limitUpdated = subAfterUpgrade.subscription.monthlyLimit === 15;
    const canCalculateAgain = subAfterUpgrade.canCalculate === true; // já que usou 5 de 15

    results.push({
      testName: 'Upgrade para Empresa -> prorrata calculada e limite expandido para 15',
      success: hasProrata && limitUpdated && canCalculateAgain,
      details: `Prorrata: ${upgradeRes.prorataKz} Kz | Novo Limite: ${subAfterUpgrade.subscription.monthlyLimit} | Desbloqueado: ${canCalculateAgain}`,
    });

    // -------------------------------------------------------------
    // Teste 3: Cancelar -> mantém ativo até renewalDate
    // -------------------------------------------------------------
    const cancelRes = await cancel(testUserId, 'Teste de cancelamento');
    const subAfterCancel = await getSubscription(testUserId);

    const isCancelledPending =
      Boolean(subAfterCancel.subscription.cancelledAt) &&
      subAfterCancel.subscription.status === 'ACTIVE' &&
      subAfterCancel.canCalculate === true;

    results.push({
      testName: 'Cancelar subscrição -> mantém ativo e operacional até à data de renovação',
      success: isCancelledPending,
      details: `Ativo até: ${cancelRes.activeUntil} | CancelledAt gravado: ${Boolean(subAfterCancel.subscription.cancelledAt)}`,
    });

    // Reativação
    await reactivate(testUserId);
    const subAfterReactivate = await getSubscription(testUserId);
    const isReactivated = subAfterReactivate.subscription.cancelledAt === null;

    results.push({
      testName: 'Reativar subscrição cancelada -> anula agendamento com sucesso',
      success: isReactivated,
      details: `CancelledAt: ${subAfterReactivate.subscription.cancelledAt}`,
    });
  } catch (err: any) {
    results.push({
      testName: 'Execução de Testes de Subscrição',
      success: false,
      details: err?.message || 'Erro inesperado',
    });
  }

  const allPassed = results.every((r) => r.success);
  return { passed: allPassed, results };
}
