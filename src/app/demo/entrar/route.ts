// SÓLO MODO DEMO: entra directo como una persona de prueba, sin código.
// /demo/entrar?email=instituto@demo.example
// Lo usan los accesos rápidos de /demo y las pruebas automáticas.

import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { usuarios } from '@/db/schema';
import { modoDemo } from '@/lib/config';
import { destinoInicial, iniciarSesion, sesionActual } from '@/lib/auth/sesion';
import { normalizarEmail } from '@/lib/texto';

export async function GET(req: Request) {
  if (!modoDemo()) return new Response('No disponible', { status: 404 });
  const url = new URL(req.url);
  const email = normalizarEmail(url.searchParams.get('email') || '');
  const [u] = await db.select({ id: usuarios.id }).from(usuarios).where(eq(usuarios.email, email)).limit(1);
  if (!u) return new Response('No existe una persona de prueba con ese mail', { status: 404 });
  await iniciarSesion(u.id);
  const s = await sesionActual();
  const inicial = s ? destinoInicial(s) : '/';
  // Sólo destinos de este sitio: "//otro-sitio" o "/\otro-sitio" también empiezan con barra.
  const pedido = new URL(url.searchParams.get('a') || inicial, url);
  return NextResponse.redirect(pedido.origin === url.origin ? pedido : new URL(inicial, url));
}
