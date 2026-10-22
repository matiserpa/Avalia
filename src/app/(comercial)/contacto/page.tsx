import type { Metadata } from 'next';
import Link from 'next/link';
import { FormularioConsulta } from '@/components/comercial/FormularioConsulta';
import { MARCA } from '@/config/marca';
import { TIPOS_CONSULTA, type TipoConsulta } from '@/db/schema';
import { metadatosSitio } from '@/features/comercial/sitio';
import { modoDemo } from '@/lib/config';

export function generateMetadata(): Metadata {
  return metadatosSitio({
    titulo: 'Sumá tu institución al piloto',
    descripcion: `Contanos de tu institución y te escribimos para coordinar una reunión y mostrarte cómo funciona ${MARCA.nombre}. Piloto en Neuquén y Río Negro.`,
    compartir: { titulo: 'Sumá tu institución al piloto.', imagen: 'instituciones' },
  });
}

const DESPUES: { titulo: string; texto: string }[] = [
  { titulo: 'Nos llega tu consulta.', texto: `La lee el equipo de ${MARCA.responsable}, que hace ${MARCA.nombre}.` },
  { titulo: 'Te escribimos.', texto: 'Por mail, o por WhatsApp si nos dejaste un número, para coordinar una reunión.' },
  { titulo: 'Te mostramos cómo funciona.', texto: 'Vemos juntos un curso de ejemplo, con datos inventados, y resolvemos tus dudas.' },
  {
    titulo: 'Si se suman, damos de alta tu institución.',
    texto: 'La cargamos con su nombre y su logo, y le mandamos la invitación a la persona responsable para que entre a su panel.',
  },
];

// Página pública, sin guarda: el formulario no muestra datos de nadie.
export default async function Contacto({ searchParams }: PageProps<'/contacto'>) {
  const sp = await searchParams;
  const tipo = (TIPOS_CONSULTA as readonly string[]).includes(String(sp.tipo)) ? (sp.tipo as TipoConsulta) : undefined;
  return (
    <main id="contenido" className="mx-auto w-full max-w-5xl flex-1 px-4 pb-16 pt-2 sm:px-6 sm:pt-6">
      <div className="max-w-2xl pt-2 sm:pt-6">
        <h1 className="text-balance text-[2.25rem] font-bold leading-[1.1] tracking-tight sm:text-[2.75rem]">Sumá tu institución al piloto</h1>
        <p className="mt-4 text-[1.125rem] leading-relaxed text-tinta-suave">
          Contanos de tu institución y te escribimos para coordinar una reunión. Te mostramos {MARCA.nombre} funcionando, con datos
          de prueba, y resolvemos tus dudas. Escribirnos no te compromete a nada.
        </p>
        <p className="mt-3 text-[0.9375rem] text-tinta-suave">
          ¿Sos profesional? Tu pasaporte llega cuando tu institución te emite un certificado. Si querés que se sume,{' '}
          <Link href="/profesionales#contarle" className="font-semibold text-tinta underline underline-offset-4">
            pasale el mensaje que te dejamos listo
          </Link>{' '}
          o elegí «Soy profesional de la estética» acá abajo.
        </p>
      </div>

      <div className="mt-10 grid items-start gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <FormularioConsulta tipoInicial={tipo} demo={modoDemo()} />
        </div>
        <section aria-labelledby="titulo-despues" className="lg:col-span-5">
          <h2 id="titulo-despues" className="text-[1.375rem] font-bold tracking-tight">
            Qué pasa después
          </h2>
          <ol className="mt-5 space-y-5">
            {DESPUES.map((p, i) => (
              <li key={p.titulo} className="flex gap-4">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-crema font-bold text-tierra-oscuro">{i + 1}</span>
                <div>
                  <p className="font-bold">{p.titulo}</p>
                  <p className="mt-0.5 text-tinta-suave">{p.texto}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-[0.9375rem]">
            ¿Preferís escribirnos directo?{' '}
            <a href={`mailto:${MARCA.emailContacto}`} className="font-semibold underline underline-offset-4">
              {MARCA.emailContacto}
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
