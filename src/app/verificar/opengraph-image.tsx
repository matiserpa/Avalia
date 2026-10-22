import { ImageResponse } from 'next/og';
import { ImagenMarca } from '@/components/marca/ImagenMarca';
import { MARCA } from '@/config/marca';
import { fuentes } from '@/lib/imagenes-generadas';

// La imagen genérica de la marca: esta página define su propio título para compartir, y sin
// esto se quedaba sin imagen.
export const alt = MARCA.nombre;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Imagen() {
  return new ImageResponse(<ImagenMarca />, { ...size, fonts: await fuentes() });
}
