// Imágenes subidas (fotos de perfil y logos). Se achican a un máximo de 512 px, se pasan a
// WebP y se guardan en la base. Se sirven por /img/<id> (ver src/app/img/[id]/route.ts),
// que decide quién puede verlas.

import 'server-only';
import sharp from 'sharp';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { imagenes } from '@/db/schema';

export const MAX_BYTES_SUBIDA = 8 * 1024 * 1024;
const TIPOS_ACEPTADOS = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'image/avif', 'image/gif', 'image/svg+xml'];

export type ResultadoImagen = { ok: true; id: string } | { ok: false; error: string };

// opciones.fondo: para logos con transparencia conviene dejarla; para fotos no importa.
export async function guardarImagen(archivo: File, opciones: { lado?: number; recortarCuadrada?: boolean } = {}): Promise<ResultadoImagen> {
  if (!archivo || archivo.size === 0) return { ok: false, error: 'Elegí una imagen.' };
  if (archivo.size > MAX_BYTES_SUBIDA) return { ok: false, error: 'La imagen pesa más de 8 MB. Probá con una más liviana.' };
  if (archivo.type && !TIPOS_ACEPTADOS.includes(archivo.type)) {
    return { ok: false, error: 'Ese archivo no es una imagen que podamos usar. Probá con JPG o PNG.' };
  }
  const lado = opciones.lado ?? 512;
  try {
    const entrada = Buffer.from(await archivo.arrayBuffer());
    let img = sharp(entrada, { failOn: 'error' }).rotate();
    img = opciones.recortarCuadrada
      ? img.resize(lado, lado, { fit: 'cover', position: 'attention' })
      : img.resize(lado, lado, { fit: 'inside', withoutEnlargement: true });
    const { data, info } = await img.webp({ quality: 82 }).toBuffer({ resolveWithObject: true });
    const [fila] = await db
      .insert(imagenes)
      .values({ mime: 'image/webp', datos: new Uint8Array(data), ancho: info.width, alto: info.height })
      .returning({ id: imagenes.id });
    return { ok: true, id: fila.id };
  } catch {
    return { ok: false, error: 'No pudimos leer esa imagen. Probá con otra, en JPG o PNG.' };
  }
}

export async function borrarImagen(id: string | null | undefined): Promise<void> {
  if (id) await db.delete(imagenes).where(eq(imagenes.id, id));
}

export async function leerImagen(id: string) {
  const [fila] = await db.select().from(imagenes).where(eq(imagenes.id, id)).limit(1);
  return fila ?? null;
}

export { urlImagen } from './imagenes-url';
