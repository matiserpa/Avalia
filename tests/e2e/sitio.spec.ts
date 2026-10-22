import { expect, test } from '@playwright/test';

// Sitio comercial: portada para instituciones, profesionales y contacto.
const PAGINAS = ['/', '/profesionales', '/contacto'];

test.describe('sitio comercial', () => {
  test('cada página tiene un solo título principal y no se corre de costado', async ({ page }) => {
    for (const ruta of PAGINAS) {
      await page.goto(ruta);
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      const ancho = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(ancho, `${ruta} se corre de costado`).toBeLessThanOrEqual(0);
    }
  });

  test('el verde aparece sólo en las muestras de lo verificado', async ({ page }) => {
    for (const ruta of PAGINAS) {
      await page.goto(ruta);
      const fuera = await page.evaluate(() =>
        [...document.querySelectorAll('[class*="verde"]')].filter((el) => !el.closest('[data-muestra]')).map((el) => el.textContent?.trim()),
      );
      expect(fuera, `${ruta} usa verde fuera de una muestra`).toEqual([]);
    }
  });

  test('todos los botones para sumarse llevan al contacto', async ({ page }) => {
    await page.goto('/');
    const links = page.getByRole('link', { name: 'Sumar mi institución al piloto' });
    expect(await links.count()).toBeGreaterThanOrEqual(3);
    for (const href of await links.evaluateAll((ls) => ls.map((l) => l.getAttribute('href')))) expect(href).toBe('/contacto');
    await page.getByRole('link', { name: 'Sumar mi congreso o jornada' }).click();
    await expect(page).toHaveURL(/\/contacto\?tipo=congreso$/);
    await expect(page.getByRole('radio', { name: 'Organizo congresos o jornadas' })).toBeChecked();
  });

  test('el menú del celular se abre, se cierra con Escape y devuelve el foco', async ({ page }, info) => {
    test.skip(info.project.name !== 'celular', 'En escritorio las secciones están a la vista.');
    await page.goto('/');
    const boton = page.getByRole('button', { name: 'Menú' });
    await boton.click();
    await expect(page.getByRole('button', { name: 'Cerrar' })).toHaveAttribute('aria-expanded', 'true');
    const menu = page.getByRole('navigation', { name: 'Menú' });
    await expect(menu.getByRole('link', { name: 'Para profesionales' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(boton).toBeFocused();
    // Elegir una opción lo cierra y lleva a la página.
    await boton.click();
    await menu.getByRole('link', { name: 'Para profesionales' }).click();
    await expect(page).toHaveURL(/\/profesionales$/);
    await expect(page.getByRole('navigation', { name: 'Menú' })).toBeHidden();
  });

  test('mientras no se defina INDEXAR, nada se indexa', async ({ page, request }) => {
    for (const ruta of [...PAGINAS, '/verificar']) {
      await page.goto(ruta);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    }
    const mapa = await request.get('/sitemap.xml');
    expect(await mapa.text()).not.toContain('<loc>');
  });

  test('la vista previa al compartir usa la imagen del sitio', async ({ page, request }) => {
    await page.goto('/');
    const og = await page.locator('meta[property="og:image"]').first().getAttribute('content');
    expect(og).toContain('/imagenes/sitio/instituciones');
    const r = await request.get('/imagenes/sitio/instituciones');
    expect(r.headers()['content-type']).toBe('image/png');
    expect((await request.get('/imagenes/sitio/otra')).status()).toBe(404);
  });
});

test.describe('formulario de contacto', () => {
  test('marca los errores en cada campo y lleva el foco al primero', async ({ page }) => {
    await page.goto('/contacto');
    await page.getByRole('button', { name: 'Enviar mi consulta' }).click();
    await expect(page.getByText('Revisá los datos marcados.')).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Trabajo en un instituto o escuela de estética' })).toBeFocused();
    const nombre = page.getByLabel('Tu nombre y apellido');
    await expect(nombre).toHaveAttribute('aria-invalid', 'true');
    await expect(nombre).toHaveAttribute('aria-describedby', /campo-nombre-error/);
    await expect(page.locator('#campo-nombre-error')).toHaveText('Escribí tu nombre y apellido.');
    await expect(page.locator('#campo-acepto-error')).toHaveText('Para responderte necesitamos que aceptes el aviso de privacidad.');

    // Lo escrito no se pierde.
    await page.getByLabel('Tu mail').fill('mal');
    await page.getByRole('button', { name: 'Enviar mi consulta' }).click();
    await expect(page.getByLabel('Tu mail')).toHaveValue('mal');
    await expect(page.locator('#campo-email-error')).toContainText('tiene que tener una @');
  });

  test('en la demo no se guarda nada y lo avisa', async ({ page }) => {
    await page.goto('/contacto?tipo=instituto');
    await expect(page.getByRole('status').filter({ hasText: 'Estás en la demo' })).toBeVisible();
    await page.getByLabel('Tu nombre y apellido').fill('Paula Prueba');
    await page.getByLabel('Institución, asociación o evento').fill('Escuela Prueba de Estética');
    await page.getByLabel('Tu mail').fill('paula.prueba@demo.example');
    await page.getByLabel(/Leí el aviso de privacidad/).check();
    await page.getByRole('button', { name: 'Enviar mi consulta' }).click();
    await expect(page.getByText('No guardamos lo que escribiste ni le avisamos a nadie.')).toBeVisible();

    // En el panel sólo están las consultas de ejemplo.
    await page.goto('/demo/entrar?email=admin@demo.example&a=/admin/consultas');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Consultas');
    await expect(page.getByText('Escuela Prueba de Estética')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Jornadas Demo de Estética' })).toBeVisible();
  });

  test('la administración marca una consulta como respondida', async ({ page }, info) => {
    test.skip(info.project.name !== 'escritorio', 'Cambia los datos de la demo: alcanza con una corrida.');
    await page.goto('/demo/entrar?email=admin@demo.example&a=/admin/consultas');
    const consulta = page.getByRole('listitem').filter({ has: page.getByRole('heading', { name: 'Jornadas Demo de Estética' }) });
    await expect(consulta.getByText('Sin responder')).toBeVisible();
    await consulta.getByRole('button', { name: 'Marcar como respondida' }).click();
    await expect(consulta.getByText('Respondida')).toBeVisible();
    await consulta.getByRole('button', { name: 'Marcar sin responder' }).click();
    await expect(consulta.getByText('Sin responder')).toBeVisible();
  });
});

test.describe('profesionales', () => {
  test('el mensaje para la institución se manda por WhatsApp sin número', async ({ page }) => {
    await page.goto('/profesionales');
    const whatsapp = page.getByRole('link', { name: /Mandar el mensaje por WhatsApp/ });
    const href = (await whatsapp.getAttribute('href')) ?? '';
    expect(href.startsWith('https://wa.me/?text=')).toBe(true);
    expect(decodeURIComponent(href)).toContain('Me encantaría tener ahí mi formación con ustedes.');
    await expect(whatsapp).toHaveAttribute('target', '_blank');
  });
});
