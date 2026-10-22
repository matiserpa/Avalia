'use client';

// Encabezado del sitio comercial (portada, profesionales, contacto). Las páginas a las que se
// llega desde un QR o un link (perfil, verificación) siguen con el encabezado mínimo.
//
// En el celular, las secciones van en un menú que se abre con un botón; se cierra al elegir una,
// con Escape o al cambiar de página.

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { Logo } from '@/components/marca/Logo';
import { Icono } from '@/components/ui/Icono';

export type EnlaceSitio = { href: string; texto: string };

export function EncabezadoSitio({
  enlaces,
  llamado,
  ingresar,
}: {
  enlaces: EnlaceSitio[];
  // El botón principal (por ejemplo, sumar la institución).
  llamado: EnlaceSitio;
  ingresar: EnlaceSitio;
}) {
  const pathname = usePathname();
  // Se guarda en qué página se abrió: al cambiar de página, el menú queda cerrado solo.
  const [abiertoEn, setAbiertoEn] = useState<string | null>(null);
  const abierto = abiertoEn === pathname;
  const setAbierto = (a: boolean) => setAbiertoEn(a ? pathname : null);
  const idMenu = useId();
  const boton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setAbierto(false);
        boton.current?.focus();
      }
    };
    document.addEventListener('keydown', alTeclear);
    return () => document.removeEventListener('keydown', alTeclear);
  });

  const actual = (href: string) => (href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`));

  return (
    <header className="no-imprimir relative z-30">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5">
        <Link href="/" className="rounded-lg">
          <Logo />
          <span className="sr-only">, ir a la portada</span>
        </Link>

        <nav aria-label="Sitio" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {enlaces.map((e) => (
              <li key={e.href}>
                <Link
                  href={e.href}
                  aria-current={actual(e.href) ? 'page' : undefined}
                  className="inline-flex min-h-12 items-center rounded-full px-3.5 font-semibold text-tinta hover:bg-crema-claro aria-[current=page]:bg-crema"
                >
                  {e.texto}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={ingresar.href}
            className="hidden min-h-12 items-center rounded-full px-3.5 font-semibold text-tinta hover:bg-crema-claro sm:inline-flex"
          >
            {ingresar.texto}
          </Link>
          <Link
            href={llamado.href}
            className="hidden min-h-12 items-center rounded-full bg-tinta px-5 font-semibold text-marfil hover:bg-[#2a2f2c] sm:inline-flex"
          >
            {llamado.texto}
          </Link>
          <button
            ref={boton}
            type="button"
            aria-expanded={abierto}
            aria-controls={idMenu}
            onClick={() => setAbierto(!abierto)}
            className="inline-flex min-h-12 items-center gap-2 rounded-full border border-borde px-4 font-semibold text-tinta hover:bg-crema-claro lg:hidden"
          >
            <Icono nombre={abierto ? 'cruz' : 'menu'} />
            {abierto ? 'Cerrar' : 'Menú'}
          </button>
        </div>
      </div>

      <div id={idMenu} hidden={!abierto} className="border-y border-borde-suave bg-papel lg:hidden">
        <nav aria-label="Sitio" className="mx-auto max-w-5xl px-4 py-3 sm:px-6">
          <ul className="grid gap-1">
            {enlaces.map((e) => (
              <li key={e.href}>
                <Link
                  href={e.href}
                  aria-current={actual(e.href) ? 'page' : undefined}
                  onClick={() => setAbierto(false)}
                  className="flex min-h-12 items-center rounded-xl px-3 text-[1.0625rem] font-semibold text-tinta hover:bg-crema-claro aria-[current=page]:bg-crema"
                >
                  {e.texto}
                </Link>
              </li>
            ))}
            <li className="sm:hidden">
              <Link
                href={ingresar.href}
                onClick={() => setAbierto(false)}
                className="flex min-h-12 items-center rounded-xl px-3 text-[1.0625rem] font-semibold text-tinta hover:bg-crema-claro"
              >
                {ingresar.texto}
              </Link>
            </li>
          </ul>
          <Link
            href={llamado.href}
            onClick={() => setAbierto(false)}
            className="mt-3 flex min-h-12 items-center justify-center rounded-full bg-tinta px-5 font-semibold text-marfil hover:bg-[#2a2f2c] sm:hidden"
          >
            {llamado.texto}
          </Link>
        </nav>
      </div>
    </header>
  );
}
