import { beforeAll, vi } from 'vitest';
import { migrar } from '@/db/migrar';

// next/headers no existe fuera de un pedido: lo simulamos con un frasco de cookies en memoria.
const frasco = new Map<string, string>();
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (n: string) => (frasco.has(n) ? { name: n, value: frasco.get(n)! } : undefined),
    set: (n: string, v: string) => void frasco.set(n, v),
    delete: (n: string) => void frasco.delete(n),
  }),
  headers: async () => new Headers(),
}));

beforeAll(async () => {
  await migrar();
});
