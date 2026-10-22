import { ImageResponse } from 'next/og';
import { IconoApp } from '@/components/marca/IconoApp';

// El ícono que usa el iPhone al agregar el sitio a la pantalla de inicio.
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function IconoApple() {
  return new ImageResponse(<IconoApp tamano={size.width} />, size);
}
