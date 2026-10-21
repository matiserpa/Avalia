'use client';

// Botón de envío de formulario que cambia el texto mientras se procesa.
//
// Mientras envía queda aria-disabled (no disabled): un botón deshabilitado pierde el foco y el
// teclado vuelve al principio de la página. Si la respuesta trae errores, lleva el foco al primer
// campo con error (el lector de pantalla lee la etiqueta y el error) o, si no hay, al aviso.

import { useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Boton } from './Boton';
import type { NombreIcono } from './Icono';

// alrededor: después de un envío, el aviso de error puede estar justo afuera del formulario. Al
// montarse sólo se mira adentro, para no llevarse el foco a un aviso ajeno al cargar la página.
function enfocarError(form: HTMLFormElement | null | undefined, alrededor: boolean) {
  if (!form) return;
  const campo = form.querySelector<HTMLElement>('[aria-invalid="true"]');
  if (campo) {
    campo.focus();
    return;
  }
  const aviso = form.querySelector<HTMLElement>('[role="alert"]') ?? (alrededor ? form.parentElement?.querySelector<HTMLElement>('[role="alert"]') : null);
  if (aviso) {
    if (!aviso.hasAttribute('tabindex')) aviso.setAttribute('tabindex', '-1');
    aviso.focus();
  }
}

export function BotonEnviar({
  children,
  textoEnviando = 'Un momento…',
  variante,
  tamano,
  anchoCompleto,
  icono,
  className,
  name,
  value,
  formAction,
}: {
  children: React.ReactNode;
  textoEnviando?: string;
  variante?: 'primario' | 'secundario' | 'fantasma' | 'peligro' | 'verde';
  tamano?: 'sm' | 'md' | 'lg';
  anchoCompleto?: boolean;
  icono?: NombreIcono;
  className?: string;
  name?: string;
  value?: string;
  formAction?: (fd: FormData) => void | Promise<void>;
}) {
  const { pending } = useFormStatus();
  const boton = useRef<HTMLButtonElement>(null);
  const enviaba = useRef(false);

  // Muchos formularios se vuelven a montar después de cada envío (para limpiar los archivos
  // elegidos): al montarse con errores, también se lleva el foco.
  useEffect(() => {
    enfocarError(boton.current?.form, false);
  }, []);

  useEffect(() => {
    if (enviaba.current && !pending) enfocarError(boton.current?.form, true);
    enviaba.current = pending;
  }, [pending]);

  return (
    <Boton
      ref={boton}
      type="submit"
      variante={variante}
      tamano={tamano}
      anchoCompleto={anchoCompleto}
      icono={pending ? undefined : icono}
      className={className}
      aria-disabled={pending || undefined}
      aria-busy={pending}
      onClick={(e) => {
        if (pending) e.preventDefault();
      }}
      name={name}
      value={value}
      formAction={formAction}
    >
      {pending ? textoEnviando : children}
    </Boton>
  );
}
