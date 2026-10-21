// Estructura de los textos legales (términos y privacidad). Son un BORRADOR para revisar con un
// abogado: lo que falta definir va marcado con <Completar>.

import { PaginaPublica } from '@/components/layout/EncabezadoPublico';
import { Aviso } from '@/components/ui/Aviso';
import { FECHA_LEGALES, VERSION_LEGALES } from '@/lib/legales';

export function DocumentoLegal({ titulo, bajada, children }: { titulo: string; bajada: string; children: React.ReactNode }) {
  return (
    <PaginaPublica ancho="normal">
      <article className="mx-auto max-w-2xl pt-4 sm:pt-8">
        <h1 className="text-[2rem] font-bold leading-tight tracking-tight sm:text-[2.5rem]">{titulo}</h1>
        <p className="mt-2 text-tinta-suave">{bajada}</p>
        <p className="mt-1 text-[0.9375rem] text-tinta-suave">
          Versión {VERSION_LEGALES} · {FECHA_LEGALES}
        </p>
        <Aviso tono="atencion" titulo="Borrador para revisar con un abogado" className="mt-6">
          Lo marcado como <Completar>COMPLETAR</Completar> todavía no está definido.
        </Aviso>
        <div className="mt-8 space-y-9">{children}</div>
      </article>
    </PaginaPublica>
  );
}

export function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-[1.375rem] font-bold tracking-tight">{titulo}</h2>
      <div className="mt-3 space-y-3 leading-relaxed [&_li]:mt-1.5 [&_ul]:list-disc [&_ul]:pl-6">{children}</div>
    </section>
  );
}

// Lo que falta definir. Se ve marcado para que nadie lo pase por alto.
export function Completar({ children }: { children: React.ReactNode }) {
  return (
    <mark className="rounded bg-tierra-claro px-1.5 py-0.5 font-semibold text-tierra-oscuro">[{children}]</mark>
  );
}
