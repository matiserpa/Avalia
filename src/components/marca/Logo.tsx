// Logo provisorio de Sella (el nombre ya está; el diseño del logo todavía no). Se reemplaza este archivo
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

// El isotipo con colores y tamaño fijos, para las imágenes que se generan en el servidor (vista
// previa de links, imagen para historias): ahí no hay CSS ni currentColor.
export function IsotipoPlano({ tamano, color, contraste }: { tamano: number; color: string; contraste: string }) {
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 32 32" fill="none">
      <rect x="5" y="3" width="22" height="26" rx="4" fill={color} />
      <circle cx="16" cy="14" r="5.5" stroke={contraste} strokeWidth="1.8" />
      <path d="M13.6 14.1l1.7 1.7 3.2-3.4" stroke={contraste} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 23.5h10" stroke={contraste} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
