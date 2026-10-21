// Métricas del piloto (ver docs/modelo-de-datos.md). Responden dos de las tres preguntas:
// ¿las profesionales activan y comparten? ¿los pacientes verifican?
//
// Se calculan en el momento: el piloto tiene decenas de personas y unos pocos miles de eventos.
// Los eventos no guardan IP, navegador ni cookies: sólo qué pasó, sobre qué y por qué canal.

import 'server-only';
import { and, eq, gte, inArray } from 'drizzle-orm';
import { db } from '@/db';
import { certificados, eventos, instituciones, perfiles, usuarios, type Canal } from '@/db/schema';

export type Filtro = { institucionId: string | null; semanas: number };

export type Conteo = { clave: string; valor: number };
export type Semana = { inicio: string; valor: number };

export type Metricas = {
  certificados: number;
  personas: number;
  activadas: number;
  publicas: number;
  compartieron: number;
  visitas: number;
  verificaciones: number;
  fallidas: number | null;
  visitasPorSemana: Semana[];
  verificacionesPorSemana: Semana[];
  visitasPorCanal: Conteo[];
  verificacionesPorCanal: Conteo[];
  compartirPorCanal: Conteo[];
  porInstitucion: { id: string; nombre: string; certificados: number; personas: number; activadas: number; verificaciones: number }[];
};

export const NOMBRE_CANAL: Record<Canal, string> = {
  qr: 'QR',
  historia: 'Historia de Instagram',
  link: 'Link compartido',
  codigo: 'Código escrito a mano',
  perfil: 'Desde el perfil',
  verificacion: 'Desde una verificación',
  directo: 'Sin dato del canal',
  copiar_link: 'Copió el link',
  compartir_nativo: 'Compartir del celular',
  qr_consultorio: 'QR del consultorio',
  imagen_historia: 'Imagen para historias',
};

const ZONA = 'America/Argentina/Buenos_Aires';

// Fecha de calendario en Argentina ('AAAA-MM-DD').
function diaLocal(d: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: ZONA, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

// El lunes de la semana de esa fecha ('AAAA-MM-DD').
export function inicioSemana(d: Date): string {
  const [a, m, dia] = diaLocal(d).split('-').map(Number);
  const utc = new Date(Date.UTC(a, m - 1, dia));
  const desdeLunes = (utc.getUTCDay() + 6) % 7;
  utc.setUTCDate(utc.getUTCDate() - desdeLunes);
  return utc.toISOString().slice(0, 10);
}

function semanasEntre(desde: string, hasta: string): string[] {
  const out: string[] = [];
  const d = new Date(`${desde}T00:00:00Z`);
  const fin = new Date(`${hasta}T00:00:00Z`);
  while (d <= fin) {
    out.push(d.toISOString().slice(0, 10));
    d.setUTCDate(d.getUTCDate() + 7);
  }
  // Como mucho, las últimas 60 semanas (las más nuevas).
  return out.slice(-60);
}

function contarPor<T>(lista: T[], clave: (x: T) => string | null): Conteo[] {
  const m = new Map<string, number>();
  for (const x of lista) {
    const k = clave(x);
    if (k) m.set(k, (m.get(k) ?? 0) + 1);
  }
  return [...m.entries()].map(([c, valor]) => ({ clave: c, valor })).sort((a, b) => b.valor - a.valor);
}

function porSemana(fechas: Date[], semanas: string[]): Semana[] {
  const m = new Map(semanas.map((s) => [s, 0]));
  for (const f of fechas) {
    const s = inicioSemana(f);
    if (m.has(s)) m.set(s, m.get(s)! + 1);
  }
  return semanas.map((inicio) => ({ inicio, valor: m.get(inicio)! }));
}

export async function calcularMetricas(f: Filtro, ahora = new Date()): Promise<Metricas> {
  // Certificados válidos y sus titulares (de la institución elegida, o de todas).
  const certs = await db
    .select({ email: certificados.email, usuarioId: certificados.usuarioId, institucionId: certificados.institucionId })
    .from(certificados)
    .where(and(eq(certificados.estado, 'valido'), f.institucionId ? eq(certificados.institucionId, f.institucionId) : undefined));
  // Una persona es una cuenta (aunque junte certificados de dos mails) o, si todavía no activó,
  // un mail. Así "activadas" y "personas" cuentan lo mismo y la tasa no se distorsiona.
  const persona = (c: { email: string; usuarioId: string | null }) => c.usuarioId ?? `mail:${c.email}`;
  const personas = new Set(certs.map(persona));
  const usuariosConCert = [...new Set(certs.map((c) => c.usuarioId).filter((x): x is string => Boolean(x)))];

  const activas = usuariosConCert.length
    ? await db
        .select({ id: usuarios.id, publico: perfiles.publico })
        .from(usuarios)
        .leftJoin(perfiles, eq(perfiles.usuarioId, usuarios.id))
        .where(inArray(usuarios.id, usuariosConCert))
    : [];
  const activadas = activas.length;
  const publicas = activas.filter((u) => u.publico).length;

  // Eventos del período (las semanas completas más la actual).
  const hoy = inicioSemana(ahora);
  const desde = new Date(`${hoy}T03:00:00Z`);
  desde.setUTCDate(desde.getUTCDate() - 7 * Math.max(0, f.semanas - 1));
  const ev = await db
    .select({ tipo: eventos.tipo, canal: eventos.canal, perfil: eventos.perfilUsuarioId, institucionId: eventos.institucionId, creadoEn: eventos.creadoEn })
    .from(eventos)
    .where(
      and(
        inArray(eventos.tipo, ['perfil_visita', 'verificacion', 'verificacion_fallida', 'compartir']),
        f.semanas > 0 ? gte(eventos.creadoEn, desde) : undefined,
      ),
    );
  const deSusPerfiles = (p: string | null) => !f.institucionId || (p !== null && usuariosConCert.includes(p));
  const visitas = ev.filter((e) => e.tipo === 'perfil_visita' && deSusPerfiles(e.perfil));
  const verificaciones = ev.filter((e) => e.tipo === 'verificacion' && (!f.institucionId || e.institucionId === f.institucionId));
  const compartir = ev.filter((e) => e.tipo === 'compartir' && deSusPerfiles(e.perfil));
  // Las fallidas no tienen institución (el código no existe): sólo cuentan en el total.
  const fallidas = f.institucionId ? null : ev.filter((e) => e.tipo === 'verificacion_fallida').length;

  const primera = f.semanas > 0 ? inicioSemana(desde) : inicioSemana(ev.reduce((min, e) => (e.creadoEn < min ? e.creadoEn : min), ahora));
  const semanas = semanasEntre(primera, hoy);

  const insts = await db.select({ id: instituciones.id, nombre: instituciones.nombre }).from(instituciones).orderBy(instituciones.nombre);
  const todosCerts = f.institucionId
    ? await db.select({ email: certificados.email, usuarioId: certificados.usuarioId, institucionId: certificados.institucionId }).from(certificados).where(eq(certificados.estado, 'valido'))
    : certs;
  const porInstitucion = insts
    .filter((i) => !f.institucionId || i.id === f.institucionId)
    .map((i) => {
      const suyos = todosCerts.filter((c) => c.institucionId === i.id);
      return {
        id: i.id,
        nombre: i.nombre,
        certificados: suyos.length,
        personas: new Set(suyos.map(persona)).size,
        activadas: new Set(suyos.map((c) => c.usuarioId).filter(Boolean)).size,
        verificaciones: ev.filter((e) => e.tipo === 'verificacion' && e.institucionId === i.id).length,
      };
    });

  return {
    certificados: certs.length,
    personas: personas.size,
    activadas,
    publicas,
    compartieron: new Set(compartir.map((e) => e.perfil)).size,
    visitas: visitas.length,
    verificaciones: verificaciones.length,
    fallidas,
    visitasPorSemana: porSemana(visitas.map((e) => e.creadoEn), semanas),
    verificacionesPorSemana: porSemana(verificaciones.map((e) => e.creadoEn), semanas),
    visitasPorCanal: contarPor(visitas, (e) => e.canal),
    verificacionesPorCanal: contarPor(verificaciones, (e) => e.canal),
    compartirPorCanal: contarPor(compartir, (e) => e.canal),
    porInstitucion,
  };
}
