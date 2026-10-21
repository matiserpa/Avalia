// Logo provisorio de AvalYa (el nombre ya está; el diseño del logo todavía no). Se reemplaza este archivo
// (y el nombre en src/config/marca.ts) y cambia en todo el sitio.

import { MARCA } from '@/config/marca';

// Isotipo: una libreta de pasaporte con un sello. Hereda el color del texto que la rodea.
export function Isotipo({ className = 'size-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="none">
      <rect x="5" y="3" width="22" height="26" rx="4" fill="currentColor" />
      <circle cx="16" cy="14" r="5.5" stroke="#F5F3EF" strokeWidth="1.8" />
      <path d="M13.6 14.1l1.7 1.7 3.2-3.4" stroke="#F5F3EF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 23.5h10" stroke="#F5F3EF" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

// Logo completo: isotipo + nombre. `compacto` muestra el nombre corto (encabezados en celular).
export function Logo({ compacto = false, className = '' }: { compacto?: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 text-tierra ${className}`}>
      <Isotipo className="size-8 shrink-0" />
      <span className="text-[1.0625rem] font-bold tracking-tight text-tinta">
        {compacto ? (
          <>
            <span className="sm:hidden">{MARCA.nombreCorto}</span>
            <span className="hidden sm:inline">{MARCA.nombre}</span>
          </>
        ) : (
          MARCA.nombre
        )}
      </span>
    </span>
  );
}
