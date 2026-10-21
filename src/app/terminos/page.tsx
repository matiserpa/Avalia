import type { Metadata } from 'next';
import Link from 'next/link';
import { Completar, DocumentoLegal, Seccion } from '@/components/legal/DocumentoLegal';
import { MARCA } from '@/config/marca';

export const metadata: Metadata = { title: 'Términos y condiciones' };

// BORRADOR. Revisar con un abogado antes del piloto con datos reales.
export default function Terminos() {
  const n = MARCA.nombre;
  return (
    <DocumentoLegal titulo="Términos y condiciones" bajada={`Las reglas para usar ${n}, en palabras simples.`}>
      <Seccion titulo={`Qué es ${n}`}>
        <p>
          {n} es un servicio de {MARCA.responsable} <Completar>razón social, CUIT y domicilio</Completar> que permite a
          instituciones de formación emitir certificados verificables, a cada profesional reunir su formación en un perfil, y
          a cualquier persona verificar un certificado con su código o su QR.
        </p>
        <p>
          Hoy funciona como <strong>piloto</strong>, con un grupo reducido de instituciones de la Patagonia. Durante el
          piloto, usar {n} no tiene costo para las profesionales. <Completar>condiciones para las instituciones</Completar>
        </p>
      </Seccion>

      <Seccion titulo="Qué verifica y qué no">
        <ul>
          <li>
            Un certificado con sello verde confirma que la institución que figura lo emitió, a nombre de quien figura, para
            ese curso y en esa fecha.
          </li>
          <li>
            {n} <strong>no reemplaza la matrícula profesional</strong>, no habilita para ejercer y no evalúa la calidad de la
            formación ni de los tratamientos.
          </li>
          <li>
            La profesión, la ciudad, la matrícula y el contacto que aparecen en un perfil los declara cada profesional, y se
            muestran sin sello.
          </li>
        </ul>
      </Seccion>

      <Seccion titulo="Responsabilidades de cada parte">
        <ul>
          <li>Cada institución es responsable de que los certificados que emite sean correctos.</li>
          <li>Cada profesional es responsable de que los datos que declara en su perfil sean ciertos.</li>
          <li>
            {MARCA.responsable} es responsable de que la verificación muestre fielmente lo que la institución emitió.
          </li>
        </ul>
        <p>
          Si un certificado tiene un error, la institución lo anula y emite uno nuevo. Un certificado anulado deja de ser
          válido y así lo muestra su verificación.
        </p>
      </Seccion>

      <Seccion titulo="Tu cuenta">
        <ul>
          <li>No hay contraseña: ingresás con un código que te mandamos al mail. Cuidá el acceso a tu mail.</li>
          <li>Tu perfil arranca privado. Publicarlo, ocultarlo o borrar tu cuenta depende sólo de vos.</li>
          <li>Ocultar un certificado de tu perfil no lo invalida: su código sigue verificando.</li>
        </ul>
      </Seccion>

      <Seccion titulo="Uso correcto">
        <p>No está permitido:</p>
        <ul>
          <li>Hacerse pasar por otra persona o institución.</li>
          <li>Declarar en el perfil datos falsos, como una matrícula que no es tuya.</li>
          <li>Usar el servicio para fines distintos de mostrar y verificar formación.</li>
        </ul>
        <p>Si pasa, podemos ocultar el perfil o suspender la cuenta.</p>
      </Seccion>

      <Seccion titulo="Disponibilidad">
        <p>
          Al ser un piloto, el servicio puede cambiar o interrumpirse. Si decidimos terminarlo, te avisamos con anticipación
          para que descargues tus certificados. <Completar>plazo de aviso</Completar>
        </p>
      </Seccion>

      <Seccion titulo="Privacidad">
        <p>
          Cómo usamos tus datos está en la{' '}
          <Link href="/privacidad" className="font-semibold underline underline-offset-4">
            política de privacidad
          </Link>
          .
        </p>
      </Seccion>

      <Seccion titulo="Ley aplicable">
        <p>
          Se aplican las leyes de la República Argentina. <Completar>jurisdicción</Completar>
        </p>
      </Seccion>
    </DocumentoLegal>
  );
}
