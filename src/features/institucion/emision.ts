// Emisión de certificados y lo que se hace con cada uno después: reenviar el mail, copiar el link
// para mandarlo por WhatsApp y anular.
//
// Al emitir, cada egresada recibe un mail:
// - Si ya tiene su pasaporte (cuenta con consentimiento) con ese mail: el certificado se suma
//   directo y el mail la invita a entrar (sin link de activación).
// - Si no: el mail trae el link para activar su pasaporte.

import 'server-only';
import { createHash } from 'node:crypto';
import { and, eq, isNotNull, isNull, sql } from 'drizzle-orm';
import { db } from '@/db';
import { certificados, egresadas, instituciones, usuarios } from '@/db/schema';
import { crearEnlaceActivacion } from '@/lib/auth/activacion';
import { generarCodigo } from '@/lib/certificados/codigo';
import { urlBase } from '@/lib/config';
import { enviarCorreos, type Correo } from '@/lib/correo/enviar';
import { correoCertificado } from '@/lib/correo/plantillas';
import { obtenerCurso } from './cursos';

// Egresadas del curso que todavía no tienen un certificado válido.
export async function pendientesDeEmitir(institucionId: string, cursoId: string) {
  if (!(await obtenerCurso(institucionId, cursoId))) return [];
  return db
    .select({ id: egresadas.id, nombre: egresadas.nombre, apellido: egresadas.apellido, email: egresadas.email })
    .from(egresadas)
    .where(
      and(
        eq(egresadas.cursoId, cursoId),
        sql`not exists (select 1 from ${certificados} c where c.egresada_id = ${egresadas.id} and c.estado = 'valido')`,
      ),
    )
    .orderBy(egresadas.apellido, egresadas.nombre);
}

// Huella de la lista que se mostró para revisar: si cambia antes de emitir (alguien agregó o
// corrigió una egresada en otra pestaña), no se emite nada que no se haya revisado.
export function firmaDeLista(lista: { id: string; nombre: string; apellido: string; email: string }[]): string {
  const ordenada = [...lista].sort((a, b) => a.id.localeCompare(b.id)).map((e) => [e.id, e.nombre, e.apellido, e.email]);
  return createHash('sha256').update(JSON.stringify(ordenada)).digest('hex').slice(0, 24);
}

async function codigoLibre(): Promise<string> {
  for (;;) {
    const codigo = generarCodigo();
    const [ya] = await db.select({ id: certificados.id }).from(certificados).where(eq(certificados.codigo, codigo)).limit(1);
    if (!ya) return codigo;
  }
}

// El error de Postgres por el índice único "un certificado válido por egresada". Drizzle lo
// envuelve: el original queda en cause.
function esDuplicada(error: unknown): boolean {
  for (let e = error as { message?: string; cause?: unknown } | undefined; e; e = e.cause as typeof e) {
    if (String(e.message ?? '').includes('certificados_egresada_valido')) return true;
  }
  return false;
}

async function cuentaActiva(email: string): Promise<string | null> {
  const [u] = await db
    .select({ id: usuarios.id })
    .from(usuarios)
    .where(and(eq(usuarios.email, email), isNotNull(usuarios.aceptoLegalesEn), isNull(usuarios.institucionId)))
    .limit(1);
  return u?.id ?? null;
}

export type ResultadoEmision = { emitidos: number; mailsConError: number; cambio?: boolean };

// firma: la de la lista que la institución revisó (ver firmaDeLista). Si no coincide, no emite.
export async function emitirCurso(institucionId: string, cursoId: string, firma?: string): Promise<ResultadoEmision> {
  const curso = await obtenerCurso(institucionId, cursoId);
  if (!curso) return { emitidos: 0, mailsConError: 0 };
  const [inst] = await db.select({ nombre: instituciones.nombre }).from(instituciones).where(eq(instituciones.id, institucionId));
  const pendientes = await pendientesDeEmitir(institucionId, cursoId);
  if (firma !== undefined && firma !== firmaDeLista(pendientes)) return { emitidos: 0, mailsConError: 0, cambio: true };

  const emitidos: { certificadoId: string; correo: Correo }[] = [];
  for (const e of pendientes) {
    const usuarioId = await cuentaActiva(e.email);
    let certificadoId: string;
    try {
      const [c] = await db
        .insert(certificados)
        .values({
          codigo: await codigoLibre(),
          egresadaId: e.id,
          cursoId,
          institucionId,
          titularNombre: e.nombre,
          titularApellido: e.apellido,
          email: e.email,
          usuarioId,
          activadoEn: usuarioId ? new Date() : null,
        })
        .returning({ id: certificados.id });
      certificadoId = c.id;
    } catch (error) {
      // Otro pedido la emitió al mismo tiempo (hay un índice que impide dos válidos): se saltea.
      // Cualquier otro error se informa: no se puede dar por emitido lo que no se emitió.
      if (!esDuplicada(error)) throw error;
      continue;
    }
    const enlace = usuarioId ? `${urlBase()}/ingresar` : await crearEnlaceActivacion(certificadoId);
    emitidos.push({
      certificadoId,
      correo: correoCertificado({
        para: e.email,
        nombre: e.nombre,
        institucion: inst.nombre,
        curso: curso.nombre,
        enlace,
        yaTieneCuenta: Boolean(usuarioId),
        certificadoId,
      }),
    });
  }

  const resultados = await enviarCorreos(emitidos.map((x) => x.correo));
  let mailsConError = 0;
  for (let i = 0; i < emitidos.length; i++) {
    const r = resultados[i];
    if (!r.ok) mailsConError++;
    await db
      .update(certificados)
      .set({ mailEnviadoEn: new Date(), mailError: r.ok ? null : r.error })
      .where(eq(certificados.id, emitidos[i].certificadoId));
  }
  return { emitidos: emitidos.length, mailsConError };
}

// Un certificado válido de esta institución, con lo que hace falta para el mail.
async function certificadoPropio(institucionId: string, certificadoId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(certificadoId)) return null;
  const [c] = await db
    .select()
    .from(certificados)
    .where(and(eq(certificados.id, certificadoId), eq(certificados.institucionId, institucionId)))
    .limit(1);
  return c ?? null;
}

export async function reenviarMail(institucionId: string, certificadoId: string): Promise<{ ok: boolean; error?: string }> {
  const c = await certificadoPropio(institucionId, certificadoId);
  if (!c || c.estado !== 'valido') return { ok: false, error: 'Ese certificado no está vigente.' };
  const curso = (await obtenerCurso(institucionId, c.cursoId))!;
  const [inst] = await db.select({ nombre: instituciones.nombre }).from(instituciones).where(eq(instituciones.id, institucionId));
  // Si ya activó, el mail la invita a entrar con su mail: nunca un link que abra la cuenta.
  const enlace = c.usuarioId ? `${urlBase()}/ingresar` : await crearEnlaceActivacion(c.id);
  const [r] = await enviarCorreos([
    correoCertificado({
      para: c.email,
      nombre: c.titularNombre,
      institucion: inst.nombre,
      curso: curso.nombre,
      enlace,
      yaTieneCuenta: Boolean(c.usuarioId),
      reenvio: true,
      certificadoId: c.id,
    }),
  ]);
  await db
    .update(certificados)
    .set({ mailEnviadoEn: new Date(), mailError: r.ok ? null : r.error })
    .where(eq(certificados.id, c.id));
  return r.ok ? { ok: true } : { ok: false, error: 'No pudimos mandar el mail. Revisá la dirección o copiá el link y mandalo por WhatsApp.' };
}

// Un link nuevo para mandar por WhatsApp. Sólo si todavía no activó: una vez activado, ningún
// link sirve para entrar (ver consultarEnlace).
export async function linkParaCompartir(
  institucionId: string,
  certificadoId: string,
): Promise<{ ok: true; link: string; mensaje: string } | { ok: false; error: string }> {
  const c = await certificadoPropio(institucionId, certificadoId);
  if (!c || c.estado !== 'valido') return { ok: false, error: 'Ese certificado no está vigente.' };
  if (c.usuarioId) return { ok: false, error: 'Ya activó su pasaporte: entra con su mail, sin link.' };
  const curso = (await obtenerCurso(institucionId, c.cursoId))!;
  const [inst] = await db.select({ nombre: instituciones.nombre }).from(instituciones).where(eq(instituciones.id, institucionId));
  const link = await crearEnlaceActivacion(c.id);
  const mensaje = `Hola, ${c.titularNombre}. ${inst.nombre} te emitió el certificado de ${curso.nombre}. Activá tu pasaporte acá: ${link}`;
  return { ok: true, link, mensaje };
}

export async function anularCertificado(
  institucionId: string,
  certificadoId: string,
  motivoCrudo: string,
): Promise<{ ok: boolean; error?: string }> {
  const motivo = motivoCrudo.trim().replace(/\s+/g, ' ').slice(0, 500);
  if (motivo.length < 5) return { ok: false, error: 'Contanos el motivo (por ejemplo, "El apellido estaba mal escrito"). No se muestra en público.' };
  const c = await certificadoPropio(institucionId, certificadoId);
  if (!c || c.estado !== 'valido') return { ok: false, error: 'Ese certificado ya no está vigente.' };
  await db
    .update(certificados)
    .set({ estado: 'anulado', anuladoEn: new Date(), motivoAnulacion: motivo })
    .where(and(eq(certificados.id, c.id), eq(certificados.institucionId, institucionId)));
  return { ok: true };
}
