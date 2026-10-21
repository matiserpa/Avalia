import type { NextConfig } from 'next';

// Sin cacheComponents ni partialPrefetching: todas las páginas se arman en cada pedido (los datos
// cambian todo el tiempo y el tráfico es chico), sin reglas de <Suspense> obligatorias y con
// 404 y redirecciones reales. Ver docs/arquitectura.md.
const nextConfig: NextConfig = {
  // Carpeta de compilación configurable: permite correr las pruebas de punta a punta con un
  // servidor propio mientras el de desarrollo sigue abierto.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
  // Paquetes que se cargan tal cual desde node_modules (PGlite trae un .wasm; pdf-lib y qrcode
  // no ganan nada con el empaquetado).
  serverExternalPackages: ['@electric-sql/pglite', 'pdf-lib', '@pdf-lib/fontkit', 'postgres', 'qrcode'],
  // Archivos que se leen del disco en tiempo de ejecución: tipografías (PDF e imágenes) y migraciones.
  outputFileTracingIncludes: {
    '/**': ['./src/fonts/**/*', './drizzle/**/*'],
  },
  experimental: {
    serverActions: {
      // Vercel corta en 4,5 MB por envío: las fotos se achican en el navegador y el servidor
      // acepta hasta 4 MB (src/lib/imagenes.ts).
      bodySizeLimit: '4.5mb',
    },
  },
  poweredByHeader: false,
  // Sin el botón flotante de Next en desarrollo (tapa la interfaz en las capturas).
  devIndicators: false,
};

export default nextConfig;
