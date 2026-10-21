import Link from 'next/link';
import { Logo } from '@/components/marca/Logo';
import { Icono } from '@/components/ui/Icono';
import { salir } from '@/lib/auth/acciones';
import { NavInferior, NavSuperior, type ItemNav } from './NavPanel';
import { Pie } from './Pie';

// Estructura de los paneles (profesional, institución, admin): encabezado con la marca, la
// navegación y Salir; contenido; y en el celular, la navegación abajo.
export function MarcoPanel({
  children,
  items,
  inicio,
  rotulo,
  ancho = 'normal',
}: {
  children: React.ReactNode;
  items: ItemNav[];
  // A dónde lleva el logo.
  inicio: string;
  // Debajo del logo en pantallas grandes: "Instituto Demo", "Administración"...
  rotulo?: string;
  ancho?: 'normal' | 'ancho';
}) {
  const max = ancho === 'ancho' ? 'max-w-6xl' : 'max-w-3xl';
  return (
    <>
      <header className="no-imprimir sticky top-0 z-30 border-b border-borde-suave bg-marfil/95 backdrop-blur">
        <div className={`mx-auto flex ${max} items-center justify-between gap-3 px-4 py-3 sm:px-6`}>
          <Link href={inicio} className="flex min-w-0 items-center gap-3 rounded-lg" aria-label="Ir al inicio del panel">
            <Logo compacto />
            {rotulo && (
              <span className="hidden truncate border-l border-borde-suave pl-3 text-[0.9375rem] font-medium text-tinta-suave md:inline">
                {rotulo}
              </span>
            )}
          </Link>
          <div className="flex items-center gap-2">
            <NavSuperior items={items} />
            <form action={salir}>
              <button
                type="submit"
                className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 font-semibold text-tinta-suave hover:bg-crema-claro hover:text-tinta"
              >
                <Icono nombre="salir" />
                <span>Salir</span>
              </button>
            </form>
          </div>
        </div>
      </header>
      <main id="contenido" className={`mx-auto w-full ${max} flex-1 px-4 pb-28 pt-6 sm:px-6 sm:pb-16 sm:pt-8`}>
        {children}
      </main>
      <div className="hidden sm:block">
        <Pie />
      </div>
      <NavInferior items={items} />
    </>
  );
}

// Título de página de panel con bajada y acción opcional a la derecha.
export function TituloPagina({
  titulo,
  bajada,
  accion,
  volver,
}: {
  titulo: string;
  bajada?: React.ReactNode;
  accion?: React.ReactNode;
  volver?: { href: string; texto: string };
}) {
  return (
    <div className="mb-6 sm:mb-8">
      {volver && (
        <Link
          href={volver.href}
          className="mb-3 inline-flex min-h-10 items-center gap-1.5 rounded-full font-semibold text-tinta-suave hover:text-tinta"
        >
          <Icono nombre="flecha-izq" />
          {volver.texto}
        </Link>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-[1.75rem] font-bold leading-tight tracking-tight sm:text-[2rem]">{titulo}</h1>
          {bajada && <div className="mt-1.5 text-tinta-suave">{bajada}</div>}
        </div>
        {accion && <div className="shrink-0">{accion}</div>}
      </div>
    </div>
  );
}
