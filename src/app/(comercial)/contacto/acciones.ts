'use server';

import { after } from 'next/server';
import type { TipoConsulta } from '@/db/schema';
import { recibirConsulta, type ErroresConsulta } from '@/features/comercial/consultas';
import { MARCA } from '@/config/marca';

// Formulario público: no hay sesión que pedir, como en /verificar. La protección está en
// recibirConsulta (campo trampa, topes por mail y por hora, y en la demo no se guarda nada).
export type EstadoConsulta = {
  intento: number;
  enviada?: boolean;
  demo?: boolean;
  // Para elegir el mensaje de éxito (a una profesional le decimos otra cosa).
  tipo?: TipoConsulta;
  errores?: ErroresConsulta;
  error?: string;
  // Con error se devuelve lo escrito: React vacía el formulario al terminar la acción.
  valores?: Record<string, string>;
};

const CAMPOS = ['tipo', 'nombre', 'email', 'telefono', 'organizacion', 'ciudad', 'mensaje', 'acepto'] as const;

export async function enviarConsulta(prev: EstadoConsulta, fd: FormData): Promise<EstadoConsulta> {
  const valores = Object.fromEntries(CAMPOS.map((c) => [c, String(fd.get(c) ?? '')])) as Record<(typeof CAMPOS)[number], string>;
  const intento = prev.intento + 1;
  try {
    const r = await recibirConsulta({ ...valores, acepto: valores.acepto === 'si', trampa: String(fd.get('sitio') ?? '') }, after);
    if (r.ok) return { intento, enviada: true, demo: r.demo, tipo: valores.tipo as TipoConsulta };
    return 'errores' in r ? { intento, errores: r.errores, valores } : { intento, error: r.error, valores };
  } catch (e) {
    console.error('No se pudo guardar una consulta.', e);
    return {
      intento,
      valores,
      error: `No pudimos enviar tu consulta. Probá de nuevo en un rato o escribinos a ${MARCA.emailContacto}. Lo que escribiste sigue acá.`,
    };
  }
}
