import type { Metadata } from 'next';
import Form from 'next/form';
import { TituloPagina } from '@/components/layout/MarcoPanel';
import { BarrasPorCategoria, ColumnasPorSemana, Medidor, NumeroClave, numero } from '@/components/graficos/Graficos';
import { Boton } from '@/components/ui/Boton';
import { Selector } from '@/components/ui/Campo';
import { listarInstituciones } from '@/features/admin/instituciones';
import { calcularMetricas, NOMBRE_CANAL } from '@/features/admin/metricas';
import type { Canal } from '@/db/schema';
import { requerirAdmin } from '@/lib/auth/guardas';
import { cantidad } from '@/lib/texto';

export const metadata: Metadata = { title: 'Métricas del piloto' };

// "frase" va dentro de una oración: "En las últimas 8 semanas."
const PERIODOS = [
  { valor: '4', texto: 'Últimas 4 semanas', frase: 'las últimas 4 semanas' },
  { valor: '8', texto: 'Últimas 8 semanas', frase: 'las últimas 8 semanas' },
  { valor: '0', texto: 'Todo el piloto', frase: 'todo el piloto' },
];

export default async function Metricas({ searchParams }: PageProps<'/admin/metricas'>) {
  await requerirAdmin();
  const sp = await searchParams;
  const instituciones = await listarInstituciones();
  const institucionId = typeof sp.institucion === 'string' && instituciones.some((i) => i.id === sp.institucion) ? sp.institucion : null;
  const semanas = typeof sp.periodo === 'string' && ['4', '8', '0'].includes(sp.periodo) ? Number(sp.periodo) : 8;
  const m = await calcularMetricas({ institucionId, semanas });
  const elegido = PERIODOS.find((p) => p.valor === String(semanas))!;
  const periodo = elegido.frase;
  const porCanal = (lista: { clave: string; valor: number }[]) => lista.map((c) => ({ etiqueta: NOMBRE_CANAL[c.clave as Canal] ?? c.clave, valor: c.valor }));

  return (
    <>
      <TituloPagina
        titulo="Métricas del piloto"
        bajada="¿Las profesionales activan su pasaporte y comparten su perfil? ¿Los pacientes verifican? Sin datos de quién visita: sólo cuántos y por qué canal."
      />

      {/* Filtros: una fila arriba de todo lo que afectan. */}
      <Form action="/admin/metricas" className="mb-8 flex flex-col gap-3 rounded-tarjeta border border-borde-suave bg-papel p-4 sm:flex-row sm:items-end">
        <Selector
          etiqueta="Período"
          name="periodo"
          defaultValue={String(semanas)}
          opciones={PERIODOS}
          className="sm:w-56"
        />
        <Selector
          etiqueta="Institución"
          name="institucion"
          defaultValue={institucionId ?? ''}
          opciones={[{ valor: '', texto: 'Todas' }, ...instituciones.map((i) => ({ valor: i.id, texto: i.nombre }))]}
          className="sm:w-72"
        />
        <Boton type="submit" variante="secundario">
          Ver
        </Boton>
      </Form>

      <section aria-labelledby="pregunta-1">
        <h2 id="pregunta-1" className="text-[1.25rem] font-bold">
          ¿Activan y comparten?
        </h2>
        <p className="mb-4 text-[0.9375rem] text-tinta-suave">Total del piloto{institucionId ? ', de las egresadas de esta institución' : ''}.</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <NumeroClave etiqueta="Certificados emitidos" valor={numero(m.certificados)} detalle={`A ${cantidad(m.personas, 'persona', 'personas')}`} />
          <Medidor
            etiqueta="Activaron su pasaporte"
            parte={m.activadas}
            total={m.personas}
            detalle={`${numero(m.activadas)} de ${cantidad(m.personas, 'persona con certificado', 'personas con certificado')}`}
          />
          <NumeroClave etiqueta="Perfiles públicos" valor={numero(m.publicas)} detalle={`De ${cantidad(m.activadas, 'pasaporte activo', 'pasaportes activos')}`} />
          <NumeroClave etiqueta="Compartieron su perfil" valor={numero(m.compartieron)} detalle={`Perfiles distintos, en ${periodo}`} />
        </div>
      </section>

      <section aria-labelledby="pregunta-2" className="mt-10">
        <h2 id="pregunta-2" className="text-[1.25rem] font-bold">
          ¿Los pacientes miran y verifican?
        </h2>
        <p className="mb-4 text-[0.9375rem] text-tinta-suave">En {periodo}. No cuentan las visitas de las propias profesionales, de las instituciones ni de la administración.</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <NumeroClave etiqueta="Visitas a perfiles" valor={numero(m.visitas)} />
          <NumeroClave
            etiqueta="Verificaciones de certificados"
            valor={numero(m.verificaciones)}
            detalle={m.fallidas !== null ? `Y ${cantidad(m.fallidas, 'código que no existía', 'códigos que no existían')}` : undefined}
          />
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
          <ColumnasPorSemana id="visitas-semana" titulo="Visitas a perfiles por semana" unidad={['visita', 'visitas']} datos={m.visitasPorSemana} />
          <ColumnasPorSemana id="verificaciones-semana" titulo="Verificaciones por semana" unidad={['verificación', 'verificaciones']} datos={m.verificacionesPorSemana} />
        </div>
      </section>

      <section aria-labelledby="canales" className="mt-10">
        <h2 id="canales" className="text-[1.25rem] font-bold">
          Por dónde llegan
        </h2>
        <p className="mb-4 text-[0.9375rem] text-tinta-suave">En {periodo}.</p>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <BarrasPorCategoria id="canal-visitas" titulo="Visitas a perfiles" datos={porCanal(m.visitasPorCanal)} vacio="Todavía no hay visitas en este período." />
          <BarrasPorCategoria
            id="canal-verificaciones"
            titulo="Verificaciones"
            datos={porCanal(m.verificacionesPorCanal)}
            vacio="Todavía no hay verificaciones en este período."
          />
          <BarrasPorCategoria id="canal-compartir" titulo="Cómo comparten" datos={porCanal(m.compartirPorCanal)} vacio="Todavía nadie compartió en este período." />
        </div>
      </section>

      <section aria-labelledby="por-institucion" className="mt-10">
        <h2 id="por-institucion" className="text-[1.25rem] font-bold">
          Por institución
        </h2>
        <div className="mt-4 overflow-x-auto rounded-tarjeta border border-borde-suave bg-papel shadow-tarjeta">
          <table className="w-full min-w-[40rem] text-left text-[0.9375rem]">
            <thead className="border-b border-borde-suave bg-crema-claro">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Institución</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Certificados</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Personas</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Activaron</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Verificaciones ({elegido.texto.toLowerCase()})</th>
              </tr>
            </thead>
            <tbody className="numeros-tabulares divide-y divide-borde-suave">
              {m.porInstitucion.map((i) => (
                <tr key={i.id}>
                  <th scope="row" className="px-4 py-3 font-semibold">{i.nombre}</th>
                  <td className="px-4 py-3 text-right">{numero(i.certificados)}</td>
                  <td className="px-4 py-3 text-right">{numero(i.personas)}</td>
                  <td className="px-4 py-3 text-right">
                    {numero(i.activadas)}
                    <span className="text-tinta-suave"> ({i.personas ? Math.round((i.activadas / i.personas) * 100) : 0} %)</span>
                  </td>
                  <td className="px-4 py-3 text-right">{numero(i.verificaciones)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[0.9375rem] text-tinta-suave">
          La tercera pregunta del piloto (¿a las instituciones les sirve y lo recomendarían?) se responde con una entrevista al cierre.
        </p>
      </section>
    </>
  );
}
