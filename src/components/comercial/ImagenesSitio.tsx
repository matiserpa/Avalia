// Imágenes del sitio comercial para la vista previa al compartir (1200×630), en el lenguaje de
// next/og: estilos en línea y flex. El verde va sólo en el sello "Verificado".

import { IsotipoPlano } from '@/components/marca/Logo';
import { MARCA } from '@/config/marca';
import { INSTITUCIONES_MUESTRA, PROFESIONAL_MUESTRA as P } from '@/features/comercial/muestras';
import { COLORES as C } from '@/lib/imagenes-generadas';
import { cantidad, nombreCompleto } from '@/lib/texto';

function Sello({ texto, tamano = 26 }: { texto: string; tamano?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, alignSelf: 'flex-start', background: C.verdeClaro, color: C.verdeOscuro, borderRadius: 999, padding: '10px 22px', fontSize: tamano, fontWeight: 700 }}>
      <svg width={tamano + 4} height={tamano + 4} viewBox="0 0 24 24" fill="none" stroke={C.verde} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12.3l2.8 2.8L16.2 9.6" />
      </svg>
      {texto}
    </div>
  );
}

function Pie({ texto }: { texto?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `2px solid ${C.bordeSuave}`, paddingTop: 26 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <IsotipoPlano tamano={44} color={C.tierra} contraste={C.marfil} />
        <span style={{ fontSize: 30, fontWeight: 800, color: C.tinta }}>{MARCA.nombre}</span>
      </div>
      {texto && <span style={{ fontSize: 26, color: C.tintaSuave }}>{texto}</span>}
    </div>
  );
}

export function ImagenInstituciones() {
  const inst = INSTITUCIONES_MUESTRA.instituto;
  const c = P.certificados[0];
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: C.marfil, padding: 72, fontFamily: 'Urbanist' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 56, flex: 1 }}>
        <span style={{ display: 'flex', flex: 1, fontSize: 58, fontWeight: 800, color: C.tinta, lineHeight: 1.1 }}>
          Tus egresadas comparten su formación. Tu logo va con ellas.
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', width: 440, gap: 14 }}>
          <span style={{ display: 'flex', fontSize: 24, fontWeight: 700, color: C.tierraOscuro }}>Tu logo</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, background: C.papel, border: `2px solid ${C.bordeSuave}`, borderRadius: 28, padding: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ width: 84, height: 84, borderRadius: 20, background: '#2F3B35', color: C.marfil, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, fontWeight: 800 }}>
                ID
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <span style={{ fontSize: 30, fontWeight: 700, color: C.tinta, lineHeight: 1.15 }}>{c.curso}</span>
                <span style={{ fontSize: 24, color: C.tintaSuave, marginTop: 6 }}>{inst.nombre}</span>
              </div>
            </div>
            <Sello texto="Verificado" />
          </div>
        </div>
      </div>
      <Pie texto="Piloto en Neuquén y Río Negro" />
    </div>
  );
}

export function ImagenProfesionales() {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: C.marfil, padding: 72, fontFamily: 'Urbanist' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 56, flex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 440, gap: 14, background: C.papel, border: `2px solid ${C.bordeSuave}`, borderRadius: 28, padding: 36 }}>
          <div style={{ width: 150, height: 150, borderRadius: 999, background: C.crema, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 58, fontWeight: 700, color: C.tierraOscuro }}>
            VR
          </div>
          <span style={{ fontSize: 40, fontWeight: 800, color: C.tinta, marginTop: 6 }}>{nombreCompleto(P)}</span>
          <span style={{ fontSize: 26, color: C.tintaSuave }}>
            {P.profesion} · {P.ciudad}
          </span>
          <div style={{ display: 'flex', marginTop: 8 }}>
            <Sello texto={cantidad(P.totalCertificados, 'certificado verificado', 'certificados verificados')} tamano={24} />
          </div>
        </div>
        <span style={{ display: 'flex', flex: 1, fontSize: 60, fontWeight: 800, color: C.tinta, lineHeight: 1.1 }}>
          Tu formación, verificada y en un solo link
        </span>
      </div>
      <Pie />
    </div>
  );
}
