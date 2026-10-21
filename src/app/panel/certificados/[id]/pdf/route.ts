// PDF de un certificado propio. Se genera en el momento (siempre refleja el estado actual) y sólo
// lo descarga su dueña. Un certificado anulado ya no se descarga.

import { requerirProfesional } from '@/lib/auth/guardas';
import { datosPdfDeCertificado, generarPdfCertificado, nombreArchivoPdf } from '@/lib/certificados/pdf';
import { registrarEvento } from '@/lib/eventos';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(_req: Request, ctx: RouteContext<'/panel/certificados/[id]/pdf'>) {
  const s = await requerirProfesional();
  const { id } = await ctx.params;
  const datos = UUID.test(id) ? await datosPdfDeCertificado(id) : null;
  if (!datos || datos.usuarioId !== s.usuario.id || datos.estado !== 'valido') {
    return new Response('No encontrado', { status: 404 });
  }
  const pdf = await generarPdfCertificado(datos);
  await registrarEvento({ tipo: 'pdf_descarga', perfilUsuarioId: s.usuario.id, certificadoId: id, institucionId: datos.institucionId });
  const archivo = nombreArchivoPdf(datos);
  return new Response(Buffer.from(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${archivo}"; filename*=UTF-8''${encodeURIComponent(archivo)}`,
      'Cache-Control': 'private, no-store',
    },
  });
}
