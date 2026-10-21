'use server';

import { revalidatePath } from 'next/cache';
import { crearInstitucion, invitarAlEquipo, type ErroresInstitucion } from '@/features/admin/instituciones';
import { requerirAdmin } from '@/lib/auth/guardas';

export type EstadoAlta = {
  intento: number;
  ok?: string;
  errores?: ErroresInstitucion;
  valores?: { nombre: string; ciudad: string; email: string };
  // Si había elegido un logo: el formulario vuelve vacío y hay que pedirle que lo elija de nuevo.
  habiaArchivo?: boolean;
};

export async function altaInstitucion(prev: EstadoAlta, fd: FormData): Promise<EstadoAlta> {
  await requerirAdmin();
  const valores = { nombre: String(fd.get('nombre') ?? ''), ciudad: String(fd.get('ciudad') ?? ''), email: String(fd.get('email') ?? '') };
  const logo = fd.get('logo');
  const r = await crearInstitucion({ ...valores, logo: logo instanceof File ? logo : null });
  if (!r.ok) return { intento: prev.intento + 1, errores: r.errores, valores, habiaArchivo: logo instanceof File && logo.size > 0 };
  revalidatePath('/admin');
  return {
    intento: prev.intento + 1,
    ok: r.mailOk
      ? `Creamos ${valores.nombre.trim()} y le mandamos la invitación a ${valores.email.trim()}.`
      : `Creamos ${valores.nombre.trim()}, pero no pudimos mandar la invitación. Avisale que entre con su mail.`,
  };
}

// Con error se devuelve el mail escrito: React vacía el formulario al terminar la acción.
export type EstadoInvitar = { ok?: boolean; mensaje?: string; email?: string; intento?: number };

export async function invitar(prev: EstadoInvitar, fd: FormData): Promise<EstadoInvitar> {
  await requerirAdmin();
  const email = String(fd.get('email') ?? '');
  const r = await invitarAlEquipo(String(fd.get('institucionId') ?? ''), email);
  if (r.ok) revalidatePath('/admin');
  const intento = (prev.intento ?? 0) + 1;
  return r.ok ? { ok: true, mensaje: 'Listo, le mandamos la invitación.', intento } : { ok: false, mensaje: r.error, email, intento };
}
