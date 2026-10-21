// Conexión a la base.
//
// - Sin DATABASE_URL: PGlite, un Postgres completo que corre dentro de Node y guarda los datos
//   en .data/pglite. Es lo que permite correr todo local con `npm run dev`, sin instalar nada.
// - Con DATABASE_URL: Postgres de verdad (Supabase, Neon o el que sea) vía postgres-js.
//
// Las dos variantes exponen la misma API de Drizzle, así que el resto del código no se entera.

import { PGlite } from '@electric-sql/pglite';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export type Db = ReturnType<typeof drizzlePostgres<typeof schema>>;

type Global = typeof globalThis & { __avalyaDb?: Db; __avalyaPglite?: PGlite };
const g = globalThis as Global;

export function directorioPglite() {
  return process.env.PGLITE_DIR || '.data/pglite';
}

function crearDb(): Db {
  const url = process.env.DATABASE_URL;
  if (url) {
    // prepare: false porque el pooler de Supabase en modo transacción no admite sentencias preparadas.
    const cliente = postgres(url, { prepare: false, max: Number(process.env.DATABASE_POOL_MAX || 5) });
    return drizzlePostgres(cliente, { schema, casing: 'snake_case' });
  }
  // Un solo PGlite por proceso: dos instancias sobre la misma carpeta la corrompen.
  g.__avalyaPglite ??= new PGlite(directorioPglite());
  return drizzlePglite(g.__avalyaPglite, { schema, casing: 'snake_case' }) as unknown as Db;
}

export const db: Db = (g.__avalyaDb ??= crearDb());

export function usaPglite() {
  return !process.env.DATABASE_URL;
}

export function clientePglite(): PGlite | undefined {
  return g.__avalyaPglite;
}

export { schema };
