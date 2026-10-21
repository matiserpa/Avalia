import type { Metadata, Viewport } from 'next';
import { connection } from 'next/server';
import { MARCA } from '@/config/marca';
import { urlBase } from '@/lib/config';
import { urbanist } from './fuentes';
import './globals.css';

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL(urlBase()),
    title: { default: MARCA.nombre, template: `%s · ${MARCA.nombre}` },
    description: MARCA.descripcion,
    applicationName: MARCA.nombre,
    // Durante el piloto nada se indexa en buscadores salvo la portada (que lo habilita en su
    // página): los perfiles y verificaciones se comparten por link, no se buscan en Google.
    robots: { index: false, follow: false },
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  themeColor: '#F5F3EF',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  // Todas las páginas se arman en cada pedido: nada se prerenderiza con datos viejos.
  await connection();
  return (
    <html lang="es-AR" className={`${urbanist.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-tinta focus:px-5 focus:py-3 focus:font-semibold focus:text-marfil"
        >
          Saltar al contenido
        </a>
        {children}
      </body>
    </html>
  );
}
