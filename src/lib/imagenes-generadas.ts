// Utilidades para las imágenes que se arman en el servidor con ImageResponse (next/og): la vista
// previa de los links y la imagen para historias.

import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { leerImagen } from '@/lib/imagenes';

// Mismos colores que los tokens de globals.css (acá no hay CSS).
export const COLORES = {
  marfil: '#F5F3EF',
  crema: '#E8E0D5',
  cremaClaro: '#EFE8DE',
  papel: '#FFFDF9',
  tinta: '#0F1210',
  tintaSuave: '#4B4F4A',
  tierra: '#7A5A43',
  tierraOscuro: '#5E4433',
  verde: '#2E6B51',
  verdeOscuro: '#245541',
  verdeClaro: '#DCEAE2',
  bordeSuave: '#D5CABB',
};

type Peso = 400 | 500 | 600 | 700 | 800;
let cargadas: Promise<{ name: string; data: Buffer; weight: Peso; style: 'normal' }[]> | null = null;

export function fuentes() {
  cargadas ??= Promise.all(
    ([400, 600, 700, 800] as const).map(async (weight) => ({
      name: 'Urbanist',
      data: await readFile(path.join(process.cwd(), 'src', 'fonts', `Urbanist-${weight}.ttf`)),
      weight,
      style: 'normal' as const,
    })),
  );
  return cargadas;
}

// La foto guardada (WebP) como PNG en data URL, que es lo que entiende ImageResponse.
// No chequea permisos: quien la llama ya decidió que se puede mostrar.
export async function fotoComoDataUrl(id: string | null, lado = 400): Promise<string | null> {
  if (!id) return null;
  const img = await leerImagen(id);
  if (!img) return null;
  try {
    const png = await sharp(Buffer.from(img.datos)).resize(lado, lado, { fit: 'cover' }).png().toBuffer();
    return `data:image/png;base64,${png.toString('base64')}`;
  } catch {
    return null;
  }
}
