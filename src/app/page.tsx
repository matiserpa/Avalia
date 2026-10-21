import type { Metadata } from 'next';
import Link from 'next/link';
import { PaginaPublica } from '@/components/layout/EncabezadoPublico';
import { Aviso } from '@/components/ui/Aviso';
import { BotonLink } from '@/components/ui/Boton';
import { Icono, type NombreIcono } from '@/components/ui/Icono';
import { MARCA } from '@/config/marca';
import { modoDemo } from '@/lib/config';
import { DEMO } from '@/lib/demo/datos';
import { FormularioCodigo } from './verificar/FormularioCodigo';

// La portada es la única página que se indexa en buscadores durante el piloto.
export const metadata: Metadata = {
  title: { absolute: `${MARCA.nombre} · ${MARCA.bajada}` },
  description: MARCA.descripcion,
  robots: { index: true, follow: true },
};

const PASOS: { icono: NombreIcono; titulo: string; texto: string }[] = [
  {
    icono: 'edificio',
    titulo: 'La institución emite',
    texto: 'Carga a sus egresadas y emite los certificados. A cada una le llega un mail para activar su pasaporte.',
  },
  {
    icono: 'usuario',
    titulo: 'La profesional lo muestra',
    texto: 'Reúne su formación en un perfil y lo comparte en redes, por WhatsApp o con el QR del consultorio.',
  },
  {
    icono: 'qr',
    titulo: 'El paciente lo verifica',
    texto: 'Escanea el QR o escribe el código y ve quién emitió el certificado. Sin crear cuenta.',
  },
];

export default function Portada() {
  return (
    <PaginaPublica ancho="ancho" mostrarIngresar>
      {modoDemo() && (
        <Aviso tono="info" titulo="Estás en la demo" className="mb-6">
          Los datos son inventados.{' '}
          <Link href={`/p/${DEMO.slugValentina}`} className="font-semibold underline underline-offset-4">
            Ver un perfil de ejemplo
          </Link>
        </Aviso>
      )}

      {/* Presentación y verificación */}
      <section className="grid items-start gap-10 pt-4 sm:pt-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-14">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-tierra-claro px-3.5 py-1.5 text-[0.9375rem] font-semibold text-tierra-oscuro">
            <Icono nombre="ubicacion" className="size-4" />
            Piloto en la Patagonia
          </p>
          <h1 className="mt-5 text-[2.375rem] font-bold leading-[1.1] tracking-tight sm:text-[3.25rem]">{MARCA.bajada}</h1>
          <p className="mt-5 max-w-xl text-[1.1875rem] leading-relaxed text-tinta-suave">
            Las instituciones emiten certificados con código y QR. Cada profesional reúne su formación en un perfil para
            compartir. Y cualquiera la verifica en segundos.
          </p>
        </div>

        <div id="verificar" className="rounded-tarjeta border border-borde-suave bg-papel p-5 shadow-elevada sm:p-7">
          <h2 className="text-[1.375rem] font-bold tracking-tight">Verificá un certificado</h2>
          <p className="mb-5 mt-1 text-tinta-suave">Escribí el código que figura en el certificado.</p>
          <FormularioCodigo />
        </div>
      </section>

      {/* Cómo funciona */}
      <section aria-labelledby="como-funciona" className="mt-16 sm:mt-24">
        <h2 id="como-funciona" className="text-[1.75rem] font-bold tracking-tight">
          Cómo funciona
        </h2>
        <ol className="mt-6 grid gap-4 md:grid-cols-3">
          {PASOS.map((p, i) => (
            <li key={p.titulo} className="rounded-tarjeta border border-borde-suave bg-papel p-5 shadow-tarjeta sm:p-6">
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-full bg-crema text-tierra">
                  <Icono nombre={p.icono} className="size-6" />
                </span>
                <span className="text-[0.9375rem] font-semibold text-tinta-suave">Paso {i + 1}</span>
              </div>
              <h3 className="mt-4 text-[1.1875rem] font-bold">{p.titulo}</h3>
              <p className="mt-1.5 text-tinta-suave">{p.texto}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Para quién */}
      <section aria-labelledby="para-quien" className="mt-16 sm:mt-24">
        <h2 id="para-quien" className="text-[1.75rem] font-bold tracking-tight">
          Para quién es
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Destinatario
            titulo="Pacientes"
            texto="Antes de un tratamiento, mirá la formación de tu profesional. Lo que tiene sello verde lo emitió una institución."
            accion={
              <BotonLink href="/verificar" variante="secundario" icono="lupa" anchoCompleto>
                Verificar un certificado
              </BotonLink>
            }
          />
          <Destinatario
            titulo="Profesionales"
            texto="Tu formación en un solo lugar y con sello, para mostrar en redes y en el consultorio. Llega cuando una institución del piloto te emite un certificado."
            accion={
              <BotonLink href="/ingresar" variante="secundario" icono="usuario" anchoCompleto>
                Ingresar a mi pasaporte
              </BotonLink>
            }
          />
          <Destinatario
            titulo="Instituciones"
            texto="Emití certificados verificables sin cambiar cómo trabajás: cargás la planilla de egresadas y Sella hace el resto."
            accion={
              <BotonLink href={`mailto:${MARCA.emailContacto}`} variante="secundario" icono="mail" anchoCompleto>
                Escribinos
              </BotonLink>
            }
          />
        </div>
      </section>

      {/* Alcance: qué verificamos y qué no */}
      <section aria-labelledby="alcance" className="mt-16 rounded-tarjeta bg-crema-claro p-6 sm:mt-24 sm:p-10">
        <h2 id="alcance" className="text-[1.75rem] font-bold tracking-tight">
          Qué verificamos y qué no
        </h2>
        <ul className="mt-6 grid gap-5 md:grid-cols-3">
          <Punto icono="check-circulo" titulo="Quién emitió el certificado">
            Confirmamos que la institución lo emitió, a nombre de quién, de qué curso y en qué fecha.
          </Punto>
          <Punto icono="info" titulo="No reemplaza la matrícula">
            No evaluamos tratamientos ni habilitamos a nadie para ejercer. La matrícula la otorga cada jurisdicción.
          </Punto>
          <Punto icono="candado" titulo="Datos cuidados">
            No pedimos ni guardamos DNI y nunca mostramos el mail. Cada profesional elige si su perfil es público.
          </Punto>
        </ul>
      </section>
    </PaginaPublica>
  );
}

function Destinatario({ titulo, texto, accion }: { titulo: string; texto: string; accion: React.ReactNode }) {
  return (
    <div className="flex flex-col rounded-tarjeta border border-borde-suave bg-papel p-5 shadow-tarjeta sm:p-6">
      <h3 className="text-[1.25rem] font-bold">{titulo}</h3>
      <p className="mb-6 mt-1.5 flex-1 text-tinta-suave">{texto}</p>
      {accion}
    </div>
  );
}

function Punto({ icono, titulo, children }: { icono: NombreIcono; titulo: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <Icono nombre={icono} className="mt-0.5 size-6 shrink-0 text-tierra" />
      <div>
        <h3 className="font-bold">{titulo}</h3>
        <p className="mt-1 text-tinta-suave">{children}</p>
      </div>
    </li>
  );
}
