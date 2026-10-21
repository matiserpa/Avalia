'use server';

import { redirect } from 'next/navigation';
import type { EstadoFormPerfil } from '@/components/perfil/FormularioPerfil';
import { leerFormularioPerfil, procesarFormularioPerfil, publicarPerfil } from '@/features/profesional/perfil';
import { aceptarLegales } from '@/lib/auth/activacion';
import { requerirProfesional, requerirSesion } from '@/lib/auth/guardas';
import { destinoInicial, sesionActual } from '@/lib/auth/sesion';
import { consentimientoVigente } from '@/lib/legales';

const PEDIR_ACEPTAR = 'Para seguir tenés que aceptar los términos y la política de privacidad.';

export async function guardarBienvenida(prev: EstadoFormPerfil, fd: FormData): Promise<EstadoFormPerfil> {
  const s = await requerirSesion();
  if (s.esAdmin || s.usuario.institucionId) redirect(destinoInicial(s));
  const intento = prev.intento + 1;

  // Si entró con código (no por el link del mail), el consentimiento se da acá. Si ya lo había dado
  // pero el perfil no llegó a crearse, aceptarLegales (que no duplica nada) lo completa.
  if (!consentimientoVigente(s.usuario) || !s.perfil) {
    if (!consentimientoVigente(s.usuario) && fd.get('acepto') !== 'si') {
      const { campos, errores } = leerFormularioPerfil(fd);
      const archivo = fd.get('foto');
      return {
        intento,
        errores: { ...errores, acepto: PEDIR_ACEPTAR },
        valores: campos,
        habiaArchivo: archivo instanceof File && archivo.size > 0,
      };
    }
    await aceptarLegales(s.usuario.id);
  }

  const r = await procesarFormularioPerfil(s.usuario.id, fd, intento);
  if (!r.ok) return r;
  redirect('/bienvenida/listo');
}

export type EstadoNuevaVersion = { error?: string };

// Ya tenía su pasaporte y cambiaron los textos legales: los acepta de nuevo y sigue.
export async function aceptarNuevaVersion(_prev: EstadoNuevaVersion, fd: FormData): Promise<EstadoNuevaVersion> {
  const s = await requerirSesion();
  if (s.esAdmin || s.usuario.institucionId) redirect(destinoInicial(s));
  if (fd.get('acepto') !== 'si') return { error: PEDIR_ACEPTAR };
  await aceptarLegales(s.usuario.id);
  const nueva = await sesionActual();
  redirect(nueva ? destinoInicial(nueva) : '/panel');
}

// Publicar el perfil: paso explícito, después de verlo.
export async function publicar() {
  const s = await requerirProfesional();
  await publicarPerfil(s.usuario.id);
  redirect('/panel/compartir?publicado=1');
}
