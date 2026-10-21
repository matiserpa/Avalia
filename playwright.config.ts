import { defineConfig, devices } from '@playwright/test';

// Pruebas de punta a punta contra un servidor de desarrollo con datos de demo recién cargados.
// Cada corrida usa su propia base (PGLITE_DIR) y su propio puerto (E2E_PORT, por defecto 3200).
const puerto = Number(process.env.E2E_PORT || 3200);
const base = `http://localhost:${puerto}`;
const entorno = {
  PGLITE_DIR: `.data/pglite-e2e-${puerto}`,
  DEMO_MODE: 'true',
  MAIL_MODE: 'bandeja',
  APP_URL: base,
  DATABASE_URL: '',
  NEXT_DIST_DIR: `.next-e2e-${puerto}`,
};

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [['list']],
  use: { baseURL: base, trace: 'retain-on-failure', locale: 'es-AR', timezoneId: 'America/Argentina/Buenos_Aires' },
  projects: [
    { name: 'celular', use: { ...devices['Pixel 7'], browserName: 'chromium' } },
    { name: 'escritorio', use: { viewport: { width: 1280, height: 800 }, browserName: 'chromium' } },
  ],
  webServer: {
    command: `npm run demo:reiniciar && npx next dev -p ${puerto}`,
    url: `${base}/ingresar`,
    reuseExistingServer: false,
    timeout: 180_000,
    env: entorno,
  },
});
