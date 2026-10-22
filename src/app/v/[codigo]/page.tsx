import type { Metadata } from 'next';
import Link from 'next/link';
import { PaginaPublica } from '@/components/layout/EncabezadoPublico';
import { Aviso } from '@/components/ui/Aviso';
import { BotonLink } from '@/components/ui/Boton';
import { CursoCertificado, EncabezadoResultado, InstitucionCertificado, TarjetaValido } from '@/components/certificados/Resultado';
import { Dato } from '@/components/ui/Dato';
import { Icono } from '@/components/ui/Icono';
import {
  quienMira,
  registrarVerificacion,
  verificarCodigo,
  type CertificadoVerificado,
  type Mirada,
} from '@/features/publico/verificacion';
import { formatearCodigo } from '@/lib/certificados/codigo';
import { canalDesdeParametro } from '@/lib/eventos';
import { fechaHora, fechaLarga, nombreCompleto } from '@/lib/texto';
import { FormularioCodigo } from '../../verificar/FormularioCodigo';

export async function generateMetadata({ params }: PageProps<'/v/[codigo]'>): Promise<Metadata> {
  const { codigo } = await params;
  const r = await verificarCodigo(codigo);
  if (r.estado === 'valido') {
    return { title: 'Certificado válido', description: `Certificado emitido por ${r.certificado.institucion.nombre}.` };
  }
  return { title: r.estado === 'anulado' ? 'Certificado anulado' : 'Certificado no encontrado' };
}

export default async function PaginaVerificacion({ params, searchParams }: PageProps<'/v/[codigo]'>) {
  const [{ codigo }, sp] = await Promise.all([params, searchParams]);
  const r = await verificarCodigo(codigo);
  const mirada = await quienMira(r.estado === 'no_encontrado' ? null : r.certificado);
  await registrarVerificacion(r, mirada, canalDesdeParametro(sp.c));
  const consultado = fechaHora(new Date());

  return (
    <PaginaPublica ancho="angosto">
      <div className="pt-2 sm:pt-6">
        <AvisoMirada mirada={mirada} />
        {r.estado === 'valido' && <Valido c={r.certificado} consultado={consultado} />}
        {r.estado === 'anulado' && <Anulado c={r.certificado} consultado={consultado} />}
        {r.estado === 'no_encontrado' && <NoEncontrado codigo={r.codigo} consultado={consultado} />}
      </div>
    </PaginaPublica>
  );
}

// Quien mira su propio certificado (o uno de su institución) entiende por qué no suma visitas.
function AvisoMirada({ mirada }: { mirada: Mirada }) {
  const textos: Record<Mirada, string | null> = {
    titular: 'Así ve tu certificado quien escanea el QR. Tus propias visitas no se cuentan.',
    institucion: 'Es un certificado de tu institución. Así lo ve quien escanea el QR; esta visita no se cuenta.',
    admin: 'Estás con la cuenta de administración: esta visita no se cuenta.',
    publico: null,
  };
  const texto = textos[mirada];
  return texto ? (
    <Aviso tono="info" className="mb-5">
      {texto}
    </Aviso>
  ) : null;
}

function Valido({ c, consultado }: { c: CertificadoVerificado; consultado: string }) {
  return (
    <>
      <TarjetaValido c={c} consultado={consultado} />
      {c.perfil && (
        <BotonLink
          href={`/p/${c.perfil.slug}?c=verificacion`}
          prefetch={false}
          tamano="lg"
          anchoCompleto
          iconoDerecha="flecha"
          className="mt-6"
        >
          Ver toda la formación de {c.perfil.nombre}
        </BotonLink>
      )}
      <OtroCodigo />
    </>
  );
}

function Anulado({ c, consultado }: { c: CertificadoVerificado; consultado: string }) {
  const titular = nombreCompleto({ nombre: c.titularNombre, apellido: c.titularApellido });
  return (
    <>
      <section aria-labelledby="resultado" className="@container overflow-hidden rounded-tarjeta border border-error/25 bg-papel shadow-elevada">
        <EncabezadoResultado tono="error" icono="cruz" titulo="Certificado anulado" consultado={consultado} />
        <div className="space-y-6 px-5 py-6 @md:px-8 @md:py-8">
          <p className="text-[1.125rem]">
            {c.institucion.nombre} anuló este certificado
            {c.anuladoEn ? ` el ${fechaLarga(c.anuladoEn)}` : ''}. <strong>Ya no tiene validez.</strong>
          </p>
          <div className="rounded-2xl border border-borde-suave bg-marfil p-4 @md:p-5">
            <p className="mb-4 text-[0.9375rem] font-semibold text-tinta-suave">Datos del certificado anulado</p>
            <CursoCertificado c={c} />
            <dl className="mt-5 grid gap-5 @md:grid-cols-2">
              <Dato termino="Titular">{titular}</Dato>
              <Dato termino="Emitido por">
                <InstitucionCertificado c={c} />
              </Dato>
              <Dato termino="Código">
                <span className="numeros-tabulares tracking-[0.08em]">{formatearCodigo(c.codigo)}</span>
              </Dato>
            </dl>
          </div>
        </div>
        <div className="flex gap-3 border-t border-borde-suave bg-crema-claro px-5 py-4 text-[0.9375rem] @md:px-8">
          <Icono nombre="info" className="mt-0.5 size-5 shrink-0 text-tierra" />
          <p>Si te lo presentaron como vigente, consultá con {c.institucion.nombre}: puede haber emitido uno nuevo con otro código.</p>
        </div>
      </section>
      <OtroCodigo />
    </>
  );
}

function NoEncontrado({ codigo, consultado }: { codigo: string | null; consultado: string }) {
  return (
    <>
      <section aria-labelledby="resultado" className="@container overflow-hidden rounded-tarjeta border border-borde-suave bg-papel shadow-elevada">
        <EncabezadoResultado tono="tierra" icono="lupa" titulo="No encontramos este certificado" consultado={consultado} />
        <div className="space-y-5 px-5 py-6 @md:px-8 @md:py-8">
          <p className="text-[1.125rem]">
            {codigo ? (
              <>
                No hay ningún certificado con el código{' '}
                <strong className="numeros-tabulares tracking-[0.08em]">{formatearCodigo(codigo)}</strong>.
              </>
            ) : (
              'La dirección no tiene un código de certificado válido.'
            )}
          </p>
          <ul className="list-disc space-y-1.5 pl-5 text-tinta-suave">
            <li>Revisá que esté bien escrito: son 8 letras y números. Una letra cambiada alcanza para que no aparezca.</li>
            <li>Si llegaste escaneando un QR, consultá con la persona o la institución que te mostró el certificado.</li>
          </ul>
          <div className="border-t border-borde-suave pt-6">
            <h2 className="mb-4 text-[1.1875rem] font-bold">Probá de nuevo</h2>
            <FormularioCodigo valor={codigo ? formatearCodigo(codigo) : ''} />
          </div>
        </div>
      </section>
    </>
  );
}

function OtroCodigo() {
  return (
    <p className="mt-6 text-center">
      <Link href="/verificar" className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4">
        Verificar otro certificado
      </Link>
    </p>
  );
}
