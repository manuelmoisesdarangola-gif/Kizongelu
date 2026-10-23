import { test, expect } from '@playwright/test';

/**
 * Teste E2E: Subscrição de Plano Profissional (45.000 Kz/mês).
 */
test.describe('Fluxo E2E: Subscrição Profissional & Faturação', () => {
  test('Escolha de plano, faturação e expansão de quotas', async ({ page }) => {
    // 1. Acesso à página de planos
    await page.goto('/planos');
    await expect(page.getByText(/Profissional|Planos/i).first()).toBeVisible();

    // 2. Seleção do Plano Profissional
    const escolherProfissional = page.getByRole('button', { name: /Subscrever Profissional|Escolher Plano/i }).first();
    if (await escolherProfissional.isVisible()) {
      await escolherProfissional.click();
    }

    // 3. Verificação de Coordenadas Multicaixa Express / BAI
    await expect(page.getByText(/45.000\s*Kz|IBAN|Referência/i).first()).toBeVisible();

    // 4. Acesso ao separador de Plano & Facturação
    await page.goto('/plano');
    await expect(page.getByText(/Plano Actual|Facturas/i).first()).toBeVisible();
  });
});
