// Piezas de la verificación de un certificado (/v/[código]). Las usa también la muestra del sitio
// comercial, para que se vea igual que la verificación real.

import { Dato } from '@/components/ui/Dato';
import { Icono, type NombreIcono } from '@/components/ui/Icono';
import { LogoInstitucion } from '@/components/ui/LogoInstitucion';
import type { CertificadoVerificado } from '@/features/publico/verificacion';
import { formatearCodigo } from '@/lib/certificados/codigo';
import { fechaLarga, horas, nombreCompleto, TIPOS_CURSO } from '@/lib/texto';

// Encabezado de la tarjeta de resultado: ícono, estado y cuándo se consultó (por si sacan captura).
// En la página es el h1; en una muestra, un párrafo (`comoTitulo="p"`) y sin la fecha de consulta.
// Se acomoda al ancho de la tarjeta, no al de la pantalla: la tarjeta lleva `@container`.
export function EncabezadoResultado({
  tono,
  icono,
  titulo,
  consultado,
  comoTitulo = 'h1',
}: {
  tono: 'verde' | 'error' | 'tierra';
  icono: NombreIcono;
  titulo: string;
  consultado?: string;
  comoTitulo?: 'h1' | 'p';
}) {
  const estilos = {
    verde: { fondo: 'bg-verde-claro text-verde-oscuro', circulo: 'bg-verde text-white' },
    error: { fondo: 'bg-error-claro text-error', circulo: 'bg-error text-white' },
    tierra: { fondo: 'bg-tierra-claro text-tierra-oscuro', circulo: 'bg-tierra text-white' },
  }[tono];
  const Titulo = comoTitulo;
  return (
    <div className={`flex items-center gap-4 px-5 py-6 @md:px-8 @md:py-7 ${estilos.fondo}`}>
      <span className={`flex size-14 shrink-0 items-center justify-center rounded-full ${estilos.circulo}`}>
        <Icono nombre={icono} className="size-8" />
      </span>
      <div className="min-w-0">
        <Titulo id={comoTitulo === 'h1' ? 'resultado' : undefined} className="text-[1.75rem] font-bold leading-tight tracking-tight @md:text-[2rem]">
          {titulo}
        </Titulo>
        {consultado && <p className="mt-0.5 text-[0.9375rem]">Consultado el {consultado}</p>}
      </div>
    </div>
  );
}

export function CursoCertificado({ c, logoSrc }: { c: CertificadoVerificado; logoSrc?: string }) {
  return (
    <div className="flex items-start gap-4">
      <LogoInstitucion logoId={c.institucion.logoId} nombre={c.institucion.nombre} tamano="lg" src={logoSrc} />
      <div className="min-w-0">
        <p className="text-[1.1875rem] font-bold leading-snug">{c.curso.nombre}</p>
        <p className="mt-0.5 text-tinta-suave">
          {TIPOS_CURSO[c.curso.tipo].nombre} de {horas(c.curso.cargaHoraria)}
        </p>
      </div>
    </div>
  );
}

export function InstitucionCertificado({ c }: { c: CertificadoVerificado }) {
  return (
    <>
      {c.institucion.nombre}
      {c.institucion.ciudad && <span className="block font-normal text-tinta-suave">{c.institucion.ciudad}</span>}
    </>
  );
}

// La tarjeta de "Certificado válido".
export function TarjetaValido({
  c,
  consultado,
  comoTitulo = 'h1',
  logoSrc,
}: {
  c: CertificadoVerificado;
  consultado?: string;
  comoTitulo?: 'h1' | 'p';
  logoSrc?: string;
}) {
  const titular = nombreCompleto({ nombre: c.titularNombre, apellido: c.titularApellido });
  const Contenedor = comoTitulo === 'h1' ? 'section' : 'div';
  return (
    <Contenedor
      aria-labelledby={comoTitulo === 'h1' ? 'resultado' : undefined}
      className="@container overflow-hidden rounded-tarjeta border border-verde/25 bg-papel shadow-elevada"
    >
      <EncabezadoResultado tono="verde" icono="check" titulo="Certificado válido" consultado={consultado} comoTitulo={comoTitulo} />
      <div className="space-y-6 px-5 py-6 @md:px-8 @md:py-8">
        <div>
          <p className="text-[0.9375rem] text-tinta-suave">Titular</p>
          <p className="text-[1.75rem] font-bold leading-tight tracking-tight">{titular}</p>
        </div>
        <CursoCertificado c={c} logoSrc={logoSrc} />
        <dl className="grid gap-5 border-t border-borde-suave pt-6 @md:grid-cols-2">
          <Dato termino="Fecha">{fechaLarga(c.curso.fecha)}</Dato>
          <Dato termino="Emitido por">
            <InstitucionCertificado c={c} />
          </Dato>
          {c.curso.docente && <Dato termino="A cargo de">{c.curso.docente}</Dato>}
          <Dato termino="Código">
            <span className="numeros-tabulares tracking-[0.08em]">{formatearCodigo(c.codigo)}</span>
          </Dato>
          {fechaLarga(c.emitidoEn) !== fechaLarga(c.curso.fecha) && <Dato termino="Fecha de emisión">{fechaLarga(c.emitidoEn)}</Dato>}
        </dl>
      </div>
      <div className="flex gap-3 border-t border-borde-suave bg-crema-claro px-5 py-4 text-[0.9375rem] @md:px-8">
        <Icono nombre="info" className="mt-0.5 size-5 shrink-0 text-tierra" />
        <p>
          Confirmamos que {c.institucion.nombre} emitió este certificado a nombre de {titular}. No reemplaza la matrícula
          profesional.
        </p>
      </div>
    </Contenedor>
  );
}
