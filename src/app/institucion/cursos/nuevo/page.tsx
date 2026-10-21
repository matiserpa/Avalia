import type { Metadata } from 'next';
import { TituloPagina } from '@/components/layout/MarcoPanel';
import { requerirInstitucion } from '@/lib/auth/guardas';
import { FormularioCurso } from './FormularioCurso';

export const metadata: Metadata = { title: 'Nuevo curso' };

export default async function NuevoCurso() {
  await requerirInstitucion();
  return (
    <div className="max-w-xl">
      <TituloPagina titulo="Nuevo curso" volver={{ href: '/institucion', texto: 'Cursos' }} />
      <FormularioCurso />
    </div>
  );
}
