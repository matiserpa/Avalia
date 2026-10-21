import { MarcoPanel } from '@/components/layout/MarcoPanel';
import type { ItemNav } from '@/components/layout/NavPanel';
import { requerirProfesional } from '@/lib/auth/guardas';

const ITEMS: ItemNav[] = [
  { href: '/panel', texto: 'Pasaporte', icono: 'libro', exacto: true },
  { href: '/panel/perfil', texto: 'Perfil', icono: 'usuario' },
  { href: '/panel/compartir', texto: 'Compartir', icono: 'compartir' },
  { href: '/panel/cuenta', texto: 'Cuenta', icono: 'candado' },
];

// Cada página del panel vuelve a llamar a su guarda: el layout no se vuelve a ejecutar al navegar.
export default async function LayoutPanel({ children }: LayoutProps<'/panel'>) {
  await requerirProfesional();
  return (
    <MarcoPanel items={ITEMS} inicio="/panel">
      {children}
    </MarcoPanel>
  );
}
