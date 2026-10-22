'use client';

// Encabezado del sitio comercial (portada, profesionales y contacto). Las páginas a las que se
// llega desde un QR o un link (perfil, verificación) siguen con el encabezado mínimo.
//
// - Celular: logo, Verificar y Menú. El menú trae las secciones, Ingresar y el botón principal.
// - Tableta: suma el botón principal en la fila; el menú queda sin él.
// - Escritorio ancho: todo en una fila, sin menú.
// El menú empuja el contenido (no es un modal); se cierra al elegir una opción, con Escape (el
// foco vuelve al botón) o al cambiar de página. En /contacto no se muestra el botón principal.

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { Logo } from '@/components/marca/Logo';
import { Icono } from '@/components/ui/Icono';

export type EnlaceSitio = { href: string; texto: string };

// Sin la regla de display: cada uso dice si es inline-flex, flex o hidden según el ancho.
const ENLACE = 'min-h-12 items-center rounded-full font-semibold text-tinta hover:bg-crema-claro';
const PRINCIPAL = 'min-h-12 items-center justify-center rounded-full bg-tinta px-5 font-semibold text-marfil hover:bg-[#2a2f2c]';

export function EncabezadoSitio({
  enlaces,
  enlacesMenu,
  llamado,
  ingresar,
}: {
  // Los de la fila, en escritorio.
  enlaces: EnlaceSitio[];
  // Los del menú, en celular y tableta.
  enlacesMenu: EnlaceSitio[];
  llamado: EnlaceSitio & { textoCorto: string };
  ingresar: EnlaceSitio;
}) {
  const pathname = usePathname();
  // Se guarda en qué página se abrió: al cambiar de página, el menú queda cerrado solo.
  const [abiertoEn, setAbiertoEn] = useState<string | null>(null);
  const abierto = abiertoEn === pathname;
  const setAbierto = (a: boolean) => setAbiertoEn(a ? pathname : null);
  const idMenu = useId();
  const boton = useRef<HTMLButtonElement>(null);
  const conLlamado = pathname !== llamado.href;

  useEffect(() => {
    if (!abierto) return;
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setAbiertoEn(null);
        boton.current?.focus();
      }
    };
    document.addEventListener('keydown', alTeclear);
    return () => document.removeEventListener('keydown', alTeclear);
  }, [abierto]);

  // Sólo las páginas: un link a una sección (/#congresos) no es "la página actual".
  const actual = (href: string) => (href.includes('#') ? undefined : pathname === href ? 'page' : undefined);

  return (
    <header className="no-imprimir relative z-30">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-4 sm:gap-3 sm:px-6 sm:py-5">
        <Link href="/" className="shrink-0 rounded-lg">
          <Logo compacto />
          <span className="sr-only">, ir a la portada</span>
        </Link>

        <nav aria-label="Sitio" className="hidden min-[1152px]:block">
          <ul className="flex items-center gap-0.5">
            {enlaces.map((e) => (
              <li key={e.href}>
                <Link href={e.href} aria-current={actual(e.href)} className={`${ENLACE} inline-flex px-3.5 aria-[current=page]:bg-crema`}>
                  {e.texto}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link href="/verificar" className={`${ENLACE} inline-flex gap-2 px-2.5 min-[360px]:px-3`}>
            <Icono nombre="lupa" />
            Verificar
          </Link>
          <Link href={ingresar.href} className={`${ENLACE} hidden border border-borde px-4 min-[1152px]:inline-flex`}>
            {ingresar.texto}
          </Link>
          {conLlamado && (
            <Link href={llamado.href} className={`${PRINCIPAL} hidden sm:inline-flex`}>
              {llamado.textoCorto}
            </Link>
          )}
          <button
            ref={boton}
            type="button"
            aria-expanded={abierto}
            aria-controls={idMenu}
            onClick={() => setAbierto(!abierto)}
            className={`${ENLACE} inline-flex gap-2 border border-borde px-3.5 min-[1152px]:hidden`}
          >
            <Icono nombre={abierto ? 'cruz' : 'menu'} />
            {abierto ? 'Cerrar' : 'Menú'}
          </button>
        </div>
      </div>

      <div id={idMenu} hidden={!abierto} className="border-y border-borde-suave bg-papel min-[1152px]:hidden">
        <nav aria-label="Menú" className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
          <ul className="grid gap-1">
            {[...enlacesMenu, ingresar].map((e) => (
              <li key={e.href}>
                <Link
                  href={e.href}
                  aria-current={actual(e.href)}
                  onClick={() => setAbierto(false)}
                  className="flex min-h-12 items-center rounded-xl px-3 text-[1.0625rem] font-semibold text-tinta hover:bg-crema-claro aria-[current=page]:bg-crema"
                >
                  {e.texto}
                </Link>
              </li>
            ))}
          </ul>
          {conLlamado && (
            <Link href={llamado.href} onClick={() => setAbierto(false)} className={`${PRINCIPAL} mt-3 flex w-full sm:hidden`}>
              {llamado.texto}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
