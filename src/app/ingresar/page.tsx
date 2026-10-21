import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PaginaPublica } from '@/components/layout/EncabezadoPublico';
import { Aviso } from '@/components/ui/Aviso';
import { MARCA } from '@/config/marca';
import { destinoInicial, sesionActual } from '@/lib/auth/sesion';
import { modoDemo } from '@/lib/config';
import { FormularioIngreso } from './FormularioIngreso';

export const metadata: Metadata = { title: 'Ingresar' };

export default async function PaginaIngresar({ searchParams }: PageProps<'/ingresar'>) {
  const sp = await searchParams;
  const s = await sesionActual();
  if (s && sp.motivo !== 'sin-permiso') redirect(destinoInicial(s));
  const email = typeof sp.email === 'string' ? sp.email : '';

  return (
    <PaginaPublica ancho="angosto" mostrarVerificar={false}>
      <div className="mx-auto max-w-md pt-6 sm:pt-10">
        <h1 className="text-[2rem] font-bold leading-tight tracking-tight">Ingresar</h1>
        <p className="mt-2 text-tinta-suave">Sin contraseña: te mandamos un código a tu mail.</p>

        {sp.motivo === 'sin-permiso' && (
          <Aviso tono="atencion" className="mt-6">
            Esa sección no está disponible para tu cuenta. Si creés que es un error, escribinos a{' '}
            <a href={`mailto:${MARCA.emailContacto}`} className="font-semibold underline underline-offset-4">
              {MARCA.emailContacto}
            </a>
            .
          </Aviso>
        )}
        {sp.motivo === 'sesion' && (
          <Aviso tono="info" className="mt-6">
            Tu sesión se cerró. Ingresá de nuevo con tu mail y te mandamos un código.
          </Aviso>
        )}
        {modoDemo() && (
          <Aviso tono="info" titulo="Modo demo" className="mt-6">
            Los mails no salen: los ves en la{' '}
            <Link href="/demo/bandeja" className="font-semibold underline underline-offset-4">
              bandeja de prueba
            </Link>
            .
          </Aviso>
        )}

        <div className="mt-8">
          <FormularioIngreso emailInicial={email} />
        </div>
      </div>
    </PaginaPublica>
  );
}
