// Aplica las migraciones de /drizzle. Con PGlite corre sola al arrancar el servidor
// (src/instrumentation.ts); contra un Postgres real se corre con `npm run db:migrar`.

import path from 'node:path';
import { migrate as migratePglite } from 'drizzle-orm/pglite/migrator';
import { migrate as migratePostgres } from 'drizzle-orm/postgres-js/migrator';
import { db, usaPglite } from './index';

const carpeta = path.join(process.cwd(), 'drizzle');

export async function migrar() {
  if (usaPglite()) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await migratePglite(db as any, { migrationsFolder: carpeta });
  } else {
    await migratePostgres(db, { migrationsFolder: carpeta });
  }
}
