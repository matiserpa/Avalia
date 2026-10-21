// Los certificados de la profesional, en su panel.

import 'server-only';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { certificados, cursos, instituciones, type TipoCurso } from '@/db/schema';

export type CertificadoPropio = {
  id: string;
  codigo: string;
  estado: 'valido' | 'anulado';
  visibleEnPerfil: boolean;
  anuladoEn: Date | null;
  curso: string;
  tipo: TipoCurso;
  cargaHoraria: number;
  fecha: string;
  institucion: string;
  institucionLogoId: string | null;
};

// Todos los certificados de su cuenta, también los ocultos y los anulados.
export async function certificadosPropios(usuarioId: string): Promise<CertificadoPropio[]> {
  return db
    .select({
      id: certificados.id,
      codigo: certificados.codigo,
      estado: certificados.estado,
      visibleEnPerfil: certificados.visibleEnPerfil,
      anuladoEn: certificados.anuladoEn,
      curso: cursos.nombre,
      tipo: cursos.tipo,
      cargaHoraria: cursos.cargaHoraria,
      fecha: cursos.fecha,
      institucion: instituciones.nombre,
      institucionLogoId: instituciones.logoId,
    })
    .from(certificados)
    .innerJoin(cursos, eq(cursos.id, certificados.cursoId))
    .innerJoin(instituciones, eq(instituciones.id, certificados.institucionId))
    .where(eq(certificados.usuarioId, usuarioId))
    .orderBy(desc(cursos.fecha), desc(certificados.emitidoEn));
}

// Mostrar u ocultar en el perfil. Sólo sobre sus propios certificados válidos.
// Ocultarlo no lo invalida: el código sigue verificando.
export async function cambiarVisibilidad(usuarioId: string, certificadoId: string, visible: boolean): Promise<boolean> {
  const r = await db
    .update(certificados)
    .set({ visibleEnPerfil: visible })
    .where(and(eq(certificados.id, certificadoId), eq(certificados.usuarioId, usuarioId), eq(certificados.estado, 'valido')))
    .returning({ id: certificados.id });
  return r.length > 0;
}
