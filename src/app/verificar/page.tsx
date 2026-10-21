import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { PaginaPublica } from '@/components/layout/EncabezadoPublico';
import { Icono } from '@/components/ui/Icono';
import { normalizarCodigo } from '@/lib/certificados/codigo';
import { FormularioCodigo } from './FormularioCodigo';

export const metadata: Metadata = {
  title: 'Verificar un certificado',
  description: 'Escribí el código del certificado y comprobá que es auténtico.',
};

export default async function PaginaVerificar({ searchParams }: PageProps<'/verificar'>) {
  const sp = await searchParams;
  const enviado = 'codigo' in sp;
  const entrada = typeof sp.codigo === 'string' ? sp.codigo.trim() : '';
  let error: string | undefined;
  if (enviado) {
    const codigo = normalizarCodigo(entrada);
    if (codigo) redirect(`/v/${codigo}?c=codigo`);
    error = entrada
      ? 'Ese código no tiene el formato correcto. Son 8 letras y números, por ejemplo AB12-CD34.'
      : 'Escribí el código del certificado.';
  }

  return (
    <PaginaPublica ancho="angosto" mostrarVerificar={false}>
      <div className="mx-auto max-w-md pt-6 sm:pt-10">
        <span className="mb-5 flex size-14 items-center justify-center rounded-full bg-crema text-tierra">
          <Icono nombre="lupa" className="size-7" />
        </span>
        <h1 className="text-[2rem] font-bold leading-tight tracking-tight">Verificar un certificado</h1>
        <p className="mt-2 text-tinta-suave">
          Escribí el código y te mostramos si el certificado es válido y quién lo emitió. No necesitás cuenta.
        </p>
        <div className="mt-8">
          <FormularioCodigo valor={entrada} error={error} />
        </div>
        <div className="mt-8 flex gap-3 rounded-2xl border border-borde-suave bg-papel p-4 text-[0.9375rem] text-tinta-suave">
          <Icono nombre="qr" className="mt-0.5 size-5 shrink-0 text-tierra" />
          <p>¿Tenés el certificado en papel o en PDF? Escaneá el QR con la cámara del celular y vas directo.</p>
        </div>
      </div>
    </PaginaPublica>
  );
}
