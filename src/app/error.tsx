'use client';

// Error inesperado en cualquier página. No muestra detalles técnicos: quedan en el registro del
// servidor, con el identificador que se ve abajo para encontrarlos.

import { useEffect } from 'react';
import { PaginaPublica } from '@/components/layout/EncabezadoPublico';
import { Boton, BotonLink } from '@/components/ui/Boton';
import { EstadoVacio } from '@/components/ui/EstadoVacio';
import { MARCA } from '@/config/marca';

export default function ErrorGeneral({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  const digest = error instanceof Error && 'digest' in error ? String((error as Error & { digest?: string }).digest ?? '') : '';
  return (
    <PaginaPublica ancho="angosto">
      <EstadoVacio
        icono="alerta"
        nivel="h1"
        titulo="Algo salió mal"
        className="mt-6 sm:mt-12"
        accion={
          <div className="flex flex-col gap-3 sm:flex-row">
            <Boton type="button" onClick={() => retry()} icono="reiniciar">
              Probar de nuevo
            </Boton>
            <BotonLink href="/" variante="secundario">
              Ir a la portada
            </BotonLink>
          </div>
        }
      >
        <p>No pudimos mostrar esta página. Probá de nuevo en un momento.</p>
        {digest && (
          <p className="mt-3 text-[0.875rem]">
            Si nos escribís a{' '}
            <a href={`mailto:${MARCA.emailContacto}`} className="font-semibold underline underline-offset-4">
              {MARCA.emailContacto}
            </a>
            , pasanos este código: {digest}
          </p>
        )}
      </EstadoVacio>
    </PaginaPublica>
  );
}
