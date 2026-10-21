'use client';

import { useActionState } from 'react';
import { BotonEnviar } from '@/components/ui/BotonEnviar';
import { Casilla } from '@/components/ui/Campo';
import { borrarMiCuenta, type EstadoBorrar } from './acciones';

export function BorrarCuenta() {
  const [estado, enviar] = useActionState<EstadoBorrar, FormData>(borrarMiCuenta, {});
  return (
    <form action={enviar} className="space-y-4" noValidate>
      <Casilla name="confirmo" value="si" error={estado.error}>
        Entiendo que borrar mi cuenta no se puede deshacer.
      </Casilla>
      <BotonEnviar variante="peligro" icono="basura" textoEnviando="Borrando…">
        Borrar mi cuenta
      </BotonEnviar>
    </form>
  );
}
