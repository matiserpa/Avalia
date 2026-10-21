import type { Metadata } from 'next';
import Link from 'next/link';
import { Completar, DocumentoLegal, Seccion } from '@/components/legal/DocumentoLegal';
import { MARCA } from '@/config/marca';

export const metadata: Metadata = { title: 'Política de privacidad' };

// BORRADOR (Ley 25.326). Revisar con un abogado antes del piloto con datos reales.
export default function Privacidad() {
  const n = MARCA.nombre;
  return (
    <DocumentoLegal titulo="Política de privacidad" bajada={`Qué datos usa ${n}, para qué y qué podés hacer con ellos.`}>
      <Seccion titulo="Quién es responsable de tus datos">
        <p>
          {n} es un servicio de {MARCA.responsable} <Completar>razón social, CUIT y domicilio</Completar>. Para cualquier
          consulta sobre tus datos escribinos a{' '}
          <a href={`mailto:${MARCA.emailContacto}`} className="font-semibold underline underline-offset-4">
            {MARCA.emailContacto}
          </a>
          .
        </p>
        <p>
          La base de datos está inscripta ante la Agencia de Acceso a la Información Pública con el número{' '}
          <Completar>número de inscripción</Completar>.
        </p>
      </Seccion>

      <Seccion titulo="Qué datos usamos">
        <p>Si sos profesional:</p>
        <ul>
          <li>
            Los datos de tus certificados que carga la institución que te formó: nombre, apellido, mail, curso y fechas.
          </li>
          <li>
            Lo que vos agregás a tu perfil, si querés: foto, profesión, ciudad, matrícula y un contacto (WhatsApp o
            Instagram).
          </li>
          <li>La fecha en que aceptaste estos textos y la versión que aceptaste.</li>
        </ul>
        <p>Si sos parte de una institución: tu mail, para ingresar al panel.</p>
        <p>
          Si visitás un perfil o verificás un certificado: no te pedimos ningún dato. Contamos cuántas visitas y
          verificaciones hubo y por qué medio llegaron (por ejemplo, un QR), sin guardar tu IP, tu navegador ni cookies de
          seguimiento.
        </p>
        <p>
          <strong>No pedimos ni guardamos DNI.</strong> Si la planilla de una institución lo trae, lo descartamos.
        </p>
      </Seccion>

      <Seccion titulo="Para qué los usamos">
        <ul>
          <li>Para emitir tus certificados y que cualquiera pueda verificarlos con su código o su QR.</li>
          <li>Para mostrar tu perfil, sólo si vos decidís publicarlo.</li>
          <li>Para mandarte los mails necesarios: el código para ingresar y los avisos de certificados nuevos.</li>
          <li>Para medir el piloto con números generales (cuántos perfiles se activan, se comparten y se verifican).</li>
        </ul>
        <p>No vendemos tus datos ni los usamos para publicidad.</p>
      </Seccion>

      <Seccion titulo="Qué es público y qué no">
        <p>
          <strong>Tu perfil arranca privado.</strong> Si lo publicás, cualquiera con el link ve tu nombre, tu foto, tu
          profesión, tu ciudad, tu contacto y los certificados que no ocultaste. La matrícula aparece sólo si elegís
          mostrarla.
        </p>
        <p>
          La verificación de un certificado muestra el nombre de la titular, el curso, la institución y las fechas a quien
          tenga el código o el QR, aunque todavía no hayas activado tu cuenta. Es la función del certificado.
        </p>
        <p>
          <strong>Nunca mostramos tu mail.</strong> Los perfiles y las verificaciones no aparecen en buscadores: se
          comparten por link.
        </p>
        <p>
          Si compartís tu link en redes o por WhatsApp, esas aplicaciones pueden guardar una vista previa con tu nombre y
          tu foto, según sus propias reglas.
        </p>
      </Seccion>

      <Seccion titulo="Quién más accede a tus datos">
        <ul>
          <li>La institución que te emitió un certificado ve si activaste tu pasaporte.</li>
          <li>
            Los proveedores que usamos para funcionar: alojamiento del sitio, base de datos y envío de mails{' '}
            <Completar>nombres de los proveedores y países donde guardan los datos</Completar>.
          </li>
        </ul>
        <p>
          Algunos de esos proveedores pueden estar fuera de la Argentina. <Completar>garantías para la transferencia internacional</Completar>
        </p>
      </Seccion>

      <Seccion titulo="Cookies">
        <p>
          Usamos una sola cookie, necesaria para mantener tu sesión iniciada. No usamos cookies de publicidad ni de
          seguimiento.
        </p>
      </Seccion>

      <Seccion titulo="Tus derechos">
        <p>Podés pedirnos ver, corregir o borrar tus datos en cualquier momento:</p>
        <ul>
          <li>Desde tu panel editás tu perfil y elegís si es público o privado.</li>
          <li>
            Desde <Link href="/panel/cuenta" className="font-semibold underline underline-offset-4">tu cuenta</Link> la
            borrás cuando quieras.
          </li>
          <li>O escribinos a {MARCA.emailContacto}.</li>
        </ul>
        <p>
          Respondemos los pedidos de acceso dentro de los 10 días corridos y los de corrección o supresión dentro de los 5
          días hábiles.
        </p>
        <p className="rounded-2xl border border-borde-suave bg-papel p-4 text-[0.9375rem]">
          El titular de los datos personales tiene la facultad de ejercer el derecho de acceso a los mismos en forma
          gratuita a intervalos no inferiores a seis meses, salvo que se acredite un interés legítimo al efecto conforme lo
          establecido en el artículo 14, inciso 3 de la Ley N° 25.326. La Agencia de Acceso a la Información Pública, en su
          carácter de Órgano de Control de la Ley N° 25.326, tiene la atribución de atender las denuncias y reclamos que
          interpongan quienes resulten afectados en sus derechos por incumplimiento de las normas vigentes en materia de
          protección de datos personales.
        </p>
      </Seccion>

      <Seccion titulo="Qué pasa si borrás tu cuenta">
        <p>
          Borramos tu perfil, tu foto, tu contacto, tu matrícula, tus sesiones y las métricas de tu perfil. Los
          certificados quedan como registro de la institución que los emitió, desvinculados de tu cuenta, y siguen
          verificando. <Completar>validar con el abogado</Completar>
        </p>
      </Seccion>

      <Seccion titulo="Cuánto tiempo guardamos los datos">
        <p>
          Mientras tengas tu cuenta y dure el piloto. <Completar>plazo de conservación al terminar el piloto</Completar>
        </p>
      </Seccion>

      <Seccion titulo="Cambios en esta política">
        <p>
          Si la cambiamos, te avisamos por mail y te pedimos que la aceptes de nuevo antes de seguir usando tu pasaporte.
        </p>
      </Seccion>
    </DocumentoLegal>
  );
}
