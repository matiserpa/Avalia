import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TituloPagina } from '@/components/layout/MarcoPanel';
import { Aviso } from '@/components/ui/Aviso';
import { BotonLink } from '@/components/ui/Boton';
import { EstadoVacio } from '@/components/ui/EstadoVacio';
import { Etiqueta } from '@/components/ui/Sello';
import { egresadasDelCurso, obtenerCurso, type EgresadaConEstado } from '@/features/institucion/cursos';
import { requerirInstitucion } from '@/lib/auth/guardas';
import { sesionActual } from '@/lib/auth/sesion';
import { formatearCodigo } from '@/lib/certificados/codigo';
import { cantidad, fechaCorta, fechaLarga, horas, TIPOS_CURSO } from '@/lib/texto';
import { AccionesCertificado, AgregarEgresada, CorregirEgresada } from './Acciones';

// El nombre del curso en la pestaña, para distinguir varias abiertas. Sólo para su institución.
export async function generateMetadata({ params }: PageProps<'/institucion/cursos/[id]'>): Promise<Metadata> {
  const [{ id }, s] = await Promise.all([params, sesionActual()]);
  const curso = s?.usuario.institucionId ? await obtenerCurso(s.usuario.institucionId, id) : null;
  return { title: curso?.nombre ?? 'Curso' };
}

export default async function DetalleCurso({ params, searchParams }: PageProps<'/institucion/cursos/[id]'>) {
  const s = await requerirInstitucion();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const curso = await obtenerCurso(s.institucionId, id);
  if (!curso) notFound();
  const lista = await egresadasDelCurso(s.institucionId, id);
  const sinEmitir = lista.filter((e) => e.estado === 'sin_emitir').length;
  const emitidos = lista.length - sinEmitir;
  const activados = lista.filter((e) => e.estado === 'activado').length;
  const conError = lista.filter((e) => e.estado === 'error_mail').length;
  const bajada = [`${TIPOS_CURSO[curso.tipo].nombre} de ${horas(curso.cargaHoraria)}`, fechaLarga(curso.fecha), curso.docente && `A cargo de ${curso.docente}`]
    .filter(Boolean)
    .join(' · ');

  return (
    <>
      <TituloPagina titulo={curso.nombre} bajada={bajada} volver={{ href: '/institucion', texto: 'Cursos' }} />

      <AvisosDeRegreso sp={sp} conError={conError} />

      <section aria-label="Resumen" className="rounded-tarjeta border border-borde-suave bg-papel p-5 shadow-tarjeta sm:p-6">
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Numero termino="Egresadas" valor={lista.length} />
          <Numero termino="Sin certificado" valor={sinEmitir} />
          <Numero termino="Emitidos" valor={emitidos} />
          <Numero termino="Activaron su pasaporte" valor={activados} />
        </dl>
        <div className="mt-5 flex flex-col gap-2 border-t border-borde-suave pt-5 sm:flex-row sm:flex-wrap">
          {sinEmitir > 0 && (
            <BotonLink href={`/institucion/cursos/${id}/emitir`} icono="check-circulo">
              {sinEmitir === 1 ? 'Emitir 1 certificado' : `Emitir ${sinEmitir} certificados`}
            </BotonLink>
          )}
          <BotonLink href={`/institucion/cursos/${id}/cargar`} variante="secundario" icono="planilla">
            Cargar planilla
          </BotonLink>
          <a
            href={`/institucion/cursos/${id}/muestra`}
            target="_blank"
            rel="noopener"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 font-semibold text-tinta hover:bg-crema-claro"
          >
            Ver certificado de muestra
          </a>
        </div>
      </section>

      <section aria-labelledby="egresadas" className="mt-10">
        <h2 id="egresadas" className="text-[1.5rem] font-bold tracking-tight">
          Egresadas
        </h2>
        {lista.length === 0 ? (
          <EstadoVacio
            icono="planilla"
            titulo="Todavía no cargaste egresadas"
            className="mt-4"
            nivel="h3"
            accion={
              <BotonLink href={`/institucion/cursos/${id}/cargar`} icono="planilla">
                Cargar planilla
              </BotonLink>
            }
          >
            Pegá las filas de tu planilla (nombre, apellido y mail) o agregalas de a una acá abajo.
          </EstadoVacio>
        ) : (
          <ul className="mt-4 divide-y divide-borde-suave overflow-hidden rounded-tarjeta border border-borde-suave bg-papel shadow-tarjeta">
            {lista.map((e) => (
              <FilaEgresada key={e.id} e={e} cursoId={id} />
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="agregar" className="mt-10 rounded-tarjeta border border-borde-suave bg-papel p-5 shadow-tarjeta sm:p-6">
        <h2 id="agregar" className="mb-4 text-[1.25rem] font-bold">
          Agregar una egresada
        </h2>
        <AgregarEgresada cursoId={id} />
      </section>
    </>
  );
}

function AvisosDeRegreso({ sp, conError }: { sp: Record<string, string | string[] | undefined>; conError: number }) {
  const n = (k: string) => Number(Array.isArray(sp[k]) ? sp[k]![0] : sp[k] ?? 0);
  return (
    <div className="space-y-3 [&:not(:empty)]:mb-6">
      {sp.nuevo && <Aviso tono="exito">Creamos el curso. Ahora cargá a las egresadas.</Aviso>}
      {sp.anulado && (
        <Aviso tono="exito" titulo="Anulamos el certificado">
          Su verificación ya dice &quot;anulado&quot;. Si hacía falta, corregí los datos de la egresada y emití uno nuevo.
        </Aviso>
      )}
      {sp.cargadas !== undefined && (
        <Aviso tono="exito">{n('cargadas') === 0 ? 'No había egresadas nuevas para cargar.' : `Cargamos ${cantidad(n('cargadas'), 'egresada', 'egresadas')}.`}</Aviso>
      )}
      {sp.emitidos !== undefined && (
        <Aviso tono={n('errores') > 0 ? 'atencion' : 'exito'} titulo={`Emitimos ${cantidad(n('emitidos'), 'certificado', 'certificados')}`}>
          {n('errores') > 0
            ? n('errores') === 1
              ? '1 mail no se pudo mandar: revisá la dirección o creá un link para mandarlo por WhatsApp.'
              : `${n('errores')} mails no se pudieron mandar: revisá esas direcciones o creá un link para mandarlo por WhatsApp.`
            : 'Le mandamos un mail a cada egresada para que active su pasaporte.'}
        </Aviso>
      )}
      {sp.emitidos === undefined && conError > 0 && (
        <Aviso tono="atencion">
          {conError === 1
            ? 'A 1 egresada no le pudimos mandar el mail. Revisá la dirección o creá un link para mandarlo por WhatsApp.'
            : `A ${conError} egresadas no les pudimos mandar el mail. Revisá sus direcciones o creá un link para mandarlo por WhatsApp.`}
        </Aviso>
      )}
    </div>
  );
}

const ESTADOS: Record<EgresadaConEstado['estado'], { texto: string; tono: 'neutro' | 'tierra' | 'error' | 'tinta'; icono: 'reloj' | 'mail' | 'alerta' | 'check' }> = {
  sin_emitir: { texto: 'Sin certificado', tono: 'neutro', icono: 'reloj' },
  emitido: { texto: 'Mail enviado, no activó', tono: 'tierra', icono: 'mail' },
  error_mail: { texto: 'No pudimos mandar el mail', tono: 'error', icono: 'alerta' },
  activado: { texto: 'Activó su pasaporte', tono: 'tinta', icono: 'check' },
};

function FilaEgresada({ e, cursoId }: { e: EgresadaConEstado; cursoId: string }) {
  const est = ESTADOS[e.estado];
  const nombre = `${e.nombre} ${e.apellido}`;
  return (
    <li className="p-4 sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="font-bold">{nombre}</p>
          <p className="break-all text-[0.9375rem] text-tinta-suave">{e.email}</p>
        </div>
        <Etiqueta tono={est.tono} icono={est.icono} className="self-start">
          {est.texto}
        </Etiqueta>
      </div>
      {e.certificado && (
        <p className="mt-2 text-[0.9375rem] text-tinta-suave">
          Emitido el {fechaCorta(e.certificado.emitidoEn)} ·{' '}
          <Link href={`/v/${e.certificado.codigo}`} prefetch={false} className="font-semibold text-tinta underline underline-offset-4">
            Código {formatearCodigo(e.certificado.codigo)}
          </Link>
          {e.certificado.mailEnviadoEn && ` · Último mail: ${fechaCorta(e.certificado.mailEnviadoEn)}`}
        </p>
      )}
      {e.anulados.length > 0 && (
        <ul className="mt-2 space-y-1 text-[0.9375rem] text-tinta-suave">
          {e.anulados.map((a) => (
            <li key={a.id}>
              Anulado{a.anuladoEn ? ` el ${fechaCorta(a.anuladoEn)}` : ''} ({formatearCodigo(a.codigo)}){a.motivo ? `: ${a.motivo}` : ''}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-3">
        {e.certificado ? (
          <AccionesCertificado certificadoId={e.certificado.id} cursoId={cursoId} nombre={nombre} activado={e.estado === 'activado'} />
        ) : (
          <CorregirEgresada egresada={e} cursoId={cursoId} puedeQuitar={e.anulados.length === 0} />
        )}
      </div>
    </li>
  );
}

function Numero({ termino, valor }: { termino: string; valor: number }) {
  return (
    <div>
      <dt className="text-[0.9375rem] text-tinta-suave">{termino}</dt>
      <dd className="numeros-tabulares text-[1.75rem] font-bold leading-tight">{valor}</dd>
    </div>
  );
}
