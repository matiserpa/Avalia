import type { MetadataRoute } from 'next';
import { COLOR_FONDO_APP } from '@/components/marca/IconoApp';
import { MARCA } from '@/config/marca';

// Permite agregar el sitio a la pantalla de inicio del celular ("Agregar a inicio" en el iPhone)
// y que se abra como una app, sin la barra del navegador.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: MARCA.nombre,
    short_name: MARCA.nombreCorto,
    description: MARCA.descripcion,
    lang: 'es-AR',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: COLOR_FONDO_APP,
    theme_color: COLOR_FONDO_APP,
    icons: [
      { src: '/icono-app/192', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icono-app/512', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icono-app/512', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
