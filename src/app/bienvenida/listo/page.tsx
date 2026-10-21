import type { Metadata } from 'next';
import { PaginaPublica } from '@/components/layout/EncabezadoPublico';
import { VistaPerfil } from '@/components/perfil/VistaPerfil';
import { BotonLink } from '@/components/ui/Boton';
import { BotonEnviar } from '@/components/ui/BotonEnviar';
import { perfilDeUsuario } from '@/features/publico/perfil';
import { requerirProfesional } from '@/lib/auth/guardas';
import { publicar } from '../acciones';

export const metadata: Metadata = { title: 'Así se ve tu perfil' };

export default async function Listo() {
  const s = await requerirProfesional();
  const datos = (await perfilDeUsuario(s.usuario.id))!;
  const publico = datos.perfil.publico;

  const acciones = publico ? (
    <BotonLink href="/panel/compartir" tamano="lg" icono="compartir" anchoCompleto>
      Compartir mi perfil
    </BotonLink>
  ) : (
    <div className="flex flex-col gap-2 sm:grid sm:grid-cols-2">
      <form action={publicar}>
        <BotonEnviar tamano="lg" anchoCompleto icono="mundo" textoEnviando="Publicando…">
          Publicar mi perfil
        </BotonEnviar>
      </form>
      <BotonLink href="/panel" tamano="lg" variante="secundario">
        Seguir sin publicar
      </BotonLink>
    </div>
  );

  return (
    // En el celular, el espacio para la barra fija va después del pie, así no tapa sus links.
    <PaginaPublica ancho="ancho" mostrarVerificar={false} clasePie={publico ? 'pb-28 sm:pb-0' : 'pb-44 sm:pb-0'}>
      <div className="pt-4 sm:pt-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[0.9375rem] font-semibold text-tierra-oscuro">Paso 2 de 2</p>
            <h1 className="mt-1 text-[2rem] font-bold leading-tight tracking-tight">
              {publico ? 'Tu perfil ya es público' : 'Así se ve tu perfil'}
            </h1>
            <p className="mt-2 text-[1.0625rem] text-tinta-suave">
              {publico
                ? 'Cualquiera con tu link lo puede ver. Compartilo en redes, por WhatsApp o con el QR del consultorio.'
                : 'Cuando lo publiques, cualquiera con tu link lo va a poder ver. Tu mail nunca se muestra y podés volver a hacerlo privado cuando quieras.'}
            </p>
            <BotonLink href="/bienvenida" variante="fantasma" icono="editar" className="-ml-3 mt-2">
              Cambiar mis datos
            </BotonLink>
          </div>
          <div className="hidden w-full max-w-md sm:block">{acciones}</div>
        </div>

        <section aria-label="Vista previa de tu perfil" className="mt-8 rounded-tarjeta border-2 border-dashed border-borde-suave p-3 sm:p-6">
          <p className="mb-4 inline-flex rounded-full bg-crema px-3 py-1 text-[0.875rem] font-semibold">Vista previa</p>
          <VistaPerfil datos={datos} nivel={2} />
        </section>

        {/* En el celular, las acciones quedan abajo, al alcance del pulgar. */}
        <div data-barra-inferior={publico ? '' : 'doble'} className="fixed inset-x-0 bottom-0 z-30 border-t border-borde-suave bg-papel/95 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 backdrop-blur sm:hidden">
          {acciones}
        </div>
      </div>
    </PaginaPublica>
  );
}
