'use server';

import { redirect } from 'next/navigation';
import { activarConEnlace, sumarCertificadoConEnlace } from '@/lib/auth/activacion';
import { iniciarSesion, sesionActual } from '@/lib/auth/sesion';

export type EstadoActivacion = { error?: string; errorAcepto?: string };

// Activar: prueba que tiene acceso al mail del certificado, registra el consentimiento y abre la
// sesión. Si había otra sesión abierta en este navegador (por ejemplo, la de una institución), la
// reemplaza.
export async function activar(_prev: EstadoActivacion, fd: FormData): Promise<EstadoActivacion> {
  const token = String(fd.get('token') || '');
  if (fd.get('acepto') !== 'si') {
    return { errorAcepto: 'Para activar tu pasaporte tenés que aceptar los términos y la política de privacidad.' };
  }
  const r = await activarConEnlace(token);
  if (!r.ok) return { error: r.error };
  await iniciarSesion(r.usuarioId);
  redirect('/bienvenida');
}

// Sumar: la profesional ya tiene su pasaporte (con otro mail) y abrió este link con la sesión
// iniciada. Abrir el link prueba que este otro mail también es suyo.
export async function sumar(_prev: EstadoActivacion, fd: FormData): Promise<EstadoActivacion> {
  const token = String(fd.get('token') || '');
  const s = await sesionActual();
  if (!s || !s.usuario.aceptoLegalesEn || s.usuario.institucionId || s.esAdmin) {
    return { error: 'Tu sesión se cerró. Volvé a abrir el link del mail.' };
  }
  const r = await sumarCertificadoConEnlace(token, s.usuario.id);
  if (!r.ok) return { error: r.error };
  redirect('/panel?sumado=1');
}
