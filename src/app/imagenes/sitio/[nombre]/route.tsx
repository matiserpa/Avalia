// Vista previa al compartir las páginas del sitio comercial (ver metadatosSitio). Pública: es
// sólo la marca y un ejemplo con datos inventados.

import { ImageResponse } from 'next/og';
import { ImagenInstituciones, ImagenProfesionales } from '@/components/comercial/ImagenesSitio';
import { fuentes } from '@/lib/imagenes-generadas';

const IMAGENES = { instituciones: ImagenInstituciones, profesionales: ImagenProfesionales };

export async function GET(_req: Request, ctx: RouteContext<'/imagenes/sitio/[nombre]'>) {
  const { nombre } = await ctx.params;
  if (!Object.hasOwn(IMAGENES, nombre)) return new Response('No encontrada', { status: 404 });
  const Imagen = IMAGENES[nombre as keyof typeof IMAGENES];
  return new ImageResponse(<Imagen />, {
    width: 1200,
    height: 630,
    fonts: await fuentes(),
    headers: { 'Cache-Control': 'public, max-age=86400' },
  });
}
