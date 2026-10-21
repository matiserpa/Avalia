'use client';

// Acciones por egresada en el detalle del curso. Cada una es un formulario con su propio estado:
// funciona sin JavaScript y muestra el resultado al lado.

import { useActionState } from 'react';
import { Aviso } from '@/components/ui/Aviso';
import { BotonLink } from '@/components/ui/Boton';
import { BotonEnviar } from '@/components/ui/BotonEnviar';
import { AreaTexto, Campo } from '@/components/ui/Campo';
import { CopiarTexto } from '@/components/ui/CopiarTexto';
import { Icono } from '@/components/ui/Icono';
import {
  accionCertificado,
  agregar,
  corregir,
  quitar,
  type EstadoCertificado,
  type EstadoEgresada,
} from '../../acciones';

function Resultado({ estado, nombre }: { estado: EstadoCertificado; nombre: string }) {
  if (estado.tipo === 'mensaje') {
    return (
      <Aviso tono={estado.ok ? 'exito' : 'error'} className="mt-3">
        {estado.texto}
      </Aviso>
    );
  }
  if (estado.tipo === 'link') {
    return (
      <div className="mt-3 space-y-2 rounded-2xl border border-borde-suave bg-crema-claro p-3">
        <p className="text-[0.9375rem]">Link nuevo para {nombre}. Sirve una sola vez y vence en 45 días.</p>
        <CopiarTexto texto={estado.link} etiqueta={`Link de activación de ${nombre}`} />
        <BotonLink href={`https://wa.me/?text=${encodeURIComponent(estado.mensaje)}`} externo variante="secundario" icono="whatsapp" tamano="sm">
          Mandar por WhatsApp
        </BotonLink>
      </div>
    );
  }
  return null;
}

function AccionCertificado({
  accion,
  certificadoId,
  cursoId,
  nombre,
  children,
  variante = 'secundario',
  textoEnviando,
}: {
  accion: 'reenviar' | 'link';
  certificadoId: string;
  cursoId: string;
  nombre: string;
  children: React.ReactNode;
  variante?: 'secundario' | 'fantasma';
  textoEnviando: string;
}) {
  const [estado, enviar] = useActionState<EstadoCertificado, FormData>(accionCertificado, { tipo: 'nada' });
  return (
    <form action={enviar} className="contents">
      <input type="hidden" name="accion" value={accion} />
      <input type="hidden" name="certificadoId" value={certificadoId} />
      <input type="hidden" name="cursoId" value={cursoId} />
      <BotonEnviar variante={variante} tamano="sm" icono={accion === 'reenviar' ? 'mail' : 'link'} textoEnviando={textoEnviando}>
        {children}
      </BotonEnviar>
      {estado.tipo !== 'nada' && (
        <div className="basis-full">
          <Resultado estado={estado} nombre={nombre} />
        </div>
      )}
    </form>
  );
}

export function AccionesCertificado({
  certificadoId,
  cursoId,
  nombre,
  activado,
}: {
  certificadoId: string;
  cursoId: string;
  nombre: string;
  activado: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <AccionCertificado accion="reenviar" certificadoId={certificadoId} cursoId={cursoId} nombre={nombre} textoEnviando="Enviando…">
        Reenviar mail
      </AccionCertificado>
      {!activado && (
        <AccionCertificado accion="link" certificadoId={certificadoId} cursoId={cursoId} nombre={nombre} textoEnviando="Creando…">
          Crear link para WhatsApp
        </AccionCertificado>
      )}
      <Anular certificadoId={certificadoId} cursoId={cursoId} nombre={nombre} />
    </div>
  );
}

function Anular({ certificadoId, cursoId, nombre }: { certificadoId: string; cursoId: string; nombre: string }) {
  const [estado, enviar] = useActionState<EstadoCertificado, FormData>(accionCertificado, { tipo: 'nada' });
  const error = estado.tipo === 'mensaje' && !estado.ok ? estado.texto : undefined;
  const motivo = estado.tipo === 'mensaje' ? estado.motivo : undefined;
  const intento = estado.tipo === 'mensaje' ? (estado.intento ?? 0) : 0;
  return (
    <details className="group basis-full sm:basis-auto sm:open:basis-full" open={error ? true : undefined}>
      <summary className="inline-flex min-h-12 cursor-pointer list-none items-center [&::-webkit-details-marker]:hidden gap-1.5 rounded-full px-4 text-[0.9375rem] font-semibold text-error hover:bg-error-claro">
        <Icono nombre="cruz-circulo" />
        Anular
      </summary>
      <form key={intento} action={enviar} className="mt-3 space-y-3 rounded-2xl border border-error/30 bg-papel p-4" noValidate>
        <input type="hidden" name="accion" value="anular" />
        <input type="hidden" name="certificadoId" value={certificadoId} />
        <input type="hidden" name="cursoId" value={cursoId} />
        <p className="text-[0.9375rem]">
          El certificado de {nombre} va a dejar de ser válido: su verificación va a decir &quot;anulado&quot;. Después podés corregir los
          datos y emitir uno nuevo.
        </p>
        <AreaTexto
          etiqueta="Motivo"
          name="motivo"
          idBase={`motivo-${certificadoId}`}
          ayuda="Es interno: no se muestra en público."
          defaultValue={motivo}
          error={error}
          className="[&_textarea]:min-h-24"
        />
        <BotonEnviar variante="peligro" tamano="sm" textoEnviando="Anulando…">
          Anular certificado
        </BotonEnviar>
      </form>
    </details>
  );
}

export function CorregirEgresada({
  egresada,
  cursoId,
  puedeQuitar,
}: {
  egresada: { id: string; nombre: string; apellido: string; email: string };
  cursoId: string;
  puedeQuitar: boolean;
}) {
  const [estado, enviar] = useActionState<EstadoEgresada, FormData>(corregir, { intento: 0 });
  const [estadoQuitar, enviarQuitar] = useActionState<EstadoEgresada, FormData>(quitar, { intento: 0 });
  const e = estado.errores ?? {};
  // Con errores, lo que escribió; si no, los datos guardados.
  const v = estado.errores ? estado.valores : undefined;
  const base = egresada.id;
  return (
    <div className="flex flex-wrap items-start gap-2">
      <details className="basis-full sm:basis-auto sm:open:basis-full" open={Object.keys(e).length > 0 || undefined}>
        <summary className="inline-flex min-h-12 cursor-pointer list-none items-center [&::-webkit-details-marker]:hidden gap-1.5 rounded-full border border-borde px-4 text-[0.9375rem] font-semibold hover:bg-crema-claro">
          <Icono nombre="editar" />
          Corregir datos
        </summary>
        <form key={estado.intento} action={enviar} className="mt-3 grid gap-3 rounded-2xl border border-borde-suave bg-papel p-4 sm:grid-cols-3" noValidate>
          <input type="hidden" name="egresadaId" value={egresada.id} />
          <input type="hidden" name="cursoId" value={cursoId} />
          <Campo etiqueta="Nombre" name="nombre" idBase={`${base}-nombre`} defaultValue={v?.nombre ?? egresada.nombre} error={e.nombre} />
          <Campo etiqueta="Apellido" name="apellido" idBase={`${base}-apellido`} defaultValue={v?.apellido ?? egresada.apellido} error={e.apellido} />
          <Campo etiqueta="Mail" name="email" type="email" idBase={`${base}-email`} defaultValue={v?.email ?? egresada.email} error={e.email} />
          <div className="sm:col-span-3">
            <BotonEnviar tamano="sm" textoEnviando="Guardando…">
              Guardar
            </BotonEnviar>
          </div>
        </form>
      </details>
      {estado.ok && <Aviso tono="exito">Guardamos los datos.</Aviso>}
      {puedeQuitar && (
        <form action={enviarQuitar}>
          <input type="hidden" name="egresadaId" value={egresada.id} />
          <input type="hidden" name="cursoId" value={cursoId} />
          <BotonEnviar variante="fantasma" tamano="sm" icono="basura" textoEnviando="Quitando…">
            Quitar
          </BotonEnviar>
          {estadoQuitar.error && (
            <Aviso tono="error" className="mt-2">
              {estadoQuitar.error}
            </Aviso>
          )}
        </form>
      )}
    </div>
  );
}

export function AgregarEgresada({ cursoId }: { cursoId: string }) {
  const [estado, enviar] = useActionState<EstadoEgresada, FormData>(agregar, { intento: 0 });
  const e = estado.errores ?? {};
  return (
    <form key={estado.intento} action={enviar} className="space-y-4" noValidate>
      {estado.ok && <Aviso tono="exito">Listo, la agregamos. Podés seguir cargando.</Aviso>}
      <input type="hidden" name="cursoId" value={cursoId} />
      <div className="grid gap-4 sm:grid-cols-3">
        <Campo etiqueta="Nombre" name="nombre" idBase="nueva-nombre" autoComplete="off" defaultValue={estado.valores?.nombre} error={e.nombre} />
        <Campo etiqueta="Apellido" name="apellido" idBase="nueva-apellido" autoComplete="off" defaultValue={estado.valores?.apellido} error={e.apellido} />
        <Campo etiqueta="Mail" name="email" type="email" idBase="nueva-email" autoComplete="off" defaultValue={estado.valores?.email} error={e.email} />
      </div>
      <BotonEnviar variante="secundario" icono="mas" textoEnviando="Agregando…">
        Agregar egresada
      </BotonEnviar>
    </form>
  );
}
