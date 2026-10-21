// Borrar la cuenta (Ley 25.326, derecho de supresión). Ver docs/modelo-de-datos.md.
//
// Se borra: el usuario, su perfil, su foto, sus sesiones, las métricas de su perfil, sus códigos
// de ingreso y el registro de mails a su dirección.
// Queda: los certificados, desvinculados, porque son registro de la institución que los emitió y
// siguen verificando. (Decisión a validar con el abogado.)

import 'server-only';
import { eq, inArray } from 'drizzle-orm';
import { db } from '@/db';
import { certificados, codigosIngreso, correos, enlacesActivacion, imagenes, perfiles, usuarios } from '@/db/schema';

export async function borrarCuenta(usuarioId: string): Promise<void> {
  await db.transaction(async (tx) => {
    const [u] = await tx.select({ email: usuarios.email }).from(usuarios).where(eq(usuarios.id, usuarioId)).limit(1);
    if (!u) return;
    const [p] = await tx.select({ fotoId: perfiles.fotoId }).from(perfiles).where(eq(perfiles.usuarioId, usuarioId)).limit(1);

    const propios = await tx
      .update(certificados)
      .set({ usuarioId: null, activadoEn: null, visibleEnPerfil: true })
      .where(eq(certificados.usuarioId, usuarioId))
      .returning({ id: certificados.id });
    // Los links de activación que quedaban sin usar dejan de servir: nadie puede volver a abrir
    // una cuenta con un link viejo. Si ella quiere volver, la institución le manda uno nuevo.
    if (propios.length > 0) {
      await tx
        .update(enlacesActivacion)
        .set({ usadoEn: new Date() })
        .where(inArray(enlacesActivacion.certificadoId, propios.map((c) => c.id)));
    }

    await tx.delete(codigosIngreso).where(eq(codigosIngreso.email, u.email));
    await tx.delete(correos).where(eq(correos.para, u.email));
    // En cascada: perfil, sesiones y eventos de su perfil.
    await tx.delete(usuarios).where(eq(usuarios.id, usuarioId));
    if (p?.fotoId) await tx.delete(imagenes).where(eq(imagenes.id, p.fotoId));
  });
}
