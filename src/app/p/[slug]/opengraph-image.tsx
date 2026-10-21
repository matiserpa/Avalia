// Vista previa del link del perfil en WhatsApp, Instagram y otras redes (1200×630).
// Sólo muestra datos si el perfil es público. Si es privado o no existe, la imagen genérica de
// la marca: la misma en los dos casos.

import { ImageResponse } from 'next/og';
import { connection } from 'next/server';
import { IsotipoPlano } from '@/components/marca/Logo';
import { ImagenMarca } from '@/components/marca/ImagenMarca';
import { MARCA } from '@/config/marca';
import { perfilPorSlug } from '@/features/publico/perfil';
import { COLORES as C, fotoComoDataUrl, fuentes } from '@/lib/imagenes-generadas';
import { cantidad, iniciales, nombreCompleto } from '@/lib/texto';

// El mismo texto para todos: si dependiera del perfil, delataría cuáles son privados.
export const alt = 'Vista previa del perfil profesional';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Imagen({ params }: { params: Promise<{ slug: string }> }) {
  // Siempre al momento: si el perfil pasa a privado, la imagen deja de mostrar sus datos.
  await connection();
  const { slug } = await params;
  const datos = await perfilPorSlug(slug);
  const opciones = { ...size, fonts: await fuentes(), headers: { 'Cache-Control': 'public, max-age=300' } };
  if (!datos?.perfil.publico) return new ImageResponse(<ImagenMarca />, opciones);

  const { perfil, certificados } = datos;
  const foto = await fotoComoDataUrl(perfil.fotoId);
  const nombre = nombreCompleto(perfil);
  const bajada = [perfil.profesion, perfil.ciudad].filter(Boolean).join(' · ');

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: C.marfil, padding: 72, fontFamily: 'Urbanist' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 64, flex: 1 }}>
          {foto ? (
            <img src={foto} width={300} height={300} alt="" style={{ borderRadius: 999, objectFit: 'cover', border: `8px solid ${C.papel}` }} />
          ) : (
            <div style={{ width: 300, height: 300, borderRadius: 999, background: C.crema, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 110, fontWeight: 700, color: C.tierraOscuro }}>
              {iniciales(perfil)}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 18 }}>
            <span style={{ fontSize: nombre.length > 22 ? 58 : 72, fontWeight: 800, color: C.tinta, lineHeight: 1.05 }}>{nombre}</span>
            {bajada && <span style={{ fontSize: 36, color: C.tintaSuave }}>{bajada}</span>}
            {certificados.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12, alignSelf: 'flex-start', background: C.verdeClaro, color: C.verdeOscuro, borderRadius: 999, padding: '12px 26px', fontSize: 30, fontWeight: 700 }}>
                <svg width={34} height={34} viewBox="0 0 24 24" fill="none" stroke={C.verde} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M8 12.3l2.8 2.8L16.2 9.6" />
                </svg>
                {cantidad(certificados.length, 'certificado verificado', 'certificados verificados')}
              </div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `2px solid ${C.bordeSuave}`, paddingTop: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <IsotipoPlano tamano={44} color={C.tierra} contraste={C.marfil} />
            <span style={{ fontSize: 30, fontWeight: 800, color: C.tinta }}>{MARCA.nombre}</span>
          </div>
          <span style={{ fontSize: 28, color: C.tintaSuave }}>
            {certificados.length > 0 ? 'Formación verificada por las instituciones' : 'Perfil profesional'}
          </span>
        </div>
      </div>
    ),
    opciones,
  );
}
