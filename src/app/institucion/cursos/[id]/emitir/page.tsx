import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { TituloPagina } from '@/components/layout/MarcoPanel';
import { Aviso } from '@/components/ui/Aviso';
import { BotonEnviar } from '@/components/ui/BotonEnviar';
import { Icono } from '@/components/ui/Icono';
import { obtenerCurso } from '@/features/institucion/cursos';
import { firmaDeLista, pendientesDeEmitir } from '@/features/institucion/emision';
import { requerirInstitucion } from '@/lib/auth/guardas';
import { emitir } from '../../../acciones';

export const metadata: Metadata = { title: 'Emitir certificados' };

export default async function Emitir({ params, searchParams }: PageProps<'/institucion/cursos/[id]/emitir'>) {
  const s = await requerirInstitucion();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const curso = await obtenerCurso(s.institucionId, id);
  if (!curso) notFound();
  const pendientes = await pendientesDeEmitir(s.institucionId, id);
  if (pendientes.length === 0) redirect(`/institucion/cursos/${id}`);
  const n = pendientes.length;
  const boton = n === 1 ? 'Emitir 1 certificado' : `Emitir ${n} certificados`;

  return (
    <div className="max-w-2xl">
      <TituloPagina titulo={boton} bajada={curso.nombre} volver={{ href: `/institucion/cursos/${id}`, texto: 'Volver al curso' }} />
      {sp.cambio && (
        <Aviso tono="atencion" titulo="La lista cambió" className="mb-6">
          Mientras la revisabas, alguien agregó o corrigió una egresada. No emitimos nada: revisá los nombres de nuevo.
        </Aviso>
      )}

      <ul className="space-y-3 rounded-tarjeta border border-borde-suave bg-papel p-5 text-tinta-suave shadow-tarjeta sm:p-6">
        <Paso icono="check-circulo">Cada egresada recibe un certificado con su código y su QR, verificable desde ese momento.</Paso>
        <Paso icono="mail">Le mandamos un mail para que active su pasaporte. Si ya tiene uno con ese mail, el certificado se suma solo.</Paso>
        <Paso icono="info">
          Un certificado emitido no se edita. Si después encontrás un error, lo anulás y emitís otro.{' '}
          <a href={`/institucion/cursos/${id}/muestra`} target="_blank" rel="noopener" className="font-semibold text-tinta underline underline-offset-4">
            Ver cómo queda el certificado
          </a>
        </Paso>
      </ul>

      <section aria-labelledby="lista" className="mt-8">
        <h2 id="lista" className="text-[1.25rem] font-bold">
          Revisá los nombres
        </h2>
        <p className="mt-1 text-tinta-suave">Van a figurar así en cada certificado.</p>
        <ol className="mt-4 divide-y divide-borde-suave rounded-tarjeta border border-borde-suave bg-papel">
          {pendientes.map((p, i) => (
            <li key={p.id} className="flex items-baseline gap-3 px-4 py-3 sm:px-5">
              <span className="numeros-tabulares w-6 shrink-0 text-right text-[0.9375rem] text-tinta-suave">{i + 1}</span>
              <span className="min-w-0">
                <span className="font-semibold">
                  {p.nombre} {p.apellido}
                </span>
                <span className="block break-all text-[0.9375rem] text-tinta-suave">{p.email}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <form action={emitir} className="mt-8">
        <input type="hidden" name="cursoId" value={id} />
        <input type="hidden" name="firma" value={firmaDeLista(pendientes)} />
        <BotonEnviar tamano="lg" anchoCompleto icono="check-circulo" textoEnviando="Emitiendo y mandando los mails…">
          {boton}
        </BotonEnviar>
      </form>
    </div>
  );
}

function Paso({ icono, children }: { icono: 'check-circulo' | 'mail' | 'info'; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <Icono nombre={icono} className="mt-0.5 size-5 shrink-0 text-tierra" />
      <span>{children}</span>
    </li>
  );
}
