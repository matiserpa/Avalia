'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { BotonEnviar } from '@/components/ui/BotonEnviar';
import { Casilla } from '@/components/ui/Campo';
import { aceptarNuevaVersion, type EstadoNuevaVersion } from './acciones';

export function FormularioNuevaVersion() {
  const [estado, enviar] = useActionState<EstadoNuevaVersion, FormData>(aceptarNuevaVersion, {});
  return (
    <form action={enviar} className="space-y-5" noValidate>
      <Casilla name="acepto" value="si" error={estado.error}>
        Leí y acepto los{' '}
        <Link href="/terminos" target="_blank" className="font-semibold underline underline-offset-4">
          términos
        </Link>{' '}
        y la{' '}
        <Link href="/privacidad" target="_blank" className="font-semibold underline underline-offset-4">
          política de privacidad
        </Link>{' '}
        actualizados.
      </Casilla>
      <BotonEnviar tamano="lg" anchoCompleto textoEnviando="Guardando…">
        Aceptar y seguir
      </BotonEnviar>
    </form>
  );
}
