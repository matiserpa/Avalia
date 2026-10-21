// Gráficos de las métricas del piloto, en HTML y CSS (sin librerías).
//
// Siguen la guía de visualización: un solo color (`dato`; el verde es sólo para lo verificado),
// marcas finas con la punta redondeada, grilla de una línea, etiquetas selectivas en color de
// texto, y el valor de cada marca al pasar el mouse o con el teclado. Cada gráfico tiene su tabla
// equivalente, así ningún dato depende sólo del color o del mouse.

import { numero, TablaEquivalente } from './comunes';

export { numero } from './comunes';
export { ColumnasPorSemana } from './ColumnasPorSemana';

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
                    <span className="numeros-tabulares whitespace-nowrap text-[0.875rem]">
                      <strong>{numero(d.valor)}</strong> <span className="text-tinta-suave">· {pct} %</span>
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {datos.length > 0 && <TablaEquivalente encabezados={['Canal', 'Cantidad']} filas={datos.map((d) => [d.etiqueta, numero(d.valor)])} />}
    </figure>
  );
}
