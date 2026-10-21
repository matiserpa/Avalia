import type { Metadata } from 'next';
import Link from 'next/link';
import { TituloPagina } from '@/components/layout/MarcoPanel';
import { BotonLink } from '@/components/ui/Boton';
import { EstadoVacio } from '@/components/ui/EstadoVacio';
import { Icono } from '@/components/ui/Icono';
import { listarCursos, obtenerInstitucion } from '@/features/institucion/cursos';
import { requerirInstitucion } from '@/lib/auth/guardas';
import { cantidad, fechaLarga, horas, TIPOS_CURSO } from '@/lib/texto';

export const metadata: Metadata = { title: 'Cursos' };

export default async function Cursos() {
  const s = await requerirInstitucion();
  const [inst, cursos] = await Promise.all([obtenerInstitucion(s.institucionId), listarCursos(s.institucionId)]);
  const nuevo = (
    <BotonLink href="/institucion/cursos/nuevo" icono="mas">
      Crear un curso
    </BotonLink>
  );
  return (
    <>
      <TituloPagina titulo="Cursos" bajada={inst ? `Los certificados que emite ${inst.nombre}.` : undefined} accion={cursos.length > 0 && nuevo} />
      {cursos.length === 0 ? (
        <EstadoVacio titulo="Todavía no cargaste cursos" accion={nuevo}>
          Creá el curso, cargá la planilla de egresadas y emití los certificados. A cada egresada le mandamos un mail para activar su
          pasaporte.
        </EstadoVacio>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {cursos.map((c) => (
            <li key={c.id}>
              <Link
                href={`/institucion/cursos/${c.id}`}
                className="block h-full rounded-tarjeta border border-borde-suave bg-papel p-5 shadow-tarjeta transition-shadow hover:shadow-elevada sm:p-6"
              >
                <p className="text-[0.9375rem] font-semibold text-tierra-oscuro">
                  {TIPOS_CURSO[c.tipo].nombre} · {fechaLarga(c.fecha)}
                </p>
                <h2 className="mt-1 text-[1.1875rem] font-bold leading-snug">{c.nombre}</h2>
                <p className="mt-0.5 text-[0.9375rem] text-tinta-suave">{horas(c.cargaHoraria)}</p>
                <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-borde-suave pt-4 text-center">
                  <Numero termino="Egresadas" valor={c.egresadas} />
                  <Numero termino="Emitidos" valor={c.emitidos} />
                  <Numero termino="Activaron" valor={c.activados} />
                </dl>
                {c.sinEmitir > 0 && (
                  <p className="mt-4 flex items-center gap-2 rounded-xl bg-tierra-claro px-3 py-2 text-[0.9375rem] font-semibold text-tierra-oscuro">
                    <Icono nombre="info" className="size-4" />
                    {cantidad(c.sinEmitir, 'egresada sin certificado', 'egresadas sin certificado')}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function Numero({ termino, valor }: { termino: string; valor: number }) {
  return (
    <div>
      <dt className="text-[0.875rem] text-tinta-suave">{termino}</dt>
      <dd className="numeros-tabulares text-[1.375rem] font-bold">{valor}</dd>
    </div>
  );
}
