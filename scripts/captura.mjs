// Captura de pantalla de una página: node scripts/captura.mjs <url> <archivo.png> [ancho=390] [alto=844]
// Usa el Chromium de Playwright. Sirve para revisar cada pantalla en celular (390) y escritorio (1280).
import { chromium } from '@playwright/test';

const [, , url, archivo, ancho = '390', alto = '844'] = process.argv;
if (!url || !archivo) {
  console.error('Uso: node scripts/captura.mjs <url> <archivo.png> [ancho] [alto]');
  process.exit(1);
}
const navegador = await chromium.launch();
const pagina = await navegador.newPage({ viewport: { width: Number(ancho), height: Number(alto) }, deviceScaleFactor: 2, locale: 'es-AR' });
await pagina.goto(url, { waitUntil: 'networkidle' });
await pagina.screenshot({ path: archivo, fullPage: true });
await navegador.close();
