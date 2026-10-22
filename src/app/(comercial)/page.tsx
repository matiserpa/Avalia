import type { Metadata } from 'next';
import Link from 'next/link';
import { FranjaVerificar } from '@/components/comercial/FranjaVerificar';
import {
  Muestra,
  MuestraCertificadoEnPerfil,
  MuestraPerfil,
  MuestraVerificacion,
  MuestraVistaPrevia,
} from '@/components/comercial/Muestras';
import { PreguntasFrecuentes, type Pregunta } from '@/components/comercial/PreguntasFrecuentes';
import { Aviso } from '@/components/ui/Aviso';
import { BotonLink } from '@/components/ui/Boton';
import { Icono, type NombreIcono } from '@/components/ui/Icono';
import { MARCA } from '@/config/marca';
import { metadatosSitio } from '@/features/comercial/sitio';
import { DEMO } from '@/lib/demo/datos';
import { modoDemo } from '@/lib/config';

export function generateMetadata(): Metadata {
  return metadatosSitio({
    titulo: `${MARCA.nombre} · Certificados verificables para instituciones de estética`,
    tituloAbsoluto: true,
    descripcion:
      'Emití certificados con código y QR. Tus egresadas los muestran en su perfil con tu logo, y cualquiera los verifica en segundos. Piloto en Neuquén y Río Negro.',
    compartir: {
      titulo: 'Tus egresadas comparten su formación. Tu logo va con ellas.',
      descripcion: 'Certificados verificables para institutos, asociaciones, congresos y jornadas de estética. Piloto en Neuquén y Río Negro.',
      imagen: 'instituciones',
    },
  });
}

const BENEFICIOS: { icono: NombreIcono; titulo: string; texto: string }[] = [
  {
    icono: 'compartir',
    titulo: 'Tu logo, en los perfiles de tus egresadas',
    texto:
      'Cada certificado del perfil muestra el nombre y el logo de tu institución. Cuando una egresada comparte su perfil en Instagram, por WhatsApp o con el QR de su consultorio, sus pacientes y colegas ven dónde se formó.',
  },
  {
    icono: 'lupa',
    titulo: 'Una forma rápida de desmentir certificados falsos',
    texto: `Cualquiera escribe el código o escanea el QR y ve si lo emitiste vos, a nombre de quién, de qué curso y si sigue válido. En ${MARCA.nombre}, sólo tu institución puede emitir certificados con tu nombre.`,
  },
  {
    icono: 'usuario',
    titulo: 'Egresadas que vuelven a nombrarte',
    texto:
      'Cada vez que muestran su formación, cuentan dónde se formaron. Y cada curso nuevo que hacen con vos se suma a su pasaporte, junto a lo que ya tenían.',
  },
  {
    icono: 'edificio',
    titulo: 'Un argumento más para tu inscripción',
    texto:
      'Podés contarlo en tu promoción: «Los certificados de nuestros cursos se pueden verificar». Y quien se inscribe sabe que va a poder mostrar su formación con sello.',
  },
];

const PASOS: { icono: NombreIcono; titulo: string; texto: string }[] = [
  {
    icono: 'planilla',
    titulo: 'Cargás a tus egresadas',
    texto:
      'Creás el curso (formación, taller, masterclass, congreso o jornada) y pegás las filas de tu Excel o Google Sheets, o subís un CSV. Revisás los nombres antes de emitir. Si la planilla trae DNI, no lo guardamos.',
  },
  {
    icono: 'qr',
    titulo: 'Emitís los certificados',
    texto:
      'Cada uno sale con su código y su QR. A cada egresada le mandamos un mail para que active su pasaporte y descargue su certificado en PDF, con tu logo. Un certificado emitido no se edita: si tiene un error, lo anulás y emitís otro.',
  },
  {
    icono: 'compartir',
    titulo: 'Tus egresadas lo muestran',
    texto:
      'Arman su perfil, lo publican cuando quieren y lo comparten en redes, por WhatsApp o con el QR del consultorio. Quien lo mira ve tu nombre y tu logo, y puede verificar cada certificado.',
  },
];

const CONGRESOS = [
  'Pegás la lista desde Excel o Google Sheets, o subís un CSV.',
  'Antes de emitir, revisás los nombres y ves un certificado de muestra.',
  'No hace falta armar ni mandar los certificados uno por uno.',
  'Si una asistente ya tiene su pasaporte con ese mail, el certificado se le suma solo.',
  'Si un nombre salió mal, anulás ese certificado y emitís uno nuevo, sin tocar el resto.',
];

const PREGUNTAS: Pregunta[] = [
  {
    pregunta: '¿Cuánto cuesta?',
    respuesta:
      'Todavía no publicamos precios para instituciones. Te contamos las condiciones del piloto cuando hablemos, antes de que tengas que decidir nada. Para tus egresadas es gratis durante el piloto, y verificar un certificado es gratis siempre, para cualquiera.',
  },
  {
    pregunta: '¿Tenemos que cambiar cómo trabajamos?',
    respuesta:
      'No. Seguís usando tu planilla de egresadas: pegás las filas desde Excel o Google Sheets, o subís un CSV. Revisás los nombres, emitís, y a cada egresada le mandamos un mail. Entrás desde el navegador, en la compu o en el celular, con un código que te mandamos por mail. No hay contraseñas ni nada para instalar.',
  },
  {
    pregunta: '¿Reemplaza el certificado que ya entregamos?',
    respuesta: `No, lo acompaña. Podés seguir entregando el tuyo como siempre. El de ${MARCA.nombre} suma un código y un QR para que cualquiera lo compruebe, y tu egresada lo descarga en PDF con tu logo.`,
  },
  {
    pregunta: '¿Qué datos de mis egresadas usan y qué se ve en público?',
    respuesta:
      'Necesitamos el nombre, el apellido y el mail de cada una. No guardamos el DNI: si tu planilla lo trae, lo descartamos. El mail nunca se muestra. Quien tiene el código o el QR de un certificado ve lo mismo que dice el certificado: el nombre, el curso, la fecha y tu institución, aunque la egresada todavía no haya activado su pasaporte. Su perfil arranca privado: cada una decide si lo publica, qué certificados muestra y si muestra su matrícula.',
  },
  {
    pregunta: `¿${MARCA.nombre} habilita para ejercer?`,
    respuesta: `No. ${MARCA.nombre} confirma que tu institución emitió el certificado: a nombre de quién, de qué curso y cuándo. No evalúa tratamientos ni habilita para ejercer. La matrícula la otorga cada jurisdicción, y así lo aclaramos en cada verificación y en cada perfil.`,
  },
  {
    pregunta: '¿Voy a ver cuántas veces se vieron mis certificados?',
    respuesta:
      'Hoy no. En tu panel ves, curso por curso, quién activó su pasaporte y a quién no le pudimos mandar el mail. Las visitas y las verificaciones las medimos sólo en general, para evaluar el piloto, sin datos de quién mira.',
  },
  {
    pregunta: '¿Nos pueden ayudar a que se note?',
    respuesta: `Si querés, sí. ${MARCA.nombre} es un servicio de ${MARCA.responsable}, una agencia de redes y comunicación especializada en salud, estética y bienestar. Podemos sumar un kit para que tus egresadas compartan su perfil y una campaña para tu próxima inscripción. Es opcional, se arma a medida y lo hablamos en la reunión. No prometemos seguidores ni inscripciones.`,
  },
];

function BotonSumar() {
  return (
    <BotonLink href="/contacto" tamano="lg" className="w-full sm:w-auto">
      Sumar mi institución al piloto
    </BotonLink>
  );
}

// Una pantalla real de la plataforma, recortada (sin mails ni encabezado). `celular`: otro recorte
// para pantallas angostas, donde el de escritorio se vería con letra diminuta.
function Captura({
  src,
  ancho,
  alto,
  alt,
  celular,
}: {
  src: string;
  ancho: number;
  alto: number;
  alt: string;
  celular?: { src: string; ancho: number; alto: number };
}) {
  return (
    <figure>
      <picture>
        {celular && <source media="(max-width: 639px)" srcSet={celular.src} width={celular.ancho} height={celular.alto} />}
        <img
          src={src}
          width={ancho}
          height={alto}
          alt={alt}
          loading="lazy"
          className="h-auto w-full rounded-2xl border border-borde-suave bg-marfil shadow-elevada"
        />
      </picture>
      <figcaption className="mt-3 text-[0.875rem] text-tinta-suave">Pantalla real de {MARCA.nombre}, con datos inventados.</figcaption>
    </figure>
  );
}

export default async function Portada({ searchParams }: PageProps<'/'>) {
  const sp = await searchParams;
  const demo = modoDemo();
  return (
    <main id="contenido" className="mx-auto w-full max-w-5xl flex-1 px-4 pb-16 pt-2 sm:px-6 sm:pt-6">
      {sp.cuenta === 'borrada' && (
        <Aviso tono="info" titulo="Borramos tu cuenta" className="mb-6">
          Tus datos ya no están en {MARCA.nombre}. Tus certificados siguen verificando con su código.
        </Aviso>
      )}
      {demo && (
        <Aviso tono="info" titulo="Estás en la demo" className="mb-6">
          Los datos son inventados.{' '}
          <Link href="/demo" className="font-semibold underline underline-offset-4">
            Ver la guía de la demo
          </Link>{' '}
          o{' '}
          <Link href={`/p/${DEMO.slugValentina}`} className="font-semibold underline underline-offset-4">
            un perfil de ejemplo
          </Link>
          .
        </Aviso>
      )}

      {/* B1 · Presentación */}
      <section className="grid items-center gap-10 pt-2 sm:pt-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-tierra-claro px-3.5 py-1.5 text-[0.9375rem] font-semibold text-tierra-oscuro">
            <Icono nombre="ubicacion" className="size-4" />
            Piloto en Neuquén y Río Negro
          </p>
          <h1 className="mt-5 text-balance text-[2.25rem] font-bold leading-[1.1] tracking-tight sm:text-[3.125rem]">
            Tus egresadas comparten su formación. Tu logo va con ellas.
          </h1>
          <p className="mt-5 max-w-xl text-[1.1875rem] leading-relaxed text-tinta-suave">
            Con {MARCA.nombre} emitís certificados con código y QR. Tus egresadas los muestran en su perfil profesional con el
            nombre y el logo de tu institución, y cualquiera comprueba en segundos que los emitiste vos.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
            <BotonSumar />
            <Link href="#muestra" className="inline-flex min-h-12 items-center justify-center font-semibold underline underline-offset-4">
              Ver un ejemplo
            </Link>
          </div>
          <p className="mt-4 text-[0.9375rem] text-tinta-suave">
            Pedirlo no te compromete a nada. Para tus egresadas es gratis durante el piloto.
          </p>
        </div>
        <Muestra
          className="mx-auto w-full max-w-md"
          leyenda="Ejemplo con datos inventados. Cada certificado del perfil lleva el logo y el nombre de la institución que lo emitió."
        >
          <MuestraCertificadoEnPerfil />
        </Muestra>
      </section>

      {/* B2 · Verificar un certificado */}
      <div className="mt-14 sm:mt-20">
        <FranjaVerificar />
      </div>

      {/* B3 · Lo que gana tu institución */}
      <section id="beneficios" aria-labelledby="titulo-beneficios" className="mt-16 scroll-mt-6 sm:mt-24">
        <h2 id="titulo-beneficios" className="text-balance text-[1.75rem] font-bold tracking-tight sm:text-[2rem]">
          Lo que gana tu institución
        </h2>
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {BENEFICIOS.map((b) => (
            <li key={b.titulo} className="rounded-tarjeta border border-borde-suave bg-papel p-5 shadow-tarjeta sm:p-6">
              <span className="flex size-11 items-center justify-center rounded-full bg-crema text-tierra">
                <Icono nombre={b.icono} className="size-6" />
              </span>
              <h3 className="mt-4 text-[1.1875rem] font-bold">{b.titulo}</h3>
              <p className="mt-1.5 text-tinta-suave">{b.texto}</p>
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <BotonSumar />
        </div>
      </section>

      {/* B4 · Así se ve */}
      <section id="muestra" aria-labelledby="titulo-muestra" className="mt-16 scroll-mt-6 sm:mt-24">
        <h2 id="titulo-muestra" className="text-balance text-[1.75rem] font-bold tracking-tight sm:text-[2rem]">
          Así ven a tu institución los pacientes de tus egresadas
        </h2>
        <p className="mt-2 max-w-2xl text-tinta-suave">
          Un ejemplo con datos inventados: Valentina Ríos, cosmiatra de Neuquén, con certificados de dos instituciones de prueba.
        </p>
        <div className="mt-8 grid items-start gap-10 lg:grid-cols-3 lg:gap-6">
          <PiezaMuestra
            titulo="Su perfil"
            texto="Su formación, ordenada por año, con sello verde en cada certificado. Lo que declara ella, como la profesión o la matrícula, va aparte y sin sello."
            donde="tu logo y tu nombre, en cada certificado que le emitiste."
          >
            <MuestraPerfil />
          </PiezaMuestra>
          <PiezaMuestra
            titulo="Su link, en un chat"
            texto="Cuando pega su link en WhatsApp, aparece una vista previa con su nombre y cuántos certificados verificados tiene."
            donde="el texto de la vista previa nombra a las instituciones que la formaron, y al tocar el link su perfil muestra tu logo."
          >
            <MuestraVistaPrevia />
          </PiezaMuestra>
          <PiezaMuestra
            titulo="La verificación"
            texto="Lo que ve un paciente al escanear el QR o escribir el código. Sin cuenta y gratis."
            donde="tu logo, tu nombre y tu ciudad, como quien emitió el certificado."
          >
            <MuestraVerificacion />
          </PiezaMuestra>
        </div>
        <p className="mt-8 max-w-3xl text-[0.9375rem] text-tinta-suave">
          También puede descargar una imagen para sus historias de Instagram, con el nombre de tu institución junto a sus cursos
          más recientes, e imprimir un QR para el consultorio que lleva a su perfil.
        </p>
        <div className="mt-6 flex gap-3 rounded-2xl border border-borde-suave bg-crema-claro p-5">
          <Icono nombre="info" className="mt-0.5 size-5 shrink-0 text-tierra" />
          <p>
            El sello verde va sólo en lo que emitió una institución. Lo que declara la profesional, como su profesión, su ciudad, su
            matrícula o su contacto, se ve sin sello. {MARCA.nombre} confirma quién emitió cada certificado; no habilita para ejercer:
            la matrícula la otorga cada jurisdicción.
          </p>
        </div>
        {demo && (
          <p className="mt-5">
            <Link href={`/p/${DEMO.slugValentina}`} className="inline-flex min-h-12 items-center font-semibold underline underline-offset-4">
              Ver el perfil completo de ejemplo
            </Link>
          </p>
        )}
      </section>

      {/* B5 · Cómo funciona */}
      <section id="como-funciona" aria-labelledby="titulo-como" className="mt-16 scroll-mt-6 sm:mt-24">
        <h2 id="titulo-como" className="text-[1.75rem] font-bold tracking-tight sm:text-[2rem]">
          Cómo funciona
        </h2>
        <p className="mt-2 max-w-2xl text-tinta-suave">
          Trabajás con la planilla de egresadas que ya tenés, desde el navegador y sin instalar nada. Vos emitís, tus egresadas
          comparten y sus pacientes verifican.
        </p>
        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-10">
          <div>
            <ol className="space-y-4">
              {PASOS.map((p, i) => (
                <li key={p.titulo} className="rounded-tarjeta border border-borde-suave bg-papel p-5 shadow-tarjeta sm:p-6">
                  <div className="flex items-center gap-3">
                    <span className="flex size-11 items-center justify-center rounded-full bg-crema text-tierra">
                      <Icono nombre={p.icono} className="size-6" />
                    </span>
                    <span className="text-[0.9375rem] font-semibold text-tinta-suave">Paso {i + 1}</span>
                  </div>
                  <h3 className="mt-4 text-[1.1875rem] font-bold">{p.titulo}</h3>
                  <p className="mt-1.5 text-tinta-suave">{p.texto}</p>
                </li>
              ))}
            </ol>
            <div className="mt-4 flex gap-3 rounded-tarjeta bg-crema-claro p-5 sm:p-6">
              <Icono nombre="edificio" className="mt-0.5 size-6 shrink-0 text-tierra" />
              <div>
                <h3 className="font-bold">Y vos seguís cada curso</h3>
                <p className="mt-1 text-tinta-suave">
                  En tu panel ves, curso por curso, quién activó su pasaporte y a quién no le pudimos mandar el mail. Le reenviás el
                  mail o le mandás su link personal por WhatsApp, sólo a ella. Entrás con un código que te mandamos por mail, sin
                  contraseña.
                </p>
              </div>
            </div>
          </div>
          <Captura
            src="/comercial/resumen-curso.webp"
            ancho={RESUMEN.ancho}
            alto={RESUMEN.alto}
            alt="Resumen de un curso en el panel de la institución: cantidad de egresadas, certificados emitidos y cuántas activaron su pasaporte, con los botones Cargar planilla y Ver certificado de muestra."
          />
        </div>
      </section>

      {/* B6 · Congresos y jornadas */}
      <section id="congresos" aria-labelledby="titulo-congresos" className="mt-16 scroll-mt-6 sm:mt-24">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-10">
          <div>
            <p className="inline-flex items-center rounded-full bg-tierra-claro px-3.5 py-1.5 text-[0.9375rem] font-semibold text-tierra-oscuro">
              Congresos y jornadas
            </p>
            <h2 id="titulo-congresos" className="mt-4 text-balance text-[1.75rem] font-bold tracking-tight sm:text-[2rem]">
              Un certificado para cada asistente, todos de una vez
            </h2>
            <p className="mt-3 text-tinta-suave">
              Cargás la lista de asistentes que ya tenés y emitís todos los certificados juntos. A cada asistente le mandamos un
              mail para que active su pasaporte y descargue su certificado en PDF, con su código y su QR. Y si publica su perfil, tu congreso queda
              ahí, con tu logo, mucho después de que termina.
            </p>
            <ul className="mt-5 space-y-2.5">
              {CONGRESOS.map((t) => (
                <li key={t} className="flex gap-3">
                  <Icono nombre="check" className="mt-0.5 size-5 shrink-0 text-tierra" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[0.9375rem] text-tinta-suave">
              Si van a ser muchas asistentes, contanos cuántas cuando nos escribas, así preparamos los envíos.
            </p>
            <div className="mt-6">
              <BotonLink href="/contacto?tipo=congreso" tamano="lg" className="w-full sm:w-auto">
                Sumar mi congreso o jornada
              </BotonLink>
            </div>
          </div>
          <Captura
            src="/comercial/emitir-congreso.webp"
            ancho={EMITIR.ancho}
            alto={EMITIR.alto}
            celular={{ src: '/comercial/emitir-congreso-celular.webp', ...EMITIR_CELULAR }}
            alt="Pantalla para emitir los certificados del Congreso Demo 2026: el título Emitir 5 certificados y lo que pasa al emitir. Cada asistente recibe su certificado con código y QR, le mandamos un mail para activar su pasaporte, y un certificado emitido no se edita."
          />
        </div>
      </section>

      {/* B7 · Preguntas frecuentes */}
      <section id="preguntas" aria-labelledby="titulo-preguntas" className="mt-16 scroll-mt-6 sm:mt-24">
        <h2 id="titulo-preguntas" className="text-[1.75rem] font-bold tracking-tight sm:text-[2rem]">
          Preguntas frecuentes
        </h2>
        <div className="mt-6 max-w-3xl">
          <PreguntasFrecuentes preguntas={PREGUNTAS} />
        </div>
      </section>

      {/* B8 · Cierre */}
      <section aria-labelledby="titulo-cierre" className="mt-16 rounded-tarjeta bg-crema-claro p-6 sm:mt-24 sm:p-10">
        <h2 id="titulo-cierre" className="max-w-2xl text-balance text-[1.75rem] font-bold tracking-tight sm:text-[2rem]">
          Que tus próximas egresadas salgan con su formación verificada
        </h2>
        <p className="mt-3 max-w-2xl text-tinta-suave">
          Estamos sumando institutos, escuelas, asociaciones y organizadores de congresos y jornadas de Neuquén y Río Negro. Contanos
          de tu institución y te escribimos para coordinar una reunión.
        </p>
        <div className="mt-6">
          <BotonSumar />
        </div>
        <p className="mt-5 text-[0.9375rem]">
          ¿Preferís escribirnos directo?{' '}
          <a href={`mailto:${MARCA.emailContacto}`} className="font-semibold underline underline-offset-4">
            {MARCA.emailContacto}
          </a>
        </p>
      </section>
    </main>
  );
}

// Tamaños de las capturas de public/comercial (para reservar el lugar antes de que carguen).
const RESUMEN = { ancho: 1056, alto: 642 };
const EMITIR = { ancho: 1440, alto: 882 };
const EMITIR_CELULAR = { ancho: 780, alto: 1088 };

function PiezaMuestra({
  titulo,
  texto,
  donde,
  children,
}: {
  titulo: string;
  texto: string;
  donde: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <h3 className="mb-3 text-[1.1875rem] font-bold">{titulo}</h3>
      <Muestra>{children}</Muestra>
      <p className="mt-3 text-tinta-suave">{texto}</p>
      <p className="mt-2 text-[0.9375rem]">
        <span className="font-semibold text-tierra-oscuro">Dónde aparecés:</span> {donde}
      </p>
    </div>
  );
}
