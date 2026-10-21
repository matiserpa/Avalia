// Botones y links con forma de botón. Mínimo 48 px de alto: se tocan con el pulgar.

import Link from 'next/link';
import { Icono, type NombreIcono } from './Icono';

type Variante = 'primario' | 'secundario' | 'fantasma' | 'peligro' | 'verde';
type Tamano = 'md' | 'lg' | 'sm';

// py-2 y text-center: si el texto ocupa dos renglones, queda centrado y con aire.
const BASE =
  'inline-flex items-center justify-center gap-2 rounded-full py-2 text-center leading-snug font-semibold transition-colors select-none disabled:opacity-55 disabled:cursor-not-allowed aria-disabled:opacity-55 aria-disabled:pointer-events-none';
const VARIANTES: Record<Variante, string> = {
  primario: 'bg-tinta text-marfil hover:bg-[#2a2f2c] active:bg-black',
  secundario: 'bg-papel text-tinta border border-borde hover:bg-crema-claro',
  fantasma: 'text-tinta hover:bg-crema-claro underline-offset-4',
  peligro: 'bg-error text-white hover:bg-[#8a2c22]',
  verde: 'bg-verde text-white hover:bg-verde-oscuro',
};
const TAMANOS: Record<Tamano, string> = {
  sm: 'min-h-12 px-4 text-[0.9375rem]',
  md: 'min-h-12 px-5 text-base',
  lg: 'min-h-14 px-7 text-[1.0625rem]',
};

export function clasesBoton({
  variante = 'primario',
  tamano = 'md',
  anchoCompleto = false,
  className = '',
}: {
  variante?: Variante;
  tamano?: Tamano;
  anchoCompleto?: boolean;
  className?: string;
}) {
  return `${BASE} ${VARIANTES[variante]} ${TAMANOS[tamano]} ${anchoCompleto ? 'w-full' : ''} ${className}`;
}

type Comunes = {
  variante?: Variante;
  tamano?: Tamano;
  anchoCompleto?: boolean;
  icono?: NombreIcono;
  iconoDerecha?: NombreIcono;
  className?: string;
  children: React.ReactNode;
};

export function Boton({
  variante,
  tamano,
  anchoCompleto,
  icono,
  iconoDerecha,
  className,
  children,
  ...resto
}: Comunes & React.ComponentProps<'button'>) {
  return (
    <button className={clasesBoton({ variante, tamano, anchoCompleto, className })} {...resto}>
      {icono && <Icono nombre={icono} />}
      {children}
      {iconoDerecha && <Icono nombre={iconoDerecha} />}
    </button>
  );
}

export function BotonLink({
  href,
  variante,
  tamano,
  anchoCompleto,
  icono,
  iconoDerecha,
  className,
  children,
  externo = false,
  prefetch,
  ...resto
}: Comunes & { href: string; externo?: boolean; prefetch?: boolean } & Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  'href'
>) {
  const clases = clasesBoton({ variante, tamano, anchoCompleto, className });
  const contenido = (
    <>
      {icono && <Icono nombre={icono} />}
      {children}
      {iconoDerecha && <Icono nombre={iconoDerecha} />}
    </>
  );
  if (externo) {
    return (
      <a href={href} className={clases} target="_blank" rel="noopener noreferrer" {...resto}>
        {contenido}
      </a>
    );
  }
  // Mails y teléfonos: un link común, que abre la aplicación de correo.
  if (/^(mailto|tel):/.test(href)) {
    return (
      <a href={href} className={clases} {...resto}>
        {contenido}
      </a>
    );
  }
  return (
    <Link href={href} className={clases} prefetch={prefetch} {...resto}>
      {contenido}
    </Link>
  );
}
