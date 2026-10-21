'use server';

import { redirect } from 'next/navigation';
import type { EstadoFormPerfil } from '@/components/perfil/FormularioPerfil';
import { procesarFormularioPerfil, publicarPerfil } from '@/features/profesional/perfil';
import { aceptarLegales } from '@/lib/auth/activacion';
import { requerirProfesional, requerirSesion } from '@/lib/auth/guardas';
import { destinoInicial } from '@/lib/auth/sesion';

export async function guardarBienvenida(prev: EstadoFormPerfil, fd: FormData): Promise<EstadoFormPerfil> {
  const s = await requerirSesion();
  if (s.esAdmin || s.usuario.institucionId) redirect(destinoInicial(s));
  const intento = prev.intento + 1;

  // Si entró con código (no por el link del mail), el consentimiento se da acá.
  if (!s.usuario.aceptoLegalesEn) {
    if (fd.get('acepto') !== 'si') {
      return {
        intento,
        errores: { acepto: 'Para seguir tenés que aceptar los términos y la política de privacidad.' },
        valores: undefined,
      };
    }
    await aceptarLegales(s.usuario.id);
  }

  const r = await procesarFormularioPerfil(s.usuario.id, fd, intento);
  if (!r.ok) return r;
  redirect('/bienvenida/listo');
}

// Publicar el perfil: paso explícito, después de verlo.
export async function publicar() {
  const s = await requerirProfesional();
  await publicarPerfil(s.usuario.id);
  redirect('/panel/compartir?publicado=1');
}
