// Se ejecuta una vez al arrancar el servidor, antes de atender pedidos.
// Con PGlite (desarrollo y demo local) aplica las migraciones y, en modo demo, carga los datos
// de prueba si la base está vacía. En la demo publicada hace lo mismo contra su Postgres, así se
// arma sola al primer arranque. En el piloto no hace nada: ahí las migraciones se corren a mano
// con `npm run db:migrar` antes de publicar.

export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  if (process.env.NEXT_PHASE === 'phase-production-build') return;
  const demo = process.env.DEMO_MODE === 'true';
  const hayBase = Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL);
  if (hayBase && !demo) return;
  // En Vercel el disco es de sólo lectura y cada instancia tendría su propia base: sin
  // DATABASE_URL no puede andar. Mejor un error claro que uno de PGlite.
  if (!hayBase && process.env.VERCEL) throw new Error('Falta DATABASE_URL: la cadena de la base de datos (ver docs/despliegue.md).');

  const { migrar } = await import('./db/migrar');
  await migrar();

  if (demo) {
    const { cargarDemoSiHaceFalta } = await import('./lib/demo/semilla');
    await cargarDemoSiHaceFalta();
  }
}
