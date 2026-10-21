'use server';

import { revalidatePath } from 'next/cache';
import type { EstadoFormPerfil } from '@/components/perfil/FormularioPerfil';
import { procesarFormularioPerfil } from '@/features/profesional/perfil';
import { requerirProfesional } from '@/lib/auth/guardas';

export async function guardarPerfilPanel(prev: EstadoFormPerfil, fd: FormData): Promise<EstadoFormPerfil> {
  const s = await requerirProfesional();
  const r = await procesarFormularioPerfil(s.usuario.id, fd, prev.intento + 1);
  if (r.ok) revalidatePath('/panel', 'layout');
  return r;
}
