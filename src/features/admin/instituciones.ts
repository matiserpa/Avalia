// Alta de instituciones e invitación a su equipo. Sólo la administración del piloto.

import 'server-only';
import { asc, eq, sql } from 'drizzle-orm';
import { db } from '@/db';
import { certificados, cursos, instituciones, perfiles, usuarios } from '@/db/schema';
import { esEmailAdmin, urlBase } from '@/lib/config';
import { enviarCorreo } from '@/lib/correo/enviar';
import { correoInvitacionInstitucion } from '@/lib/correo/plantillas';
import { guardarImagen } from '@/lib/imagenes';
import { emailValido, normalizarEmail } from '@/lib/texto';

export type ResumenInstitucion = {
  id: string;
  nombre: string;
  ciudad: string | null;
  logoId: string | null;
  cursos: number;
  emitidos: number;
  equipo: string[];
};

export async function listarInstituciones(): Promise<ResumenInstitucion[]> {
  // La columna de afuera va escrita entera: en el select de una sola tabla, Drizzle la escribiría
  // como "id" y dentro de la subconsulta sería la de adentro.
  const filas = await db
    .select({
      i: instituciones,
      cursos: sql<number>`(select count(*)::int from ${cursos} c where c.institucion_id = "instituciones"."id")`,
      emitidos: sql<number>`(select count(*)::int from ${certificados} c where c.institucion_id = "instituciones"."id" and c.estado = 'valido')`,
    })
    .from(instituciones)
    .orderBy(asc(instituciones.nombre));
  const equipo = await db.select({ email: usuarios.email, institucionId: usuarios.institucionId }).from(usuarios).where(sql`${usuarios.institucionId} is not null`);
  return filas.map((f) => ({
    id: f.i.id,
    nombre: f.i.nombre,
    ciudad: f.i.ciudad,
    logoId: f.i.logoId,
    cursos: Number(f.cursos),
    emitidos: Number(f.emitidos),
    equipo: equipo.filter((e) => e.institucionId === f.i.id).map((e) => e.email),
  }));
}

export type ErroresInstitucion = Partial<Record<'nombre' | 'ciudad' | 'logo' | 'email', string>>;

// ¿Se puede sumar este mail al equipo de una institución?
async function problemaConEmail(email: string, institucionId?: string): Promise<string | null> {
  if (!emailValido(email)) return 'Revisá el mail: tiene que ser del tipo nombre@ejemplo.com.';
  if (esEmailAdmin(email)) return 'Ese mail es de la administración. Usá otro.';
  const [u] = await db
    .select({ institucionId: usuarios.institucionId, acepto: usuarios.aceptoLegalesEn, perfil: perfiles.usuarioId })
    .from(usuarios)
    .leftJoin(perfiles, eq(perfiles.usuarioId, usuarios.id))
    .where(eq(usuarios.email, email))
    .limit(1);
  if (!u) return null;
  if (u.institucionId && u.institucionId === institucionId) return 'Esa persona ya está en el equipo.';
  if (u.institucionId) return 'Ese mail ya está en el equipo de otra institución.';
  if (u.acepto || u.perfil) return 'Ese mail ya tiene un pasaporte de profesional. Pedí otro mail para la institución.';
  return null;
}

async function invitar(email: string, institucionId: string, nombreInstitucion: string) {
  const [existente] = await db.select({ id: usuarios.id }).from(usuarios).where(eq(usuarios.email, email)).limit(1);
  if (existente) await db.update(usuarios).set({ institucionId }).where(eq(usuarios.id, existente.id));
  else await db.insert(usuarios).values({ email, institucionId });
  return enviarCorreo(
    correoInvitacionInstitucion({ para: email, institucion: nombreInstitucion, enlace: `${urlBase()}/ingresar?email=${encodeURIComponent(email)}` }),
  );
}

export async function crearInstitucion(d: {
  nombre: string;
  ciudad: string;
  email: string;
  logo: File | null;
}): Promise<{ ok: true; mailOk: boolean } | { ok: false; errores: ErroresInstitucion }> {
  const nombre = d.nombre.trim().replace(/\s+/g, ' ').slice(0, 120);
  const ciudad = d.ciudad.trim().replace(/\s+/g, ' ').slice(0, 80);
  const email = normalizarEmail(d.email);
  const errores: ErroresInstitucion = {};
  if (!nombre) errores.nombre = 'Escribí el nombre de la institución, como va en los certificados.';
  const problema = await problemaConEmail(email);
  if (problema) errores.email = problema;
  if (!d.logo || d.logo.size === 0) errores.logo = 'Subí el logo: va en cada certificado.';
  if (Object.keys(errores).length > 0) return { ok: false, errores };

  // Logos: sin recortar, para que entren enteros.
  const img = await guardarImagen(d.logo!, { lado: 512 });
  if (!img.ok) return { ok: false, errores: { logo: img.error } };
  const [inst] = await db.insert(instituciones).values({ nombre, ciudad: ciudad || null, logoId: img.id }).returning();
  const envio = await invitar(email, inst.id, inst.nombre);
  return { ok: true, mailOk: envio.ok };
}

export async function invitarAlEquipo(institucionId: string, emailCrudo: string): Promise<{ ok: boolean; error?: string }> {
  const [inst] = await db.select().from(instituciones).where(eq(instituciones.id, institucionId)).limit(1);
  if (!inst) return { ok: false, error: 'No encontramos la institución.' };
  const email = normalizarEmail(emailCrudo);
  const problema = await problemaConEmail(email, institucionId);
  if (problema) return { ok: false, error: problema };
  const envio = await invitar(email, inst.id, inst.nombre);
  return envio.ok ? { ok: true } : { ok: false, error: 'La sumamos al equipo, pero no pudimos mandar el mail. Avisale que entre con su mail.' };
}
