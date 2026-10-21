import { expect, test, type Page } from '@playwright/test';

async function entrarComoInstituto(page: Page) {
  await page.goto('/demo/entrar?email=instituto@demo.example');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Cursos');
}

test.describe('panel de la institución', () => {
  test('emite certificados, copia un link para WhatsApp y anula uno', async ({ page }, info) => {
    await entrarComoInstituto(page);
    if (info.project.name === 'celular') {
      // El congreso de la demo ya tiene 5 egresadas cargadas sin emitir.
      await page.getByRole('link', { name: /Congreso Demo 2026/ }).click();
    } else {
      // En escritorio, un curso nuevo con su planilla (el congreso ya se emitió en celular).
      await page.getByRole('link', { name: 'Crear un curso' }).click();
      await page.getByRole('button', { name: 'Crear curso' }).click();
      await expect(page.getByLabel('Nombre del curso')).toHaveAttribute('aria-invalid', 'true');
      await page.getByLabel('Nombre del curso').fill('Taller Demo de Microneedling');
      await page.getByLabel('Tipo').selectOption('workshop');
      await page.getByLabel('Carga horaria').fill('4,5');
      await page.getByLabel('Fecha').fill('2026-10-01');
      await page.getByRole('button', { name: 'Crear curso' }).click();
      await expect(page.getByText('Creamos el curso.')).toBeVisible();
      await page.getByRole('link', { name: 'Cargar planilla' }).first().click();
      await page.getByLabel('Pegá las filas de tu planilla').fill('Nombre\tApellido\tDNI\tMail\nANA\tGÓMEZ\t30111222\tana.gomez@demo.example\nSol\tPereyra\t30111333\tsol.pereyra@demo.example');
      await page.getByRole('button', { name: 'Revisar' }).click();
      await expect(page.getByText('Ignoramos la columna DNI: no lo guardamos.')).toBeVisible();
      await page.getByRole('button', { name: 'Cargar 2 egresadas' }).click();
      await expect(page.getByText('Cargamos 2 egresadas.')).toBeVisible();
      await expect(page.getByText('Ana Gómez')).toBeVisible();
    }

    const emitir = page.getByRole('link', { name: /^Emitir \d+ certificados?$/ });
    const texto = (await emitir.textContent())!;
    await emitir.click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(texto);
    await page.getByRole('button', { name: texto }).click();
    await expect(page.getByText(/^Emitimos \d+ certificados?$/)).toBeVisible();
    await expect(page.getByText('Mail enviado, no activó').first()).toBeVisible();

    await page.getByRole('button', { name: 'Crear link para WhatsApp' }).first().click();
    await expect(page.getByText(/^Link nuevo para/)).toBeVisible();
    await expect(page.getByRole('link', { name: 'Mandar por WhatsApp' })).toHaveAttribute('href', /^https:\/\/wa\.me\/\?text=/);

    await page.locator('summary', { hasText: 'Anular' }).first().click();
    await page.getByRole('button', { name: 'Anular certificado' }).first().click();
    await expect(page.getByLabel('Motivo').first()).toHaveAccessibleDescription(/Contanos el motivo/);
    await page.getByLabel('Motivo').first().fill('El apellido estaba mal escrito.');
    await page.getByRole('button', { name: 'Anular certificado' }).first().click();
    await expect(page.getByText('Anulamos el certificado')).toBeVisible();
    await expect(page.getByText(/Anulado el .*: El apellido estaba mal escrito\./)).toBeVisible();
  });

  test('una institución no entra a los cursos de otra', async ({ page }) => {
    await page.goto('/demo/entrar?email=asociacion@demo.example');
    const ajeno = await page.getByRole('link', { name: /Taller Demo de Dermaplaning/ }).getAttribute('href');
    await entrarComoInstituto(page);
    expect((await page.goto(ajeno!))?.status()).toBe(404);
  });

  test('una profesional no entra al panel de la institución', async ({ page }) => {
    await page.goto('/demo/entrar?email=valentina.rios@demo.example&a=/institucion');
    await expect(page).toHaveURL(/\/ingresar\?motivo=sin-permiso/);
  });
});
