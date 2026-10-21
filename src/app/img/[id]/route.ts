// Sirve las imágenes guardadas en la base, con estas reglas:
// - Logos de instituciones: públicos.
// - Foto de perfil: pública sólo si el perfil está publicado; si no, sólo la ve su dueña
//   (y la administración).
// - Cualquier otra cosa: 404.

import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { instituciones, perfiles } from '@/db/schema';
import { sesionActual } from '@/lib/auth/sesion';
import { leerImagen } from '@/lib/imagenes';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function noEncontrada() {
  return new Response('No encontrada', { status: 404, headers: { 'Cache-Control': 'no-store' } });
}

export async function GET(_req: Request, ctx: RouteContext<'/img/[id]'>) {
  const { id } = await ctx.params;
  if (!UUID.test(id)) return noEncontrada();

  let publica = false;
  const [logo] = await db.select({ id: instituciones.id }).from(instituciones).where(eq(instituciones.logoId, id)).limit(1);
  if (logo) {
    publica = true;
  } else {
    const [perfil] = await db
      .select({ usuarioId: perfiles.usuarioId, publico: perfiles.publico })
      .from(perfiles)
      .where(eq(perfiles.fotoId, id))
      .limit(1);
    if (!perfil) {
      // Imagen recién subida y todavía sin asociar, o huérfana: sólo admin.
      const s = await sesionActual();
      if (!s?.esAdmin) return noEncontrada();
    } else if (perfil.publico) {
      publica = true;
    } else {
      const s = await sesionActual();
      if (!s || (s.usuario.id !== perfil.usuarioId && !s.esAdmin)) return noEncontrada();
    }
  }

  const img = await leerImagen(id);
  if (!img) return noEncontrada();
  return new Response(Buffer.from(img.datos), {
    headers: {
      'Content-Type': img.mime,
      'Content-Length': String(img.datos.byteLength),
      // Las imágenes no cambian nunca (una foto nueva es un id nuevo). Las privadas no se guardan
      // en cachés compartidas: si el perfil pasa a privado, deja de verse.
      'Cache-Control': publica ? 'public, max-age=300, stale-while-revalidate=86400' : 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
