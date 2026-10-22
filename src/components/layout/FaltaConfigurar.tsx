import type { Faltante } from '@/lib/config';
import { modoDemo, valorDemo } from '@/lib/config';
import { PaginaPublica } from './EncabezadoPublico';

// Pantalla que reemplaza a todas las páginas cuando al sitio publicado le falta configuración
// (ver faltaConfigurar en src/lib/config.ts). La lee quien lo está publicando: nombra las
// variables tal como aparecen en Vercel. Nunca muestra sus valores.

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
  const demo = valorDemo();
  return (
    <PaginaPublica ancho="angosto" mostrarVerificar={false}>
      <h1 className="mt-6 text-2xl font-bold sm:mt-12 sm:text-3xl">Falta terminar de configurar el sitio</h1>
      <p className="mt-3 text-tinta-suave">El sitio ya está publicado, pero todavía no puede funcionar.</p>
      <ul className="mt-6 space-y-4">
        {!modoDemo() && (
          <li className="rounded-tarjeta border border-borde bg-papel p-5">
            <p className="font-semibold">Para ver la demo</p>
            <ol className="mt-2 list-decimal space-y-1.5 pl-5">
              <li>
                En Vercel, entrá a Settings, Environment Variables, y agregá <Codigo>DEMO_MODE</Codigo> con el valor{' '}
                <Codigo>true</Codigo>, marcando Production.
              </li>
              <li>En Deployments, abrí el menú del último despliegue y tocá Redeploy.</li>
            </ol>
            <p className="mt-3 rounded-xl bg-crema-claro px-3 py-2 text-[0.9375rem]">
              {demo === null ? (
                <>Hoy a este despliegue no le llega ninguna variable DEMO_MODE. Si ya la cargaste, fijate que esté marcada para Production y que hayas vuelto a desplegar después.</>
              ) : (
                <>
                  Hoy DEMO_MODE llega con el valor <Codigo>{demo.slice(0, 30) || '(vacío)'}</Codigo>: tiene que decir{' '}
                  <Codigo>true</Codigo>.
                </>
              )}
            </p>
            <p className="mt-3">No hace falta nada más: la demo arma sola sus datos de prueba.</p>
          </li>
        )}
        {(falta.includes('base') || variables.length > 0) && (
          <li className="rounded-tarjeta border border-borde bg-papel p-5">
            <p className="font-semibold">Para el piloto, en cambio</p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              {falta.includes('base') && <li>Una base de datos: en Vercel, Storage, creá una base Neon y conectala al proyecto.</li>}
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
