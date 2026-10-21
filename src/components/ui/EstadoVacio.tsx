import { Icono, type NombreIcono } from './Icono';

export function EstadoVacio({
  icono = 'libro',
  titulo,
  children,
  accion,
  className = '',
}: {
  icono?: NombreIcono;
  titulo: string;
  children?: React.ReactNode;
  accion?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-tarjeta border border-dashed border-borde bg-papel/60 px-6 py-10 text-center ${className}`}>
      <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-crema text-tierra">
        <Icono nombre={icono} className="size-7" />
      </span>
      <h2 className="text-xl font-bold">{titulo}</h2>
      {children && <div className="mx-auto mt-2 max-w-md text-tinta-suave">{children}</div>}
      {accion && <div className="mt-6 flex justify-center">{accion}</div>}
    </div>
  );
}
