// Datos para la guía de la demo (/demo) y la bandeja de mails en pantalla (/demo/bandeja).
// Sólo existen con DEMO_MODE=true: las páginas devuelven 404 si no.

import 'server-only';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { certificados, correos, cursos, usuarios } from '@/db/schema';
import { DEMO } from '@/lib/demo/datos';

export async function estadoDelRecorrido() {
  const [congreso] = await db.select({ id: cursos.id }).from(cursos).where(eq(cursos.nombre, 'Congreso Demo 2026')).limit(1);
  const [certCamila] = await db
    .select({ codigo: certificados.codigo, usuarioId: certificados.usuarioId })
    .from(certificados)
    .where(and(eq(certificados.email, DEMO.emailCamila), eq(certificados.estado, 'valido')))
    .orderBy(desc(certificados.emitidoEn))
    .limit(1);
  const [camila] = await db.select({ acepto: usuarios.aceptoLegalesEn }).from(usuarios).where(eq(usuarios.email, DEMO.emailCamila)).limit(1);
  return {
    congresoId: congreso?.id ?? null,
    emitido: Boolean(certCamila),
    codigoCamila: certCamila?.codigo ?? null,
    camilaActivo: Boolean(camila?.acepto),
  };
}

export async function listarCorreos() {
  return db
    .select({ id: correos.id, para: correos.para, asunto: correos.asunto, creadoEn: correos.creadoEn, plantilla: correos.plantilla })
    .from(correos)
    .orderBy(desc(correos.creadoEn))
    .limit(200);
}

export async function obtenerCorreo(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [c] = await db.select().from(correos).where(eq(correos.id, id)).limit(1);
  return c ?? null;
}
