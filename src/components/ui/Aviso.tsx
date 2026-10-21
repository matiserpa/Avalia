// Mensajes en la página. 'error' se anuncia de inmediato al lector de pantalla (role=alert);
// el resto, cuando termina lo que se está leyendo (role=status).

import { Icono, type NombreIcono } from './Icono';

type Tono = 'info' | 'exito' | 'error' | 'atencion';

const ESTILOS: Record<Tono, { clase: string; icono: NombreIcono }> = {
  info: { clase: 'bg-crema-claro border-borde-suave text-tinta', icono: 'info' },
  exito: { clase: 'bg-verde-claro border-verde/30 text-verde-oscuro', icono: 'check-circulo' },
  error: { clase: 'bg-error-claro border-error/30 text-error', icono: 'alerta' },
  atencion: { clase: 'bg-tierra-claro border-tierra/30 text-tierra-oscuro', icono: 'info' },
};

export function Aviso({
  tono = 'info',
  titulo,
  children,
  className = '',
}: {
  tono?: Tono;
  titulo?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const e = ESTILOS[tono];
  return (
    <div role={tono === 'error' ? 'alert' : 'status'} className={`flex gap-3 rounded-2xl border p-4 ${e.clase} ${className}`}>
      <Icono nombre={e.icono} className="mt-0.5 size-5 shrink-0" />
      <div className="min-w-0 text-[0.9875rem] leading-relaxed">
        {titulo && <p className="font-bold">{titulo}</p>}
        {children && <div className={titulo ? 'mt-0.5' : ''}>{children}</div>}
      </div>
    </div>
  );
}
