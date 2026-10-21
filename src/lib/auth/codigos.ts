// Ingreso con código de 6 dígitos por mail. Sin contraseñas.
//
// Puede pedir código: quien ya tiene cuenta, quien tiene certificados emitidos a ese mail
// (todavía sin activar) y los administradores. A cualquier otro mail no se le manda nada, pero
// la respuesta es la misma: así nadie puede averiguar si un mail está en la plataforma.

import 'server-only';
import { and, desc, eq, gt, isNull, sql } from 'drizzle-orm';
import { db } from '@/db';
import { certificados, codigosIngreso, usuarios } from '@/db/schema';
import { esEmailAdmin } from '@/lib/config';
import { codigoNumerico, hashSecreto, igualesSeguro } from '@/lib/cripto';
import { correoCodigo } from '@/lib/correo/plantillas';
import { enviarCorreo } from '@/lib/correo/enviar';
import { emailValido, normalizarEmail } from '@/lib/texto';

const VIGENCIA_MS = 10 * 60 * 1000;
const MAX_INTENTOS = 5;
const MAX_CODIGOS_POR_HORA = 5;
const ESPERA_ENTRE_CODIGOS_MS = 60 * 1000;


async function puedeIngresar(email: string): Promise<boolean> {
  if (esEmailAdmin(email)) return true;
  const [u] = await db.select({ id: usuarios.id }).from(usuarios).where(eq(usuarios.email, email)).limit(1);
  if (u) return true;
  const [c] = await db
    .select({ id: certificados.id })
    .from(certificados)
    .where(and(eq(certificados.email, email), eq(certificados.estado, 'valido')))
    .limit(1);
  return Boolean(c);
}

function hashCodigo(email: string, codigo: string) {
  return hashSecreto(`codigo:${email}:${codigo}`);
}

export async function solicitarCodigo(emailCrudo: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const email = normalizarEmail(emailCrudo);
  if (!emailValido(email)) return { ok: false, error: 'Revisá el mail: tiene que ser del tipo nombre@ejemplo.com.' };
  if (!(await puedeIngresar(email))) return { ok: true };

  const haceUnaHora = new Date(Date.now() - 60 * 60 * 1000);
  const recientes = await db
    .select({ creadoEn: codigosIngreso.creadoEn })
    .from(codigosIngreso)
    .where(and(eq(codigosIngreso.email, email), gt(codigosIngreso.creadoEn, haceUnaHora)))
    .orderBy(desc(codigosIngreso.creadoEn));
  if (recientes.length >= MAX_CODIGOS_POR_HORA) {
    return { ok: false, error: 'Pediste muchos códigos seguidos. Esperá unos minutos y probá de nuevo.' };
  }
  // Si pidió uno hace menos de un minuto, no mandamos otro: el anterior sigue sirviendo.
  if (recientes[0] && Date.now() - recientes[0].creadoEn.getTime() < ESPERA_ENTRE_CODIGOS_MS) return { ok: true };

  const codigo = codigoNumerico(6);
  await db.insert(codigosIngreso).values({
    email,
    codigoHash: hashCodigo(email, codigo),
    expiraEn: new Date(Date.now() + VIGENCIA_MS),
  });
  const envio = await enviarCorreo(correoCodigo(email, codigo));
  if (!envio.ok) return { ok: false, error: 'No pudimos mandar el mail. Probá de nuevo en unos minutos.' };
  return { ok: true };
}

// Devuelve el id del usuario (creándolo si hace falta) o un error para mostrar.
export async function verificarCodigo(
  emailCrudo: string,
  codigoCrudo: string,
): Promise<{ ok: true; usuarioId: string } | { ok: false; error: string }> {
  const email = normalizarEmail(emailCrudo);
  const codigo = String(codigoCrudo || '').replace(/\D/g, '');
  if (codigo.length !== 6) return { ok: false, error: 'El código tiene 6 números.' };

  const [fila] = await db
    .select()
    .from(codigosIngreso)
    .where(and(eq(codigosIngreso.email, email), isNull(codigosIngreso.usadoEn), gt(codigosIngreso.expiraEn, new Date())))
    .orderBy(desc(codigosIngreso.creadoEn))
    .limit(1);
  if (!fila) return { ok: false, error: 'El código venció o ya se usó. Pedí uno nuevo.' };
  if (fila.intentos >= MAX_INTENTOS) return { ok: false, error: 'Probaste demasiadas veces. Pedí un código nuevo.' };

  if (!igualesSeguro(fila.codigoHash, hashCodigo(email, codigo))) {
    await db
      .update(codigosIngreso)
      .set({ intentos: sql`${codigosIngreso.intentos} + 1` })
      .where(eq(codigosIngreso.id, fila.id));
    return { ok: false, error: 'Ese código no es correcto. Revisalo y probá de nuevo.' };
  }

  // Marcar usado de forma atómica: si dos pedidos llegan juntos, sólo uno gana.
  const usados = await db
    .update(codigosIngreso)
    .set({ usadoEn: new Date() })
    .where(and(eq(codigosIngreso.id, fila.id), isNull(codigosIngreso.usadoEn)))
    .returning({ id: codigosIngreso.id });
  if (usados.length === 0) return { ok: false, error: 'El código venció o ya se usó. Pedí uno nuevo.' };

  const usuarioId = await obtenerOCrearUsuario(email);
  return { ok: true, usuarioId };
}

export async function obtenerOCrearUsuario(email: string): Promise<string> {
  const [existente] = await db.select({ id: usuarios.id }).from(usuarios).where(eq(usuarios.email, email)).limit(1);
  if (existente) return existente.id;
  const [nuevo] = await db
    .insert(usuarios)
    .values({ email })
    .onConflictDoNothing()
    .returning({ id: usuarios.id });
  if (nuevo) return nuevo.id;
  const [otra] = await db.select({ id: usuarios.id }).from(usuarios).where(eq(usuarios.email, email)).limit(1);
  return otra.id;
}
