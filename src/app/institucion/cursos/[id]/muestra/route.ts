// Certificado de muestra del curso, con marca de agua: para revisar cómo va a quedar antes de
// emitir. Usa el nombre de la primera egresada cargada, o uno de ejemplo.

import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { imagenes } from '@/db/schema';
import { obtenerCurso, obtenerInstitucion } from '@/features/institucion/cursos';
import { pendientesDeEmitir } from '@/features/institucion/emision';
import { requerirInstitucion } from '@/lib/auth/guardas';
import { generarPdfCertificado } from '@/lib/certificados/pdf';

export async function GET(_req: Request, ctx: RouteContext<'/institucion/cursos/[id]/muestra'>) {
  const s = await requerirInstitucion();
  const { id } = await ctx.params;
  const curso = await obtenerCurso(s.institucionId, id);
  const inst = await obtenerInstitucion(s.institucionId);
  if (!curso || !inst) return new Response('No encontrado', { status: 404 });
  const [primera] = await pendientesDeEmitir(s.institucionId, id);
  const [logo] = inst.logoId ? await db.select({ datos: imagenes.datos }).from(imagenes).where(eq(imagenes.id, inst.logoId)) : [];
  const pdf = await generarPdfCertificado({
    codigo: '00000000',
    titularNombre: primera?.nombre ?? 'Nombre',
    titularApellido: primera?.apellido ?? 'Apellido',
    cursoNombre: curso.nombre,
    tipo: curso.tipo,
    cargaHoraria: curso.cargaHoraria,
    fecha: curso.fecha,
    docente: curso.docente,
    institucionNombre: inst.nombre,
    institucionLogo: logo?.datos ?? null,
    emitidoEn: new Date(),
    muestra: true,
  });
  return new Response(Buffer.from(pdf), {
    headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'inline; filename="certificado-de-muestra.pdf"', 'Cache-Control': 'private, no-store' },
  });
}
