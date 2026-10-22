'use client';

// El mensaje listo para que una profesional le cuente a su institución: lo manda por WhatsApp
// (eligiendo el chat) o lo copia. No se le pide ningún dato.

import { useState } from 'react';
import { Icono } from '@/components/ui/Icono';

export function MensajeInstitucion({ mensaje }: { mensaje: string }) {
  const [copiado, setCopiado] = useState<'si' | 'no' | 'error'>('no');
  async function copiar() {
    try {
      await navigator.clipboard.writeText(mensaje);
      setCopiado('si');
      setTimeout(() => setCopiado('no'), 2500);
    } catch {
      setCopiado('error');
    }
  }
  return (
    <div>
      <blockquote className="whitespace-pre-line rounded-2xl border border-borde-suave bg-papel p-5 text-[1.0625rem] leading-relaxed">
        {mensaje}
      </blockquote>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(mensaje)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-tinta px-5 py-2 text-center font-semibold text-marfil hover:bg-[#2a2f2c]"
        >
          <Icono nombre="whatsapp" />
          Mandar el mensaje por WhatsApp
          <span className="sr-only"> (se abre en otra pestaña)</span>
        </a>
        <button
          type="button"
          onClick={copiar}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-borde bg-papel px-5 py-2 font-semibold text-tinta hover:bg-crema-claro"
        >
          <Icono nombre={copiado === 'si' ? 'check' : 'copiar'} />
          {copiado === 'si' ? 'Copiado' : 'Copiar el mensaje'}
        </button>
      </div>
      <p aria-live="polite" className="mt-2 text-[0.9375rem] text-tinta-suave">
        {copiado === 'si' && <span className="sr-only">Copiamos el mensaje.</span>}
        {copiado === 'error' && 'No pudimos copiarlo. Seleccioná el texto del recuadro y copialo a mano.'}
      </p>
    </div>
  );
}
