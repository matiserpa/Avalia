import { PaginaPublica } from '@/components/layout/EncabezadoPublico';
import { BotonLink } from '@/components/ui/Boton';
import { EstadoVacio } from '@/components/ui/EstadoVacio';

// El mismo mensaje para un perfil privado y para uno que no existe.
export default function PerfilNoDisponible() {
  return (
    <PaginaPublica ancho="angosto">
      <EstadoVacio
        icono="candado"
        titulo="Este perfil no está disponible"
        nivel="h1"
        className="mt-6 sm:mt-12"
        accion={
          <BotonLink href="/verificar" icono="lupa">
            Verificar un certificado
          </BotonLink>
        }
      >
        <p>Puede que el link esté mal escrito o que la profesional haya decidido no mostrarlo por ahora.</p>
        <p className="mt-2">Si tenés un certificado suyo, podés verificarlo con el código.</p>
      </EstadoVacio>
    </PaginaPublica>
  );
}
