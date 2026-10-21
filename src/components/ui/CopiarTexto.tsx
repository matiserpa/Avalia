'use client';

// Campo de solo lectura con botón Copiar. Anuncia "Copiado" al lector de pantalla.

import { useState } from 'react';
import { Icono } from './Icono';

export function CopiarTexto({
  texto,
  etiqueta,
  alCopiar,
  className = '',
}: {
  texto: string;
  etiqueta: string;
  alCopiar?: () => void;
  className?: string;
}) {
  const [copiado, setCopiado] = useState(false);
  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
    } catch {
      // Navegadores viejos o sin permiso: seleccionar el texto para que lo copien a mano.
      const el = document.getElementById(`copiar-${etiqueta}`) as HTMLInputElement | null;
      el?.select();
      return;
    }
    setCopiado(true);
    alCopiar?.();
    setTimeout(() => setCopiado(false), 2500);
  }
  return (
    <div className={className}>
      <label htmlFor={`copiar-${etiqueta}`} className="sr-only">
        {etiqueta}
      </label>
      <div className="flex items-stretch gap-2 rounded-2xl border border-borde bg-papel p-1.5 pl-4">
        <input
          id={`copiar-${etiqueta}`}
          readOnly
          value={texto}
          onFocus={(e) => e.currentTarget.select()}
          className="min-w-0 flex-1 bg-transparent text-[1rem] font-medium text-tinta outline-none"
        />
        <button
          type="button"
          onClick={copiar}
          className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl bg-tinta px-4 font-semibold text-marfil hover:bg-[#2a2f2c]"
        >
          <Icono nombre={copiado ? 'check' : 'copiar'} />
          {copiado ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <p aria-live="polite" className="sr-only">
        {copiado ? 'Link copiado' : ''}
      </p>
    </div>
  );
}
