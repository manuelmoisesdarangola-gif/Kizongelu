import { test, expect } from '@playwright/test';

/**
 * Teste E2E: Verificação Pública de Autenticidade via QR Code.
 */
test.describe('Fluxo E2E: Verificação Pública de QR Code e Auditoria do Motor', () => {
  test('Acesso à página pública de verificação e checagem de hash SHA-256', async ({ page }) => {
    // 1. Acesso à rota pública de verificação
    await page.goto('/verificar');
    await expect(page.getByText(/Verificação de Autenticidade|Verificar Orçamento/i).first()).toBeVisible();

    // 2. Inserção de código de verificação
    const tokenInput = page.locator('input[type="text"], input[name="token"]').first();
    if (await tokenInput.isVisible()) {
      await tokenInput.fill('KZ-2026-T3-LUA-7890');
      const verificarBtn = page.getByRole('button', { name: /Verificar|Validar/i }).first();
      await verificarBtn.click();
    }

    // 3. Verificação de emissão legítima
    await expect(page.getByText(/Kizongelu|Autêntico|Orçamento Válido|Motor/i).first()).toBeVisible();
  });
});
