'use client';

// Campo para subir un archivo, con un botón y textos propios en castellano: el campo del
// navegador muestra "Choose File" o "No file chosen" según el idioma del navegador.

import { useId, useState } from 'react';
import { prepararCampoImagen } from '@/lib/achicar-imagen';
import { TextoError } from './Campo';
import { Icono, type NombreIcono } from './Icono';

export function ElegirArchivo({
  etiqueta,
  textoBoton,
  name,
  accept,
  ayuda,
  error,
  opcional = false,
  icono = 'subir',
  esImagen = false,
}: {
  etiqueta: string;
  textoBoton: string;
  name: string;
  accept: string;
  ayuda?: React.ReactNode;
  error?: string;
  opcional?: boolean;
  icono?: NombreIcono;
  // Las imágenes se achican en el navegador antes de subirse (ver src/lib/achicar-imagen.ts).
  esImagen?: boolean;
}) {
  const id = `campo-${name}-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const [elegido, setElegido] = useState('');
  const [errorLocal, setErrorLocal] = useState<string | undefined>();
  const errorMostrado = errorLocal ?? error;
  const describe = [ayuda && `${id}-ayuda`, `${id}-elegido`, errorMostrado && `${id}-error`].filter(Boolean).join(' ');
  return (
    <div>
      <p id={`${id}-etiqueta`} className="mb-1.5 font-semibold">
        {etiqueta} {opcional && <span className="font-normal text-tinta-suave">(opcional)</span>}
      </p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <label
          htmlFor={id}
          className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-full border border-borde bg-papel px-5 font-semibold hover:bg-crema-claro has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-tierra"
        >
          <Icono nombre={icono} />
          <span id={`${id}-boton`}>{textoBoton}</span>
          <input
            id={id}
            name={name}
            type="file"
            accept={accept}
            className="sr-only"
            aria-labelledby={`${id}-etiqueta ${id}-boton`}
            aria-describedby={describe}
            aria-invalid={errorMostrado ? true : undefined}
            onChange={async (ev) => {
              const campo = ev.currentTarget;
              if (!esImagen) {
                setElegido(campo.files?.[0]?.name ?? '');
                return;
              }
              const nombre = campo.files?.[0]?.name ?? '';
              setElegido('…');
              const r = await prepararCampoImagen(campo);
              setErrorLocal(r.error);
              setElegido(r.archivo ? nombre : '');
            }}
          />
        </label>
        <span id={`${id}-elegido`} className="min-w-0 break-all text-[0.9375rem] text-tinta-suave">
          {elegido === '…' ? 'Preparando la imagen…' : elegido ? `Elegiste ${elegido}` : 'Todavía no elegiste ningún archivo.'}
        </span>
      </div>
      {ayuda && (
        <p id={`${id}-ayuda`} className="mt-1.5 text-[0.9375rem] text-tinta-suave">
          {ayuda}
        </p>
      )}
      {errorMostrado && <TextoError id={`${id}-error`}>{errorMostrado}</TextoError>}
    </div>
  );
}
