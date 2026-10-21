import { iniciales } from '@/lib/texto';

// Foto de perfil o, si no hay, las iniciales sobre crema.
export function Avatar({
  fotoUrl,
  nombre,
  apellido,
  tamano = 'md',
  className = '',
}: {
  fotoUrl: string | null;
  nombre: string;
  apellido: string;
  tamano?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const t = { sm: 'size-10 text-sm', md: 'size-14 text-lg', lg: 'size-24 text-3xl', xl: 'size-32 text-4xl' }[tamano];
  if (fotoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={fotoUrl} alt="" className={`${t} shrink-0 rounded-full object-cover ${className}`} />;
  }
  return (
    <span
      aria-hidden="true"
      className={`${t} flex shrink-0 items-center justify-center rounded-full bg-crema font-bold text-tierra-oscuro ${className}`}
    >
      {iniciales({ nombre, apellido })}
    </span>
  );
}
