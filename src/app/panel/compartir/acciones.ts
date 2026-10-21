'use server';

import { revalidatePath } from 'next/cache';
import type { Canal } from '@/db/schema';
import { publicarPerfil } from '@/features/profesional/perfil';
import { requerirProfesional } from '@/lib/auth/guardas';
import { registrarEvento } from '@/lib/eventos';

const CANALES_COMPARTIR: Canal[] = ['copiar_link', 'compartir_nativo', 'qr_consultorio', 'imagen_historia'];

// La profesional tocó copiar, compartir, imprimir o descargar. Sólo para las métricas del piloto.
export async function registrarCompartir(canal: string) {
  const s = await requerirProfesional();
  if (!CANALES_COMPARTIR.includes(canal as Canal)) return;
  await registrarEvento({ tipo: 'compartir', canal: canal as Canal, perfilUsuarioId: s.usuario.id });
}

export async function publicarDesdeCompartir() {
  const s = await requerirProfesional();
  await publicarPerfil(s.usuario.id);
  revalidatePath('/panel', 'layout');
}
