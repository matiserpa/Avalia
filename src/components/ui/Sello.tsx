// Sellos y etiquetas de estado. El verde se reserva para lo que verificamos (certificados
// emitidos por una institución). Nunca para datos que declara la profesional.

import { Icono, type NombreIcono } from './Icono';

type Tono = 'verde' | 'tierra' | 'neutro' | 'error' | 'tinta';

const TONOS: Record<Tono, string> = {
  verde: 'bg-verde-claro text-verde-oscuro',
  tierra: 'bg-tierra-claro text-tierra-oscuro',
  neutro: 'bg-crema text-tinta',
  error: 'bg-error-claro text-error',
  tinta: 'bg-tinta text-marfil',
};

export function Etiqueta({
  tono = 'neutro',
  icono,
  children,
  className = '',
}: {
  tono?: Tono;
  icono?: NombreIcono;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.875rem] font-semibold leading-tight ${TONOS[tono]} ${className}`}
    >
      {icono && <Icono nombre={icono} className="size-4" />}
      {children}
    </span>
  );
}

export function SelloVerificado({ texto = 'Verificado', className = '' }: { texto?: string; className?: string }) {
  return (
    <Etiqueta tono="verde" icono="check-circulo" className={className}>
      {texto}
    </Etiqueta>
  );
}
