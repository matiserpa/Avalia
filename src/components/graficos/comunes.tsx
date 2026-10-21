// Piezas compartidas por los gráficos (sirven en el servidor y en el navegador).

import { MESES } from '@/lib/texto';

const formato = new Intl.NumberFormat('es-AR');
export const numero = (n: number) => formato.format(n);

export function semanaCorta(inicio: string) {
  const [, m, d] = inicio.split('-').map(Number);
  return `${d}/${m}`;
}
export function semanaLarga(inicio: string) {
  const [, m, d] = inicio.split('-').map(Number);
  return `semana del ${d} de ${MESES[m - 1]}`;
}

// Tope del eje redondeado (5, 10, 20, 50…), con dos marcas intermedias limpias.
export function escala(max: number): number[] {
  if (max <= 0) return [0, 1];
  const paso = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000].find((p) => p * 2 >= max) ?? Math.ceil(max / 2);
  return [0, paso, paso * 2];
}

// Cada gráfico tiene su tabla: ningún dato depende sólo del color o del mouse.
export function TablaEquivalente({ encabezados, filas }: { encabezados: string[]; filas: string[][] }) {
  return (
    <details className="mt-4 text-[0.875rem]">
      <summary className="inline-flex min-h-12 cursor-pointer items-center font-semibold text-tinta-suave hover:text-tinta">Ver como tabla</summary>
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
