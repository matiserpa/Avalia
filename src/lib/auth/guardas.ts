// Guardas de acceso para páginas y acciones. Cada panel llama a la suya al principio:
// los permisos se chequean en el servidor, siempre, aunque la interfaz ya oculte lo que no corresponde.

import 'server-only';
import { redirect } from 'next/navigation';
import { sesionActual, type SesionActual } from './sesion';

export async function requerirSesion(): Promise<SesionActual> {
  const s = await sesionActual();
  if (!s) redirect('/ingresar');
  return s;
}

// Profesional con consentimiento dado. Sin consentimiento, a /bienvenida.
export async function requerirProfesional(): Promise<SesionActual & { perfil: NonNullable<SesionActual['perfil']> }> {
  const s = await requerirSesion();
  if (!s.usuario.aceptoLegalesEn || !s.perfil) redirect('/bienvenida');
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
