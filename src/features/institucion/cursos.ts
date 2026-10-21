// Cursos y egresadas de una institución. TODA consulta filtra por el institucionId de la sesión,
// que llega como primer parámetro: nunca por uno que venga de un formulario.

import 'server-only';
import { and, asc, desc, eq, sql } from 'drizzle-orm';
import { db } from '@/db';
import { certificados, cursos, egresadas, instituciones, tipoCurso, type Curso, type TipoCurso } from '@/db/schema';

export async function obtenerInstitucion(institucionId: string) {
  const [i] = await db.select().from(instituciones).where(eq(instituciones.id, institucionId)).limit(1);
  return i ?? null;
}

export type ResumenCurso = Curso & { egresadas: number; emitidos: number; activados: number; sinEmitir: number };

export async function listarCursos(institucionId: string): Promise<ResumenCurso[]> {
  const filas = await db
    .select({
      curso: cursos,
      egresadas: sql<number>`(select count(*)::int from ${egresadas} e where e.curso_id = ${cursos.id})`,
      emitidos: sql<number>`(select count(*)::int from ${certificados} c where c.curso_id = ${cursos.id} and c.estado = 'valido')`,
      activados: sql<number>`(select count(*)::int from ${certificados} c where c.curso_id = ${cursos.id} and c.estado = 'valido' and c.usuario_id is not null)`,
    })
    .from(cursos)
    .where(eq(cursos.institucionId, institucionId))
    .orderBy(desc(cursos.fecha), desc(cursos.creadoEn));
  return filas.map((f) => ({
    ...f.curso,
    egresadas: Number(f.egresadas),
    emitidos: Number(f.emitidos),
    activados: Number(f.activados),
    sinEmitir: Number(f.egresadas) - Number(f.emitidos),
  }));
}

export async function obtenerCurso(institucionId: string, cursoId: string): Promise<Curso | null> {
  if (!/^[0-9a-f-]{36}$/i.test(cursoId)) return null;
  const [c] = await db
    .select()
    .from(cursos)
    .where(and(eq(cursos.id, cursoId), eq(cursos.institucionId, institucionId)))
    .limit(1);
  return c ?? null;
}

// ---------- alta de curso ----------

export type CamposCurso = { nombre: string; tipo: string; cargaHoraria: string; fecha: string; docente: string };
export type ErroresCurso = Partial<Record<keyof CamposCurso, string>>;

export function validarCurso(c: CamposCurso): { errores: ErroresCurso; datos?: Omit<typeof cursos.$inferInsert, 'institucionId'> } {
  const errores: ErroresCurso = {};
  const nombre = c.nombre.trim().replace(/\s+/g, ' ').slice(0, 160);
  if (!nombre) errores.nombre = 'Escribí el nombre del curso, como figura en el certificado.';
  const tipo = (tipoCurso.enumValues as readonly string[]).includes(c.tipo) ? (c.tipo as TipoCurso) : null;
  if (!tipo) errores.tipo = 'Elegí el tipo de curso.';
  const horas = Number(c.cargaHoraria.replace(',', '.').trim());
  if (!c.cargaHoraria.trim() || !Number.isFinite(horas) || horas <= 0 || horas > 5000) {
    errores.cargaHoraria = 'Escribí la carga horaria en horas, por ejemplo 16 o 2,5.';
  }
  const fecha = /^\d{4}-\d{2}-\d{2}$/.test(c.fecha) ? c.fecha : '';
  const anio = Number(fecha.slice(0, 4));
  const limite = new Date();
  limite.setFullYear(limite.getFullYear() + 1);
  if (!fecha || Number.isNaN(Date.parse(fecha)) || anio < 1980 || new Date(fecha) > limite) {
    errores.fecha = 'Elegí la fecha en que se realizó o terminó el curso.';
  }
  if (Object.keys(errores).length > 0) return { errores };
  return {
    errores,
    datos: {
      nombre,
      tipo: tipo!,
      cargaHoraria: Math.round(horas * 10) / 10,
      fecha,
      docente: c.docente.trim().replace(/\s+/g, ' ').slice(0, 200) || null,
    },
  };
}

export async function crearCurso(institucionId: string, c: CamposCurso): Promise<{ ok: true; id: string } | { ok: false; errores: ErroresCurso }> {
  const { errores, datos } = validarCurso(c);
  if (!datos) return { ok: false, errores };
  const [nuevo] = await db
    .insert(cursos)
    .values({ ...datos, institucionId })
    .returning({ id: cursos.id });
  return { ok: true, id: nuevo.id };
}

// ---------- egresadas y el estado de su certificado ----------

export type EstadoEgresada = 'sin_emitir' | 'emitido' | 'error_mail' | 'activado';

export type EgresadaConEstado = {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  estado: EstadoEgresada;
  // El certificado válido, si tiene.
  certificado: { id: string; codigo: string; emitidoEn: Date; mailEnviadoEn: Date | null; mailError: string | null; activadoEn: Date | null } | null;
  anulados: { id: string; codigo: string; anuladoEn: Date | null; motivo: string | null }[];
};

export async function egresadasDelCurso(institucionId: string, cursoId: string): Promise<EgresadaConEstado[]> {
  const curso = await obtenerCurso(institucionId, cursoId);
  if (!curso) return [];
  const lista = await db.select().from(egresadas).where(eq(egresadas.cursoId, cursoId)).orderBy(asc(egresadas.apellido), asc(egresadas.nombre));
  const certs = await db
    .select()
    .from(certificados)
    .where(and(eq(certificados.cursoId, cursoId), eq(certificados.institucionId, institucionId)))
    .orderBy(desc(certificados.emitidoEn));
  return lista.map((e) => {
    const propios = certs.filter((c) => c.egresadaId === e.id);
    const valido = propios.find((c) => c.estado === 'valido') ?? null;
    const estado: EstadoEgresada = !valido ? 'sin_emitir' : valido.usuarioId ? 'activado' : valido.mailError ? 'error_mail' : 'emitido';
    return {
      id: e.id,
      nombre: e.nombre,
      apellido: e.apellido,
      email: e.email,
      estado,
      certificado: valido && {
        id: valido.id,
        codigo: valido.codigo,
        emitidoEn: valido.emitidoEn,
        mailEnviadoEn: valido.mailEnviadoEn,
        mailError: valido.mailError,
        activadoEn: valido.activadoEn,
      },
      anulados: propios
        .filter((c) => c.estado === 'anulado')
        .map((c) => ({ id: c.id, codigo: c.codigo, anuladoEn: c.anuladoEn, motivo: c.motivoAnulacion })),
    };
  });
}
