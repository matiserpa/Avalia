// Sesiones: una cookie httpOnly con un token al azar; en la base, sólo su hash.
// Duran 30 días y se renuevan solas cuando falta menos de la mitad.

import 'server-only';
import { cookies } from 'next/headers';
import { and, eq, gt, lt } from 'drizzle-orm';
import { db } from '@/db';
import { perfiles, sesiones, usuarios, type Perfil, type Usuario } from '@/db/schema';
import { cookieSegura, esEmailAdmin } from '@/lib/config';
import { hashSecreto, tokenAleatorio } from '@/lib/cripto';

export const COOKIE_SESION = 'pp_sesion';
const DURACION_MS = 30 * 24 * 60 * 60 * 1000;

export type SesionActual = {
  usuario: Usuario;
  perfil: Perfil | null;
  esAdmin: boolean;
};

// Sólo desde Server Actions o Route Handlers (son los únicos que pueden escribir cookies).
export async function iniciarSesion(usuarioId: string): Promise<void> {
  const token = tokenAleatorio();
  const expiraEn = new Date(Date.now() + DURACION_MS);
  await db.insert(sesiones).values({ tokenHash: hashSecreto(token), usuarioId, expiraEn });
  await db.update(usuarios).set({ ultimoIngresoEn: new Date() }).where(eq(usuarios.id, usuarioId));
  // Limpieza oportunista de sesiones vencidas de esta persona.
  await db.delete(sesiones).where(and(eq(sesiones.usuarioId, usuarioId), lt(sesiones.expiraEn, new Date())));
  const c = await cookies();
  c.set(COOKIE_SESION, token, {
    httpOnly: true,
    secure: cookieSegura(),
    sameSite: 'lax',
    path: '/',
    expires: expiraEn,
  });
}

export async function cerrarSesion(): Promise<void> {
  const c = await cookies();
  const token = c.get(COOKIE_SESION)?.value;
  if (token) await db.delete(sesiones).where(eq(sesiones.tokenHash, hashSecreto(token)));
  c.delete(COOKIE_SESION);
}

// Quién está mirando, o null. Se puede llamar desde cualquier Server Component.
export async function sesionActual(): Promise<SesionActual | null> {
  const c = await cookies();
  const token = c.get(COOKIE_SESION)?.value;
  if (!token) return null;
  const filas = await db
    .select({ usuario: usuarios, perfil: perfiles })
    .from(sesiones)
    .innerJoin(usuarios, eq(usuarios.id, sesiones.usuarioId))
    .leftJoin(perfiles, eq(perfiles.usuarioId, usuarios.id))
    .where(and(eq(sesiones.tokenHash, hashSecreto(token)), gt(sesiones.expiraEn, new Date())))
    .limit(1);
  const fila = filas[0];
  if (!fila) return null;
  return { usuario: fila.usuario, perfil: fila.perfil, esAdmin: esEmailAdmin(fila.usuario.email) };
}

// A dónde va cada persona después de ingresar.
export function destinoInicial(s: SesionActual): string {
  if (s.esAdmin) return '/admin';
  if (s.usuario.institucionId) return '/institucion';
  if (!s.usuario.aceptoLegalesEn) return '/bienvenida';
  if (!s.perfil) return '/bienvenida';
  return '/panel';
}
