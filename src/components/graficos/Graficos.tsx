// Gráficos de las métricas del piloto, en HTML y CSS (sin librerías).
//
// Siguen la guía de visualización: un solo color (`dato`; el verde es sólo para lo verificado),
// marcas finas con la punta redondeada, grilla de una línea, etiquetas selectivas en color de
// texto, y el valor de cada marca al pasar el mouse o con el teclado. Cada gráfico tiene su tabla
// equivalente, así ningún dato depende sólo del color o del mouse.

import { MESES } from '@/lib/texto';

const formato = new Intl.NumberFormat('es-AR');
export const numero = (n: number) => formato.format(n);

// ---------- número clave ----------

export function NumeroClave({ etiqueta, valor, detalle }: { etiqueta: string; valor: string; detalle?: string }) {
  return (
    <div className="rounded-tarjeta border border-borde-suave bg-papel p-4 shadow-tarjeta sm:p-5">
      <p className="text-[0.9375rem] text-tinta-suave">{etiqueta}</p>
      <p className="mt-1 text-[2rem] font-bold leading-none tracking-tight">{valor}</p>
      {detalle && <p className="mt-2 text-[0.875rem] text-tinta-suave">{detalle}</p>}
    </div>
  );
}

// Medidor: una proporción contra el total. La pista es un tono claro del mismo color.
export function Medidor({ etiqueta, parte, total, detalle }: { etiqueta: string; parte: number; total: number; detalle: string }) {
  const pct = total > 0 ? Math.round((parte / total) * 100) : 0;
  return (
    <div className="rounded-tarjeta border border-borde-suave bg-papel p-4 shadow-tarjeta sm:p-5">
      <p className="text-[0.9375rem] text-tinta-suave">{etiqueta}</p>
      <p className="mt-1 text-[2rem] font-bold leading-none tracking-tight">{pct} %</p>
      <div
        role="meter"
        aria-label={etiqueta}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={parte}
        aria-valuetext={`${parte} de ${total} (${pct} %)`}
        className="mt-3 h-2 overflow-hidden rounded-full bg-dato/15"
      >
        <div className="h-full rounded-full bg-dato" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-[0.875rem] text-tinta-suave">{detalle}</p>
    </div>
  );
}

// ---------- columnas por semana ----------

function semanaCorta(inicio: string) {
  const [, m, d] = inicio.split('-').map(Number);
  return `${d}/${m}`;
}
function semanaLarga(inicio: string) {
  const [, m, d] = inicio.split('-').map(Number);
  return `semana del ${d} de ${MESES[m - 1]}`;
}

// Tope del eje redondeado (5, 10, 20, 50…), con dos marcas intermedias limpias.
function escala(max: number): number[] {
  if (max <= 0) return [0, 1];
  const paso = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000].find((p) => p * 2 >= max) ?? Math.ceil(max / 2);
  return [0, paso, paso * 2];
}

export function ColumnasPorSemana({
  id,
  titulo,
  unidad,
  datos,
}: {
  id: string;
  titulo: string;
  // "visitas", "verificaciones": para el texto de cada columna.
  unidad: [string, string];
  datos: { inicio: string; valor: number }[];
}) {
  const marcas = escala(Math.max(0, ...datos.map((d) => d.valor)));
  const tope = marcas[marcas.length - 1];
  const ultima = datos[datos.length - 1];
  const texto = (v: number) => `${numero(v)} ${v === 1 ? unidad[0] : unidad[1]}`;
  // Con muchas semanas, en el celular se rotula una de cada dos.
  const saltear = datos.length > 8;
  return (
    <figure aria-labelledby={`${id}-titulo`} className="rounded-tarjeta border border-borde-suave bg-papel p-4 shadow-tarjeta sm:p-5">
      <figcaption id={`${id}-titulo`} className="font-bold">
        {titulo}
      </figcaption>
      {ultima && <p className="text-[0.875rem] text-tinta-suave">Esta semana (en curso): {texto(ultima.valor)}</p>}

      <div className="mt-7 flex gap-2">
        {/* Eje vertical */}
        <div className="numeros-tabulares relative h-40 w-7 shrink-0 text-right text-[0.75rem] text-tinta-suave" aria-hidden="true">
          {marcas.map((m) => (
            <span key={m} className="absolute right-0 -translate-y-1/2" style={{ bottom: `${(m / tope) * 100}%` }}>
              {numero(m)}
            </span>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <div className="relative h-40">
            {marcas.map((m) => (
              <div key={m} aria-hidden="true" className="absolute inset-x-0 h-px bg-borde-suave" style={{ bottom: `${(m / tope) * 100}%` }} />
            ))}
            <ul className="absolute inset-0 flex items-end gap-0.5">
              {datos.map((d) => (
                <li key={d.inicio} className="group relative flex h-full flex-1 items-end justify-center">
                  <span
                    tabIndex={0}
                    role="img"
                    aria-label={`${semanaLarga(d.inicio)}: ${texto(d.valor)}`}
                    className="flex h-full w-full cursor-default items-end justify-center rounded-md outline-offset-0"
                  >
                    <span
                      aria-hidden="true"
                      className="w-full max-w-6 rounded-t-[4px] bg-dato transition-opacity group-hover:opacity-80 group-focus-within:opacity-80"
                      style={{ height: `${(d.valor / tope) * 100}%`, minHeight: d.valor > 0 ? 2 : 0 }}
                    />
                  </span>
                  {/* Valor al pasar el mouse o con el teclado: primero el número, después la semana. */}
                  <span
                    role="tooltip"
                    className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-tinta px-2.5 py-1.5 text-[0.8125rem] text-marfil shadow-elevada group-focus-within:block group-hover:block"
                  >
                    <strong className="block text-[0.9375rem]">{texto(d.valor)}</strong>
                    {semanaLarga(d.inicio)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          {/* Eje horizontal */}
          <ul aria-hidden="true" className="mt-1.5 flex gap-0.5 text-center text-[0.75rem] text-tinta-suave">
            {datos.map((d, i) => (
              <li key={d.inicio} className={`flex-1 ${saltear && i % 2 === 1 ? 'invisible sm:visible' : ''}`}>
                {semanaCorta(d.inicio)}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <TablaEquivalente
        encabezados={['Semana', titulo]}
        filas={datos.map((d) => [semanaLarga(d.inicio), numero(d.valor)])}
      />
    </figure>
  );
}

// ---------- barras por categoría ----------

export function BarrasPorCategoria({
  id,
  titulo,
  datos,
  vacio,
}: {
  id: string;
  titulo: string;
  datos: { etiqueta: string; valor: number }[];
  vacio: string;
}) {
  const max = Math.max(1, ...datos.map((d) => d.valor));
  const total = datos.reduce((a, d) => a + d.valor, 0);
  return (
    <figure aria-labelledby={`${id}-titulo`} className="rounded-tarjeta border border-borde-suave bg-papel p-4 shadow-tarjeta sm:p-5">
      <figcaption id={`${id}-titulo`} className="font-bold">
        {titulo}
      </figcaption>
      {datos.length === 0 ? (
        <p className="mt-3 text-[0.9375rem] text-tinta-suave">{vacio}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {datos.map((d) => {
            const pct = Math.round((d.valor / total) * 100);
            return (
              <li key={d.etiqueta} className="group relative">
                <div
                  tabIndex={0}
                  role="img"
                  aria-label={`${d.etiqueta}: ${numero(d.valor)} (${pct} % del total)`}
                  className="cursor-default rounded-md"
                >
                  <p className="text-[0.875rem]">{d.etiqueta}</p>
                  <div aria-hidden="true" className="mt-1 flex items-center gap-2">
                    <span
                      className="h-4 rounded-r-[4px] bg-dato transition-opacity group-hover:opacity-80 group-focus-within:opacity-80"
                      style={{ width: `${(d.valor / max) * 85}%`, minWidth: 2 }}
                    />
                    <span className="numeros-tabulares text-[0.875rem] font-semibold">{numero(d.valor)}</span>
                  </div>
                </div>
                <span
                  role="tooltip"
                  className="pointer-events-none absolute -top-9 left-0 z-10 hidden whitespace-nowrap rounded-lg bg-tinta px-2.5 py-1.5 text-[0.8125rem] text-marfil shadow-elevada group-focus-within:block group-hover:block"
                >
                  <strong>{pct} %</strong> del total
                </span>
              </li>
            );
          })}
        </ul>
      )}
      {datos.length > 0 && <TablaEquivalente encabezados={['Canal', 'Cantidad']} filas={datos.map((d) => [d.etiqueta, numero(d.valor)])} />}
    </figure>
  );
}

function TablaEquivalente({ encabezados, filas }: { encabezados: string[]; filas: string[][] }) {
  return (
    <details className="mt-4 text-[0.875rem]">
      <summary className="inline-flex min-h-10 cursor-pointer items-center font-semibold text-tinta-suave hover:text-tinta">Ver como tabla</summary>
      <table className="mt-2 w-full text-left">
        <thead>
          <tr className="border-b border-borde-suave">
            {encabezados.map((e, i) => (
              <th key={e} scope="col" className={`py-1.5 font-semibold ${i > 0 ? 'text-right' : ''}`}>
                {e}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((f) => (
            <tr key={f[0]} className="border-b border-borde-suave/60">
              {f.map((c, i) => (
                <td key={i} className={`py-1.5 ${i > 0 ? 'numeros-tabulares text-right' : ''}`}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}
