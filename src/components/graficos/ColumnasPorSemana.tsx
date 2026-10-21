'use client';

// Columnas por semana. El valor de cada columna se ve en la línea de arriba al pasar el mouse o
// con el teclado (sin carteles flotantes que tapen otros datos).

import { useState } from 'react';
import { escala, numero, semanaCorta, semanaLarga, TablaEquivalente } from './comunes';

const mayuscula = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

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
  // La columna que se está mirando (mouse o teclado). Su valor se lee en la línea de arriba, que
  // siempre está: así no aparece nada encima del gráfico que tape otros datos.
  const [activa, setActiva] = useState<number | null>(null);
  const mirada = activa !== null ? datos[activa] : null;
  // Con muchas semanas, en el celular se rotula una de cada dos.
  const saltear = datos.length > 8;
  return (
    <figure aria-labelledby={`${id}-titulo`} className="rounded-tarjeta border border-borde-suave bg-papel p-4 shadow-tarjeta sm:p-5">
      <figcaption id={`${id}-titulo`} className="font-bold">
        {titulo}
      </figcaption>
      <p className="min-h-[1.375rem] text-[0.875rem] text-tinta-suave">
        {mirada ? (
          <>
            {mayuscula(semanaLarga(mirada.inicio))}: <strong className="text-tinta">{texto(mirada.valor)}</strong>
          </>
        ) : (
          ultima && <>Esta semana (en curso): {texto(ultima.valor)}</>
        )}
      </p>

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
              {datos.map((d, i) => (
                <li key={d.inicio} className="group relative flex h-full flex-1 items-end justify-center">
                  <span
                    tabIndex={0}
                    role="img"
                    aria-label={`${semanaLarga(d.inicio)}: ${texto(d.valor)}`}
                    onMouseEnter={() => setActiva(i)}
                    onMouseLeave={() => setActiva(null)}
                    onFocus={() => setActiva(i)}
                    onBlur={() => setActiva(null)}
                    className="flex h-full w-full cursor-default items-end justify-center rounded-md outline-offset-0"
                  >
                    <span
                      aria-hidden="true"
                      className="w-full max-w-6 rounded-t-[4px] bg-dato transition-opacity group-hover:opacity-80 group-focus-within:opacity-80"
                      style={{ height: `${(d.valor / tope) * 100}%`, minHeight: d.valor > 0 ? 2 : 0 }}
                    />
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
