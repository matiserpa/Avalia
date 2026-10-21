'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { Aviso } from '@/components/ui/Aviso';
import { BotonEnviar } from '@/components/ui/BotonEnviar';
import { Casilla } from '@/components/ui/Campo';
import { activar, sumar, type EstadoActivacion } from './acciones';

export function FormularioActivar({ token }: { token: string }) {
  const [estado, enviar] = useActionState<EstadoActivacion, FormData>(activar, {});
  return (
    <form action={enviar} className="space-y-5" noValidate>
      <input type="hidden" name="token" value={token} />
      {estado.error && <Aviso tono="error">{estado.error}</Aviso>}
      <Casilla name="acepto" value="si" error={estado.errorAcepto}>
        Leí y acepto los{' '}
        <Link href="/terminos" target="_blank" className="font-semibold underline underline-offset-4">
          términos
        </Link>{' '}
        y la{' '}
        <Link href="/privacidad" target="_blank" className="font-semibold underline underline-offset-4">
          política de privacidad
        </Link>
        .
      </Casilla>
      <BotonEnviar tamano="lg" anchoCompleto textoEnviando="Activando…">
        Activar mi pasaporte
      </BotonEnviar>
    </form>
  );
}

export function FormularioSumar({ token }: { token: string }) {
  const [estado, enviar] = useActionState<EstadoActivacion, FormData>(sumar, {});
  return (
    <form action={enviar} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      {estado.error && <Aviso tono="error">{estado.error}</Aviso>}
      <BotonEnviar tamano="lg" anchoCompleto icono="mas" textoEnviando="Sumando…">
        Sumar a mi pasaporte
      </BotonEnviar>
    </form>
  );
}
