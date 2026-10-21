// Se ejecuta una vez al arrancar el servidor, antes de atender pedidos.
// Con PGlite (desarrollo y demo local) aplica las migraciones y, en modo demo, carga los datos
// de prueba si la base está vacía. Contra un Postgres real no hace nada: ahí las migraciones
// se corren a mano con `npm run db:migrar` antes de publicar.

export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  if (process.env.NEXT_PHASE === 'phase-production-build') return;
  if (process.env.DATABASE_URL) return;
  // En Vercel el disco es de sólo lectura y cada instancia tendría su propia base: sin
  // DATABASE_URL no puede andar. Mejor un error claro que uno de PGlite.
  if (process.env.VERCEL) throw new Error('Falta DATABASE_URL: la cadena del pooler de Supabase (ver docs/despliegue.md).');

  const { migrar } = await import('./db/migrar');
  await migrar();

  if (process.env.DEMO_MODE === 'true') {
    const { cargarDemoSiHaceFalta } = await import('./lib/demo/semilla');
    await cargarDemoSiHaceFalta();
  }
}
