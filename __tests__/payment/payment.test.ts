/**
 * @file __tests__/payment/payment.test.ts
 * Testes Unitários e de Integração para a :
 * Pagamento Manual, Upload de Comprovativo, Rate Limiting, Auditoria e Desbloqueio.
 */

import {
  submitPaymentProof,
  reviewPayment,
  getPaymentStatus,
  getNotifications,
  clearPaymentsStore,
  generatePaymentReference,
} from '../../lib/actions/payment';
import { getRecentAuditLogs, clearAuditLogs } from '../../lib/audit';
import { resetRateLimit } from '../../lib/rate-limit';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ [FAIL] ${message}`);
    throw new Error(message);
  }
  console.log(`✅ [PASS] ${message}`);
}

async function runPaymentPhase7Tests() {
  console.log('======================================================');
  console.log('--- EXECUTANDO TESTES UNITÁRIOS DE PAGAMENTO (FASE 7) ---');
  console.log('======================================================');

  clearPaymentsStore();
  clearAuditLogs();
  const testProjectId = `proj_test_${Date.now()}`;
  resetRateLimit(`upload_proof:${testProjectId}`);

  // ----------------------------------------------------
  // Teste 1: Formato da Referência Bancária Auto-gerada
  // ----------------------------------------------------
  const ref = generatePaymentReference(testProjectId);
  const currentYear = new Date().getFullYear();
  assert(
    ref.startsWith(`KZ-${currentYear}-`),
    `Teste 1: Referência gerada no formato correto: ${ref}`
  );

  // ----------------------------------------------------
  // Teste 2: Submissão de comprovativo com sucesso
  // ----------------------------------------------------
  const submitRes = await submitPaymentProof({
    projectId: testProjectId,
    fileUrl: 'https://storage.kizongelu.ao/recibos/comprovativo_bai.pdf',
    fileName: 'comprovativo_bai.pdf',
    fileSize: 320000,
    fileType: 'application/pdf',
    notes: 'Transferência feita a partir do Multicaixa Express.',
    method: 'TRANSFERENCIA',
    userId: 'usr_particular_01',
  });

  assert(submitRes.success === true, 'Teste 2.1: Submissão do comprovativo foi bem-sucedida.');
  assert(
    submitRes.payment?.status === 'PROOF_RECEIVED',
    `Teste 2.2: Pagamento criado com status PROOF_RECEIVED (${submitRes.payment?.status}).`
  );
  assert(
    submitRes.payment?.amount === 27000,
    `Teste 2.3: Montante fixado em 27.000 Kz (${submitRes.payment?.amount} Kz).`
  );

  // Verifica notificações
  const notifs = getNotifications();
  const hasAdminNotif = notifs.some((n) => n.recipientRole === 'ADMIN' && n.type === 'PAYMENT_PROOF_RECEIVED');
  const hasUserNotif = notifs.some((n) => n.recipientRole === 'USER' && n.type === 'PAYMENT_PROOF_RECEIVED');
  assert(hasAdminNotif, 'Teste 2.4: Notificação para o administrador disparada.');
  assert(hasUserNotif, 'Teste 2.5: Notificação para o utilizador disparada.');

  // ----------------------------------------------------
  // Teste 3: Auditoria (AuditLog)
  // ----------------------------------------------------
  const auditLogs = getRecentAuditLogs();
  const hasPaymentAudit = auditLogs.some((l) => l.event === 'PAYMENT_PROOF_SUBMITTED');
  assert(hasPaymentAudit, 'Teste 3: Registo de auditoria criado para PAYMENT_PROOF_SUBMITTED.');

  // ----------------------------------------------------
  // Teste 4: Consulta de Estado e Linha do Tempo
  // ----------------------------------------------------
  const statusBeforeApproval = await getPaymentStatus(testProjectId);
  assert(
    statusBeforeApproval.hasPayment === true,
    'Teste 4.1: getPaymentStatus detetou pagamento associado ao projeto.'
  );
  assert(
    statusBeforeApproval.isUnlocked === false,
    'Teste 4.2: Projeto ainda não está desbloqueado antes da aprovação.'
  );
  assert(
    statusBeforeApproval.timeline.length === 4,
    `Teste 4.3: Linha do tempo possui as 4 etapas requeridas (${statusBeforeApproval.timeline.length}).`
  );
  assert(
    statusBeforeApproval.timeline[0].status === 'COMPLETED' &&
      statusBeforeApproval.timeline[1].status === 'IN_PROGRESS',
    'Teste 4.4: Etapa 1 completa e Etapa 2 em análise.'
  );

  // ----------------------------------------------------
  // Teste 5: Aprovação por Admin -> Desbloqueio do Projeto e PDF
  // ----------------------------------------------------
  const paymentId = submitRes.payment!.id;
  const reviewRes = await reviewPayment({
    paymentId,
    action: 'APPROVE',
    adminId: 'usr_admin_financeiro',
  });

  assert(reviewRes.success === true, 'Teste 5.1: Aprovação pelo administrador executada com sucesso.');
  assert(
    reviewRes.payment?.status === 'APPROVED',
    `Teste 5.2: Status do pagamento alterado para APPROVED (${reviewRes.payment?.status}).`
  );

  const statusAfterApproval = await getPaymentStatus(testProjectId);
  assert(
    statusAfterApproval.isUnlocked === true,
    'Teste 5.3: Projeto marcado como UNLOCKED após aprovação.'
  );
  assert(
    statusAfterApproval.projectStatus === 'UNLOCKED',
    `Teste 5.4: Estado do projeto atualizado para UNLOCKED.`
  );
  assert(
    statusAfterApproval.timeline[2].status === 'COMPLETED' &&
      statusAfterApproval.timeline[3].status === 'COMPLETED',
    'Teste 5.5: Todas as etapas da timeline marcadas como concluídas (Aprovação e Documento Desbloqueado).'
  );

  const auditLogsAfterApproval = getRecentAuditLogs();
  const hasApproveAudit = auditLogsAfterApproval.some((l) => l.event === 'PAYMENT_APPROVED');
  assert(hasApproveAudit, 'Teste 5.6: Registo de auditoria criado para PAYMENT_APPROVED.');

  // ----------------------------------------------------
  // Teste 6: Rate Limiting (Máximo 5 envios por projeto por hora)
  // ----------------------------------------------------
  const rateLimitProjectId = `proj_rate_${Date.now()}`;
  resetRateLimit(`upload_proof:${rateLimitProjectId}`);

  // Envia 5 comprovativos (devem passar)
  for (let i = 1; i <= 5; i++) {
    const res = await submitPaymentProof({
      projectId: rateLimitProjectId,
      fileUrl: `https://storage.kizongelu.ao/recibo_${i}.pdf`,
      fileName: `recibo_${i}.pdf`,
      fileSize: 100000,
      fileType: 'application/pdf',
    });
    assert(res.success === true, `Teste 6.${i}: Tentativa ${i} de 5 aceite dentro da cota horária.`);
  }

  // 6ª tentativa deve ser bloqueada
  const blockedRes = await submitPaymentProof({
    projectId: rateLimitProjectId,
    fileUrl: 'https://storage.kizongelu.ao/recibo_6.pdf',
    fileName: 'recibo_6.pdf',
    fileSize: 100000,
    fileType: 'application/pdf',
  });

  assert(
    blockedRes.success === false,
    'Teste 6.6: 6ª tentativa bloqueada pelo rate limiter (máx 5 por hora).'
  );
  assert(
    blockedRes.error?.includes('Limite de tentativas excedido') === true,
    `Teste 6.7: Mensagem de rate limiting amigável exibida: "${blockedRes.error}"`
  );

  console.log('======================================================');
  console.log('--- RESULTADOS DOS TESTES UNITÁRIOS DE PAGAMENTO ---');
  console.log('✅ TODOS OS TESTES DA FASE 7 PASSARAM COM SUCESSO!');
  console.log('======================================================');
}

runPaymentPhase7Tests().catch((err) => {
  console.error('Falha nos testes da :', err);
  process.exit(1);
});
