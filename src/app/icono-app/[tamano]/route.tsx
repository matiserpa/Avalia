// Íconos del manifiesto (src/app/manifest.ts), en los tamaños que piden Android y Chrome.
// Público: es sólo la marca, sin ningún dato.

import { ImageResponse } from 'next/og';
import { IconoApp } from '@/components/marca/IconoApp';

const TAMANOS = [192, 512];

export async function GET(_req: Request, ctx: RouteContext<'/icono-app/[tamano]'>) {
  const tamano = Number((await ctx.params).tamano);
  if (!TAMANOS.includes(tamano)) return new Response('No encontrado', { status: 404 });
  return new ImageResponse(<IconoApp tamano={tamano} />, {
    width: tamano,
    height: tamano,
    headers: { 'Cache-Control': 'public, max-age=86400' },
  });
}
