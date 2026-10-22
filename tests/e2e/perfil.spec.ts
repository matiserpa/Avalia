import { expect, test } from '@playwright/test';

test.describe('perfil público', () => {
  test('muestra la formación verificada y lleva a la verificación de cada certificado', async ({ page }) => {
    await page.goto('/p/valentina-rios?c=historia');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Valentina Ríos');
    await expect(page.getByText('4 certificados verificados')).toBeVisible();
    // Lo declarado no lleva sello: la matrícula se rotula como declarada.
    await expect(page.getByText('Matrícula MP 4821')).toBeVisible();
    await expect(page.getByText('declarada', { exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: /^Verificar el certificado de/ })).toHaveCount(4);
    await page.getByRole('link', { name: 'Verificar el certificado de Masterclass Demo: Peelings químicos' }).click();
    await expect(page).toHaveURL(/\/v\/VR9Q3H6T\?c=perfil/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Certificado válido');
  });

  test('un perfil privado y uno que no existe responden exactamente igual', async ({ page }) => {
    const privado = await page.goto('/p/julieta-acosta');
    expect(privado?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Este perfil no está disponible');
    const titulo = await page.title();
    const inexistente = await page.goto('/p/nadie-con-este-nombre');
    expect(inexistente?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Este perfil no está disponible');
    expect(await page.title()).toBe(titulo);
    await expect(page.getByText('Julieta')).toHaveCount(0);
  });

  test('la dueña ve su perfil privado con un aviso', async ({ page }) => {
    await page.goto('/demo/entrar?email=julieta.acosta@demo.example&a=/p/julieta-acosta');
    await expect(page.getByText('Tu perfil es privado: sólo lo ves vos.')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Julieta Acosta');
  });

  test('tiene imagen de vista previa para redes', async ({ page, request }) => {
    await page.goto('/p/valentina-rios');
    const og = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(og).toContain('/p/valentina-rios/opengraph-image');
    const r = await request.get('/p/valentina-rios/opengraph-image');
    expect(r.headers()['content-type']).toBe('image/png');
  });
});

test.describe('portada y textos legales', () => {
  test('la portada permite verificar', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Código del certificado').fill('VR4K-7M2P');
    await page.getByRole('button', { name: 'Verificar' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Certificado válido');
  });

  test('las demás páginas no se indexan', async ({ page }) => {
    await page.goto('/p/valentina-rios');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  });

  test('los textos legales están en borrador y dicen que no guardamos DNI', async ({ page }) => {
    await page.goto('/privacidad');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Política de privacidad');
    await expect(page.getByText('Borrador para revisar con un abogado')).toBeVisible();
    await expect(page.getByText('No pedimos ni guardamos DNI.')).toBeVisible();
    await page.goto('/terminos');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Términos y condiciones');
  });

  test('una página que no existe muestra un mensaje claro', async ({ page }) => {
    const r = await page.goto('/esto-no-existe');
    expect(r?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('No encontramos esta página');
  });
});
