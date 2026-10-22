import Link from 'next/link';
import { Logo } from '@/components/marca/Logo';
import { MARCA } from '@/config/marca';

const GRUPOS: { titulo: string; links: { href: string; texto: string }[] }[] = [
  {
    titulo: 'Instituciones',
    links: [
      { href: '/#como-funciona', texto: 'Cómo funciona' },
      { href: '/#congresos', texto: 'Congresos y jornadas' },
      { href: '/#preguntas', texto: 'Preguntas frecuentes' },
      { href: '/contacto', texto: 'Sumar mi institución al piloto' },
    ],
  },
  {
    titulo: 'Profesionales',
    links: [
      { href: '/profesionales', texto: 'Conocer el pasaporte' },
      { href: '/ingresar', texto: 'Ingresar' },
    ],
  },
  { titulo: 'Pacientes', links: [{ href: '/verificar', texto: 'Verificar un certificado' }] },
];

// Pie del sitio comercial (portada, profesionales y contacto).
export function PieComercial() {
  return (
    <footer className="no-imprimir mt-auto border-t border-borde-suave bg-papel/60">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,3fr)]">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-[0.9375rem] text-tinta-suave">{MARCA.descripcion}</p>
            <p className="mt-2 text-[0.9375rem] text-tinta-suave">Piloto en Neuquén y Río Negro.</p>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-[repeat(3,minmax(0,1fr))_auto]">
            {GRUPOS.map((g) => (
              <nav key={g.titulo} aria-label={g.titulo}>
                <p className="text-[0.9375rem] font-bold">{g.titulo}</p>
                <ul className="mt-1">
                  {g.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="flex min-h-12 items-center text-[0.9375rem] text-tinta-suave underline-offset-4 hover:text-tinta hover:underline">
                        {l.texto}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
            <nav aria-label="Contacto" className="col-span-2 md:col-span-1">
              <p className="text-[0.9375rem] font-bold">Contacto</p>
              <ul className="mt-1">
                <li>
                  <a
                    href={`mailto:${MARCA.emailContacto}`}
                    className="flex min-h-12 items-center text-[0.9375rem] text-tinta-suave max-md:[overflow-wrap:anywhere] underline-offset-4 hover:text-tinta hover:underline"
                  >
                    {MARCA.emailContacto}
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-2 border-t border-borde-suave pt-6 text-[0.9375rem] text-tinta-suave sm:flex-row sm:items-center sm:justify-between">
          <p>
            {MARCA.nombre} es un servicio de {MARCA.responsable}. No reemplaza la matrícula profesional ni habilita para ejercer.
          </p>
          <nav aria-label="Textos legales" className="flex gap-5">
            <Link href="/terminos" className="flex min-h-12 items-center underline-offset-4 hover:underline">
              Términos
            </Link>
            <Link href="/privacidad" className="flex min-h-12 items-center underline-offset-4 hover:underline">
              Privacidad
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
