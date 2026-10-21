import type { Metadata } from 'next';
import { PaginaPublica } from '@/components/layout/EncabezadoPublico';
import { Aviso } from '@/components/ui/Aviso';
import { BotonLink } from '@/components/ui/Boton';
import { EstadoVacio } from '@/components/ui/EstadoVacio';
import { LogoInstitucion } from '@/components/ui/LogoInstitucion';
import { SelloVerificado } from '@/components/ui/Sello';
import { consultarEnlace, type EstadoEnlace } from '@/lib/auth/activacion';
import { sesionActual } from '@/lib/auth/sesion';
import { fechaLarga, nombreCompleto } from '@/lib/texto';
import { FormularioActivar, FormularioSumar } from './Formularios';

export const metadata: Metadata = { title: 'Activar mi pasaporte' };

// Abrir esta página no activa nada (los antivirus de correo abren los links solos): activa el
// botón, que además registra el consentimiento.
export default async function PaginaActivar({ params }: PageProps<'/activar/[token]'>) {
  const { token } = await params;
  const e = await consultarEnlace(token);
  if (e.estado !== 'valido') return <LinkQueNoSirve estado={e.estado} />;

  const s = await sesionActual();
  // Sumar sólo si quien mira ya es una profesional con su pasaporte y el certificado es de otro mail.
  const esProfesional = Boolean(s?.usuario.aceptoLegalesEn && !s.usuario.institucionId && !s.esAdmin);
  const sumarAOtraCuenta = esProfesional && s!.usuario.email !== e.email;
  const c = e.certificado;

  return (
    <PaginaPublica ancho="angosto" mostrarVerificar={false}>
      <div className="mx-auto max-w-lg pt-4 sm:pt-8">
        <h1 className="text-[2rem] font-bold leading-tight tracking-tight">
          {sumarAOtraCuenta ? 'Sumá este certificado' : `Hola, ${c.titularNombre}`}
        </h1>
        <p className="mt-2 text-[1.0625rem] text-tinta-suave">
          {sumarAOtraCuenta
            ? 'Este certificado se emitió a otro mail. Si es tuyo, sumalo a tu pasaporte y aparece junto con el resto de tu formación.'
            : `${c.institucion} te emitió un certificado. Activá tu pasaporte para descargarlo y mostrar tu formación verificada.`}
        </p>

        <div className="mt-6 rounded-tarjeta border border-borde-suave bg-papel p-5 shadow-tarjeta sm:p-6">
          <div className="flex items-start gap-4">
            <LogoInstitucion logoId={c.institucionLogoId} nombre={c.institucion} tamano="lg" />
            <div className="min-w-0">
              <p className="text-[1.125rem] font-bold leading-snug">{c.curso}</p>
              <p className="mt-0.5 text-tinta-suave">{c.institucion}</p>
              <p className="text-tinta-suave">{fechaLarga(c.fecha)}</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-borde-suave pt-4">
            <p>
              <span className="text-[0.9375rem] text-tinta-suave">A nombre de </span>
              <strong>{nombreCompleto({ nombre: c.titularNombre, apellido: c.titularApellido })}</strong>
            </p>
            <SelloVerificado />
          </div>
        </div>

        <div className="mt-8">
          {sumarAOtraCuenta ? (
            <>
              <FormularioSumar token={token} />
              <p className="mt-4 text-[0.9375rem] text-tinta-suave">Si este certificado no es tuyo, no lo sumes: cerrá esta página.</p>
            </>
          ) : (
            <>
              {s && (
                <Aviso tono="info" className="mb-5">
                  Al activar, se cierra la sesión que tenés abierta en este navegador.
                </Aviso>
              )}
              <FormularioActivar token={token} />
              <ul className="mt-6 space-y-2 text-[0.9375rem] text-tinta-suave">
                <li>Tu perfil arranca privado: nadie lo ve hasta que vos lo publiques.</li>
                <li>No hay contraseña. Para volver a entrar, te mandamos un código a tu mail.</li>
              </ul>
            </>
          )}
        </div>
      </div>
    </PaginaPublica>
  );
}

function LinkQueNoSirve({ estado }: { estado: Exclude<EstadoEnlace['estado'], 'valido'> }) {
  const textos = {
    usado: {
      titulo: 'Este link ya se usó',
      cuerpo: 'Tu pasaporte ya está activo. Para entrar, ingresá con tu mail y te mandamos un código.',
    },
    vencido: {
      titulo: 'Este link venció',
      cuerpo: 'Los links de activación duran 45 días. Ingresá con tu mail y te mandamos un código, o pedile a tu institución que te mande uno nuevo.',
    },
    anulado: {
      titulo: 'Este certificado fue anulado',
      cuerpo: 'La institución que lo emitió lo anuló. Si tenés dudas, consultá con ella: puede haberte emitido uno nuevo.',
    },
    inexistente: {
      titulo: 'Este link no sirve',
      cuerpo: 'Puede que esté incompleto. Copialo entero desde el mail, o ingresá con tu mail y te mandamos un código.',
    },
  }[estado];
  return (
    <PaginaPublica ancho="angosto" mostrarVerificar={false}>
      <EstadoVacio
        icono={estado === 'anulado' ? 'alerta' : 'link'}
        nivel="h1"
        titulo={textos.titulo}
        className="mt-6 sm:mt-12"
        accion={
          estado !== 'anulado' && (
            <BotonLink href="/ingresar" icono="mail">
              Ingresar con mi mail
            </BotonLink>
          )
        }
      >
        <p>{textos.cuerpo}</p>
      </EstadoVacio>
    </PaginaPublica>
  );
}
