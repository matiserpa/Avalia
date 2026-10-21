import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TituloPagina } from '@/components/layout/MarcoPanel';
import { obtenerCurso } from '@/features/institucion/cursos';
import { requerirInstitucion } from '@/lib/auth/guardas';
import { CargaPlanilla } from './CargaPlanilla';

export const metadata: Metadata = { title: 'Cargar planilla' };

export default async function Cargar({ params }: PageProps<'/institucion/cursos/[id]/cargar'>) {
  const s = await requerirInstitucion();
  const { id } = await params;
  const curso = await obtenerCurso(s.institucionId, id);
  if (!curso) notFound();
  return (
    <div className="max-w-3xl">
      <TituloPagina titulo="Cargar egresadas" bajada={curso.nombre} volver={{ href: `/institucion/cursos/${id}`, texto: 'Volver al curso' }} />
      <CargaPlanilla cursoId={id} />
    </div>
  );
}
