import type { Metadata } from 'next';
import { TituloPagina } from '@/components/layout/MarcoPanel';
import { Isotipo } from '@/components/marca/Logo';
import { Aviso } from '@/components/ui/Aviso';
import { BotonEnviar } from '@/components/ui/BotonEnviar';
import { EstadoVacio } from '@/components/ui/EstadoVacio';
import { MARCA } from '@/config/marca';
import { requerirProfesional } from '@/lib/auth/guardas';
import { urlBase } from '@/lib/config';
import { qrSvg } from '@/lib/qr';
import { nombreCompleto } from '@/lib/texto';
import { publicarDesdeCompartir } from './acciones';
import { CompartirNativo, CopiarLink, Descargar, Imprimir } from './Acciones';

export const metadata: Metadata = { title: 'Compartir' };

export default async function Compartir({ searchParams }: PageProps<'/panel/compartir'>) {
  const s = await requerirProfesional();
  const sp = await searchParams;
  const p = s.perfil;

  if (!p.publico) {
    return (
      <>
        <TituloPagina titulo="Compartir" />
        <EstadoVacio
          icono="candado"
          titulo="Primero publicá tu perfil"
          accion={
            <form action={publicarDesdeCompartir}>
              <BotonEnviar icono="mundo" textoEnviando="Publicando…">
                Publicar mi perfil
              </BotonEnviar>
            </form>
          }
        >
          Tu perfil es privado. Cuando lo publiques, vas a poder compartir tu link, imprimir tu QR y descargar una imagen
          para tus historias.
        </EstadoVacio>
      </>
    );
  }

  const base = `${urlBase()}/p/${p.slug}`;
  const linkCorto = base.replace(/^https?:\/\//, '');
  const svg = await qrSvg(`${base}?c=qr`);
  const nombre = nombreCompleto(p);

  return (
    <>
      <div className="no-imprimir">
        <TituloPagina titulo="Compartir" bajada="Mostrá tu formación verificada donde te buscan tus pacientes." />
        {sp.publicado && (
          <Aviso tono="exito" titulo="¡Tu perfil ya es público!" className="mb-8">
            Compartilo: cada vez que alguien lo abre desde tu link, tu QR o tu historia, lo vas a estar mostrando con sello.
          </Aviso>
        )}
      </div>

      <div className="space-y-6">
        <Bloque titulo="Tu link" bajada="Para WhatsApp, tu bio de Instagram o donde quieras.">
          <div className="space-y-3">
            <CopiarLink texto={`${base}?c=link`} etiqueta="Link de tu perfil" />
            <CompartirNativo url={`${base}?c=link`} titulo={nombre} />
          </div>
        </Bloque>

        <Bloque
          titulo="QR para el consultorio"
          bajada="Imprimilo y dejalo a la vista: tus pacientes lo escanean con la cámara y ven tu formación."
        >
          {/* La tarjeta es lo único que se imprime. */}
          <div className="tarjeta-qr mx-auto max-w-sm rounded-tarjeta border-2 border-tinta bg-white p-6 text-center">
            <p className="text-[1.1875rem] font-bold">Mi formación está verificada</p>
            <div className="mx-auto mt-4 w-56 [&_svg]:h-auto [&_svg]:w-full" role="img" aria-label={`Código QR que lleva a ${linkCorto}`}>
              <div aria-hidden="true" dangerouslySetInnerHTML={{ __html: svg }} />
            </div>
            <p className="mt-4 text-[1.25rem] font-bold">{nombre}</p>
            {p.profesion && <p className="text-tinta-suave">{p.profesion}</p>}
            <p className="mt-3 text-[0.9375rem] text-tinta-suave">Escaneá con la cámara del celular</p>
            <p className="mt-4 inline-flex items-center gap-2 text-tierra">
              <Isotipo className="size-6" />
              <span className="font-bold text-tinta">{MARCA.nombre}</span>
            </p>
          </div>
          <div className="no-imprimir mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Imprimir>Imprimir</Imprimir>
            <Descargar href="/panel/compartir/qr" canal="qr_consultorio">
              Descargar el QR
            </Descargar>
          </div>
        </Bloque>

        <Bloque
          titulo="Imagen para tus historias"
          bajada="Descargala, subila a tu historia de Instagram y agregá el sticker de enlace con este link:"
        >
          <CopiarLink texto={`${base}?c=historia`} etiqueta="Link para el sticker de la historia" />
          <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:items-start">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/panel/compartir/historia"
              alt={`Vista previa de la imagen para historias: ${nombre}, formación verificada`}
              width={1080}
              height={1920}
              className="h-auto w-48 rounded-2xl border border-borde-suave shadow-tarjeta"
            />
            <div className="w-full space-y-3 sm:pt-2">
              <Descargar href="/panel/compartir/historia?descargar=1" canal="imagen_historia" variante="primario">
                Descargar la imagen
              </Descargar>
              <p className="text-[0.9375rem] text-tinta-suave">
                Tamaño para historias (1080 × 1920). Muestra tu nombre, tu profesión y tus certificados verificados más
                recientes.
              </p>
            </div>
          </div>
        </Bloque>
      </div>
    </>
  );
}

function Bloque({ titulo, bajada, children }: { titulo: string; bajada: string; children: React.ReactNode }) {
  return (
    <section className="bloque-compartir rounded-tarjeta border border-borde-suave bg-papel p-5 shadow-tarjeta sm:p-6">
      <div className="no-imprimir mb-4">
        <h2 className="text-[1.25rem] font-bold">{titulo}</h2>
        <p className="mt-0.5 text-tinta-suave">{bajada}</p>
      </div>
      {children}
    </section>
  );
}
