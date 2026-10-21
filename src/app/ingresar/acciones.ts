'use server';

import { redirect } from 'next/navigation';
import { after } from 'next/server';
import { solicitarCodigo, verificarCodigo } from '@/lib/auth/codigos';
import { destinoInicial, iniciarSesion, sesionActual } from '@/lib/auth/sesion';
import { normalizarEmail } from '@/lib/texto';

export type EstadoIngreso = {
  paso: 'email' | 'codigo';
  email: string;
  error?: string;
  // Para reiniciar la cuenta regresiva de "Reenviar" cada vez que se pide un código.
  pedidoEn?: number;
};

export async function accionIngreso(_prev: EstadoIngreso, fd: FormData): Promise<EstadoIngreso> {
  const email = normalizarEmail(String(fd.get('email') || ''));
  const intencion = String(fd.get('intencion') || 'pedir');

  if (intencion === 'pedir' || intencion === 'reenviar') {
    const r = await solicitarCodigo(email, after);
    if (!r.ok) return { paso: intencion === 'reenviar' ? 'codigo' : 'email', email, error: r.error };
    return { paso: 'codigo', email, pedidoEn: Date.now() };
  }

  const r = await verificarCodigo(email, String(fd.get('codigo') || ''));
  if (!r.ok) return { paso: 'codigo', email, error: r.error };
  await iniciarSesion(r.usuarioId);
  const s = await sesionActual();
  redirect(s ? destinoInicial(s) : '/');
}
