import type { Metadata } from 'next';
import Link from 'next/link';
import { TituloPagina } from '@/components/layout/MarcoPanel';
import { BotonEnviar } from '@/components/ui/BotonEnviar';
import { Icono } from '@/components/ui/Icono';
import { requerirProfesional } from '@/lib/auth/guardas';
import { cambiarVisibilidadPerfil } from './acciones';
import { BorrarCuenta } from './BorrarCuenta';

export const metadata: Metadata = { title: 'Mi cuenta' };

export default async function Cuenta() {
  const s = await requerirProfesional();
  const publico = s.perfil.publico;
  return (
    <>
      <TituloPagina titulo="Mi cuenta" bajada={`Ingresás con ${s.usuario.email}. Sólo vos ves este mail.`} />

      <div className="space-y-6">
        <section aria-labelledby="visibilidad" className="rounded-tarjeta border border-borde-suave bg-papel p-5 shadow-tarjeta sm:p-6">
          <div className="flex items-start gap-3">
            <Icono nombre={publico ? 'mundo' : 'candado'} className="mt-0.5 size-6 shrink-0 text-tierra" />
            <div>
              <h2 id="visibilidad" className="text-[1.25rem] font-bold">
                {publico ? 'Tu perfil es público' : 'Tu perfil es privado'}
              </h2>
              <p className="mt-1 text-tinta-suave">
                {publico
                  ? 'Cualquiera con tu link lo ve. Si lo hacés privado, el link muestra "Este perfil no está disponible", igual que si no existiera.'
                  : 'Nadie lo ve. Tus certificados siguen verificando con su código y su QR.'}
              </p>
            </div>
          </div>
          <form action={cambiarVisibilidadPerfil} className="mt-5">
            <input type="hidden" name="publico" value={publico ? 'no' : 'si'} />
            <BotonEnviar variante={publico ? 'secundario' : 'primario'} icono={publico ? 'candado' : 'mundo'} textoEnviando="Guardando…">
              {publico ? 'Hacer privado mi perfil' : 'Publicar mi perfil'}
            </BotonEnviar>
          </form>
        </section>

        <section aria-labelledby="borrar" className="rounded-tarjeta border border-error/30 bg-papel p-5 shadow-tarjeta sm:p-6">
          <h2 id="borrar" className="text-[1.25rem] font-bold">
            Borrar mi cuenta
          </h2>
          <div className="mt-3 grid gap-4 text-[0.9375rem] sm:grid-cols-2">
            <div>
              <p className="font-semibold">Se borra</p>
              <ul className="mt-1.5 list-disc space-y-1 pl-5 text-tinta-suave">
                <li>Tu perfil, tu foto, tu contacto y tu matrícula.</li>
                <li>Tus sesiones y los registros de tus ingresos.</li>
                <li>Las métricas de tu perfil.</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold">Queda</p>
              <ul className="mt-1.5 list-disc space-y-1 pl-5 text-tinta-suave">
                <li>
                  Tus certificados, porque son registro de la institución que los emitió. Siguen verificando con su código,
                  pero ya no están en ninguna cuenta.
                </li>
              </ul>
            </div>
          </div>
          <p className="mb-5 mt-4 text-[0.9375rem] text-tinta-suave">
            Más detalles en la{' '}
            <Link href="/privacidad" className="font-semibold underline underline-offset-4">
              política de privacidad
            </Link>
            .
          </p>
          <BorrarCuenta />
        </section>
      </div>
    </>
  );
}
