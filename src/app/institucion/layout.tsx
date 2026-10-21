import { MarcoPanel } from '@/components/layout/MarcoPanel';
import { obtenerInstitucion } from '@/features/institucion/cursos';
import { requerirInstitucion } from '@/lib/auth/guardas';

// Cada página vuelve a llamar a su guarda: el layout no se vuelve a ejecutar al navegar.
export default async function LayoutInstitucion({ children }: LayoutProps<'/institucion'>) {
  const s = await requerirInstitucion();
  const inst = await obtenerInstitucion(s.institucionId);
  return (
    <MarcoPanel items={[{ href: '/institucion', texto: 'Cursos', icono: 'libro' }]} inicio="/institucion" rotulo={inst?.nombre} ancho="ancho">
      {children}
    </MarcoPanel>
  );
}
