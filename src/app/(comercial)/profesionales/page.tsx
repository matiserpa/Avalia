import type { Metadata } from 'next';
import Link from 'next/link';
import { MensajeInstitucion } from '@/components/comercial/MensajeInstitucion';
import { Muestra, MuestraPerfil, MuestraVerificadoYDeclarado, MuestraVistaPrevia } from '@/components/comercial/Muestras';
import { PreguntasFrecuentes, type Pregunta } from '@/components/comercial/PreguntasFrecuentes';
import { BotonLink } from '@/components/ui/Boton';
import { Icono, type NombreIcono } from '@/components/ui/Icono';
import { MARCA } from '@/config/marca';
import { metadatosSitio } from '@/features/comercial/sitio';
import { urlBase } from '@/lib/config';

export function generateMetadata(): Metadata {
  return metadatosSitio({
    titulo: 'Tu formación verificada, en un solo link',
    descripcion:
      'Tu pasaporte reúne los certificados que te emitieron las instituciones, con sello verde, en un perfil para compartir con tus pacientes. Gratis durante el piloto.',
    compartir: {
      titulo: 'Tu formación, verificada y en un solo link.',
      descripcion:
        'Un perfil con tu formación verificada para compartir en redes, por WhatsApp y en el consultorio. Se activa cuando una institución del piloto te emite un certificado.',
      imagen: 'profesionales',
    },
  });
}

const GANAS: { icono: NombreIcono; titulo: string; texto: string }[] = [
  {
    icono: 'libro',
    titulo: 'Tu formación en un solo lugar',
    texto: 'Tus certificados juntos, ordenados por año, con el logo de cada institución que te formó.',
  },
  {
    icono: 'lupa',
    titulo: 'Un sello que se comprueba',
    texto: 'Lo que te emitió una institución lleva sello verde. Tus pacientes tocan Verificar y lo comprueban en segundos.',
  },
  {
    icono: 'compartir',
    titulo: 'Listo para compartir',
    texto:
      'Tu link para la bio de Instagram o para WhatsApp, un QR para imprimir en el consultorio y una imagen para tus historias. Al pegar tu link en WhatsApp se ve tu nombre y cuántos certificados verificados tenés.',
  },
];

const PASOS: { titulo: string; texto: string }[] = [
  {
    titulo: 'Tu institución te emite un certificado.',
    texto: 'Cuando una institución del piloto te emite un certificado, te mandamos un mail.',
  },
  {
    titulo: 'Activás tu pasaporte.',
    texto:
      'Tocás el botón del mail, mirás tu certificado y aceptás los términos y la política de privacidad. No hay contraseña: la próxima vez entrás con un código que te mandamos por mail.',
  },
  {
    titulo: 'Armás tu perfil y lo compartís.',
    texto:
      'Sumás tu foto, tu profesión, tu ciudad y un contacto por WhatsApp o Instagram, si querés. Lo mirás antes de publicarlo y lo compartís cuando quieras.',
  },
];

const DECIDIS = [
  'Tu perfil arranca privado: lo publicás cuando quieras y lo podés volver a hacer privado.',
  'Tu matrícula aparece sólo si elegís mostrarla, y figura como «declarada».',
  'Podés ocultar un certificado de tu perfil. Su código sigue verificando.',
  'Nunca mostramos tu mail y no guardamos tu DNI.',
  'Podés borrar tu cuenta desde tu panel cuando quieras.',
];

const PREGUNTAS: Pregunta[] = [
  {
    pregunta: '¿Puedo subir mis certificados por mi cuenta?',
    respuesta: `No. Para llevar sello verde, un certificado lo tiene que emitir la institución que te formó: por eso el sello vale. Si tu institución todavía no está en ${MARCA.nombre}, contale con el mensaje de esta página.`,
  },
  {
    pregunta: '¿Cuánto me cuesta?',
    respuesta: 'Nada. Durante el piloto, el pasaporte es gratis para las profesionales. Y para tus pacientes, verificar tus certificados es gratis siempre.',
  },
];

export default function Profesionales() {
  const mensaje = `Hola, ¿cómo están? Les cuento que existe ${MARCA.nombre}: las instituciones emiten certificados que cualquiera puede verificar, y las egresadas los mostramos en un perfil con el logo de la institución. Me encantaría tener ahí mi formación con ustedes. Les dejo la info: ${urlBase()}/`;
  return (
    <main id="contenido" className="mx-auto w-full max-w-5xl flex-1 px-4 pb-16 pt-2 sm:px-6 sm:pt-6">
      {/* P1 · Presentación */}
      <section className="grid items-center gap-10 pt-2 sm:pt-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-14">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-tierra-claro px-3.5 py-1.5 text-[0.9375rem] font-semibold text-tierra-oscuro">
            <Icono nombre="usuario" className="size-4" />
            Para profesionales de la estética
          </p>
          <h1 className="mt-5 text-balance text-[2.25rem] font-bold leading-[1.1] tracking-tight sm:text-[3.125rem]">
            Tu formación, verificada y en un solo link
          </h1>
          <p className="mt-5 max-w-xl text-[1.1875rem] leading-relaxed text-tinta-suave">
            Tu pasaporte reúne los certificados que te emitieron las instituciones donde te formaste, cada uno con sello verde, en
            un perfil para compartir con tus pacientes. Durante el piloto es gratis.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <BotonLink href="#contarle" tamano="lg" className="w-full sm:w-auto">
              Contarle a mi institución
            </BotonLink>
            <BotonLink href="/ingresar" tamano="lg" variante="secundario" className="w-full sm:w-auto">
              Ingresar a mi pasaporte
            </BotonLink>
          </div>
          <p className="mt-4 text-[0.9375rem] text-tinta-suave">
            Tu pasaporte se activa cuando una institución del piloto te emite un certificado: te mandamos un mail para activarlo.
          </p>
        </div>
        <Muestra className="mx-auto w-full max-w-sm">
          {/* En escritorio, dentro de un marco de celular simple, sin marca ni modelo. */}
          <div className="lg:rounded-[2.25rem] lg:border-[6px] lg:border-tinta/85 lg:bg-tinta/85 lg:p-1.5">
            <div className="lg:overflow-hidden lg:rounded-[1.75rem]">
              <MuestraPerfil />
            </div>
          </div>
        </Muestra>
      </section>

      {/* P2 · Qué ganás */}
      <section aria-labelledby="titulo-ganas" className="mt-16 sm:mt-24">
        <h2 id="titulo-ganas" className="text-balance text-[1.75rem] font-bold tracking-tight sm:text-[2rem]">
          Todo lo que estudiaste, a la vista de tus pacientes
        </h2>
        <div className="mt-8 grid items-start gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <ul className="space-y-6">
            {GANAS.map((g) => (
              <li key={g.titulo} className="flex gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-crema text-tierra">
                  <Icono nombre={g.icono} className="size-6" />
                </span>
                <div>
                  <h3 className="text-[1.1875rem] font-bold">{g.titulo}</h3>
                  <p className="mt-1 text-tinta-suave">{g.texto}</p>
                </div>
              </li>
            ))}
          </ul>
          <Muestra>
            <MuestraVistaPrevia />
          </Muestra>
        </div>
      </section>

      {/* P3 · Cómo se activa */}
      <section id="como-se-activa" aria-labelledby="titulo-activa" className="mt-16 scroll-mt-6 sm:mt-24">
        <h2 id="titulo-activa" className="text-balance text-[1.75rem] font-bold tracking-tight sm:text-[2rem]">
          Sin contraseñas y sin papeles: así se activa tu pasaporte
        </h2>
        <ol className="mt-6 grid gap-4 md:grid-cols-3">
          {PASOS.map((p, i) => (
            <li key={p.titulo} className="rounded-tarjeta border border-borde-suave bg-papel p-5 shadow-tarjeta sm:p-6">
              <span className="text-[0.9375rem] font-semibold text-tinta-suave">Paso {i + 1}</span>
              <h3 className="mt-2 text-[1.1875rem] font-bold">{p.titulo}</h3>
              <p className="mt-1.5 text-tinta-suave">{p.texto}</p>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-[0.9375rem] text-tinta-suave">Si otra institución te emite un certificado al mismo mail, se suma solo a tu pasaporte.</p>
      </section>

      {/* P4 · Qué lleva sello verde y qué no */}
      <section aria-labelledby="titulo-sello" className="mt-16 sm:mt-24">
        <h2 id="titulo-sello" className="text-balance text-[1.75rem] font-bold tracking-tight sm:text-[2rem]">
          Qué lleva sello verde y qué no
        </h2>
        <p className="mt-3 max-w-3xl text-tinta-suave">
          El sello verde va sólo en los certificados que emitió una institución. Tu profesión, tu ciudad, tu matrícula y tu
          contacto los contás vos: se muestran sin sello, para que tus pacientes sepan qué está comprobado. Tu pasaporte no
          reemplaza la matrícula: la otorga cada jurisdicción.
        </p>
        <Muestra className="mt-6 max-w-2xl">
          <MuestraVerificadoYDeclarado />
        </Muestra>
        <h3 className="mt-10 text-[1.25rem] font-bold">Vos decidís qué se ve</h3>
        <ul className="mt-4 space-y-2.5">
          {DECIDIS.map((t) => (
            <li key={t} className="flex gap-3">
              <Icono nombre="candado" className="mt-0.5 size-5 shrink-0 text-tierra" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* P5 · Contarle a tu institución */}
      <section id="contarle" aria-labelledby="titulo-contarle" className="mt-16 scroll-mt-6 rounded-tarjeta bg-crema-claro p-6 sm:mt-24 sm:p-10">
        <h2 id="titulo-contarle" className="text-balance text-[1.75rem] font-bold tracking-tight sm:text-[2rem]">
          ¿Tu institución todavía no está en {MARCA.nombre}?
        </h2>
        <p className="mt-3 max-w-3xl text-tinta-suave">
          Los certificados de tu pasaporte los emite siempre la institución: vos no podés cargarlos, y por eso el sello vale. Si
          querés tener ahí tu formación, contale a tu institución. Te dejamos el mensaje listo.
        </p>
        <div className="mt-6 max-w-2xl">
          <MensajeInstitucion mensaje={mensaje} />
        </div>
        <p className="mt-4">
          O{' '}
          <Link href="/contacto?tipo=profesional" className="font-semibold underline underline-offset-4">
            contanos cuál es tu institución
          </Link>
        </p>
      </section>

      {/* P6 · Dudas frecuentes */}
      <section aria-labelledby="titulo-dudas" className="mt-16 sm:mt-24">
        <h2 id="titulo-dudas" className="text-[1.75rem] font-bold tracking-tight sm:text-[2rem]">
          Dudas frecuentes
        </h2>
        <div className="mt-6 max-w-3xl">
          <PreguntasFrecuentes preguntas={PREGUNTAS} />
        </div>
      </section>

      {/* P7 · Cierre */}
      <section aria-labelledby="titulo-ya" className="mt-16 sm:mt-24">
        <h2 id="titulo-ya" className="text-[1.75rem] font-bold tracking-tight sm:text-[2rem]">
          ¿Ya tenés tu pasaporte?
        </h2>
        <p className="mt-2 text-tinta-suave">Entrá con el mail donde recibiste tu certificado.</p>
        <div className="mt-6">
          <BotonLink href="/ingresar" tamano="lg" className="w-full sm:w-auto">
            Ingresar a mi pasaporte
          </BotonLink>
        </div>
        <p className="mt-5 text-[0.9375rem]">
          ¿Trabajás en una institución?{' '}
          <Link href="/" className="font-semibold underline underline-offset-4">
            Ver lo que gana tu institución
          </Link>
        </p>
      </section>
    </main>
  );
}
