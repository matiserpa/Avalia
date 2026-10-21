import Link from 'next/link';
import { Logo } from '@/components/marca/Logo';
import { Icono } from '@/components/ui/Icono';
import { Pie } from './Pie';

// Encabezado mínimo de las páginas públicas (perfil, verificación, legales): la marca y un
// acceso a verificar. Nada que distraiga a quien llegó desde un QR.
export function EncabezadoPublico({
  mostrarVerificar = true,
  mostrarIngresar = false,
}: {
  mostrarVerificar?: boolean;
  mostrarIngresar?: boolean;
}) {
  return (
    <header className="no-imprimir">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6 sm:py-5">
        <Link href="/" aria-label="Ir a la portada" className="rounded-lg">
          <Logo compacto />
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          {mostrarVerificar && (
            <Link
              href="/verificar"
              className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 font-semibold text-tinta hover:bg-crema-claro"
            >
              <Icono nombre="lupa" />
              <span>Verificar</span>
            </Link>
          )}
          {mostrarIngresar && (
            <Link
              href="/ingresar"
              className="inline-flex min-h-11 items-center rounded-full border border-borde px-4 font-semibold text-tinta hover:bg-crema-claro"
            >
              Ingresar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

// Estructura de una página pública: encabezado, contenido centrado y pie.
export function PaginaPublica({
  children,
  ancho = 'normal',
  mostrarVerificar,
  mostrarIngresar,
}: {
  children: React.ReactNode;
  ancho?: 'angosto' | 'normal' | 'ancho';
  mostrarVerificar?: boolean;
  mostrarIngresar?: boolean;
}) {
  const max = { angosto: 'max-w-xl', normal: 'max-w-3xl', ancho: 'max-w-5xl' }[ancho];
  return (
    <>
      <EncabezadoPublico mostrarVerificar={mostrarVerificar} mostrarIngresar={mostrarIngresar} />
      <main id="contenido" className={`mx-auto w-full ${max} flex-1 px-4 pb-16 pt-2 sm:px-6 sm:pt-6`}>
        {children}
      </main>
      <Pie />
    </>
  );
}

