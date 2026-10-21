// SÓLO MODO DEMO: genera un link de activación nuevo para un certificado y lo abre.
// /demo/enlace?codigo=ML8D2F6N
// Para probar la activación sin pasar por la emisión ni por la bandeja.

import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { certificados } from '@/db/schema';
import { modoDemo } from '@/lib/config';
import { crearEnlaceActivacion } from '@/lib/auth/activacion';
import { normalizarCodigo } from '@/lib/certificados/codigo';

export async function GET(req: Request) {
  if (!modoDemo()) return new Response('No disponible', { status: 404 });
  const codigo = normalizarCodigo(new URL(req.url).searchParams.get('codigo') || '');
  if (!codigo) return new Response('Código inválido', { status: 400 });
  const [c] = await db.select({ id: certificados.id }).from(certificados).where(eq(certificados.codigo, codigo)).limit(1);
  if (!c) return new Response('No existe ese certificado', { status: 404 });
  return NextResponse.redirect(await crearEnlaceActivacion(c.id));
}
