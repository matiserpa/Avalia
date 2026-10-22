'use client';

import { useActionState } from 'react';
import { Aviso } from '@/components/ui/Aviso';
import { BotonEnviar } from '@/components/ui/BotonEnviar';
import { Campo } from '@/components/ui/Campo';
import { ElegirArchivo } from '@/components/ui/ElegirArchivo';
import { esperarImagenes } from '@/lib/achicar-imagen';
import { altaInstitucion, invitar, type EstadoAlta, type EstadoInvitar } from './acciones';

export function AltaInstitucion() {
  const [estado, enviar] = useActionState<EstadoAlta, FormData>(altaInstitucion, { intento: 0 });
  const e = estado.errores ?? {};
  const v = estado.valores;
  return (
    <form key={estado.intento} action={enviar} onSubmit={esperarImagenes} className="space-y-5" noValidate>
      {estado.ok && <Aviso tono="exito">{estado.ok}</Aviso>}
      {Object.keys(e).length > 0 && (
        <Aviso tono="error">
          {estado.habiaArchivo
            ? 'Revisá los datos marcados y volvé a elegir el logo: lo guardamos recién cuando está todo bien.'
            : 'Revisá los datos marcados.'}
        </Aviso>
      )}
      <Campo etiqueta="Nombre de la institución" name="nombre" defaultValue={v?.nombre} error={e.nombre} ayuda="Como va a figurar en los certificados." />
      <Campo etiqueta="Ciudad" name="ciudad" opcional defaultValue={v?.ciudad} error={e.ciudad} />
      <ElegirArchivo
        etiqueta="Logo"
        textoBoton="Elegir el logo"
        name="logo"
        icono="imagen"
        esImagen
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        ayuda="PNG, JPG o SVG, idealmente cuadrado y con fondo claro. Va en cada certificado."
        error={e.logo}
      />
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
        Crear y mandar la invitación
      </BotonEnviar>
    </form>
  );
}

export function InvitarAlEquipo({ institucionId, nombre }: { institucionId: string; nombre: string }) {
  const [estado, enviar] = useActionState<EstadoInvitar, FormData>(invitar, {});
  return (
    <form key={estado.intento} action={enviar} className="space-y-3" noValidate>
      <input type="hidden" name="institucionId" value={institucionId} />
      <Campo
        etiqueta={`Sumar a otra persona de ${nombre}`}
        name="email"
        idBase={`invitar-${institucionId}`}
        type="email"
        autoComplete="off"
        placeholder="nombre@example.com"
        defaultValue={estado.email}
        error={estado.ok === false ? estado.mensaje : undefined}
      />
      {estado.ok && <Aviso tono="exito">{estado.mensaje}</Aviso>}
      <BotonEnviar variante="secundario" tamano="sm" icono="mail" textoEnviando="Invitando…">
        Invitar
      </BotonEnviar>
    </form>
  );
}
