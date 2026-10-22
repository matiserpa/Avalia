import { PieComercial } from '@/components/comercial/PieComercial';
import { EncabezadoSitio } from '@/components/layout/EncabezadoSitio';

// Sitio comercial: portada (para instituciones), profesionales y contacto. Páginas públicas, sin
// guarda: no muestran nada de nadie.
export default function LayoutComercial({ children }: LayoutProps<'/'>) {
  return (
    <>
      <EncabezadoSitio
        enlaces={[
          { href: '/', texto: 'Instituciones' },
          { href: '/#congresos', texto: 'Congresos y jornadas' },
          { href: '/profesionales', texto: 'Profesionales' },
        ]}
        enlacesMenu={[
          { href: '/', texto: 'Para instituciones' },
          { href: '/#como-funciona', texto: 'Cómo funciona' },
          { href: '/#congresos', texto: 'Congresos y jornadas' },
          { href: '/profesionales', texto: 'Para profesionales' },
          { href: '/#preguntas', texto: 'Preguntas frecuentes' },
        ]}
        llamado={{ href: '/contacto', texto: 'Sumar mi institución al piloto', textoCorto: 'Sumar mi institución' }}
        ingresar={{ href: '/ingresar', texto: 'Ingresar' }}
      />
      {children}
      <PieComercial />
    </>
  );
}
