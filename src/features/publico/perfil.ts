// Perfil público de una profesional (/p/<slug>).
//
// Sólo se muestra si ella lo publicó. Si es privado o no existe, la página responde lo mismo en
// los dos casos (así nadie puede averiguar si alguien tiene cuenta). La única excepción es la
// dueña, que ve su propio perfil aunque sea privado.

import 'server-only';
import { cache } from 'react';
import { and, desc, eq, sql } from 'drizzle-orm';
import { db } from '@/db';
import { certificados, cursos, instituciones, perfiles, type Canal, type Perfil, type TipoCurso } from '@/db/schema';
import type { SesionActual } from '@/lib/auth/sesion';
import { esRobot, registrarEvento } from '@/lib/eventos';
import { anioDe, nombreCompleto, slugificar } from '@/lib/texto';

export type CertificadoDePerfil = {
  id: string;
  codigo: string;
  curso: string;
  tipo: TipoCurso;
  cargaHoraria: number;
  fecha: string;
  institucion: string;
  institucionLogoId: string | null;
  // El nombre que figura en el certificado (lo puso la institución al emitirlo).
  titular: string;
};

export type DatosPerfil = {
  perfil: Perfil;
  certificados: CertificadoDePerfil[];
};

// Los certificados que ella muestra: válidos y no ocultos, del más nuevo al más viejo.
export async function certificadosVisibles(usuarioId: string): Promise<CertificadoDePerfil[]> {
  return db
    .select({
      id: certificados.id,
      codigo: certificados.codigo,
      curso: cursos.nombre,
      tipo: cursos.tipo,
      cargaHoraria: cursos.cargaHoraria,
      fecha: cursos.fecha,
      institucion: instituciones.nombre,
      institucionLogoId: instituciones.logoId,
      titular: sql<string>`${certificados.titularNombre} || ' ' || ${certificados.titularApellido}`,
    })
    .from(certificados)
    .innerJoin(cursos, eq(cursos.id, certificados.cursoId))
    .innerJoin(instituciones, eq(instituciones.id, certificados.institucionId))
    .where(
      and(eq(certificados.usuarioId, usuarioId), eq(certificados.estado, 'valido'), eq(certificados.visibleEnPerfil, true)),
    )
    .orderBy(desc(cursos.fecha), desc(certificados.emitidoEn));
}

// Busca el perfil por su link, sea público o no: quien llama decide si se puede mostrar.
export const perfilPorSlug = cache(async (slug: string): Promise<DatosPerfil | null> => {
  const limpio = String(slug || '').toLowerCase();
  if (!/^[a-z0-9-]{1,80}$/.test(limpio)) return null;
  const [perfil] = await db.select().from(perfiles).where(eq(perfiles.slug, limpio)).limit(1);
  if (!perfil) return null;
  return { perfil, certificados: await certificadosVisibles(perfil.usuarioId) };
});

export async function perfilDeUsuario(usuarioId: string): Promise<DatosPerfil | null> {
  const [perfil] = await db.select().from(perfiles).where(eq(perfiles.usuarioId, usuarioId)).limit(1);
  if (!perfil) return null;
  return { perfil, certificados: await certificadosVisibles(usuarioId) };
}

// Agrupa por año, del más reciente al más viejo.
export function porAnio(lista: CertificadoDePerfil[]): { anio: number; certificados: CertificadoDePerfil[] }[] {
  const grupos = new Map<number, CertificadoDePerfil[]>();
  for (const c of lista) {
    const a = anioDe(c.fecha);
    grupos.set(a, [...(grupos.get(a) ?? []), c]);
  }
  return [...grupos.entries()].sort((a, b) => b[0] - a[0]).map(([anio, certificados]) => ({ anio, certificados }));
}

// "Instituto Demo y Asociación Demo de Cosmiatría"
export function institucionesDe(lista: CertificadoDePerfil[]): string[] {
  return [...new Set(lista.map((c) => c.institucion))];
}

// Una visita al perfil público. No cuentan la dueña, la administración ni los programas que arman
// vistas previas de links.
export async function registrarVisitaPerfil(perfilUsuarioId: string, sesion: SesionActual | null, canal: Canal): Promise<void> {
  if (sesion && (sesion.usuario.id === perfilUsuarioId || sesion.esAdmin)) return;
  if (await esRobot()) return;
  await registrarEvento({ tipo: 'perfil_visita', canal, perfilUsuarioId });
}

// ¿El certificado está a nombre de otra persona que la del perfil? Puede pasar por un cambio de
// apellido, o si alguien sumó un certificado ajeno: en los dos casos el perfil lo muestra.
export function aOtroNombre(c: CertificadoDePerfil, perfil: Pick<Perfil, 'nombre' | 'apellido'>): boolean {
  return slugificar(c.titular) !== slugificar(nombreCompleto(perfil));
}
