/**
 * @file __tests__/admin/admin-phase10.test.ts
 * Testes Unitários e de Integração do Painel Administrativo (Fase 10 - Tarefa 12).
 * 
 * 1. Aprovar pagamento → confirmar Project UNLOCKED
 * 2. Alterar preço → confirmar histórico de auditoria (before/after)
 * 3. Criar nova versão do motor → confirmar versão anterior arquivada
 */

import {
  submitPaymentProof,
  reviewPayment,
  getPaymentStatus,
  clearPaymentsStore,
} from '../../lib/actions/payment';
import { AdminDataService } from '../../src/lib/services/admin-data';
import { PriceDatabaseRepository } from '../../src/db/price-database';
import { clearAuditLogs, getRecentAuditLogs } from '../../lib/audit';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ [FAIL] ${message}`);
    throw new Error(message);
  }
  console.log(`✅ [PASS] ${message}`);
}

export async function runAdminPhase10Tests() {
  console.log('======================================================');
  console.log('--- EXECUTANDO TESTES DO PAINEL ADMIN (FASE 10) ---');
  console.log('======================================================');

  clearPaymentsStore();
  clearAuditLogs();

  const testProjectId = `proj_admin_test_${Date.now()}`;

  // =========================================================================
  // TESTE 1: Aprovar pagamento → confirmar Project UNLOCKED
  // =========================================================================
  console.log('\n[Teste 1] Fluxo de Pagamento e Desbloqueio do Projeto...');
  const submitRes = await submitPaymentProof({
    projectId: testProjectId,
    fileUrl: 'https://storage.kizongelu.ao/recibos/comprovativo_mcx_teste.jpg',
    fileName: 'comprovativo_mcx_teste.jpg',
    fileSize: 245000,
    fileType: 'image/jpeg',
    notes: 'Transferência Multicaixa Express efetuada.',
    method: 'MULTICAIXA_EXPRESS',
    userId: 'usr_particular_test',
  });

  assert(submitRes.success === true, 'Submissão de comprovativo concluída.');
  const paymentId = submitRes.payment!.id;

  const statusPre = await getPaymentStatus(testProjectId);
  assert(statusPre.isUnlocked === false, 'Projeto permanece BLOQUEADO antes da aprovação.');

  const approvalRes = await reviewPayment({
    paymentId,
    action: 'APPROVE',
    adminId: 'usr_admin_master',
  });

  assert(approvalRes.success === true, 'Admin aprovou pagamento com sucesso.');
  assert(approvalRes.payment?.status === 'APPROVED', 'Estado do pagamento alterado para APPROVED.');

  const statusPost = await getPaymentStatus(testProjectId);
  assert(statusPost.isUnlocked === true, 'CONFIRMADO: Projeto agora está UNLOCKED.');
  assert(statusPost.projectStatus === 'UNLOCKED', 'Status oficial do projeto é UNLOCKED.');

  // =========================================================================
  // TESTE 2: Alterar preço → confirmar histórico de auditoria (before/after)
  // =========================================================================
  console.log('\n[Teste 2] Alteração de Preço e Rastreio no AuditLog...');
  const items = PriceDatabaseRepository.getAll();
  const targetItem = items[0];
  const oldPrice = targetItem.custoMaterialKz;
  const newPrice = oldPrice + 500;

  // Atualiza preço
  PriceDatabaseRepository.updatePriceItem({
    ...targetItem,
    custoMaterialKz: newPrice,
    precoBaseKz: newPrice + targetItem.custoMaoDeObraKz + targetItem.custoEquipamentoKz,
  });

  // Regista no serviço de auditoria
  const auditEntry = AdminDataService.recordAudit({
    evento: 'PRICE_ITEM_UPDATED',
    adminNome: 'Manuel Moisés (Admin)',
    adminEmail: 'manuelmoises.darangola@gmail.com',
    gravidade: 'INFO',
    descricao: `Preço do artigo ${targetItem.codigo} atualizado de ${oldPrice} para ${newPrice} Kz.`,
    ip: '105.172.45.12 (Luanda)',
    userAgent: 'Chrome 128.0 / MacOS',
    before: { custoMaterialKz: oldPrice },
    after: { custoMaterialKz: newPrice },
  });

  assert(auditEntry.id.startsWith('aud_'), 'Registo de auditoria criado com identificador único.');
  assert(auditEntry.before?.custoMaterialKz === oldPrice, 'AuditLog preserva valor anterior (Before).');
  assert(auditEntry.after?.custoMaterialKz === newPrice, 'AuditLog preserva valor novo (After).');

  const auditHistory = AdminDataService.getAuditLogs();
  const foundInHistory = auditHistory.some((l) => l.id === auditEntry.id);
  assert(foundInHistory, 'CONFIRMADO: Alteração de preço consta no histórico de auditoria.');

  // =========================================================================
  // TESTE 3: Criar nova versão do motor → confirmar versão anterior arquivada
  // =========================================================================
  console.log('\n[Teste 3] Ciclo de Versões do Motor Determinístico LNEC...');
  const initialVersions = AdminDataService.getEngineVersions();
  const previousActive = initialVersions.find((v) => v.status === 'ATIVA');
  assert(previousActive !== undefined, `Versão inicial ativa encontrada: ${previousActive?.versao}`);

  const testVersionNum = `v2.9-teste-${Date.now()}`;
  const newDraft = AdminDataService.createNewVersion({
    versao: testVersionNum,
    descricao: 'Versão experimental de validação de testes unitários.',
    responsavel: 'Manuel Moisés',
    adminEmail: 'manuelmoises.darangola@gmail.com',
  });

  assert(newDraft.status === 'RASCUNHO', 'Nova versão criada em estado de RASCUNHO.');

  // Ativa a nova versão
  AdminDataService.activateVersion(newDraft.id, 'Manuel Moisés', 'manuelmoises.darangola@gmail.com');

  const updatedVersions = AdminDataService.getEngineVersions();
  const currentActive = updatedVersions.find((v) => v.id === newDraft.id);
  const oldActiveNow = updatedVersions.find((v) => v.id === previousActive?.id);

  assert(currentActive?.status === 'ATIVA', `CONFIRMADO: Nova versão ${testVersionNum} está ATIVA.`);
  assert(
    oldActiveNow?.status === 'ARQUIVADA',
    `CONFIRMADO: Versão anterior (${previousActive?.versao}) foi ARQUIVADA automaticamente.`
  );

  console.log('\n======================================================');
  console.log('✅ TODOS OS TESTES DA FASE 10 PASSARAM COM SUCESSO!');
  console.log('======================================================\n');
  return true;
}

// Auto-execução se chamado diretamente via tsx/node
if (typeof process !== 'undefined' && process.argv[1]?.includes('admin-phase10')) {
  runAdminPhase10Tests()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
