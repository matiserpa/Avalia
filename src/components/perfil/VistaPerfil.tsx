// El perfil tal como lo ve cualquiera: lo usa la página pública (/p/<slug>) y la vista previa
// de la profesional antes de publicarlo.
//
// Regla de diseño: el sello verde va SÓLO en los certificados (los emitió una institución).
// Profesión, ciudad, matrícula y contacto los declara ella: van sin sello, y la matrícula se
// rotula "declarada".

import Link from 'next/link';
import { BotonLink } from '@/components/ui/Boton';
import { Avatar } from '@/components/ui/Avatar';
import { EstadoVacio } from '@/components/ui/EstadoVacio';
import { Icono } from '@/components/ui/Icono';
import { LogoInstitucion } from '@/components/ui/LogoInstitucion';
import { Etiqueta, SelloVerificado } from '@/components/ui/Sello';
import { institucionesDe, porAnio, type DatosPerfil } from '@/features/publico/perfil';
import { urlImagen } from '@/lib/imagenes-url';
import { cantidad, fechaLarga, horas, linkContacto, listaConY, nombreCompleto, TIPOS_CURSO, usuarioInstagram } from '@/lib/texto';

// `nivel` 2 cuando el perfil va dentro de otra página que ya tiene su título (la vista previa).
export function VistaPerfil({ datos, nivel = 1 }: { datos: DatosPerfil; nivel?: 1 | 2 }) {
  const { perfil, certificados } = datos;
  const H1 = nivel === 1 ? 'h1' : 'h2';
  const H2 = nivel === 1 ? 'h2' : 'h3';
  const H3 = nivel === 1 ? 'h3' : 'h4';
  const nombre = nombreCompleto(perfil);
  const grupos = porAnio(certificados);
  const instituciones = institucionesDe(certificados);

  return (
    <div className="lg:grid lg:grid-cols-[22rem_minmax(0,1fr)] lg:items-start lg:gap-10">
      <aside className="lg:sticky lg:top-24">
        <div className="rounded-tarjeta border border-borde-suave bg-papel px-5 py-7 text-center shadow-tarjeta sm:px-7">
          <Avatar
            fotoUrl={urlImagen(perfil.fotoId)}
            nombre={perfil.nombre}
            apellido={perfil.apellido}
            tamano="xl"
            className="mx-auto"
          />
          <H1 className="mt-5 text-[1.875rem] font-bold leading-tight tracking-tight">{nombre}</H1>
          {(perfil.profesion || perfil.ciudad) && (
            <p className="mt-1.5 text-[1.0625rem] text-tinta-suave">
              {perfil.profesion}
              {perfil.profesion && perfil.ciudad && <span aria-hidden="true"> · </span>}
              {perfil.ciudad && (
                <span className="whitespace-nowrap">
                  {perfil.profesion && <span className="sr-only">, </span>}
                  {perfil.ciudad}
                </span>
              )}
            </p>
          )}
          {perfil.mostrarMatricula && perfil.matricula && (
            <p className="mt-3 flex flex-wrap items-center justify-center gap-2 text-[0.9375rem]">
              <span>Matrícula {perfil.matricula}</span>
              <Etiqueta tono="neutro">declarada</Etiqueta>
            </p>
          )}
          <Contacto tipo={perfil.contactoTipo} valor={perfil.contactoValor} />

          <div className="mt-6 border-t border-borde-suave pt-5">
            {certificados.length > 0 ? (
              <>
                <SelloVerificado texto={cantidad(certificados.length, 'certificado verificado', 'certificados verificados')} />
                <p className="mt-2 text-[0.9375rem] text-tinta-suave">Emitidos por {listaConY(instituciones)}.</p>
              </>
            ) : (
              <p className="text-[0.9375rem] text-tinta-suave">Todavía sin certificados verificados.</p>
            )}
          </div>
        </div>
      </aside>

      <section aria-labelledby="formacion" className="mt-10 lg:mt-0">
        <H2 id="formacion" className="text-[1.5rem] font-bold tracking-tight">
          Formación verificada
        </H2>
        <p className="mt-1 text-tinta-suave">Cada certificado lo emitió la institución. Tocá Verificar para comprobarlo.</p>

        {grupos.length === 0 ? (
          <EstadoVacio icono="libro" titulo="Todavía no hay formación para mostrar" className="mt-6">
            Cuando una institución le emita un certificado, va a aparecer acá.
          </EstadoVacio>
        ) : (
          <div className="mt-6 space-y-8">
            {grupos.map((g) => (
              <section key={g.anio} aria-labelledby={`anio-${g.anio}`}>
                <H3 id={`anio-${g.anio}`} className="mb-3 flex items-center gap-3 text-[0.9375rem] font-bold text-tierra-oscuro">
                  {g.anio}
                  <span aria-hidden="true" className="h-px flex-1 bg-borde-suave" />
                </H3>
                <ul className="space-y-3">
                  {g.certificados.map((c) => (
                    <li key={c.id} className="flex gap-4 rounded-tarjeta border border-borde-suave bg-papel p-4 shadow-tarjeta sm:p-5">
                      <LogoInstitucion logoId={c.institucionLogoId} nombre={c.institucion} />
                      <div className="min-w-0 flex-1">
                        <p className="text-[1.0625rem] font-bold leading-snug">{c.curso}</p>
                        <p className="mt-0.5 text-[0.9375rem] text-tinta-suave">{c.institucion}</p>
                        <p className="text-[0.9375rem] text-tinta-suave">
                          {TIPOS_CURSO[c.tipo].nombre} de {horas(c.cargaHoraria)} · {fechaLarga(c.fecha)}
                        </p>
                        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <SelloVerificado />
                          <Link
                            href={`/v/${c.codigo}?c=perfil`}
                            prefetch={false}
                            className="inline-flex min-h-11 items-center gap-1 rounded-full px-1 font-semibold underline underline-offset-4"
                          >
                            Verificar<span className="sr-only"> el certificado de {c.curso}</span>
                          </Link>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}

        <div className="mt-8 flex gap-3 rounded-2xl border border-borde-suave bg-crema-claro p-4 text-[0.9375rem]">
          <Icono nombre="info" className="mt-0.5 size-5 shrink-0 text-tierra" />
          <p>
            Lo que tiene sello verde lo emitió una institución y se puede verificar con su código. La profesión, la
            ciudad, la matrícula y el contacto los declara {perfil.nombre}. Este perfil no reemplaza la matrícula
            profesional.
          </p>
        </div>
      </section>
    </div>
  );
}

function Contacto({ tipo, valor }: { tipo: 'whatsapp' | 'instagram' | null; valor: string | null }) {
  const href = linkContacto(tipo, valor);
  if (!href || !tipo) return null;
  // Instagram: el usuario a la vista (el ícono ya dice qué red es) y el nombre de la red para el
  // lector de pantalla. Si es largo, se corta con puntos suspensivos en vez de ocupar dos renglones.
  const texto =
    tipo === 'whatsapp' ? (
      'Escribirle por WhatsApp'
    ) : (
      <span className="min-w-0 truncate">
        <span className="sr-only">Instagram: </span>@{usuarioInstagram(valor ?? '')}
      </span>
    );
  return (
    <BotonLink
      href={href}
      externo
      rel="noopener noreferrer nofollow"
      variante="secundario"
      icono={tipo}
      anchoCompleto
      className="mt-5 max-w-full"
    >
      {texto}
    </BotonLink>
  );
}
