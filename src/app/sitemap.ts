import type { MetadataRoute } from 'next';
import { connection } from 'next/server';
import { indexar, urlBase } from '@/lib/config';

// Sólo las páginas del sitio comercial y la verificación, y sólo si se indexa (INDEXAR=true).
// Perfiles, verificaciones, paneles y legales nunca van a buscadores.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  if (!indexar()) return [];
  const base = urlBase();
  return ['/', '/profesionales', '/contacto', '/verificar'].map((ruta) => ({ url: `${base}${ruta}` }));
}
