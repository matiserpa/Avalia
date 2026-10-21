import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PaginaPublica } from '@/components/layout/EncabezadoPublico';
import { EstadoVacio } from '@/components/ui/EstadoVacio';
import { Icono } from '@/components/ui/Icono';
import { listarCorreos, obtenerCorreo } from '@/features/demo/demo';
import { modoDemo } from '@/lib/config';
import { fechaHora } from '@/lib/texto';

export const metadata: Metadata = { title: 'Bandeja de prueba' };

// Los mails que "salieron" en la demo, para mostrarlos en pantalla. Sólo con DEMO_MODE=true.
export default async function Bandeja({ searchParams }: PageProps<'/demo/bandeja'>) {
  if (!modoDemo()) notFound();
  const sp = await searchParams;
  const lista = await listarCorreos();
  const id = typeof sp.id === 'string' ? sp.id : null;
  const abierto = id ? await obtenerCorreo(id) : null;

  return (
    <PaginaPublica ancho="ancho">
      <div className="pt-4 sm:pt-6">
        <Link href="/demo" className="mb-3 inline-flex min-h-10 items-center gap-1.5 font-semibold text-tinta-suave hover:text-tinta">
          <Icono nombre="flecha-izq" />
          Guía de la demo
        </Link>
        <h1 className="text-[2rem] font-bold leading-tight tracking-tight">Bandeja de prueba</h1>
        <p className="mt-1 text-tinta-suave">En la demo los mails no salen: quedan acá. Los links funcionan igual que en el mail.</p>

        {lista.length === 0 ? (
          <EstadoVacio icono="mail" titulo="Todavía no salió ningún mail" className="mt-8">
            Emití los certificados del Congreso Demo 2026 (paso 1 de la guía) y van a aparecer acá.
          </EstadoVacio>
        ) : (
          <div className="mt-6 grid items-start gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
            <nav aria-label="Mails" className={abierto ? 'hidden lg:block' : ''}>
              <ul className="divide-y divide-borde-suave overflow-hidden rounded-tarjeta border border-borde-suave bg-papel">
                {lista.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/demo/bandeja?id=${c.id}`}
                      aria-current={c.id === abierto?.id ? 'true' : undefined}
                      className={`block px-4 py-3 hover:bg-crema-claro ${c.id === abierto?.id ? 'bg-crema' : ''}`}
                    >
                      <span className="block truncate text-[0.9375rem] font-semibold">{c.para}</span>
                      <span className="block truncate">{c.asunto}</span>
                      <span className="block text-[0.8125rem] text-tinta-suave">{fechaHora(c.creadoEn)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {abierto ? (
              <article aria-labelledby="asunto" className="overflow-hidden rounded-tarjeta border border-borde-suave bg-papel shadow-tarjeta">
                <div className="border-b border-borde-suave p-4 sm:p-5">
                  <Link href="/demo/bandeja" className="mb-2 inline-flex min-h-10 items-center gap-1.5 font-semibold text-tinta-suave hover:text-tinta lg:hidden">
                    <Icono nombre="flecha-izq" />
                    Todos los mails
                  </Link>
                  <h2 id="asunto" className="text-[1.25rem] font-bold">
                    {abierto.asunto}
                  </h2>
                  <p className="mt-1 break-all text-[0.9375rem] text-tinta-suave">
                    Para {abierto.para} · {fechaHora(abierto.creadoEn)}
                  </p>
                </div>
                {abierto.html ? (
                  // El mail se muestra aislado del sitio, sin scripts. Sus links abren en esta misma pestaña.
                  <iframe
                    title={`Mail: ${abierto.asunto}`}
                    srcDoc={abierto.html.replace('<head>', '<head><base target="_top">')}
                    sandbox="allow-top-navigation-by-user-activation allow-popups allow-popups-to-escape-sandbox"
                    className="h-[44rem] w-full bg-marfil"
                  />
                ) : (
                  <p className="p-5 text-tinta-suave">Este mail salió de verdad: en ese modo no guardamos el contenido.</p>
                )}
              </article>
            ) : (
              <div className="hidden rounded-tarjeta border border-dashed border-borde p-10 text-center text-tinta-suave lg:block">
                Elegí un mail de la lista para verlo.
              </div>
            )}
          </div>
        )}
      </div>
    </PaginaPublica>
  );
}
