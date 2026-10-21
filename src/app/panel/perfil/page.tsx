import type { Metadata } from 'next';
import { TituloPagina } from '@/components/layout/MarcoPanel';
import { FormularioPerfil } from '@/components/perfil/FormularioPerfil';
import { BotonLink } from '@/components/ui/Boton';
import { valoresDePerfil } from '@/features/profesional/perfil';
import { requerirProfesional } from '@/lib/auth/guardas';
import { urlImagen } from '@/lib/imagenes-url';
import { guardarPerfilPanel } from './acciones';

export const metadata: Metadata = { title: 'Mi perfil' };

export default async function EditarPerfil() {
  const s = await requerirProfesional();
  return (
    <>
      <TituloPagina
        titulo="Mi perfil"
        bajada="Lo que cargás acá lo declarás vos: se muestra sin sello. Tus certificados no se pueden editar porque los emite la institución."
        accion={
          <BotonLink href={s.perfil.publico ? `/p/${s.perfil.slug}` : '/bienvenida/listo'} variante="secundario" icono="ojo" prefetch={false}>
            {s.perfil.publico ? 'Ver mi perfil' : 'Ver cómo queda'}
          </BotonLink>
        }
      />
      <div className="max-w-lg">
        <FormularioPerfil
          accion={guardarPerfilPanel}
          iniciales={valoresDePerfil(s.perfil)}
          fotoUrl={urlImagen(s.perfil.fotoId)}
          textoBoton="Guardar cambios"
          textoOk="Listo, guardamos los cambios."
        />
      </div>
    </>
  );
}
