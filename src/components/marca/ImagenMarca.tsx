// Imagen genérica de la marca (1200×630) para la vista previa de links que no tienen una propia:
// la portada, y los perfiles privados o inexistentes (que no pueden revelar nada).

import { MARCA } from '@/config/marca';
import { IsotipoPlano } from './Logo';

const C = { marfil: '#F5F3EF', tinta: '#0F1210', suave: '#4B4F4A', tierra: '#7A5A43', verde: '#2E6B51', verdeClaro: '#DCEAE2' };

export function ImagenMarca() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: C.marfil,
        padding: 80,
        fontFamily: 'Urbanist',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <IsotipoPlano tamano={72} color={C.tierra} contraste={C.marfil} />
        <span style={{ fontSize: 44, fontWeight: 800, color: C.tinta }}>{MARCA.nombre}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <span style={{ fontSize: 68, fontWeight: 800, color: C.tinta, lineHeight: 1.1, maxWidth: 960 }}>{MARCA.bajada}</span>
        <span style={{ fontSize: 32, color: C.suave, maxWidth: 900 }}>{MARCA.descripcion}</span>
      </div>
    </div>
  );
}
