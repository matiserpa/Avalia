import type { Metadata } from 'next';
import { TituloPagina } from '@/components/layout/MarcoPanel';
import { Boton } from '@/components/ui/Boton';
import { EstadoVacio } from '@/components/ui/EstadoVacio';
import { Icono } from '@/components/ui/Icono';
import { Etiqueta } from '@/components/ui/Sello';
import { listarConsultas, NOMBRES_TIPO } from '@/features/comercial/consultas';
import { requerirAdmin } from '@/lib/auth/guardas';
import { modoDemo } from '@/lib/config';
import { cantidad, fechaHora } from '@/lib/texto';
import { borrar, cambiarEstado } from './acciones';

export const metadata: Metadata = { title: 'Consultas' };

// Lo que llega desde el formulario de contacto del sitio (/contacto). Las consultas tienen datos
// personales: se borran cuando ya no hacen falta (ver la política de privacidad).
export default async function Consultas() {
  await requerirAdmin();
  const lista = await listarConsultas();
  const nuevas = lista.filter((c) => !c.respondidaEn).length;
  return (
    <>
      <TituloPagina
        titulo="Consultas"
        bajada={
          lista.length === 0
            ? 'Lo que llega desde el formulario de contacto del sitio.'
            : `Lo que llega desde el formulario de contacto del sitio. ${cantidad(nuevas, 'sin responder', 'sin responder')}.`
        }
      />
      {modoDemo() && (
        <p className="mb-6 max-w-2xl rounded-2xl border border-borde-suave bg-tierra-claro p-4 text-[0.9375rem]">
          En la demo el formulario no guarda nada, porque cualquiera puede entrar a este panel. Estas consultas son de ejemplo.
        </p>
      )}
      {lista.length === 0 ? (
        <EstadoVacio icono="mail" titulo="Todavía no llegó ninguna consulta" nivel="h2">
          Cuando alguien escriba desde el sitio, la vas a ver acá y te llega un aviso a tu mail.
        </EstadoVacio>
      ) : (
        <ul className="max-w-3xl space-y-4">
          {lista.map((c) => (
            <li key={c.id} className="rounded-tarjeta border border-borde-suave bg-papel p-5 shadow-tarjeta sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                <div className="min-w-0">
                  <h2 className="text-[1.1875rem] font-bold">{c.organizacion || c.nombre}</h2>
                  <p className="text-tinta-suave">
                    {NOMBRES_TIPO[c.tipo]}
                    {c.ciudad ? ` · ${c.ciudad}` : ''}
                  </p>
                </div>
                {c.respondidaEn ? (
                  <Etiqueta tono="neutro" icono="check">
                    Respondida
                  </Etiqueta>
                ) : (
                  <Etiqueta tono="tinta">Sin responder</Etiqueta>
                )}
              </div>
              <dl className="mt-4 grid gap-x-6 gap-y-1 text-[0.9375rem] sm:grid-cols-[auto_minmax(0,1fr)]">
                <dt className="text-tinta-suave">Nombre</dt>
                <dd className="font-semibold">{c.nombre}</dd>
                <dt className="text-tinta-suave">Mail</dt>
                <dd className="break-all font-semibold">
                  <a href={`mailto:${c.email}`} className="underline underline-offset-4">
                    {c.email}
                  </a>
                </dd>
                {c.telefono && (
                  <>
                    <dt className="text-tinta-suave">Teléfono</dt>
                    <dd className="font-semibold">{c.telefono}</dd>
                  </>
                )}
                <dt className="text-tinta-suave">Llegó</dt>
                <dd>{fechaHora(c.creadaEn)}</dd>
              </dl>
              {c.mensaje && <p className="mt-4 whitespace-pre-wrap rounded-2xl bg-marfil p-4">{c.mensaje}</p>}
              <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-borde-suave pt-4">
                <form action={cambiarEstado}>
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="respondida" value={c.respondidaEn ? 'no' : 'si'} />
                  <Boton type="submit" variante="secundario" tamano="sm" icono={c.respondidaEn ? 'reiniciar' : 'check'}>
                    {c.respondidaEn ? 'Marcar sin responder' : 'Marcar como respondida'}
                  </Boton>
                </form>
                <details className="group">
                  <summary className="inline-flex min-h-12 cursor-pointer list-none items-center gap-2 rounded-full px-4 font-semibold text-error hover:bg-error-claro [&::-webkit-details-marker]:hidden">
                    <Icono nombre="basura" />
                    Borrar
                  </summary>
                  <form action={borrar} className="mt-2 rounded-2xl border border-borde-suave p-4">
                    <input type="hidden" name="id" value={c.id} />
                    <p className="mb-3 text-[0.9375rem]">Se borra para siempre. ¿La borramos?</p>
                    <Boton type="submit" variante="peligro" tamano="sm" icono="basura">
                      Borrar la consulta
                    </Boton>
                  </form>
                </details>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
