import { expect, test } from '@playwright/test';

// Un PNG de 1×1 alcanza como logo de prueba.
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');

test.describe('panel admin', () => {
  test('crea una institución con su logo e invita a la responsable', async ({ page }, info) => {
    const nombre = `Instituto Demo ${info.project.name === 'celular' ? 'Sur' : 'Norte'}`;
    const email = `direccion.${info.project.name}@demo.example`;
    await page.goto('/demo/entrar?email=admin@demo.example');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Instituciones');

    await page.getByRole('button', { name: 'Crear institución y mandar la invitación' }).click();
    await expect(page.getByLabel('Nombre de la institución')).toHaveAttribute('aria-invalid', 'true');

    await page.getByLabel('Nombre de la institución').fill(nombre);
    await page.getByLabel('Ciudad').fill('Bariloche');
    await page.getByLabel('Logo').setInputFiles({ name: 'logo.png', mimeType: 'image/png', buffer: PNG });
    await page.getByLabel('Mail de la persona responsable').fill(email);
    await page.getByRole('button', { name: 'Crear institución y mandar la invitación' }).click();
    await expect(page.getByText(`Creamos ${nombre} y le mandamos la invitación a ${email}.`)).toBeVisible();
    await expect(page.getByRole('heading', { name: nombre })).toBeVisible();
    await expect(page.getByText(email, { exact: true })).toBeVisible();

    // La responsable entra a su panel, vacío.
    await page.goto(`/demo/entrar?email=${email}`);
    await expect(page.getByText('Todavía no cargaste cursos')).toBeVisible();
  });

  test('muestra las métricas del piloto y filtra por institución', async ({ page }) => {
    await page.goto('/demo/entrar?email=admin@demo.example&a=/admin/metricas');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Métricas del piloto');
    await expect(page.getByRole('meter', { name: 'Activaron su pasaporte' })).toBeVisible();
    await expect(page.getByRole('figure', { name: 'Visitas a perfiles por semana' })).toBeVisible();
    await page.getByLabel('Institución', { exact: true }).selectOption({ label: 'Asociación Demo de Cosmiatría' });
    await page.getByRole('button', { name: 'Ver' }).click();
    await expect(page).toHaveURL(/institucion=/);
    await expect(page.locator('table').last().locator('tbody tr')).toHaveCount(1);
  });

  test('una institución no entra al panel admin', async ({ page }) => {
    await page.goto('/demo/entrar?email=instituto@demo.example&a=/admin');
    await expect(page).toHaveURL(/\/ingresar\?motivo=sin-permiso/);
  });
});
