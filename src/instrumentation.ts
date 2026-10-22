// Se ejecuta una vez al arrancar el servidor, antes de atender pedidos.
// Con PGlite (desarrollo y demo local) aplica las migraciones y, en modo demo, carga los datos
// de prueba si la base está vacía. En la demo publicada hace lo mismo contra su Postgres, así se
// arma sola al primer arranque; y si la demo publicada no tiene base, la arma en memoria (los
// datos vuelven al estado inicial cada vez que Vercel arranca una instancia nueva). En el piloto
// no hace nada: ahí las migraciones se corren a mano con `npm run db:migrar` antes de publicar.

export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  if (process.env.NEXT_PHASE === 'phase-production-build') return;
  const { modoDemo } = await import('./lib/config');
  const demo = modoDemo();
  const hayBase = Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL);
  if (hayBase && !demo) return;
  // El piloto en Vercel sin DATABASE_URL no puede andar (cada instancia tendría su propia base).
  // No se corta acá: las páginas muestran qué falta (ver faltaConfigurar en src/lib/config.ts).
  // La demo sí: usa una base en memoria (directorioPglite en src/db/index.ts).
  if (!hayBase && process.env.VERCEL && !demo) {
    console.error('Falta DATABASE_URL: la cadena de la base de datos (ver docs/despliegue.md).');
    return;
  }

  const { conCandado, migrar } = await import('./db/migrar');
  await conCandado(async () => {
    await migrar();
    if (demo) {
      const { cargarDemoSiHaceFalta } = await import('./lib/demo/semilla');
      await cargarDemoSiHaceFalta();
    }
  });
}
