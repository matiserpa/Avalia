import { expect, test } from '@playwright/test';

// Cada proyecto (celular y escritorio) activa a una persona distinta: comparten la base.
const PERSONA = {
  celular: { enlace: '/demo/enlace?codigo=MK8D2F6N', nombre: 'Martina', slug: 'martina-lopez' },
  escritorio: { enlace: '/demo/enlace?email=florencia.paz@demo.example', nombre: 'Florencia', slug: 'florencia-paz' },
} as const;

test.describe('panel de la profesional', () => {
  test('activa su pasaporte, arma el perfil, lo publica y lo comparte', async ({ page }, info) => {
    const p = PERSONA[info.project.name as keyof typeof PERSONA];
    await page.goto(p.enlace);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(`Hola, ${p.nombre}`);
    const linkDeActivacion = page.url();

    // Sin aceptar los términos no se activa, y el error queda asociado a la casilla.
    await page.getByRole('button', { name: 'Activar mi pasaporte' }).click();
    await expect(page.getByRole('checkbox')).toHaveAccessibleDescription(/tenés que aceptar/);
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Activar mi pasaporte' }).click();
    await page.waitForURL('**/bienvenida');

    await page.getByLabel('Profesión').selectOption('Cosmiatra');
    await page.getByLabel('Ciudad').fill('Cipolletti');
    await page.getByLabel('Cómo te pueden contactar').selectOption('instagram');
    await page.getByLabel('Tu usuario de Instagram').fill('@demo.cosmiatra');
    await page.getByRole('button', { name: 'Ver cómo queda' }).click();
    await page.waitForURL('**/bienvenida/listo');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Así se ve tu perfil');

    // Antes de publicar, el perfil no se ve desde afuera.
    const afuera = await page.context().browser()!.newPage();
    expect((await afuera.goto(`/p/${p.slug}`))?.status()).toBe(404);

    await page.getByRole('button', { name: 'Publicar mi perfil' }).click();
    await page.waitForURL('**/panel/compartir?publicado=1');
    await expect(page.getByText('¡Tu perfil ya es público!')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Imprimir' })).toBeVisible();

    expect((await afuera.goto(`/p/${p.slug}`))?.status()).toBe(200);
    await expect(afuera.getByRole('heading', { level: 1 })).toContainText(p.nombre);
    await expect(afuera.locator('main')).toContainText('Cipolletti');
    await afuera.close();

    // El link del mail ya no sirve para entrar.
    await page.goto(linkDeActivacion);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Este link ya se usó');
  });

  test('oculta un certificado del perfil y descarga el PDF', async ({ page, request }) => {
    await page.goto('/demo/entrar?email=valentina.rios@demo.example&a=/panel');
    const interruptor = page.getByRole('switch', { name: 'Mostrar en mi perfil: Masterclass Demo: Peelings químicos' });
    await expect(interruptor).toHaveAttribute('aria-checked', 'true');
    await interruptor.click();
    await expect(interruptor).toHaveAttribute('aria-checked', 'false');
    await expect(page.getByText('Oculto en tu perfil')).toBeVisible();

    const perfil = await request.get('/p/valentina-rios');
    expect(await perfil.text()).toContain('3 certificados verificados');
    // Volver a mostrarlo, para dejar la demo como estaba.
    await interruptor.click();
    await expect(interruptor).toHaveAttribute('aria-checked', 'true');

    const descarga = page.waitForEvent('download');
    await page.getByRole('link', { name: 'Descargar PDF' }).first().click();
    expect((await descarga).suggestedFilename()).toMatch(/^Certificado-.*\.pdf$/);
  });

  test('sin sesión, el panel pide ingresar', async ({ page }) => {
    await page.goto('/panel');
    await expect(page).toHaveURL(/\/ingresar/);
  });

  test('borra su cuenta y su perfil deja de verse', async ({ page }, info) => {
    test.skip(info.project.name !== 'celular', 'Se borra una sola vez: la base es compartida entre proyectos.');
    await page.goto('/demo/entrar?email=agustina.molina@demo.example&a=/panel/cuenta');
    await page.getByRole('button', { name: 'Borrar mi cuenta' }).click();
    await expect(page.getByRole('checkbox')).toHaveAccessibleDescription(/no se puede deshacer/);
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Borrar mi cuenta' }).click();
    await page.waitForURL('**/?cuenta=borrada');
    await expect(page.getByText('Borramos tu cuenta')).toBeVisible();
    expect((await page.goto('/p/agustina-molina'))?.status()).toBe(404);
  });
});
