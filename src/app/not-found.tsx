import { PaginaPublica } from '@/components/layout/EncabezadoPublico';
import { BotonLink } from '@/components/ui/Boton';
import { EstadoVacio } from '@/components/ui/EstadoVacio';

export default function NoEncontrada() {
  return (
    <PaginaPublica ancho="angosto">
      <EstadoVacio
        icono="lupa"
        nivel="h1"
        titulo="No encontramos esta página"
        className="mt-6 sm:mt-12"
        accion={
          <div className="flex flex-col gap-3 sm:flex-row">
            <BotonLink href="/" variante="secundario">
              Ir a la portada
            </BotonLink>
            <BotonLink href="/verificar" icono="lupa">
              Verificar un certificado
            </BotonLink>
          </div>
        }
      >
        <p>Puede que el link esté mal escrito o que la página ya no exista.</p>
      </EstadoVacio>
    </PaginaPublica>
  );
}
