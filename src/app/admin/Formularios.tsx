'use client';

import { useActionState } from 'react';
import { Aviso } from '@/components/ui/Aviso';
import { BotonEnviar } from '@/components/ui/BotonEnviar';
import { Campo } from '@/components/ui/Campo';
import { altaInstitucion, invitar, type EstadoAlta, type EstadoInvitar } from './acciones';

export function AltaInstitucion() {
  const [estado, enviar] = useActionState<EstadoAlta, FormData>(altaInstitucion, { intento: 0 });
  const e = estado.errores ?? {};
  const v = estado.valores;
  return (
    <form key={estado.intento} action={enviar} className="space-y-5" noValidate>
      {estado.ok && <Aviso tono="exito">{estado.ok}</Aviso>}
      {Object.keys(e).length > 0 && <Aviso tono="error">Revisá los datos marcados{e.logo ? ' y volvé a elegir el logo' : ''}.</Aviso>}
      <Campo etiqueta="Nombre de la institución" name="nombre" defaultValue={v?.nombre} error={e.nombre} ayuda="Como va a figurar en los certificados." />
      <Campo etiqueta="Ciudad" name="ciudad" opcional defaultValue={v?.ciudad} error={e.ciudad} />
      <div>
        <label htmlFor="campo-logo" className="mb-1.5 block font-semibold">
          Logo
        </label>
        <input
          id="campo-logo"
          name="logo"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          aria-describedby={e.logo ? 'campo-logo-ayuda campo-logo-error' : 'campo-logo-ayuda'}
          aria-invalid={e.logo ? true : undefined}
          className="block w-full text-[0.9375rem] file:mr-4 file:min-h-12 file:cursor-pointer file:rounded-full file:border file:border-borde file:bg-papel file:px-5 file:font-semibold file:text-tinta hover:file:bg-crema-claro"
        />
        <p id="campo-logo-ayuda" className="mt-1.5 text-[0.9375rem] text-tinta-suave">
          PNG o JPG, idealmente cuadrado y con fondo claro. Va en cada certificado.
        </p>
        {e.logo && (
          <p id="campo-logo-error" className="mt-1.5 text-[0.9375rem] font-medium text-error">
            {e.logo}
          </p>
        )}
      </div>
      <Campo
        etiqueta="Mail de la persona responsable"
        name="email"
        type="email"
        autoComplete="off"
        defaultValue={v?.email}
        error={e.email}
        ayuda="Le mandamos una invitación para entrar al panel con un código, sin contraseña."
      />
      <BotonEnviar icono="mail" textoEnviando="Creando…">
        Crear institución y mandar la invitación
      </BotonEnviar>
    </form>
  );
}

export function InvitarAlEquipo({ institucionId, nombre }: { institucionId: string; nombre: string }) {
  const [estado, enviar] = useActionState<EstadoInvitar, FormData>(invitar, {});
  return (
    <form action={enviar} className="space-y-3" noValidate>
      <input type="hidden" name="institucionId" value={institucionId} />
      <Campo
        etiqueta={`Sumar a otra persona de ${nombre}`}
        name="email"
        idBase={`invitar-${institucionId}`}
        type="email"
        autoComplete="off"
        placeholder="nombre@ejemplo.com"
        error={estado.ok === false ? estado.mensaje : undefined}
      />
      {estado.ok && <Aviso tono="exito">{estado.mensaje}</Aviso>}
      <BotonEnviar variante="secundario" tamano="sm" icono="mail" textoEnviando="Invitando…">
        Invitar
      </BotonEnviar>
    </form>
  );
}
