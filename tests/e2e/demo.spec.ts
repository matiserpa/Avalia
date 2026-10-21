import { expect, test } from '@playwright/test';

// El recorrido de la reunión (docs/producto.md), de punta a punta:
// 1. Instituto Demo emite los 5 certificados del Congreso Demo 2026.
// 2. Camila abre su mail en la bandeja de prueba, activa su pasaporte y publica su perfil.
// 3. Alguien abre el QR de su certificado y ve "Certificado válido".
test('el recorrido de la demo en 2 minutos', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Reiniciar los datos de la demo' }).click();
  await expect(page.getByText('Listo: los datos volvieron al punto de partida.')).toBeVisible();

  // 1
  await page.getByRole('link', { name: 'Entrar como Instituto Demo' }).click();
  await page.getByRole('link', { name: 'Emitir 5 certificados' }).click();
  await page.getByRole('button', { name: 'Emitir 5 certificados' }).click();
  await expect(page.getByText('Emitimos 5 certificados')).toBeVisible();

  // 2
  await page.goto('/demo/bandeja');
  await page.getByRole('link', { name: /camila\.sosa@demo\.example/ }).click();
  const mail = page.frameLocator('iframe');
  await expect(mail.getByText('Hola, Camila:')).toBeVisible();
  await mail.getByRole('link', { name: 'Activar mi pasaporte' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Hola, Camila');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Activar mi pasaporte' }).click();
  await page.getByLabel('Profesión').selectOption('Cosmiatra');
  await page.getByRole('button', { name: 'Ver cómo queda' }).click();
  await page.getByRole('button', { name: 'Publicar mi perfil' }).click();
  await expect(page.getByText('¡Tu perfil ya es público!')).toBeVisible();

  // 3
  await page.goto('/demo');
  await expect(page.getByRole('img', { name: 'Código QR del certificado de Camila' })).toBeVisible();
  await page.getByRole('link', { name: 'Ver la verificación' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Certificado válido');
  await expect(page.getByText('Camila Sosa', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Ver toda la formación de Camila' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Camila Sosa');

  // Dejar la demo como estaba, para lo que siga.
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Reiniciar los datos de la demo' }).click();
  await expect(page.getByText('Listo: los datos volvieron al punto de partida.')).toBeVisible();
});

test('la guía y la bandeja responden en modo demo', async ({ request }) => {
  // Este servidor corre con DEMO_MODE=true: acá sólo se comprueba que respondan.
  expect((await request.get('/demo')).status()).toBe(200);
  expect((await request.get('/demo/bandeja')).status()).toBe(200);
});
