'use client';

// Campo de solo lectura con botón Copiar. Anuncia "Copiado" al lector de pantalla.

import { useId, useState } from 'react';
import { Icono } from './Icono';

export function CopiarTexto({
  texto,
  etiqueta,
  legible,
  alCopiar,
  className = '',
}: {
  texto: string;
  etiqueta: string;
  // El link escrito para leer (sin https:// ni parámetros): en el celular el campo sólo muestra el
  // principio, y lo que identifica el perfil está al final.
  legible?: string;
  alCopiar?: () => void;
  className?: string;
}) {
  const [copiado, setCopiado] = useState(false);
  const id = useId();
  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
    } catch {
      // Navegadores viejos o sin permiso: seleccionar el texto para que lo copien a mano.
      const el = document.getElementById(id) as HTMLInputElement | null;
      el?.select();
      return;
    }
    setCopiado(true);
    alCopiar?.();
    setTimeout(() => setCopiado(false), 2500);
  }
  return (
    <div className={className}>
      <label htmlFor={id} className="sr-only">
        {etiqueta}
      </label>
      {/* El foco del campo se dibuja en el recuadro entero. */}
      <div className="flex items-stretch gap-2 rounded-2xl border border-borde bg-papel p-1 pl-4 has-[input:focus-visible]:outline has-[input:focus-visible]:outline-3 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-tierra">
        <input
          id={id}
          readOnly
          value={texto}
          onFocus={(e) => e.currentTarget.select()}
          className="min-w-0 flex-1 bg-transparent text-[1rem] font-medium text-tinta outline-none"
        />
        <button
          type="button"
          onClick={copiar}
          className="inline-flex min-h-12 shrink-0 items-center gap-1.5 rounded-xl bg-tinta px-4 font-semibold text-marfil hover:bg-[#2a2f2c]"
        >
          <Icono nombre={copiado ? 'check' : 'copiar'} />
          {copiado ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      {legible && (
        <p className="mt-1.5 break-all text-[0.9375rem] text-tinta-suave" aria-hidden="true">
          {legible}
        </p>
      )}
      <p aria-live="polite" className="sr-only">
        {copiado ? 'Link copiado' : ''}
      </p>
    </div>
  );
}
