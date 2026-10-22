// Muestras del sitio comercial: piezas de la plataforma armadas con sus componentes reales y los
// datos fijos de src/features/comercial/muestras.ts. Son ilustraciones: van en un <figure> con su
// leyenda, sin títulos adentro y sin nada que se pueda tocar (sin links, botones ni campos: una
// prueba de punta a punta lo controla). No llevan `inert`: así el lector de pantalla las lee.

import { TarjetaValido } from '@/components/certificados/Resultado';
import { Isotipo } from '@/components/marca/Logo';
import { Avatar } from '@/components/ui/Avatar';
import { LogoInstitucion } from '@/components/ui/LogoInstitucion';
import { Etiqueta, SelloVerificado } from '@/components/ui/Sello';
import { MARCA } from '@/config/marca';
import {
  INSTITUCIONES_MUESTRA,
  PROFESIONAL_MUESTRA as P,
  VERIFICACION_MUESTRA,
  type CertificadoMuestra,
} from '@/features/comercial/muestras';
import { cantidad, fechaLarga, horas, listaConY, nombreCompleto, TIPOS_CURSO } from '@/lib/texto';

const NOMBRE = nombreCompleto(P);
const VERIFICADOS = cantidad(P.totalCertificados, 'certificado verificado', 'certificados verificados');
const EMISORAS = listaConY(Object.values(INSTITUCIONES_MUESTRA).map((i) => i.nombre));

// El marco de toda muestra: la pieza (inerte) y su leyenda.
export function Muestra({
  leyenda = 'Ejemplo con datos inventados.',
  className = '',
  children,
}: {
  leyenda?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <figure className={className} data-muestra>
      <div className="select-none">
        {children}
      </div>
      <figcaption className="mt-3 text-[0.875rem] text-tinta-suave">{leyenda}</figcaption>
    </figure>
  );
}

function TarjetaCertificado({ c }: { c: CertificadoMuestra }) {
  const inst = INSTITUCIONES_MUESTRA[c.institucion];
  return (
    <div className="rounded-2xl border border-borde-suave bg-papel p-4 shadow-tarjeta">
      <div className="flex items-start gap-3">
        <LogoInstitucion logoId={null} nombre={inst.nombre} src={inst.logo} />
        <div className="min-w-0">
          <p className="font-bold leading-snug">{c.curso}</p>
          <p className="text-[0.9375rem] text-tinta-suave">{inst.nombre}</p>
          <p className="text-[0.875rem] text-tinta-suave">
            {TIPOS_CURSO[c.tipo].nombre} de {horas(c.horas)} · {fechaLarga(c.fecha)}
          </p>
          <SelloVerificado className="mt-2.5" />
        </div>
      </div>
    </div>
  );
}

// M1: un certificado en el perfil, con el logo de la institución señalado.
export function MuestraCertificadoEnPerfil() {
  const c = P.certificados[0];
  return (
    <div className="rounded-tarjeta border border-borde-suave bg-marfil p-4 shadow-elevada sm:p-5">
      <div className="flex items-center gap-3">
        <Avatar fotoUrl={null} nombre={P.nombre} apellido={P.apellido} tamano="md" />
        <div className="min-w-0">
          <p className="text-[1.125rem] font-bold leading-tight">{NOMBRE}</p>
          <p className="text-[0.9375rem] text-tinta-suave">
            {P.profesion} · {P.ciudad}
          </p>
        </div>
      </div>
      <SelloVerificado texto={VERIFICADOS} className="mt-3" />
      <div className="mt-4">
        <TarjetaCertificado c={c} />
      </div>
      <p aria-hidden="true" className="mt-3 flex items-center gap-2 text-[0.9375rem] font-semibold text-tierra-oscuro">
        <svg viewBox="0 0 24 24" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 18V8a2 2 0 0 1 2-2h8" />
          <path d="M12 2l4 4-4 4" />
        </svg>
        Tu logo y tu nombre, en cada certificado
      </p>
    </div>
  );
}

// Su perfil: lo que declara ella va sin sello; su formación, con sello verde.
export function MuestraPerfil() {
  const otros = P.totalCertificados - P.certificados.length;
  return (
    <div className="rounded-tarjeta border border-borde-suave bg-marfil p-4 shadow-elevada sm:p-5">
      <div className="rounded-2xl border border-borde-suave bg-papel px-4 py-5 text-center">
        <Avatar fotoUrl={null} nombre={P.nombre} apellido={P.apellido} tamano="lg" className="mx-auto" />
        <p className="mt-3 text-[1.375rem] font-bold leading-tight tracking-tight">{NOMBRE}</p>
        <p className="mt-0.5 text-tinta-suave">
          {P.profesion} · {P.ciudad}
        </p>
        <p className="mt-2 flex flex-wrap items-center justify-center gap-2 text-[0.9375rem]">
          <span>Matrícula {P.matricula}</span>
          <Etiqueta tono="neutro">declarada</Etiqueta>
        </p>
        <div className="mt-4 border-t border-borde-suave pt-4">
          <SelloVerificado texto={VERIFICADOS} />
          <p className="mt-2 text-[0.875rem] text-tinta-suave">Emitidos por {EMISORAS}.</p>
        </div>
      </div>
      <p className="mt-4 flex items-center gap-3 text-[0.9375rem] font-semibold text-tinta-suave">
        2025
        <span className="h-px flex-1 bg-borde-suave" />
      </p>
      <div className="mt-3 space-y-3">
        {P.certificados.map((c) => (
          <TarjetaCertificado key={c.curso} c={c} />
        ))}
      </div>
      {otros > 0 && <p className="mt-3 text-[0.875rem] text-tinta-suave">Y {cantidad(otros, 'certificado más', 'certificados más')}.</p>}
    </div>
  );
}

// Su link pegado en un chat: la vista previa que arma el perfil. Un chat genérico, sin marcas.
export function MuestraVistaPrevia() {
  return (
    <div className="rounded-tarjeta border border-borde-suave bg-crema-claro p-4 shadow-elevada sm:p-5">
      <div className="ml-auto max-w-[19rem] rounded-2xl rounded-br-md border border-borde-suave bg-papel p-2 shadow-tarjeta">
        <div className="rounded-xl bg-marfil p-4">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="flex size-14 shrink-0 items-center justify-center rounded-full bg-crema text-[1.25rem] font-bold text-tierra-oscuro">
              VR
            </span>
            <div className="min-w-0">
              <p className="text-[1.0625rem] font-bold leading-tight">{NOMBRE}</p>
              <p className="text-[0.875rem] text-tinta-suave">
                {P.profesion} · {P.ciudad}
              </p>
            </div>
          </div>
          <SelloVerificado texto={VERIFICADOS} className="mt-3" />
          <p className="mt-3 flex items-center gap-1.5 border-t border-borde-suave pt-2.5 text-[0.8125rem] font-bold text-tinta">
            <Isotipo className="size-4 text-tierra" />
            {MARCA.nombre}
          </p>
        </div>
        <div className="px-2 pb-1 pt-2.5">
          <p className="font-bold leading-snug">
            {NOMBRE} · {P.profesion}
          </p>
          <p className="mt-0.5 text-[0.875rem] text-tinta-suave">
            {P.totalCertificados} certificados verificados, emitidos por {EMISORAS}.
          </p>
        </div>
      </div>
    </div>
  );
}

// Lo que ve un paciente al verificar: la misma tarjeta que /v/[código].
export function MuestraVerificacion() {
  return <TarjetaValido c={VERIFICACION_MUESTRA} comoTitulo="p" logoSrc={INSTITUCIONES_MUESTRA.instituto.logo} />;
}

// Lo verificado y lo declarado, lado a lado.
export function MuestraVerificadoYDeclarado() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-2xl border border-borde-suave bg-papel p-4 shadow-tarjeta">
        <p className="font-bold leading-snug">{P.certificados[0].curso}</p>
        <p className="text-[0.9375rem] text-tinta-suave">{INSTITUCIONES_MUESTRA.instituto.nombre}</p>
        <SelloVerificado className="mt-2.5" />
      </div>
      <div className="rounded-2xl border border-borde-suave bg-papel p-4 shadow-tarjeta">
        <p className="font-bold leading-snug">Matrícula {P.matricula}</p>
        <p className="text-[0.9375rem] text-tinta-suave">La escribe ella en su perfil</p>
        <Etiqueta tono="neutro" className="mt-2.5">
          declarada
        </Etiqueta>
      </div>
    </div>
  );
}
