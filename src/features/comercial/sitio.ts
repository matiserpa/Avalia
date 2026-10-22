// Metadatos de las páginas del sitio comercial: título, descripción, vista previa al compartir
// y si se dejan indexar (sólo con INDEXAR=true; ver indexar() en src/lib/config.ts).

import type { Metadata } from 'next';
import { MARCA } from '@/config/marca';
import { indexar } from '@/lib/config';

export const IMAGENES_SITIO = {
  instituciones: `${MARCA.nombre}: certificados verificables con el logo de tu institución.`,
  profesionales: `${MARCA.nombre}: tu formación verificada en un perfil para compartir.`,
} as const;
export type ImagenSitio = keyof typeof IMAGENES_SITIO;

export function robotsSitio(): Metadata['robots'] {
  return indexar() ? { index: true, follow: true } : { index: false, follow: false };
}

export function metadatosSitio(m: {
  titulo: string;
  // La portada usa su título tal cual, sin "· Avalya" al final.
  tituloAbsoluto?: boolean;
  descripcion: string;
  compartir: { titulo: string; descripcion?: string; imagen: ImagenSitio };
}): Metadata {
  const imagen = { url: `/imagenes/sitio/${m.compartir.imagen}`, width: 1200, height: 630, alt: IMAGENES_SITIO[m.compartir.imagen] };
  const descripcion = m.compartir.descripcion ?? m.descripcion;
  return {
    title: m.tituloAbsoluto ? { absolute: m.titulo } : m.titulo,
    description: m.descripcion,
    robots: robotsSitio(),
    openGraph: { title: m.compartir.titulo, description: descripcion, images: [imagen], siteName: MARCA.nombre, locale: 'es_AR', type: 'website' },
    twitter: { card: 'summary_large_image', title: m.compartir.titulo, description: descripcion, images: [imagen] },
  };
}
