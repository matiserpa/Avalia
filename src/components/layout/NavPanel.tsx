'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icono, type NombreIcono } from '@/components/ui/Icono';

export type ItemNav = { href: string; texto: string; icono: NombreIcono; exacto?: boolean };

function activo(pathname: string, item: ItemNav) {
  return item.exacto ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

// En pantallas grandes: pestañas en el encabezado.
export function NavSuperior({ items }: { items: ItemNav[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Secciones" className="hidden sm:block">
      <ul className="flex items-center gap-1">
        {items.map((it) => {
          const a = activo(pathname, it);
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                aria-current={a ? 'page' : undefined}
                className={`inline-flex min-h-12 items-center gap-2 rounded-full px-4 font-semibold ${
                  a ? 'bg-tinta text-marfil' : 'text-tinta hover:bg-crema-claro'
                }`}
              >
                <Icono nombre={it.icono} />
                {it.texto}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// En el celular: barra fija abajo, al alcance del pulgar.
export function NavInferior({ items }: { items: ItemNav[] }) {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Secciones"
      data-barra-inferior
      className="no-imprimir fixed inset-x-0 bottom-0 z-40 border-t border-borde-suave bg-papel/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden"
    >
      <ul className="mx-auto flex max-w-md">
        {items.map((it) => {
          const a = activo(pathname, it);
          return (
            <li key={it.href} className="flex-1">
              <Link
                href={it.href}
                aria-current={a ? 'page' : undefined}
                className={`flex min-h-16 flex-col items-center justify-center gap-1 text-[0.8125rem] font-semibold ${
                  a ? 'text-tinta' : 'text-tinta-suave'
                }`}
              >
                <span className={`flex h-8 w-14 items-center justify-center rounded-full ${a ? 'bg-crema' : ''}`}>
                  <Icono nombre={it.icono} className="size-[1.375rem]" />
                </span>
                {it.texto}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
