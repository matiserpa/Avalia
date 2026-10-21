// QR del perfil en PNG, para imprimir o sumar a sus propios diseños. Lleva a /p/<slug>?c=qr.

import { requerirProfesional } from '@/lib/auth/guardas';
import { urlBase } from '@/lib/config';
import { qrPng } from '@/lib/qr';

export async function GET() {
  const s = await requerirProfesional();
  if (!s.perfil.publico) return new Response('Tu perfil es privado', { status: 404 });
  const png = await qrPng(`${urlBase()}/p/${s.perfil.slug}?c=qr`, 1200);
  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': `attachment; filename="qr-${s.perfil.slug}.png"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
