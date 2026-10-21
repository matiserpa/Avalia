import { urlImagen } from '@/lib/imagenes-url';

// Logo de una institución emisora. Sin logo, un monograma con la inicial.
export function LogoInstitucion({
  logoId,
  nombre,
  tamano = 'md',
  className = '',
}: {
  logoId: string | null;
  nombre: string;
  tamano?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const t = { sm: 'size-9', md: 'size-12', lg: 'size-16' }[tamano];
  const url = urlImagen(logoId);
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt={`Logo de ${nombre}`} className={`${t} shrink-0 rounded-xl border border-borde-suave bg-white object-contain p-1 ${className}`} />
    );
  }
  return (
    <span
      role="img"
      aria-label={`Logo de ${nombre}`}
      className={`${t} flex shrink-0 items-center justify-center rounded-xl border border-borde-suave bg-crema-claro font-bold text-tierra-oscuro ${className}`}
    >
      {nombre.trim().charAt(0).toUpperCase()}
    </span>
  );
}
