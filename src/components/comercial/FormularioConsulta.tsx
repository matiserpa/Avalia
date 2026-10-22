'use client';

// Formulario de contacto del sitio comercial. Todo pasa en la misma página: el mail no viaja en
// la dirección. Al salir bien, el formulario se reemplaza por el mensaje (nunca en verde: el verde
// es sólo para lo verificado) y el foco va a su título.

import Link from 'next/link';
import { useActionState, useEffect, useRef } from 'react';
import { enviarConsulta, type EstadoConsulta } from '@/app/(comercial)/contacto/acciones';
import { Aviso } from '@/components/ui/Aviso';
import { BotonEnviar } from '@/components/ui/BotonEnviar';
import { AreaTexto, Campo, Casilla, TextoError } from '@/components/ui/Campo';
import { MARCA } from '@/config/marca';
import type { TipoConsulta } from '@/db/schema';

const OPCIONES: { valor: TipoConsulta; texto: string }[] = [
  { valor: 'instituto', texto: 'Trabajo en un instituto o escuela de estética' },
  { valor: 'asociacion', texto: 'Trabajo en una asociación profesional' },
  { valor: 'congreso', texto: 'Organizo congresos o jornadas' },
  { valor: 'profesional', texto: 'Soy profesional de la estética' },
  { valor: 'otro', texto: 'Otro' },
];

export function FormularioConsulta({ tipoInicial }: { tipoInicial?: TipoConsulta }) {
  const [estado, enviar] = useActionState<EstadoConsulta, FormData>(enviarConsulta, { intento: 0 });
  const titulo = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (estado.enviada) titulo.current?.focus();
  }, [estado.enviada]);

  if (estado.enviada) return <Enviada estado={estado} titulo={titulo} />;

  const e = estado.errores ?? {};
  const v = estado.valores;
  const tipoElegido = v?.tipo ?? tipoInicial;
  return (
    <form key={estado.intento} action={enviar} className="space-y-6" noValidate>
      {Object.keys(e).length > 0 && <Aviso tono="error" titulo="Revisá los datos marcados." />}
      {estado.error && <Aviso tono="error">{estado.error}</Aviso>}

      <fieldset aria-describedby={e.tipo ? 'campo-tipo-error' : undefined}>
        <legend className="mb-2 font-semibold">¿Qué te describe mejor?</legend>
        <div className="grid gap-1">
          {OPCIONES.map((o, i) => (
            <label key={o.valor} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl px-1 hover:bg-crema-claro">
              <input
                type="radio"
                name="tipo"
                value={o.valor}
                required
                defaultChecked={tipoElegido === o.valor}
                // El primero lleva la marca de error: ahí va el foco si falta elegir.
                aria-invalid={e.tipo && i === 0 ? true : undefined}
                className="size-6 shrink-0 cursor-pointer accent-tinta"
              />
              <span>{o.texto}</span>
            </label>
          ))}
        </div>
        {e.tipo && <TextoError id="campo-tipo-error">{e.tipo}</TextoError>}
      </fieldset>

      <Campo etiqueta="Tu nombre y apellido" name="nombre" autoComplete="name" required aria-required defaultValue={v?.nombre} error={e.nombre} />
      <Campo
        etiqueta="Institución, asociación o evento"
        name="organizacion"
        opcional
        autoComplete="organization"
        defaultValue={v?.organizacion}
        error={e.organizacion}
        ayuda="Por ejemplo, el nombre de tu instituto o de tu congreso. Si sos profesional, la institución donde te formaste."
      />
      <Campo
        etiqueta="Ciudad"
        name="ciudad"
        opcional
        autoComplete="address-level2"
        defaultValue={v?.ciudad}
        error={e.ciudad}
        ayuda="El piloto es en Neuquén y Río Negro. Si estás en otro lugar, escribinos igual."
      />
      <Campo
        etiqueta="Tu mail"
        name="email"
        type="email"
        autoComplete="email"
        spellCheck={false}
        required
        aria-required
        defaultValue={v?.email}
        error={e.email}
        ayuda="Te respondemos a este mail."
      />
      <Campo
        etiqueta="WhatsApp o teléfono"
        name="telefono"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        opcional
        defaultValue={v?.telefono}
        error={e.telefono}
        ayuda="Con código de área, si preferís que te escribamos por WhatsApp o te llamemos."
      />
      <AreaTexto
        etiqueta="¿Algo más que quieras contarnos?"
        name="mensaje"
        opcional
        rows={4}
        defaultValue={v?.mensaje}
        error={e.mensaje}
        ayuda="Por ejemplo, qué cursos dan, cuántas egresadas tienen por año o cuándo es su próximo congreso. No hace falta que nos pases datos de tus egresadas."
      />

      {/* Campo trampa: una persona no lo ve ni llega con el teclado. Si viene lleno, es un robot. */}
      <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
        <label htmlFor="campo-sitio">Dejá este campo vacío</label>
        <input id="campo-sitio" name="sitio" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <section aria-labelledby="como-usamos" className="rounded-2xl border border-borde-suave bg-papel p-5 text-[0.9375rem]">
        <h2 id="como-usamos" className="text-[1.0625rem] font-bold">
          Cómo usamos tus datos
        </h2>
        <div className="mt-2 space-y-2 text-tinta-suave">
          <p>
            Los datos de este formulario los recibe {MARCA.responsable}, responsable de {MARCA.nombre}{' '}
            <span className="rounded bg-tierra-claro px-1 text-tierra-oscuro">[COMPLETAR: razón social, CUIT y domicilio]</span>. Los
            usamos sólo para responder tu consulta y conversar con vos sobre el piloto: no los publicamos, no te sumamos a listas de
            envío y no los usamos para publicidad. Para guardarlos y mandarte mails usamos servicios de alojamiento, base de datos y
            correo que pueden estar fuera de la Argentina.
          </p>
          <p>
            Tu nombre, tu mail y la opción que te describe son necesarios para responderte; lo que dice «(opcional)» lo podés dejar
            vacío. Guardamos tu consulta en el sitio hasta 12 meses y después se borra sola. Una copia de tu consulta y los mails que
            nos crucemos quedan en nuestro correo; también los borramos si nos lo pedís.
          </p>
          <p>
            Podés pedirnos ver, corregir o borrar tus datos cuando quieras, escribiendo a {MARCA.emailContacto}. Más detalles en la{' '}
            <a href="/privacidad" target="_blank" rel="noopener" className="font-semibold text-tinta underline underline-offset-4">
              política de privacidad
              <span className="sr-only"> (se abre en otra pestaña)</span>
            </a>
            .
          </p>
        </div>
        <p className="mt-3 text-[0.8125rem] leading-relaxed text-tinta-suave">
          El titular de los datos personales tiene la facultad de ejercer el derecho de acceso a los mismos en forma gratuita a
          intervalos no inferiores a seis meses, salvo que se acredite un interés legítimo al efecto conforme lo establecido en el
          artículo 14, inciso 3 de la Ley N° 25.326. La Agencia de Acceso a la Información Pública, en su carácter de Órgano de
          Control de la Ley N° 25.326, tiene la atribución de atender las denuncias y reclamos que interpongan quienes resulten
          afectados en sus derechos por incumplimiento de las normas vigentes en materia de protección de datos personales.
        </p>
      </section>

      <Casilla name="acepto" value="si" required aria-required defaultChecked={v?.acepto === 'si'} error={e.acepto}>
        Leí el aviso de privacidad y acepto que {MARCA.responsable} use mis datos para responder esta consulta.
      </Casilla>

      <BotonEnviar icono="mail" textoEnviando="Enviando…" className="w-full sm:w-auto">
        Enviar mi consulta
      </BotonEnviar>
    </form>
  );
}

function Enviada({ estado, titulo }: { estado: EstadoConsulta; titulo: React.RefObject<HTMLParagraphElement | null> }) {
  const textos = estado.demo
    ? {
        titulo: 'Estás en la demo',
        texto: `No guardamos lo que escribiste ni le avisamos a nadie. En el sitio del piloto, la consulta se guarda y le avisamos por mail a ${MARCA.responsable}. Para escribirnos de verdad: ${MARCA.emailContacto}.`,
        link: { href: '/', texto: 'Volver a la portada' },
      }
    : estado.tipo === 'profesional'
      ? {
          titulo: 'Listo, recibimos tu consulta',
          texto: 'Gracias. Si necesitamos algo más, te escribimos al mail que nos dejaste. Mientras tanto, podés pasarle a tu institución el mensaje que te dejamos listo.',
          link: { href: '/profesionales#contarle', texto: 'Contarle a mi institución' },
        }
      : {
          titulo: 'Listo, recibimos tu consulta',
          texto: `Gracias. Te vamos a escribir al mail que nos dejaste para coordinar una reunión. Si no ves nuestra respuesta, revisá la carpeta de correo no deseado o escribinos a ${MARCA.emailContacto}.`,
          link: { href: '/', texto: 'Volver a la portada' },
        };
  return (
    <div role="status" className="rounded-tarjeta border border-borde-suave bg-crema-claro p-6 sm:p-8">
      <p ref={titulo} tabIndex={-1} className="text-[1.375rem] font-bold tracking-tight">
        {textos.titulo}
      </p>
      <p className="mt-2 text-tinta-suave">{textos.texto}</p>
      <Link href={textos.link.href} className="mt-5 inline-flex min-h-12 items-center font-semibold underline underline-offset-4">
        {textos.link.texto}
      </Link>
    </div>
  );
}
