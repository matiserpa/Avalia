// Conexión a la base.
//
// - Sin DATABASE_URL: PGlite, un Postgres completo que corre dentro de Node y guarda los datos
//   en .data/pglite. Es lo que permite correr todo local con `npm run dev`, sin instalar nada.
// - Con DATABASE_URL: Postgres de verdad (Supabase, Neon o el que sea) vía postgres-js. Si no
//   está, se toma POSTGRES_URL, que es la que crea Vercel al conectar una base desde su panel.
//
// Las dos variantes exponen la misma API de Drizzle, así que el resto del código no se entera.

import { PGlite } from '@electric-sql/pglite';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export type Db = ReturnType<typeof drizzlePostgres<typeof schema>>;

type Global = typeof globalThis & { __sellaDb?: Db; __sellaPglite?: PGlite };
const g = globalThis as Global;

// La cadena de conexión, o '' si no hay (PGlite).
export function urlDeLaBase(): string {
  const cruda = process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
  if (!cruda) return '';
  // La integración de Supabase en Vercel agrega parámetros propios que Postgres no entiende.
  const url = new URL(cruda);
  url.searchParams.delete('supa');
  url.searchParams.delete('pgbouncer');
  return url.toString();
}

export function directorioPglite() {
  return process.env.PGLITE_DIR || '.data/pglite';
}

function crearDb(): Db {
  const url = urlDeLaBase();
  if (url) {
    // prepare: false porque el pooler de Supabase en modo transacción no admite sentencias preparadas.
    const cliente = postgres(url, { prepare: false, max: Number(process.env.DATABASE_POOL_MAX || 5) });
    return drizzlePostgres(cliente, { schema, casing: 'snake_case' });
  }
  // Un solo PGlite por proceso: dos instancias sobre la misma carpeta la corrompen.
  g.__sellaPglite ??= new PGlite(directorioPglite());
  return drizzlePglite(g.__sellaPglite, { schema, casing: 'snake_case' }) as unknown as Db;
}

// La conexión se abre recién en la primera consulta, no al importar este archivo. En desarrollo,
// Next importa las páginas también en procesos auxiliares (para revisar sus rutas) que nunca
// consultan nada: si cada uno abriera PGlite sobre la misma carpeta, la base se dañaría.
function real(): Db {
  return (g.__sellaDb ??= crearDb());
}

export const db: Db = new Proxy({} as Db, {
  get(_destino, prop) {
    const instancia = real();
    const valor = Reflect.get(instancia, prop, instancia);
    return typeof valor === 'function' ? valor.bind(instancia) : valor;
  },
});

export function usaPglite() {
  return !urlDeLaBase();
}

export function clientePglite(): PGlite | undefined {
  return g.__sellaPglite;
}

export { schema };
