// Guardas de acceso para páginas y acciones. Cada panel llama a la suya al principio:
// los permisos se chequean en el servidor, siempre, aunque la interfaz ya oculte lo que no corresponde.

import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { igualesSeguro } from '@/lib/cripto';
import { consentimientoVigente } from '@/lib/legales';
import { COOKIE_SESION, sesionActual, type SesionActual } from './sesion';

export async function requerirSesion(): Promise<SesionActual> {
  const s = await sesionActual();
  // Si tenía una sesión que se cerró o venció, Ingresar se lo explica.
  if (!s) redirect((await cookies()).has(COOKIE_SESION) ? '/ingresar?motivo=sesion' : '/ingresar');
  return s;
}

// Profesional con el consentimiento de la versión vigente. Si no, a /bienvenida.
export async function requerirProfesional(): Promise<SesionActual & { perfil: NonNullable<SesionActual['perfil']> }> {
  const s = await requerirSesion();
  if (!consentimientoVigente(s.usuario) || !s.perfil) redirect('/bienvenida');
  return s as SesionActual & { perfil: NonNullable<SesionActual['perfil']> };
}

export async function requerirInstitucion(): Promise<SesionActual & { institucionId: string }> {
  const s = await requerirSesion();
  if (!s.usuario.institucionId) redirect('/ingresar?motivo=sin-permiso');
  return { ...s, institucionId: s.usuario.institucionId };
}

export async function requerirAdmin(): Promise<SesionActual> {
  const s = await requerirSesion();
  if (!s.esAdmin) redirect('/ingresar?motivo=sin-permiso');
  return s;
}

// Tareas programadas (vercel.json, "crons"): Vercel manda `Authorization: Bearer <CRON_SECRET>`.
// Sin CRON_SECRET definido, nadie pasa.
export function esTareaProgramada(req: Request): boolean {
  const secreto = process.env.CRON_SECRET;
  if (!secreto || secreto.length < 16) return false;
  return igualesSeguro(req.headers.get('authorization') ?? '', `Bearer ${secreto}`);
}
