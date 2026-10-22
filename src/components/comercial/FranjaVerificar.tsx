import Link from 'next/link';
import { FormularioCodigo } from '@/app/verificar/FormularioCodigo';

// Acceso rápido para quien llega a la portada a verificar un certificado.
export function FranjaVerificar() {
  return (
    <section
      id="verificar"
      aria-labelledby="titulo-verificar"
      className="scroll-mt-6 rounded-tarjeta bg-crema-claro p-5 sm:p-8 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-start md:gap-10"
    >
      <div>
        <h2 id="titulo-verificar" className="text-[1.375rem] font-bold tracking-tight">
          ¿Te mostraron un certificado?
        </h2>
        <p className="mt-2 text-tinta-suave">
          Escribí el código y comprobá quién lo emitió, a nombre de quién y si sigue válido. Es gratis y no necesitás cuenta.
        </p>
        <p className="mt-4 hidden text-[0.9375rem] md:block">
          ¿Sos profesional de la estética?{' '}
          <Link href="/profesionales" className="font-semibold underline underline-offset-4">
            Conocé tu pasaporte
          </Link>
        </p>
      </div>
      <div className="mt-5 md:mt-0">
        <FormularioCodigo variante="secundario" />
        <p className="mt-4 text-[0.9375rem] md:hidden">
          ¿Sos profesional de la estética?{' '}
          <Link href="/profesionales" className="font-semibold underline underline-offset-4">
            Conocé tu pasaporte
          </Link>
        </p>
      </div>
    </section>
  );
}
