import { Icono } from '@/components/ui/Icono';

export type Pregunta = { pregunta: string; respuesta: React.ReactNode };

// Preguntas que se abren y se cierran, con los elementos nativos del navegador.
export function PreguntasFrecuentes({ preguntas }: { preguntas: Pregunta[] }) {
  return (
    <div className="divide-y divide-borde-suave rounded-tarjeta border border-borde-suave bg-papel">
      {preguntas.map((p) => (
        <details key={p.pregunta} className="group">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-[1.0625rem] font-semibold sm:px-6 [&::-webkit-details-marker]:hidden">
            {p.pregunta}
            <Icono nombre="mas" className="size-5 shrink-0 text-tierra transition-transform group-open:rotate-45" />
          </summary>
          <div className="px-5 pb-5 text-tinta-suave sm:px-6">{p.respuesta}</div>
        </details>
      ))}
    </div>
  );
}
