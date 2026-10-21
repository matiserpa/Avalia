'use client';

// Interruptor "Mostrar en mi perfil" de cada certificado. Es un formulario: funciona aunque no
// cargue JavaScript, y con JavaScript se actualiza sin recargar la página.

import { useOptimistic, useTransition } from 'react';

export function InterruptorVisibilidad({
  certificadoId,
  visible,
  curso,
  accion,
}: {
  certificadoId: string;
  visible: boolean;
  curso: string;
  accion: (fd: FormData) => Promise<void>;
}) {
  const [mostrado, setMostrado] = useOptimistic(visible);
  const [, empezar] = useTransition();
  return (
    <form
      action={(fd) =>
        empezar(async () => {
          setMostrado(!mostrado);
          await accion(fd);
        })
      }
    >
      <input type="hidden" name="certificadoId" value={certificadoId} />
      <input type="hidden" name="visible" value={mostrado ? 'no' : 'si'} />
      <button
        type="submit"
        role="switch"
        aria-checked={mostrado}
        aria-label={`Mostrar en mi perfil: ${curso}`}
        className="inline-flex min-h-12 items-center gap-3 rounded-full pr-2 font-semibold"
      >
        <span
          aria-hidden="true"
          className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border-2 transition-colors ${
            mostrado ? 'border-tinta bg-tinta' : 'border-borde bg-papel'
          }`}
        >
          <span
            className={`inline-block size-5 rounded-full transition-transform ${mostrado ? 'translate-x-[1.375rem] bg-marfil' : 'translate-x-0.5 bg-borde'}`}
          />
        </span>
        Mostrar en mi perfil
      </button>
    </form>
  );
}
