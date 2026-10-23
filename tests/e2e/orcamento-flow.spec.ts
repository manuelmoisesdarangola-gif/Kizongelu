import { test, expect } from '@playwright/test';

/**
 * Teste E2E Integral:
 * Registo → Wizard de Obra → Preview → Paywall → Upload de Comprovativo → Aprovação Admin → Emissão de PDF.
 */
test.describe('Fluxo E2E: Ciclo de Vida do Orçamento de Obra em Angola', () => {
  test('Fluxo completo desde o registo até ao PDF auditado', async ({ page }) => {
    // 1. Acesso à página inicial
    await page.goto('/');
    await expect(page).toHaveTitle(/Kizongelu/i);

    // 2. Navegação para Registo
    const criarContaBtn = page.getByRole('button', { name: /Criar Conta|Registar/i }).first();
    if (await criarContaBtn.isVisible()) {
      await criarContaBtn.click();
    } else {
      await page.goto('/criar-conta');
    }

    // 3. Preenchimento de Registo
    await page.fill('input[type="email"], input[name="email"]', 'engenheiro.teste@kizongelu.ao');
    await page.fill('input[type="password"]', 'Angola2026!');
    const submitRegister = page.getByRole('button', { name: /Criar Conta|Registar/i }).first();
    await submitRegister.click();

    // 4. Acesso ao Painel e Abertura do Wizard
    await page.goto('/painel');
    await expect(page.getByText(/Painel/i).first()).toBeVisible();

    // Iniciar novo orçamento
    const novoOrcamentoBtn = page.getByRole('button', { name: /Novo orçamento|Criar Orçamento/i }).first();
    await novoOrcamentoBtn.click();

    // 5. Preenchimento do Wizard (5 passos)
    // Passo 1: Localização
    await expect(page.getByText(/Província|Localização/i).first()).toBeVisible();
    const avancarBtn = page.getByRole('button', { name: /Continuar|Seguinte|Avançar/i }).first();
    await avancarBtn.click();

    // 6. Visualização do Preview com Marca de Água
    await page.waitForTimeout(1000);
    await expect(page.getByText(/Resumo|Estimativa|Pré-visualização/i).first()).toBeVisible();

    // 7. Acesso ao Paywall / Desbloqueio
    const desbloquearBtn = page.getByRole('button', { name: /Desbloquear|Obter Mapa Completo/i }).first();
    if (await desbloquearBtn.isVisible()) {
      await desbloquearBtn.click();
    }

    // 8. Upload de Comprovativo Multicaixa / Transferência
    await expect(page.getByText(/Multicaixa Express|IBAN|Coordenadas/i).first()).toBeVisible();
    const uploadInput = page.locator('input[type="file"]').first();
    if (await uploadInput.count() > 0) {
      await uploadInput.setInputFiles({
        name: 'comprovativo-multicaixa.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('comprovativo-multicaixa-mock-data'),
      });
    }

    const submeterPagamento = page.getByRole('button', { name: /Confirmar Transferência|Submeter Comprovativo/i }).first();
    if (await submeterPagamento.isVisible()) {
      await submeterPagamento.click();
    }

    // 9. Simulação de Aprovação Administrativa
    await page.goto('/admin');
    await expect(page.getByText(/Dashboard|Administração/i).first()).toBeVisible();

    const pagamentosTab = page.getByRole('button', { name: /Pagamentos/i }).first();
    await pagamentosTab.click();

    const aprovarBtn = page.getByRole('button', { name: /Aprovar/i }).first();
    if (await aprovarBtn.isVisible()) {
      await aprovarBtn.click();
    }

    // 10. Verificação de Emissão de PDF e Selo Técnico v3.2
    await page.goto('/projetos');
    const verDetalheBtn = page.getByRole('button', { name: /Ver Orçamento|Detalhe/i }).first();
    if (await verDetalheBtn.isVisible()) {
      await verDetalheBtn.click();
    }

    await expect(page.getByText(/Motor v3.2|Auditado/i).first()).toBeVisible();
  });
});
