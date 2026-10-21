// SÓLO MODO DEMO: genera un link de activación nuevo para un certificado y lo abre.
// /demo/enlace?codigo=MK8D2F6N  o  /demo/enlace?email=florencia.paz@demo.example
// Para probar la activación sin pasar por la emisión ni por la bandeja.

import { NextResponse } from 'next/server';
import { and, desc, eq, isNull } from 'drizzle-orm';
import { db } from '@/db';
import { certificados } from '@/db/schema';
import { modoDemo } from '@/lib/config';
import { crearEnlaceActivacion } from '@/lib/auth/activacion';
import { normalizarCodigo } from '@/lib/certificados/codigo';
import { normalizarEmail } from '@/lib/texto';

export async function GET(req: Request) {
  if (!modoDemo()) return new Response('No disponible', { status: 404 });
  const sp = new URL(req.url).searchParams;
  let c: { id: string } | undefined;
  if (sp.get('email')) {
    // El certificado válido más reciente de ese mail que todavía no está en ninguna cuenta.
    [c] = await db
      .select({ id: certificados.id })
      .from(certificados)
      .where(and(eq(certificados.email, normalizarEmail(sp.get('email')!)), eq(certificados.estado, 'valido'), isNull(certificados.usuarioId)))
      .orderBy(desc(certificados.emitidoEn))
      .limit(1);
  } else {
    const codigo = normalizarCodigo(sp.get('codigo') || '');
    if (!codigo) return new Response('Código inválido', { status: 400 });
    [c] = await db.select({ id: certificados.id }).from(certificados).where(eq(certificados.codigo, codigo)).limit(1);
  }
  if (!c) return new Response('No hay un certificado sin activar para eso', { status: 404 });
  return NextResponse.redirect(await crearEnlaceActivacion(c.id));
}
