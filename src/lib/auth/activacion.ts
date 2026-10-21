// Activación de la cuenta de una profesional.
//
// El link del mail del certificado (/activar/<token>) prueba que la persona tiene acceso a ese
// mail. Abrirlo NO activa nada (los antivirus de correo abren los links solos): activa el botón,
// que además registra el consentimiento. Después de usarse, el link deja de servir para entrar.

import 'server-only';
import { and, eq, gt, isNull } from 'drizzle-orm';
import { db } from '@/db';
import {
  certificados,
  cursos,
  enlacesActivacion,
  eventos,
  instituciones,
  perfiles,
  usuarios,
} from '@/db/schema';
import { urlBase } from '@/lib/config';
import { hashSecreto, tokenAleatorio } from '@/lib/cripto';
import { VERSION_LEGALES } from '@/lib/legales';
import { capitalizarNombre, slugificar } from '@/lib/texto';
import { obtenerOCrearUsuario } from './codigos';

export { VERSION_LEGALES };
const VIGENCIA_ENLACE_MS = 45 * 24 * 60 * 60 * 1000;

// Crea un link nuevo para un certificado. Devuelve la URL completa: es la única vez que existe.
export async function crearEnlaceActivacion(certificadoId: string): Promise<string> {
  const token = tokenAleatorio();
  await db.insert(enlacesActivacion).values({
    certificadoId,
    tokenHash: hashSecreto(`activacion:${token}`),
    expiraEn: new Date(Date.now() + VIGENCIA_ENLACE_MS),
  });
  return `${urlBase()}/activar/${token}`;
}

export type EstadoEnlace =
  | { estado: 'inexistente' }
  | { estado: 'vencido' | 'usado' | 'anulado'; email: string }
  | {
      estado: 'valido';
      enlaceId: string;
      email: string;
      certificado: {
        id: string;
        titularNombre: string;
        titularApellido: string;
        curso: string;
        institucion: string;
        institucionLogoId: string | null;
        fecha: string;
      };
    };

export async function consultarEnlace(token: string): Promise<EstadoEnlace> {
  if (!token || token.length < 20) return { estado: 'inexistente' };
  const [fila] = await db
    .select({
      enlace: enlacesActivacion,
      cert: certificados,
      curso: { nombre: cursos.nombre, fecha: cursos.fecha },
      inst: { nombre: instituciones.nombre, logoId: instituciones.logoId },
    })
    .from(enlacesActivacion)
    .innerJoin(certificados, eq(certificados.id, enlacesActivacion.certificadoId))
    .innerJoin(cursos, eq(cursos.id, certificados.cursoId))
    .innerJoin(instituciones, eq(instituciones.id, certificados.institucionId))
    .where(eq(enlacesActivacion.tokenHash, hashSecreto(`activacion:${token}`)))
    .limit(1);
  if (!fila) return { estado: 'inexistente' };
  const email = fila.cert.email;
  if (fila.cert.estado === 'anulado') return { estado: 'anulado', email };
  // Si el certificado ya está en una cuenta, sus links no sirven más para entrar: un link viejo
  // (por ejemplo, uno que la institución mandó por WhatsApp) no puede abrir la cuenta de nadie.
  // Desde ahí se entra con el código por mail.
  if (fila.enlace.usadoEn || fila.cert.usuarioId) return { estado: 'usado', email };
  if (fila.enlace.expiraEn.getTime() < Date.now()) return { estado: 'vencido', email };
  return {
    estado: 'valido',
    enlaceId: fila.enlace.id,
    email,
    certificado: {
      id: fila.cert.id,
      titularNombre: fila.cert.titularNombre,
      titularApellido: fila.cert.titularApellido,
      curso: fila.curso.nombre,
      institucion: fila.inst.nombre,
      institucionLogoId: fila.inst.logoId,
      fecha: fila.curso.fecha,
    },
  };
}

// Marca el link como usado. Devuelve false si otro pedido lo usó antes.
export async function usarEnlace(enlaceId: string): Promise<boolean> {
  const r = await db
    .update(enlacesActivacion)
    .set({ usadoEn: new Date() })
    .where(and(eq(enlacesActivacion.id, enlaceId), isNull(enlacesActivacion.usadoEn), gt(enlacesActivacion.expiraEn, new Date())))
    .returning({ id: enlacesActivacion.id });
  return r.length > 0;
}

// Activación por link: crea (o encuentra) la cuenta del mail del certificado y registra el
// consentimiento. Devuelve el id del usuario para iniciar la sesión.
export async function activarConEnlace(token: string): Promise<{ ok: true; usuarioId: string } | { ok: false; error: string }> {
  const e = await consultarEnlace(token);
  if (e.estado !== 'valido') return { ok: false, error: 'Este link ya no sirve. Ingresá con tu mail y te mandamos un código.' };
  if (!(await usarEnlace(e.enlaceId))) return { ok: false, error: 'Este link ya se usó. Ingresá con tu mail y te mandamos un código.' };
  const usuarioId = await obtenerOCrearUsuario(e.email);
  await aceptarLegales(usuarioId);
  return { ok: true, usuarioId };
}

// Suma un certificado (emitido a otro mail) a la cuenta de quien ya tiene sesión. Para la
// profesional que tiene certificados en dos mails distintos: abrir el link prueba que el otro
// mail también es suyo.
export async function sumarCertificadoConEnlace(
  token: string,
  usuarioId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const e = await consultarEnlace(token);
  if (e.estado !== 'valido') return { ok: false, error: 'Este link ya no sirve.' };
  if (!(await usarEnlace(e.enlaceId))) return { ok: false, error: 'Este link ya se usó.' };
  await db
    .update(certificados)
    .set({ usuarioId, activadoEn: new Date() })
    .where(and(eq(certificados.id, e.certificado.id), isNull(certificados.usuarioId)));
  return { ok: true };
}

// Consentimiento + todo lo que se habilita con él: vincular los certificados de ese mail y
// crear el perfil (privado). Se puede llamar más de una vez sin efectos dobles.
export async function aceptarLegales(usuarioId: string): Promise<void> {
  const [u] = await db.select().from(usuarios).where(eq(usuarios.id, usuarioId)).limit(1);
  if (!u) throw new Error('Usuario inexistente');
  const primeraVez = !u.aceptoLegalesEn;
  if (primeraVez) {
    await db
      .update(usuarios)
      .set({ aceptoLegalesEn: new Date(), versionLegales: VERSION_LEGALES })
      .where(eq(usuarios.id, usuarioId));
  }
  await vincularCertificadosPorEmail(usuarioId, u.email);
  await asegurarPerfil(usuarioId, u.email);
  if (primeraVez) await db.insert(eventos).values({ tipo: 'cuenta_activada', perfilUsuarioId: usuarioId });
}

export async function vincularCertificadosPorEmail(usuarioId: string, email: string): Promise<void> {
  await db
    .update(certificados)
    .set({ usuarioId, activadoEn: new Date() })
    .where(and(eq(certificados.email, email), isNull(certificados.usuarioId)));
}

// Crea el perfil con el nombre del certificado más reciente. Queda privado.
async function asegurarPerfil(usuarioId: string, email: string): Promise<void> {
  const [ya] = await db.select({ id: perfiles.usuarioId }).from(perfiles).where(eq(perfiles.usuarioId, usuarioId)).limit(1);
  if (ya) return;
  const [c] = await db
    .select({ nombre: certificados.titularNombre, apellido: certificados.titularApellido })
    .from(certificados)
    .where(eq(certificados.usuarioId, usuarioId))
    .orderBy(certificados.emitidoEn)
    .limit(1);
  const nombre = capitalizarNombre(c?.nombre || email.split('@')[0]);
  const apellido = capitalizarNombre(c?.apellido || '');
  const slug = await slugLibre(`${nombre} ${apellido}`);
  await db.insert(perfiles).values({ usuarioId, slug, nombre, apellido }).onConflictDoNothing();
}

export async function slugLibre(base: string, propioUsuarioId?: string): Promise<string> {
  const raiz = slugificar(base) || 'perfil';
  for (let n = 1; n < 500; n++) {
    const candidato = n === 1 ? raiz : `${raiz}-${n}`;
    const [ocupado] = await db
      .select({ usuarioId: perfiles.usuarioId })
      .from(perfiles)
      .where(eq(perfiles.slug, candidato))
      .limit(1);
    if (!ocupado || ocupado.usuarioId === propioUsuarioId) return candidato;
  }
  return `${raiz}-${tokenAleatorio().slice(0, 6).toLowerCase()}`;
}
