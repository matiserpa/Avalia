'use server';

import { after } from 'next/server';
import { recibirConsulta, type ErroresConsulta } from '@/features/comercial/consultas';

// Formulario público: no hay sesión que pedir. La protección está en recibirConsulta (campo
// trampa, topes por mail y por hora, y en la demo no se guarda nada).
export type EstadoConsulta = {
  intento: number;
  enviada?: boolean;
  demo?: boolean;
  errores?: ErroresConsulta;
  error?: string;
  // Con error se devuelve lo escrito: React vacía el formulario al terminar la acción.
  valores?: Record<string, string>;
};

const CAMPOS = ['tipo', 'nombre', 'email', 'telefono', 'organizacion', 'ciudad', 'mensaje'] as const;

export async function enviarConsulta(prev: EstadoConsulta, fd: FormData): Promise<EstadoConsulta> {
  const valores = Object.fromEntries(CAMPOS.map((c) => [c, String(fd.get(c) ?? '')])) as Record<(typeof CAMPOS)[number], string>;
  const r = await recibirConsulta(
    { ...valores, acepto: fd.get('acepto') === 'si', trampa: String(fd.get('sitio') ?? '') },
    after,
  );
  const intento = prev.intento + 1;
  if (r.ok) return { intento, enviada: true, demo: r.demo };
  return 'errores' in r ? { intento, errores: r.errores, valores } : { intento, error: r.error, valores };
}
