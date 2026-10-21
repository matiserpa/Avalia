import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { PaginaPublica } from '@/components/layout/EncabezadoPublico';
import { FormularioPerfil } from '@/components/perfil/FormularioPerfil';
import { valoresInicialesPerfil } from '@/features/profesional/perfil';
import { requerirSesion } from '@/lib/auth/guardas';
import { destinoInicial } from '@/lib/auth/sesion';
import { urlImagen } from '@/lib/imagenes-url';
import { guardarBienvenida } from './acciones';

export const metadata: Metadata = { title: 'Tu perfil' };

// Consentimiento (si entró con código) y perfil, en una sola pantalla.
export default async function Bienvenida() {
  const s = await requerirSesion();
  if (s.esAdmin || s.usuario.institucionId) redirect(destinoInicial(s));
  const pedirConsentimiento = !s.usuario.aceptoLegalesEn;

  const iniciales = await valoresInicialesPerfil(s);

  return (
    <PaginaPublica ancho="angosto" mostrarVerificar={false}>
      <div className="mx-auto max-w-lg pt-4 sm:pt-8">
        <p className="text-[0.9375rem] font-semibold text-tierra-oscuro">Paso 1 de 2</p>
        <h1 className="mt-1 text-[2rem] font-bold leading-tight tracking-tight">Armá tu perfil</h1>
        <p className="mt-2 text-[1.0625rem] text-tinta-suave">
          Tus certificados ya están verificados. Sumá lo que quieras mostrar: lo que cargás acá lo declarás vos y se ve sin
          sello. Nada es público hasta que lo publiques.
        </p>
        <div className="mt-8">
          <FormularioPerfil
            accion={guardarBienvenida}
            iniciales={iniciales}
            fotoUrl={urlImagen(s.perfil?.fotoId)}
            pedirConsentimiento={pedirConsentimiento}
            textoBoton="Ver cómo queda"
          />
        </div>
      </div>
    </PaginaPublica>
  );
}
