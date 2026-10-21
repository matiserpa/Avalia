import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PaginaPublica } from '@/components/layout/EncabezadoPublico';
import { VistaPerfil } from '@/components/perfil/VistaPerfil';
import { Aviso } from '@/components/ui/Aviso';
import { BotonLink } from '@/components/ui/Boton';
import { institucionesDe, perfilPorSlug } from '@/features/publico/perfil';
import { sesionActual } from '@/lib/auth/sesion';
import { canalDesdeParametro, esRobot, registrarEvento } from '@/lib/eventos';
import { cantidad, listaConY, nombreCompleto } from '@/lib/texto';

// Si el perfil es privado o no existe, la respuesta es la misma (incluidos los metadatos): nadie
// puede averiguar si una persona tiene cuenta.
export async function generateMetadata({ params }: PageProps<'/p/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const datos = await perfilPorSlug(slug);
  if (!datos?.perfil.publico) return { title: 'Perfil no disponible' };
  const { perfil, certificados } = datos;
  const title = [nombreCompleto(perfil), perfil.profesion].filter(Boolean).join(' · ');
  const description =
    certificados.length > 0
      ? `${cantidad(certificados.length, 'certificado verificado', 'certificados verificados')}, emitidos por ${listaConY(institucionesDe(certificados))}.`
      : 'Perfil profesional con formación verificada.';
  return { title, description, openGraph: { title, description, type: 'profile' } };
}

export default async function PaginaPerfil({ params, searchParams }: PageProps<'/p/[slug]'>) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const datos = await perfilPorSlug(slug);
  const s = await sesionActual();
  const esDuena = Boolean(datos && s?.usuario.id === datos.perfil.usuarioId);
  if (!datos || (!datos.perfil.publico && !esDuena)) notFound();

  if (!esDuena && !s?.esAdmin && !(await esRobot())) {
    await registrarEvento({ tipo: 'perfil_visita', canal: canalDesdeParametro(sp.c), perfilUsuarioId: datos.perfil.usuarioId });
  }

  return (
    <PaginaPublica ancho="ancho">
      {esDuena && (
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Aviso tono={datos.perfil.publico ? 'info' : 'atencion'} className="flex-1">
            {datos.perfil.publico
              ? 'Así ven tu perfil. Tus propias visitas no se cuentan.'
              : 'Tu perfil es privado: sólo lo ves vos. Nadie más puede abrir este link hasta que lo publiques.'}
          </Aviso>
          <BotonLink href="/panel" variante="secundario" icono="flecha-izq">
            Volver a mi panel
          </BotonLink>
        </div>
      )}
      <div className="pt-2 sm:pt-4">
        <VistaPerfil datos={datos} />
      </div>
    </PaginaPublica>
  );
}
