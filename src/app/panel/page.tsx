import type { Metadata } from 'next';
import Link from 'next/link';
import { TituloPagina } from '@/components/layout/MarcoPanel';
import { Aviso } from '@/components/ui/Aviso';
import { BotonLink, clasesBoton } from '@/components/ui/Boton';
import { EstadoVacio } from '@/components/ui/EstadoVacio';
import { Icono } from '@/components/ui/Icono';
import { LogoInstitucion } from '@/components/ui/LogoInstitucion';
import { Etiqueta, SelloVerificado } from '@/components/ui/Sello';
import { certificadosPropios, type CertificadoPropio } from '@/features/profesional/certificados';
import { requerirProfesional } from '@/lib/auth/guardas';
import { formatearCodigo } from '@/lib/certificados/codigo';
import { urlBase } from '@/lib/config';
import { cantidad, fechaLarga, horas, TIPOS_CURSO } from '@/lib/texto';
import { alternarVisibilidad } from './acciones';
import { CopiarLink } from './compartir/Acciones';
import { InterruptorVisibilidad } from './InterruptorVisibilidad';

export const metadata: Metadata = { title: 'Mi pasaporte' };

export default async function MiPasaporte({ searchParams }: PageProps<'/panel'>) {
  const s = await requerirProfesional();
  const sp = await searchParams;
  const lista = await certificadosPropios(s.usuario.id);
  const validos = lista.filter((c) => c.estado === 'valido');
  const anulados = lista.filter((c) => c.estado === 'anulado');
  const link = `${urlBase()}/p/${s.perfil.slug}`;

  return (
    <>
      <TituloPagina titulo={`Hola, ${s.perfil.nombre}`} bajada="Tu pasaporte con toda tu formación verificada." />

      {sp.sumado && (
        <Aviso tono="exito" className="mb-6">
          Listo: sumamos el certificado a tu pasaporte.
        </Aviso>
      )}

      <section aria-labelledby="estado-perfil" className="rounded-tarjeta border border-borde-suave bg-papel p-5 shadow-tarjeta sm:p-6">
        <div className="flex items-start gap-3">
          <span className={`flex size-11 shrink-0 items-center justify-center rounded-full ${s.perfil.publico ? 'bg-crema text-tierra' : 'bg-crema-claro text-tinta-suave'}`}>
            <Icono nombre={s.perfil.publico ? 'mundo' : 'candado'} className="size-6" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="estado-perfil" className="text-[1.1875rem] font-bold">
              {s.perfil.publico ? 'Tu perfil es público' : 'Tu perfil es privado'}
            </h2>
            <p className="mt-0.5 text-tinta-suave">
              {s.perfil.publico
                ? 'Cualquiera con tu link ve tu formación verificada.'
                : 'Sólo vos lo ves. Publicalo cuando quieras para compartir tu formación.'}
            </p>
          </div>
        </div>
        {s.perfil.publico ? (
          <div className="mt-5 space-y-3">
            <CopiarLink texto={`${link}?c=link`} etiqueta="Link de tu perfil" />
            <div className="flex flex-col gap-2 sm:flex-row">
              <BotonLink href="/panel/compartir" icono="compartir" className="sm:flex-1">
                Compartir
              </BotonLink>
              <BotonLink href={`/p/${s.perfil.slug}`} variante="secundario" icono="ojo" className="sm:flex-1" prefetch={false}>
                Ver mi perfil
              </BotonLink>
            </div>
          </div>
        ) : (
          <BotonLink href="/bienvenida/listo" icono="ojo" className="mt-5 w-full sm:w-auto">
            Ver cómo queda y publicarlo
          </BotonLink>
        )}
      </section>

      <section aria-labelledby="mis-certificados" className="mt-10">
        <h2 id="mis-certificados" className="text-[1.5rem] font-bold tracking-tight">
          Mis certificados
        </h2>
        <p className="mt-1 text-tinta-suave">
          {validos.length > 0
            ? `${cantidad(validos.length, 'certificado verificado', 'certificados verificados')}. Elegí cuáles mostrar en tu perfil: ocultar uno no lo invalida.`
            : 'Todavía no tenés certificados válidos.'}
        </p>

        {validos.length === 0 ? (
          <EstadoVacio titulo="Tu pasaporte está vacío" className="mt-6" nivel="h3">
            Cuando una institución te emita un certificado a tu mail, aparece acá.
          </EstadoVacio>
        ) : (
          <ul className="mt-6 space-y-3">
            {validos.map((c) => (
              <FilaCertificado key={c.id} c={c} />
            ))}
          </ul>
        )}

        {anulados.length > 0 && (
          <div className="mt-8">
            <h3 className="font-bold">Anulados</h3>
            <ul className="mt-3 space-y-2">
              {anulados.map((c) => (
                <li key={c.id} className="rounded-2xl border border-borde-suave bg-papel/60 p-4 text-[0.9375rem]">
                  <p className="font-semibold">{c.curso}</p>
                  <p className="text-tinta-suave">
                    {c.institucion} lo anuló{c.anuladoEn ? ` el ${fechaLarga(c.anuladoEn)}` : ''}. Ya no es válido y no se muestra en tu
                    perfil.
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-8 flex gap-3 rounded-2xl border border-borde-suave bg-crema-claro p-4 text-[0.9375rem]">
          <Icono nombre="info" className="mt-0.5 size-5 shrink-0 text-tierra" />
          <p>
            ¿Tenés certificados emitidos a otro mail? Abrí el link de ese mail con esta sesión iniciada y se suman acá.
          </p>
        </div>
      </section>
    </>
  );
}

function FilaCertificado({ c }: { c: CertificadoPropio }) {
  return (
    <li className="rounded-tarjeta border border-borde-suave bg-papel p-4 shadow-tarjeta sm:p-5">
      <div className="flex gap-4">
        <LogoInstitucion logoId={c.institucionLogoId} nombre={c.institucion} />
        <div className="min-w-0 flex-1">
          <p className="text-[1.0625rem] font-bold leading-snug">{c.curso}</p>
          <p className="mt-0.5 text-[0.9375rem] text-tinta-suave">{c.institucion}</p>
          <p className="text-[0.9375rem] text-tinta-suave">
            {TIPOS_CURSO[c.tipo].nombre} de {horas(c.cargaHoraria)} · {fechaLarga(c.fecha)}
          </p>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <SelloVerificado />
            {!c.visibleEnPerfil && <Etiqueta icono="ojo-tachado">Oculto en tu perfil</Etiqueta>}
            <Link
              href={`/v/${c.codigo}`}
              prefetch={false}
              className="inline-flex min-h-11 items-center px-1 text-[0.9375rem] font-semibold underline underline-offset-4"
            >
              Código {formatearCodigo(c.codigo)}
            </Link>
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-3 border-t border-borde-suave pt-4 sm:flex-row sm:items-center sm:justify-between">
        <InterruptorVisibilidad certificadoId={c.id} visible={c.visibleEnPerfil} curso={c.curso} accion={alternarVisibilidad} />
        {/* Un link común (no de Next): es una descarga. */}
        <a href={`/panel/certificados/${c.id}/pdf`} className={clasesBoton({ variante: 'secundario', tamano: 'md' })}>
          <Icono nombre="descargar" />
          Descargar PDF
        </a>
      </div>
    </li>
  );
}
