import Link from 'next/link';
import { MARCA } from '@/config/marca';

export function Pie({ className = '' }: { className?: string }) {
  return (
    <footer className={`no-imprimir mt-auto border-t border-borde-suave ${className}`}>
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-8 text-[0.9375rem] text-tinta-suave sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          {MARCA.nombre} · un servicio de {MARCA.responsable}
        </p>
        <nav aria-label="Pie de página" className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/verificar" className="underline-offset-4 hover:underline">
            Verificar un certificado
          </Link>
          <Link href="/terminos" className="underline-offset-4 hover:underline">
            Términos
          </Link>
          <Link href="/privacidad" className="underline-offset-4 hover:underline">
            Privacidad
          </Link>
        </nav>
      </div>
    </footer>
  );
}
