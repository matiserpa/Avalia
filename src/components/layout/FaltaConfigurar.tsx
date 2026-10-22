import type { Faltante } from '@/lib/config';
import { modoDemo } from '@/lib/config';
import { PaginaPublica } from './EncabezadoPublico';

// Pantalla que reemplaza a todas las páginas cuando al sitio publicado le falta configuración
// (ver faltaConfigurar en src/lib/config.ts). La lee quien lo está publicando: nombra las
// variables tal como aparecen en Vercel. Nunca muestra sus valores.

const VARIABLES: Partial<Record<Faltante, React.ReactNode>> = {
  APP_URL: (
    <>
      <Codigo>APP_URL</Codigo>: la dirección pública del sitio, por ejemplo https://avalia.com.ar.
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
  return (
    <PaginaPublica ancho="angosto" mostrarVerificar={false}>
      <h1 className="mt-6 text-2xl font-bold sm:mt-12 sm:text-3xl">Falta terminar de configurar el sitio</h1>
      <p className="mt-3 text-tinta-suave">El sitio ya está publicado, pero todavía no puede funcionar. Falta esto:</p>
      <ul className="mt-6 space-y-4">
        {falta.includes('base') && (
          <li className="rounded-tarjeta border border-borde bg-papel p-5">
            <p className="font-semibold">Una base de datos</p>
            <p className="mt-1">En el proyecto de Vercel, entrá a Storage, creá una base Neon y conectala al proyecto.</p>
          </li>
        )}
        {variables.length > 0 && !modoDemo() && (
          <li className="rounded-tarjeta border border-borde bg-papel p-5">
            <p className="font-semibold">Si es la demo</p>
            <p className="mt-1">
              Agregá la variable <Codigo>DEMO_MODE</Codigo> con el valor <Codigo>true</Codigo>, en Settings, Environment
              Variables. Con eso alcanza: lo que sigue es para el piloto.
            </p>
          </li>
        )}
        {variables.length > 0 && (
          <li className="rounded-tarjeta border border-borde bg-papel p-5">
            <p className="font-semibold">Si es el piloto, estas variables</p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
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
