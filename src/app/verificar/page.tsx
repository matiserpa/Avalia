import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { PaginaPublica } from '@/components/layout/EncabezadoPublico';
import { Icono, type NombreIcono } from '@/components/ui/Icono';
import { Etiqueta } from '@/components/ui/Sello';
import { MARCA } from '@/config/marca';
import { robotsSitio } from '@/features/comercial/sitio';
import { normalizarCodigo } from '@/lib/certificados/codigo';
import { FormularioCodigo } from './FormularioCodigo';

export function generateMetadata(): Metadata {
  const descripcion =
    'Escribí el código o escaneá el QR y comprobá quién emitió el certificado, a nombre de quién y si sigue válido. Gratis y sin crear cuenta.';
  return {
    title: 'Verificar un certificado',
    description: descripcion,
    robots: robotsSitio(),
    openGraph: { title: 'Verificar un certificado', description: descripcion },
  };
}

// Los tres resultados posibles, con la etiqueta de cada estado. El verde, sólo en el válido.
const RESULTADOS: { tono: 'verde' | 'error' | 'tierra'; icono: NombreIcono; estado: string; texto: string }[] = [
  {
    tono: 'verde',
    icono: 'check',
    estado: 'Certificado válido',
    texto:
      'La institución lo emitió a nombre de esa persona y no lo anuló. Ves el curso, la fecha y quién lo emitió. Si la profesional publicó su perfil, también ves un link a toda su formación.',
  },
  {
    tono: 'error',
    icono: 'cruz',
    estado: 'Certificado anulado',
    texto:
      'La institución lo dejó sin efecto, por ejemplo porque tenía un error. Puede haber emitido otro con un código nuevo: consultalo con la profesional o con la institución.',
  },
  {
    tono: 'tierra',
    icono: 'lupa',
    estado: 'No encontramos este certificado',
    texto: `Revisá que el código esté bien escrito: son 8 letras y números. Si sigue sin aparecer, consultá con quien te lo mostró: puede ser un certificado que no se emitió con ${MARCA.nombre}.`,
  },
];

const SABER = [
  'La verificación confirma quién emitió el certificado. No es una matrícula ni una habilitación para ejercer: la matrícula la otorga cada jurisdicción.',
  'No evalúa la calidad del curso ni de los tratamientos.',
  'En el perfil de una profesional, lo que tiene sello verde lo emitió una institución. La profesión, la ciudad, la matrícula y el contacto los declara ella.',
  'Verificar es gratis, siempre. No necesitás cuenta y no te pedimos ningún dato.',
];

export default async function PaginaVerificar({ searchParams }: PageProps<'/verificar'>) {
  const sp = await searchParams;
  const enviado = 'codigo' in sp;
  const entrada = typeof sp.codigo === 'string' ? sp.codigo.trim() : '';
  let error: string | undefined;
  if (enviado) {
    const codigo = normalizarCodigo(entrada);
    if (codigo) redirect(`/v/${codigo}?c=codigo`);
    error = entrada
      ? 'Ese código no tiene el formato correcto. Son 8 letras y números, por ejemplo AB12-CD34.'
      : 'Escribí el código del certificado.';
  }

  return (
    <PaginaPublica ancho="angosto" mostrarVerificar={false}>
      <div className="mx-auto max-w-md pt-6 sm:pt-10">
        <span className="mb-5 flex size-14 items-center justify-center rounded-full bg-crema text-tierra">
          <Icono nombre="lupa" className="size-7" />
        </span>
        <h1 className="text-[2rem] font-bold leading-tight tracking-tight">Verificar un certificado</h1>
        <p className="mt-2 text-tinta-suave">
          Escribí el código y te mostramos si el certificado es válido y quién lo emitió. No necesitás cuenta.
        </p>
        <div className="mt-8">
          <FormularioCodigo valor={entrada} error={error} />
        </div>
        <div className="mt-8 flex gap-3 rounded-2xl border border-borde-suave bg-papel p-4 text-[0.9375rem] text-tinta-suave">
          <Icono nombre="qr" className="mt-0.5 size-5 shrink-0 text-tierra" />
          <p>¿Tenés el certificado en papel o en PDF? Escaneá el QR con la cámara del celular y vas directo.</p>
        </div>

        <section aria-labelledby="como-leer" className="mt-12">
          <h2 id="como-leer" className="text-[1.375rem] font-bold tracking-tight">
            Cómo leer el resultado
          </h2>
          <ul className="mt-4 space-y-5">
            {RESULTADOS.map((r) => (
              <li key={r.estado}>
                <Etiqueta tono={r.tono} icono={r.icono}>
                  {r.estado}
                </Etiqueta>
                <p className="mt-2 text-tinta-suave">{r.texto}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="saber" className="mt-12">
          <h2 id="saber" className="text-[1.375rem] font-bold tracking-tight">
            Lo que tenés que saber
          </h2>
          <ul className="mt-4 space-y-3">
            {SABER.map((t) => (
              <li key={t} className="flex gap-3">
                <Icono nombre="info" className="mt-0.5 size-5 shrink-0 text-tierra" />
                <span className="text-tinta-suave">{t}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </PaginaPublica>
  );
}
