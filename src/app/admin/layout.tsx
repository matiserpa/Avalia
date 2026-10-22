import { MarcoPanel } from '@/components/layout/MarcoPanel';
import type { ItemNav } from '@/components/layout/NavPanel';
import { requerirAdmin } from '@/lib/auth/guardas';

const ITEMS: ItemNav[] = [
  { href: '/admin', texto: 'Instituciones', icono: 'edificio', exacto: true },
  { href: '/admin/metricas', texto: 'Métricas', icono: 'grafico' },
  { href: '/admin/consultas', texto: 'Consultas', icono: 'mail' },
];

// Cada página vuelve a llamar a su guarda: el layout no se vuelve a ejecutar al navegar.
export default async function LayoutAdmin({ children }: LayoutProps<'/admin'>) {
  await requerirAdmin();
  return (
    <MarcoPanel items={ITEMS} inicio="/admin" rotulo="Administración del piloto" ancho="ancho">
      {children}
    </MarcoPanel>
  );
}
