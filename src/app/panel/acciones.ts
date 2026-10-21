'use server';

import { revalidatePath } from 'next/cache';
import { cambiarVisibilidad } from '@/features/profesional/certificados';
import { requerirProfesional } from '@/lib/auth/guardas';

// Mostrar u ocultar un certificado en el perfil. Ocultarlo no lo invalida.
export async function alternarVisibilidad(fd: FormData) {
  const s = await requerirProfesional();
  await cambiarVisibilidad(s.usuario.id, String(fd.get('certificadoId') || ''), fd.get('visible') === 'si');
  revalidatePath('/panel');
}
