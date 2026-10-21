'use server';

import { revalidatePath } from 'next/cache';
import { crearInstitucion, invitarAlEquipo, type ErroresInstitucion } from '@/features/admin/instituciones';
import { requerirAdmin } from '@/lib/auth/guardas';

export type EstadoAlta = { intento: number; ok?: string; errores?: ErroresInstitucion; valores?: { nombre: string; ciudad: string; email: string } };

export async function altaInstitucion(prev: EstadoAlta, fd: FormData): Promise<EstadoAlta> {
  await requerirAdmin();
  const valores = { nombre: String(fd.get('nombre') ?? ''), ciudad: String(fd.get('ciudad') ?? ''), email: String(fd.get('email') ?? '') };
  const logo = fd.get('logo');
  const r = await crearInstitucion({ ...valores, logo: logo instanceof File ? logo : null });
  if (!r.ok) return { intento: prev.intento + 1, errores: r.errores, valores };
  revalidatePath('/admin');
  return {
    intento: prev.intento + 1,
    ok: r.mailOk
      ? `Creamos ${valores.nombre.trim()} y le mandamos la invitación a ${valores.email.trim()}.`
      : `Creamos ${valores.nombre.trim()}, pero no pudimos mandar la invitación. Avisale que entre con su mail.`,
  };
}

export type EstadoInvitar = { ok?: boolean; mensaje?: string };

export async function invitar(_prev: EstadoInvitar, fd: FormData): Promise<EstadoInvitar> {
  await requerirAdmin();
  const r = await invitarAlEquipo(String(fd.get('institucionId') ?? ''), String(fd.get('email') ?? ''));
  if (r.ok) revalidatePath('/admin');
  return { ok: r.ok, mensaje: r.ok ? 'Listo, le mandamos la invitación.' : r.error };
}
