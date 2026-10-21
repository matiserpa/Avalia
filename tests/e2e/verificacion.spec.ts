import { expect, test } from '@playwright/test';

// Códigos fijos de la demo (src/lib/demo/semilla.ts).
const VALIDO = 'VR4K7M2P';
const ANULADO = 'SH5A0E9R';

test.describe('verificación pública', () => {
  test('escribir un código a mano lleva a la verificación', async ({ page }) => {
    await page.goto('/verificar');
    await page.getByLabel('Código del certificado').fill('vr4k 7m2p');
    await page.getByRole('button', { name: 'Verificar' }).click();
    await expect(page).toHaveURL(new RegExp(`/v/${VALIDO}\\?c=codigo`));
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Certificado válido');
    await expect(page.getByText('Valentina Ríos', { exact: true })).toBeVisible();
    await expect(page.getByText('No reemplaza la matrícula profesional', { exact: false })).toBeVisible();
    await page.getByRole('link', { name: 'Ver toda la formación de Valentina' }).click();
    await expect(page).toHaveURL(/\/p\/valentina-rios\?c=verificacion/);
  });

  test('un código con formato incorrecto marca el error en el campo', async ({ page }) => {
    await page.goto('/verificar');
    await page.getByLabel('Código del certificado').fill('abc');
    await page.getByRole('button', { name: 'Verificar' }).click();
    const campo = page.getByLabel('Código del certificado');
    await expect(campo).toHaveAttribute('aria-invalid', 'true');
    await expect(campo).toHaveAccessibleDescription(/no tiene el formato correcto/);
  });

  test('anulado y no encontrado', async ({ page }) => {
    await page.goto(`/v/${ANULADO}?c=qr`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Certificado anulado');
    await expect(page.getByText('Ya no tiene validez.')).toBeVisible();
    // El motivo de la anulación es interno de la institución.
    await expect(page.getByText('mal escrito')).toHaveCount(0);
    await expect(page.getByRole('link', { name: /Ver toda la formación/ })).toHaveCount(0);

    await page.goto('/v/AB12CD34');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('No encontramos este certificado');
    await expect(page.getByLabel('Código del certificado')).toHaveValue('AB12-CD34');
  });
});
