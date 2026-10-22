'use server';

import { revalidatePath } from 'next/cache';
import { borrarConsulta, marcarRespondida } from '@/features/comercial/consultas';
import { requerirAdmin } from '@/lib/auth/guardas';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function cambiarEstado(fd: FormData): Promise<void> {
  await requerirAdmin();
  const id = String(fd.get('id') ?? '');
  if (!UUID.test(id)) return;
  await marcarRespondida(id, fd.get('respondida') === 'si');
  revalidatePath('/admin/consultas');
}

export async function borrar(fd: FormData): Promise<void> {
  await requerirAdmin();
  const id = String(fd.get('id') ?? '');
  if (!UUID.test(id)) return;
  await borrarConsulta(id);
  revalidatePath('/admin/consultas');
}
