'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { borrarCuenta } from '@/features/profesional/cuenta';
import { ocultarPerfil, publicarPerfil } from '@/features/profesional/perfil';
import { requerirProfesional } from '@/lib/auth/guardas';
import { cerrarSesion } from '@/lib/auth/sesion';

export async function cambiarVisibilidadPerfil(fd: FormData) {
  const s = await requerirProfesional();
  if (fd.get('publico') === 'si') await publicarPerfil(s.usuario.id);
  else await ocultarPerfil(s.usuario.id);
  revalidatePath('/panel', 'layout');
}

export type EstadoBorrar = { error?: string };

export async function borrarMiCuenta(_prev: EstadoBorrar, fd: FormData): Promise<EstadoBorrar> {
  const s = await requerirProfesional();
  if (fd.get('confirmo') !== 'si') {
    return { error: 'Para borrar tu cuenta, confirmá que entendés que no se puede deshacer.' };
  }
  await borrarCuenta(s.usuario.id);
  await cerrarSesion();
  redirect('/?cuenta=borrada');
}
