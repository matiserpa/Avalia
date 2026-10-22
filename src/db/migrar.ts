// Aplica las migraciones de /drizzle. Con PGlite corre sola al arrancar el servidor
// (src/instrumentation.ts); contra un Postgres real se corre con `npm run db:migrar`.

import path from 'node:path';
import { migrate as migratePglite } from 'drizzle-orm/pglite/migrator';
import { migrate as migratePostgres } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { db, urlDeLaBase, usaPglite } from './index';

const carpeta = path.join(process.cwd(), 'drizzle');

export async function migrar() {
  if (usaPglite()) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await migratePglite(db as any, { migrationsFolder: carpeta });
  } else {
    await migratePostgres(db, { migrationsFolder: carpeta });
  }
}

// Contra Postgres pueden arrancar varias instancias a la vez (en Vercel pasa con el primer
// despliegue de la demo): si dos migran o cargan la demo juntas, chocan y la que pierde queda
// rota. Con este candado la primera hace la tarea y las demás esperan a que termine.
//
// El candado vive en una transacción abierta en una conexión aparte, mientras la tarea usa las
// conexiones de siempre. Es de transacción y no de sesión porque los poolers (Neon, Supabase)
// reparten las sesiones entre clientes.
export async function conCandado(tarea: () => Promise<void>) {
  if (usaPglite()) return tarea();
  const cliente = postgres(urlDeLaBase(), { prepare: false, max: 1, onnotice: () => {} });
  try {
    await cliente.begin(async (tx) => {
      await tx`select pg_advisory_xact_lock(7302025)`;
      await tarea();
    });
  } finally {
    await cliente.end();
  }
}
