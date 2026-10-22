// Ícono de la app, para cuando se agrega el sitio a la pantalla de inicio del celular. Cuadrado y
// sin bordes redondeados: cada sistema los redondea a su manera. El isotipo queda dentro del
// círculo central que Android respeta al recortar.

import { IsotipoPlano } from './Logo';

const C = { marfil: '#F5F3EF', tierra: '#7A5A43' };

export function IconoApp({ tamano }: { tamano: number }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.marfil }}>
      <IsotipoPlano tamano={Math.round(tamano * 0.72)} color={C.tierra} contraste={C.marfil} />
    </div>
  );
}

export const COLOR_FONDO_APP = C.marfil;
