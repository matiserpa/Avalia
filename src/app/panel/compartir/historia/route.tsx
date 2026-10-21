// Imagen para historias de Instagram (1080 × 1920): nombre, profesión y certificados verificados.
// Arriba y abajo deja lugar libre, donde Instagram pone sus botones.

import { ImageResponse } from 'next/og';
import { IsotipoPlano } from '@/components/marca/Logo';
import { MARCA } from '@/config/marca';
import { perfilDeUsuario } from '@/features/publico/perfil';
import { requerirProfesional } from '@/lib/auth/guardas';
import { urlBase } from '@/lib/config';
import { COLORES as C, fotoComoDataUrl, fuentes } from '@/lib/imagenes-generadas';
import { cantidad, iniciales, nombreCompleto } from '@/lib/texto';

export async function GET(req: Request) {
  const s = await requerirProfesional();
  const datos = await perfilDeUsuario(s.usuario.id);
  if (!datos?.perfil.publico) return new Response('Tu perfil es privado', { status: 404 });
  const { perfil, certificados } = datos;
  const foto = await fotoComoDataUrl(perfil.fotoId, 480);
  const nombre = nombreCompleto(perfil);
  const bajada = [perfil.profesion, perfil.ciudad].filter(Boolean).join(' · ');
  const link = `${urlBase().replace(/^https?:\/\//, '')}/p/${perfil.slug}`;
  const descargar = new URL(req.url).searchParams.has('descargar');

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', background: C.marfil, padding: '190px 90px 0', fontFamily: 'Urbanist', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <IsotipoPlano tamano={64} color={C.tierra} contraste={C.marfil} />
          <span style={{ fontSize: 44, fontWeight: 800, color: C.tinta }}>{MARCA.nombre}</span>
        </div>

        <div style={{ display: 'flex', marginTop: 56 }}>
          {foto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={foto} width={300} height={300} alt="" style={{ borderRadius: 999, border: `10px solid ${C.papel}` }} />
          ) : (
            <div style={{ width: 300, height: 300, borderRadius: 999, background: C.crema, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 116, fontWeight: 700, color: C.tierraOscuro }}>
              {iniciales(perfil)}
            </div>
          )}
        </div>

        <span style={{ marginTop: 40, fontSize: nombre.length > 20 ? 74 : 90, fontWeight: 800, color: C.tinta, textAlign: 'center', lineHeight: 1.05 }}>{nombre}</span>
        {bajada && <span style={{ marginTop: 16, fontSize: 44, color: C.tintaSuave, textAlign: 'center' }}>{bajada}</span>}

        {certificados.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 40, background: C.verdeClaro, color: C.verdeOscuro, borderRadius: 999, padding: '18px 36px', fontSize: 42, fontWeight: 700 }}>
            <svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke={C.verde} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M8 12.3l2.8 2.8L16.2 9.6" />
            </svg>
            {cantidad(certificados.length, 'certificado verificado', 'certificados verificados')}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', marginTop: 48, gap: 18, maxHeight: 470, overflow: 'hidden' }}>
          {certificados.slice(0, 3).map((c) => (
            <div key={c.id} style={{ display: 'flex', flexDirection: 'column', background: C.papel, borderRadius: 32, padding: '24px 36px', border: `2px solid ${C.bordeSuave}` }}>
              <span style={{ fontSize: 36, fontWeight: 700, color: C.tinta, lineHeight: 1.2 }}>{c.curso}</span>
              <span style={{ fontSize: 30, color: C.tintaSuave, marginTop: 4 }}>{c.institucion}</span>
            </div>
          ))}
        </div>

        {/* El pie va fijo, por encima de la zona donde Instagram pone sus botones. */}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 230, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: 44, fontWeight: 700, color: C.tinta }}>
            {certificados.length > 0 ? 'Mirá mi formación verificada' : 'Mirá mi perfil profesional'}
          </span>
          <span style={{ marginTop: 18, fontSize: 34, color: C.tierraOscuro, background: C.tierraClaro, borderRadius: 999, padding: '14px 34px' }}>{link}</span>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1920,
      fonts: await fuentes(),
      headers: {
        'Cache-Control': 'private, no-store',
        ...(descargar ? { 'Content-Disposition': `attachment; filename="historia-${perfil.slug}.png"` } : {}),
      },
    },
  );
}
