'use client';

// Botón de envío de formulario que se deshabilita y cambia el texto mientras se procesa.

import { useFormStatus } from 'react-dom';
import { Boton } from './Boton';
import type { NombreIcono } from './Icono';

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
  return (
    <Boton
      type="submit"
      variante={variante}
      tamano={tamano}
      anchoCompleto={anchoCompleto}
      icono={pending ? undefined : icono}
      className={className}
      disabled={pending}
      aria-busy={pending}
      name={name}
      value={value}
      formAction={formAction}
    >
      {pending ? textoEnviando : children}
    </Boton>
  );
}
