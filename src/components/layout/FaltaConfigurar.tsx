import type { Faltante } from '@/lib/config';
import { valorDemo } from '@/lib/config';
import { PaginaPublica } from './EncabezadoPublico';

// Pantalla que reemplaza a todas las páginas cuando al sitio publicado le falta configuración
// (ver faltaConfigurar en src/lib/config.ts). La lee quien lo está publicando: nombra las
// variables tal como aparecen en Vercel. No muestra sus valores, salvo el de DEMO_MODE, que no es
// secreto.

const VARIABLES: Partial<Record<Faltante, React.ReactNode>> = {
  APP_URL: (
    <>
      <Codigo>APP_URL</Codigo>: la dirección pública del sitio, por ejemplo https://avalya.com.ar.
    </>
  ),
  AUTH_SECRET: (
    <>
      <Codigo>AUTH_SECRET</Codigo>: una clave secreta de 32 caracteres o más.
    </>
  ),
  MAIL_MODE: (
    <>
      <Codigo>MAIL_MODE</Codigo> con el valor <Codigo>resend</Codigo>, para que los mails salgan de verdad.
    </>
  ),
  RESEND_API_KEY: (
    <>
      <Codigo>RESEND_API_KEY</Codigo>: la clave de Resend, el servicio que manda los mails.
    </>
  ),
};

function Codigo({ children }: { children: React.ReactNode }) {
  return <code className="rounded bg-crema px-1.5 py-0.5 text-[0.9375rem] break-all">{children}</code>;
}

export function FaltaConfigurar({ falta }: { falta: Faltante[] }) {
  const variables = falta.filter((f) => f in VARIABLES);
  // Sin base, el sitio publicado sólo deja de ser demo si DEMO_MODE la apaga a propósito (ver
  // modoDemo en src/lib/config.ts). Con una base conectada no se ofrece la demo: podría tener
  // datos reales, y en la demo cualquiera entra como cualquiera.
  const sinBase = falta.includes('base');
  return (
    <PaginaPublica ancho="angosto" mostrarVerificar={false}>
      <h1 className="mt-6 text-2xl font-bold sm:mt-12 sm:text-3xl">Falta terminar de configurar el sitio</h1>
      <p className="mt-3 text-tinta-suave">El sitio ya está publicado, pero todavía no puede funcionar.</p>
      <ul className="mt-6 space-y-4">
        {sinBase && (
          <li className="rounded-tarjeta border border-borde bg-papel p-5">
            <p className="font-semibold">Para ver la demo</p>
            <p className="mt-2">
              Hoy la variable <Codigo>DEMO_MODE</Codigo> dice <Codigo>{valorDemo() || '(vacío)'}</Codigo>, y eso apaga la demo.
            </p>
            <ol className="mt-2 list-decimal space-y-1.5 pl-5">
              <li>En Vercel, entrá a Settings, Environment Variables, y borrá DEMO_MODE o cambiale el valor a true.</li>
              <li>En Deployments, abrí el menú del último despliegue y tocá Redeploy.</li>
            </ol>
            <p className="mt-3">No hace falta nada más: la demo arma sola sus datos de prueba.</p>
          </li>
        )}
        {(sinBase || variables.length > 0) && (
          <li className="rounded-tarjeta border border-borde bg-papel p-5">
            <p className="font-semibold">{sinBase ? 'Para el piloto, en cambio' : 'Para el piloto'}</p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              {sinBase && <li>Una base de datos: en Vercel, Storage, creá una base Neon y conectala al proyecto.</li>}
              {variables.map((v) => (
                <li key={v}>{VARIABLES[v]}</li>
              ))}
            </ul>
          </li>
        )}
      </ul>
      <p className="mt-6">
        Después de cada cambio, volvé a desplegar el sitio: en Vercel, Deployments, el menú del último despliegue y
        Redeploy. Todos los pasos están en <Codigo>docs/despliegue.md</Codigo>, en el repositorio.
      </p>
    </PaginaPublica>
  );
}
