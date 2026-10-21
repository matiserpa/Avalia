// Métricas del piloto. Ver el comentario de la tabla `eventos` en src/db/schema.ts.

import 'server-only';
import { db } from '@/db';
import { CANALES, eventos, type Canal, type TipoEvento } from '@/db/schema';

export async function registrarEvento(e: {
  tipo: TipoEvento;
  canal?: Canal | null;
  perfilUsuarioId?: string | null;
  certificadoId?: string | null;
  institucionId?: string | null;
}): Promise<void> {
  try {
    await db.insert(eventos).values({
      tipo: e.tipo,
      canal: e.canal ?? null,
      perfilUsuarioId: e.perfilUsuarioId ?? null,
      certificadoId: e.certificadoId ?? null,
      institucionId: e.institucionId ?? null,
    });
  } catch (err) {
    // Una métrica que falla nunca rompe la página.
    console.error('No se pudo registrar el evento', e.tipo, err);
  }
}

// El ?c= de los links compartidos → canal. Cualquier otra cosa cuenta como 'directo'.
export function canalDesdeParametro(c: string | string[] | undefined): Canal {
  const v = Array.isArray(c) ? c[0] : c;
  return v && (CANALES as readonly string[]).includes(v) ? (v as Canal) : 'directo';
}
