import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PaginaPublica } from '@/components/layout/EncabezadoPublico';
import { Aviso } from '@/components/ui/Aviso';
import { BotonLink } from '@/components/ui/Boton';
import { BotonEnviar } from '@/components/ui/BotonEnviar';
import { Icono } from '@/components/ui/Icono';
import { Etiqueta } from '@/components/ui/Sello';
import { MARCA } from '@/config/marca';
import { estadoDelRecorrido } from '@/features/demo/demo';
import { formatearCodigo } from '@/lib/certificados/codigo';
import { modoDemo, urlBase } from '@/lib/config';
import { DEMO } from '@/lib/demo/datos';
import { qrSvg } from '@/lib/qr';
import { reiniciar } from './acciones';

export const metadata: Metadata = { title: 'Demo' };

const entrar = (email: string, a?: string) => `/demo/entrar?email=${encodeURIComponent(email)}${a ? `&a=${encodeURIComponent(a)}` : ''}`;

export default async function GuiaDemo({ searchParams }: PageProps<'/demo'>) {
  if (!modoDemo()) notFound();
  const sp = await searchParams;
  const e = await estadoDelRecorrido();
  const urlVerificacion = e.codigoCamila ? `${urlBase()}/v/${e.codigoCamila}?c=qr` : null;
  const svg = urlVerificacion ? await qrSvg(urlVerificacion) : null;
  const local = /localhost|127\.0\.0\.1/.test(urlBase());

  return (
    <PaginaPublica ancho="normal">
      <div className="pt-4 sm:pt-8">
        <p className="inline-flex rounded-full bg-tierra-claro px-3 py-1 text-[0.875rem] font-semibold text-tierra-oscuro">Modo demo</p>
        <h1 className="mt-3 text-[2rem] font-bold leading-tight tracking-tight sm:text-[2.5rem]">El recorrido de {MARCA.nombre} en 2 minutos</h1>
        <p className="mt-2 max-w-2xl text-[1.0625rem] text-tinta-suave">
          Para mostrar en una reunión. Las instituciones y las personas son inventadas, y los mails no salen: se ven en la bandeja de
          prueba.
        </p>
        {sp.reiniciado && (
          <Aviso tono="exito" className="mt-6">
            Listo: los datos volvieron al punto de partida.
          </Aviso>
        )}

        <ol className="mt-8 space-y-4">
          <Paso
            numero={1}
            titulo="La institución emite los certificados"
            hecho={e.emitido}
            accion={
              e.congresoId && (
                <BotonLink href={entrar(DEMO.emailInstituto, `/institucion/cursos/${e.congresoId}`)} icono="edificio">
                  Entrar como Instituto Demo
                </BotonLink>
              )
            }
          >
            Instituto Demo tiene cargado el <strong>Congreso Demo 2026</strong> con 5 egresadas sin certificado. Entrá como la
            institución y tocá <strong>Emitir 5 certificados</strong>.
          </Paso>

          <Paso
            numero={2}
            titulo="Camila activa su pasaporte"
            hecho={e.camilaActivo}
            accion={
              <BotonLink href="/demo/bandeja" icono="mail" variante={e.emitido ? 'primario' : 'secundario'}>
                Abrir la bandeja de mails
              </BotonLink>
            }
          >
            {e.emitido ? (
              <>
                Abrí el mail de <strong>Camila Sosa</strong>, tocá <strong>Activar mi pasaporte</strong>, completá el perfil y
                publicalo. Lleva menos de un minuto.
              </>
            ) : (
              'Primero hacé el paso 1: al emitir, a Camila le llega un mail para activar su pasaporte.'
            )}
          </Paso>

          <Paso numero={3} titulo="Alguien verifica el certificado" hecho={false}>
            {urlVerificacion && svg ? (
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="w-40 shrink-0 rounded-2xl border border-borde-suave bg-white p-3 [&_svg]:h-auto [&_svg]:w-full" role="img" aria-label="Código QR del certificado de Camila">
                  <div aria-hidden="true" dangerouslySetInnerHTML={{ __html: svg }} />
                </div>
                <div className="space-y-3">
                  <p>
                    Es el QR del certificado de Camila (código {formatearCodigo(e.codigoCamila!)}). Escanealo con un celular y aparece{' '}
                    <strong>Certificado válido</strong>.
                  </p>
                  {local && (
                    <p className="text-[0.9375rem] text-tinta-suave">
                      La demo está corriendo en esta compu: un celular no llega a esta dirección. Para escanearlo de verdad, el sitio tiene
                      que estar publicado. Mientras tanto, abrila acá.
                    </p>
                  )}
                  <BotonLink href={`/v/${e.codigoCamila}?c=qr`} variante="secundario" icono="lupa" prefetch={false}>
                    Ver la verificación
                  </BotonLink>
                </div>
              </div>
            ) : (
              'Después del paso 1 aparece acá el QR del certificado de Camila, para escanearlo con el celular.'
            )}
          </Paso>
        </ol>

        <section aria-labelledby="ademas" className="mt-12">
          <h2 id="ademas" className="text-[1.375rem] font-bold">
            Para mostrar además
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            <Extra href={`/p/${DEMO.slugValentina}`} icono="usuario" titulo="Un perfil completo">
              Valentina Ríos, con cuatro certificados de dos instituciones.
            </Extra>
            <Extra href={entrar(DEMO.emailValentina, '/panel/compartir')} icono="compartir" titulo="Cómo comparte una profesional">
              Su link, el QR del consultorio y la imagen para historias.
            </Extra>
            <Extra href={entrar(DEMO.emailAdmin, '/admin/metricas')} icono="grafico" titulo="Las métricas del piloto">
              Activación, visitas y verificaciones por semana y por canal.
            </Extra>
          </ul>
        </section>

        <section aria-labelledby="accesos" className="mt-12">
          <h2 id="accesos" className="text-[1.375rem] font-bold">
            Entrar como…
          </h2>
          <p className="mt-1 text-tinta-suave">Sin código: sólo existe en la demo.</p>
          <ul className="mt-4 divide-y divide-borde-suave rounded-tarjeta border border-borde-suave bg-papel">
            <Acceso href={entrar(DEMO.emailInstituto)} nombre="Instituto Demo" detalle="Institución: cursos, carga de planillas y emisión" />
            <Acceso href={entrar(DEMO.emailAsociacion)} nombre="Asociación Demo de Cosmiatría" detalle="Otra institución" />
            <Acceso href={entrar(DEMO.emailValentina)} nombre="Valentina Ríos" detalle="Profesional con su perfil publicado" />
            <Acceso
              href={`/demo/enlace?codigo=${DEMO.codigoNoActivado}`}
              nombre="Martina López"
              detalle="Profesional que todavía no activó: abre su link de activación"
            />
            <Acceso href={entrar(DEMO.emailAdmin)} nombre="Administración" detalle="Instituciones y métricas del piloto" />
          </ul>
        </section>

        <section aria-labelledby="reiniciar" className="mt-12 rounded-tarjeta border border-borde-suave bg-crema-claro p-5 sm:p-6">
          <h2 id="reiniciar" className="text-[1.25rem] font-bold">
            Volver a empezar
          </h2>
          <p className="mb-4 mt-1 text-tinta-suave">Borra todo lo que se hizo en la demo, carga los datos de prueba de nuevo y cierra las sesiones.</p>
          <form action={reiniciar}>
            <BotonEnviar variante="secundario" icono="reiniciar" textoEnviando="Reiniciando…">
              Reiniciar los datos de la demo
            </BotonEnviar>
          </form>
        </section>
      </div>
    </PaginaPublica>
  );
}

function Paso({
  numero,
  titulo,
  hecho,
  accion,
  children,
}: {
  numero: number;
  titulo: string;
  hecho: boolean;
  accion?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <li className="rounded-tarjeta border border-borde-suave bg-papel p-5 shadow-tarjeta sm:p-6">
      <div className="flex items-start gap-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-tinta text-[1.125rem] font-bold text-marfil" aria-hidden="true">
          {numero}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[1.25rem] font-bold">
              <span className="sr-only">Paso {numero}: </span>
              {titulo}
            </h2>
            {hecho && (
              <Etiqueta tono="tinta" icono="check">
                Hecho
              </Etiqueta>
            )}
          </div>
          <div className="mt-2 text-tinta-suave">{children}</div>
          {accion && <div className="mt-4 [&>a]:w-full sm:[&>a]:w-auto">{accion}</div>}
        </div>
      </div>
    </li>
  );
}

function Extra({ href, icono, titulo, children }: { href: string; icono: 'usuario' | 'compartir' | 'grafico'; titulo: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} prefetch={false} className="flex h-full flex-col rounded-tarjeta border border-borde-suave bg-papel p-4 shadow-tarjeta hover:shadow-elevada">
        <Icono nombre={icono} className="size-6 text-tierra" />
        <span className="mt-2 font-bold">{titulo}</span>
        <span className="mt-1 text-[0.9375rem] text-tinta-suave">{children}</span>
      </Link>
    </li>
  );
}

function Acceso({ href, nombre, detalle }: { href: string; nombre: string; detalle: string }) {
  return (
    <li>
      <a href={href} className="flex min-h-16 items-center justify-between gap-3 px-4 py-3 hover:bg-crema-claro sm:px-5">
        <span className="min-w-0">
          <span className="block font-semibold">{nombre}</span>
          <span className="block text-[0.9375rem] text-tinta-suave">{detalle}</span>
        </span>
        <Icono nombre="flecha" className="size-5 shrink-0 text-tinta-suave" />
      </a>
    </li>
  );
}
