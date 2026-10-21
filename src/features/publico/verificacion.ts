// Verificación pública de un certificado (/v/<código>). La ve cualquiera, sin cuenta.
//
// Muestra lo que la institución certificó: titular, curso, institución y fechas. Nunca el mail
// de la titular ni el motivo de una anulación (es interno de la institución).

import 'server-only';
import { cache } from 'react';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { certificados, cursos, instituciones, perfiles, type Canal, type TipoCurso } from '@/db/schema';
import { sesionActual } from '@/lib/auth/sesion';
import { normalizarCodigo } from '@/lib/certificados/codigo';
import { esRobot, registrarEvento } from '@/lib/eventos';

export type CertificadoVerificado = {
  id: string;
  codigo: string;
  estado: 'valido' | 'anulado';
  titularNombre: string;
  titularApellido: string;
  emitidoEn: Date;
  anuladoEn: Date | null;
  usuarioId: string | null;
  curso: { nombre: string; tipo: TipoCurso; cargaHoraria: number; fecha: string; docente: string | null };
  institucion: { id: string; nombre: string; ciudad: string | null; logoId: string | null };
  // El perfil de la titular, sólo si es público y ella no ocultó este certificado.
  perfil: { slug: string; nombre: string } | null;
};

export type ResultadoVerificacion =
  | { estado: 'no_encontrado'; codigo: string | null }
  | { estado: 'valido' | 'anulado'; certificado: CertificadoVerificado };

// cache(): la página y sus metadatos la llaman en el mismo pedido; consulta una sola vez.
export const verificarCodigo = cache(async (entrada: string): Promise<ResultadoVerificacion> => {
  const codigo = normalizarCodigo(entrada);
  if (!codigo) return { estado: 'no_encontrado', codigo: null };
  const [fila] = await db
    .select({
      cert: certificados,
      curso: {
        nombre: cursos.nombre,
        tipo: cursos.tipo,
        cargaHoraria: cursos.cargaHoraria,
        fecha: cursos.fecha,
        docente: cursos.docente,
      },
      inst: { id: instituciones.id, nombre: instituciones.nombre, ciudad: instituciones.ciudad, logoId: instituciones.logoId },
      perfil: { slug: perfiles.slug, nombre: perfiles.nombre, publico: perfiles.publico },
    })
    .from(certificados)
    .innerJoin(cursos, eq(cursos.id, certificados.cursoId))
    .innerJoin(instituciones, eq(instituciones.id, certificados.institucionId))
    .leftJoin(perfiles, eq(perfiles.usuarioId, certificados.usuarioId))
    .where(eq(certificados.codigo, codigo))
    .limit(1);
  if (!fila) return { estado: 'no_encontrado', codigo };

  const c = fila.cert;
  const muestraPerfil = c.estado === 'valido' && c.visibleEnPerfil && fila.perfil?.publico === true;
  return {
    estado: c.estado,
    certificado: {
      id: c.id,
      codigo: c.codigo,
      estado: c.estado,
      titularNombre: c.titularNombre,
      titularApellido: c.titularApellido,
      emitidoEn: c.emitidoEn,
      anuladoEn: c.anuladoEn,
      usuarioId: c.usuarioId,
      curso: fila.curso,
      institucion: fila.inst,
      perfil: muestraPerfil && fila.perfil ? { slug: fila.perfil.slug, nombre: fila.perfil.nombre } : null,
    },
  };
});

// Quién está mirando, en relación con el certificado. Las visitas de la titular, de la
// institución que lo emitió y de la administración no se cuentan en las métricas.
export type Mirada = 'titular' | 'institucion' | 'admin' | 'publico';

export async function quienMira(cert: Pick<CertificadoVerificado, 'usuarioId' | 'institucion'> | null): Promise<Mirada> {
  const s = await sesionActual();
  if (!s) return 'publico';
  if (s.esAdmin) return 'admin';
  if (cert && cert.usuarioId && s.usuario.id === cert.usuarioId) return 'titular';
  if (cert && s.usuario.institucionId === cert.institucion.id) return 'institucion';
  return 'publico';
}

export async function registrarVerificacion(r: ResultadoVerificacion, mirada: Mirada, canal: Canal): Promise<void> {
  if (mirada !== 'publico' || (await esRobot())) return;
  if (r.estado === 'no_encontrado') {
    await registrarEvento({ tipo: 'verificacion_fallida', canal });
    return;
  }
  await registrarEvento({
    tipo: 'verificacion',
    canal,
    certificadoId: r.certificado.id,
    institucionId: r.certificado.institucion.id,
  });
}
