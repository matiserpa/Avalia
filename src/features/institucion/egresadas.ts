// Carga y corrección de egresadas. Una egresada con un certificado válido no se edita: si hay un
// error, se anula el certificado (vuelve a "sin emitir"), se corrige y se emite otro.

import 'server-only';
import { and, eq, inArray } from 'drizzle-orm';
import { db } from '@/db';
import { certificados, egresadas } from '@/db/schema';
import { capitalizarNombre, emailValido, normalizarEmail } from '@/lib/texto';
import { obtenerCurso } from './cursos';
import type { FilaPlanilla } from './planilla';

export type CamposEgresada = { nombre: string; apellido: string; email: string };
export type ErroresEgresada = Partial<Record<keyof CamposEgresada, string>>;

function validar(c: CamposEgresada): { errores: ErroresEgresada; datos: CamposEgresada } {
  const datos = {
    nombre: capitalizarNombre(c.nombre).slice(0, 80),
    apellido: capitalizarNombre(c.apellido).slice(0, 80),
    email: normalizarEmail(c.email),
  };
  const errores: ErroresEgresada = {};
  if (!datos.nombre) errores.nombre = 'Escribí el nombre.';
  if (!datos.apellido) errores.apellido = 'Escribí el apellido.';
  if (!emailValido(datos.email)) errores.email = 'Revisá el mail: tiene que ser del tipo nombre@ejemplo.com.';
  return { errores, datos };
}

async function mailYaCargado(cursoId: string, email: string, salvoId?: string) {
  const [otra] = await db
    .select({ id: egresadas.id })
    .from(egresadas)
    .where(and(eq(egresadas.cursoId, cursoId), eq(egresadas.email, email)))
    .limit(1);
  return Boolean(otra && otra.id !== salvoId);
}

export async function agregarEgresada(
  institucionId: string,
  cursoId: string,
  c: CamposEgresada,
): Promise<{ ok: true } | { ok: false; errores: ErroresEgresada }> {
  if (!(await obtenerCurso(institucionId, cursoId))) return { ok: false, errores: { nombre: 'No encontramos el curso.' } };
  const { errores, datos } = validar(c);
  if (Object.keys(errores).length > 0) return { ok: false, errores };
  if (await mailYaCargado(cursoId, datos.email)) return { ok: false, errores: { email: 'Ya hay una egresada con ese mail en este curso.' } };
  await db.insert(egresadas).values({ cursoId, ...datos });
  return { ok: true };
}

// La egresada, si es de un curso de esta institución.
async function egresadaPropia(institucionId: string, egresadaId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(egresadaId)) return null;
  const [e] = await db.select().from(egresadas).where(eq(egresadas.id, egresadaId)).limit(1);
  if (!e || !(await obtenerCurso(institucionId, e.cursoId))) return null;
  return e;
}

async function tieneCertificadoValido(egresadaId: string) {
  const [c] = await db
    .select({ id: certificados.id })
    .from(certificados)
    .where(and(eq(certificados.egresadaId, egresadaId), eq(certificados.estado, 'valido')))
    .limit(1);
  return Boolean(c);
}

export async function editarEgresada(
  institucionId: string,
  egresadaId: string,
  c: CamposEgresada,
): Promise<{ ok: true } | { ok: false; errores: ErroresEgresada }> {
  const e = await egresadaPropia(institucionId, egresadaId);
  if (!e) return { ok: false, errores: { nombre: 'No encontramos a esa egresada.' } };
  if (await tieneCertificadoValido(e.id)) {
    return { ok: false, errores: { nombre: 'Ya tiene un certificado emitido. Para corregir sus datos, primero anulalo.' } };
  }
  const { errores, datos } = validar(c);
  if (Object.keys(errores).length > 0) return { ok: false, errores };
  if (await mailYaCargado(e.cursoId, datos.email, e.id)) return { ok: false, errores: { email: 'Ya hay una egresada con ese mail en este curso.' } };
  await db.update(egresadas).set(datos).where(eq(egresadas.id, e.id));
  return { ok: true };
}

// Sólo se quita si nunca se le emitió nada (los certificados, incluso anulados, son historial).
export async function quitarEgresada(institucionId: string, egresadaId: string): Promise<{ ok: boolean; error?: string }> {
  const e = await egresadaPropia(institucionId, egresadaId);
  if (!e) return { ok: false, error: 'No encontramos a esa egresada.' };
  const [c] = await db.select({ id: certificados.id }).from(certificados).where(eq(certificados.egresadaId, e.id)).limit(1);
  if (c) return { ok: false, error: 'Tiene certificados emitidos: no se puede quitar.' };
  await db.delete(egresadas).where(eq(egresadas.id, e.id));
  return { ok: true };
}

// Revisión de la planilla contra lo que ya está cargado: marca las que ya estaban en el curso.
export async function revisarFilas(institucionId: string, cursoId: string, filas: FilaPlanilla[]): Promise<FilaPlanilla[]> {
  if (!(await obtenerCurso(institucionId, cursoId))) return [];
  const mails = filas.filter((f) => !f.error).map((f) => f.email);
  const ya = mails.length
    ? await db
        .select({ email: egresadas.email })
        .from(egresadas)
        .where(and(eq(egresadas.cursoId, cursoId), inArray(egresadas.email, mails)))
    : [];
  const cargados = new Set(ya.map((x) => x.email));
  return filas.map((f) => (!f.error && cargados.has(f.email) ? { ...f, error: 'Ya está cargada en este curso.' } : f));
}

// Carga las filas sin errores. Se vuelven a validar acá: lo que llega del navegador no es confiable.
export async function cargarFilas(institucionId: string, cursoId: string, filas: CamposEgresada[]): Promise<number> {
  if (!(await obtenerCurso(institucionId, cursoId))) return 0;
  const validas: CamposEgresada[] = [];
  const vistos = new Set<string>();
  for (const f of filas.slice(0, 500)) {
    const { errores, datos } = validar(f);
    if (Object.keys(errores).length > 0 || vistos.has(datos.email)) continue;
    vistos.add(datos.email);
    validas.push(datos);
  }
  if (validas.length === 0) return 0;
  const r = await db
    .insert(egresadas)
    .values(validas.map((v) => ({ cursoId, ...v })))
    .onConflictDoNothing()
    .returning({ id: egresadas.id });
  return r.length;
}
