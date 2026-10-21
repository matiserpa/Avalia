import type { Metadata } from 'next';
import { TituloPagina } from '@/components/layout/MarcoPanel';
import { EstadoVacio } from '@/components/ui/EstadoVacio';
import { LogoInstitucion } from '@/components/ui/LogoInstitucion';
import { listarInstituciones } from '@/features/admin/instituciones';
import { requerirAdmin } from '@/lib/auth/guardas';
import { cantidad } from '@/lib/texto';
import { AltaInstitucion, InvitarAlEquipo } from './Formularios';

export const metadata: Metadata = { title: 'Instituciones' };

export default async function Instituciones() {
  await requerirAdmin();
  const lista = await listarInstituciones();
  return (
    <>
      <TituloPagina titulo="Instituciones" bajada="Las que emiten certificados en el piloto, y su equipo." />
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <section aria-labelledby="lista">
          <h2 id="lista" className="sr-only">
            Instituciones del piloto
          </h2>
          {lista.length === 0 ? (
            <EstadoVacio icono="edificio" titulo="Todavía no hay instituciones">
              Creá la primera con el formulario.
            </EstadoVacio>
          ) : (
            <ul className="space-y-4">
              {lista.map((i) => (
                <li key={i.id} className="rounded-tarjeta border border-borde-suave bg-papel p-5 shadow-tarjeta sm:p-6">
                  <div className="flex items-start gap-4">
                    <LogoInstitucion logoId={i.logoId} nombre={i.nombre} tamano="lg" />
                    <div className="min-w-0">
                      <h3 className="text-[1.1875rem] font-bold">{i.nombre}</h3>
                      {i.ciudad && <p className="text-tinta-suave">{i.ciudad}</p>}
                      <p className="mt-1 text-[0.9375rem] text-tinta-suave">
                        {cantidad(i.cursos, 'curso', 'cursos')} · {cantidad(i.emitidos, 'certificado emitido', 'certificados emitidos')}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 border-t border-borde-suave pt-4">
                    <p className="text-[0.9375rem] font-semibold">Equipo</p>
                    {i.equipo.length === 0 ? (
                      <p className="text-[0.9375rem] text-tinta-suave">Nadie todavía.</p>
                    ) : (
                      <ul className="mt-1 space-y-0.5 text-[0.9375rem] text-tinta-suave">
                        {i.equipo.map((e) => (
                          <li key={e} className="break-all">
                            {e}
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="mt-4">
                      <InvitarAlEquipo institucionId={i.id} nombre={i.nombre} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section aria-labelledby="alta" className="rounded-tarjeta border border-borde-suave bg-papel p-5 shadow-tarjeta sm:p-6 lg:sticky lg:top-24">
          <h2 id="alta" className="mb-4 text-[1.25rem] font-bold">
            Nueva institución
          </h2>
          <AltaInstitucion />
        </section>
      </div>
    </>
  );
}
