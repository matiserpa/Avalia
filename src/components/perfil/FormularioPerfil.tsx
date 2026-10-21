'use client';

// Formulario del perfil de la profesional. Lo usan /bienvenida (con el consentimiento, si todavía
// no lo dio) y /panel/perfil. Todo lo que se carga acá lo declara ella: se muestra sin sello.

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { Aviso } from '@/components/ui/Aviso';
import { Avatar } from '@/components/ui/Avatar';
import { BotonEnviar } from '@/components/ui/BotonEnviar';
import { Campo, Casilla, Selector } from '@/components/ui/Campo';
import { Icono } from '@/components/ui/Icono';
import { esperarImagenes, prepararCampoImagen } from '@/lib/achicar-imagen';
import { PROFESIONES } from '@/lib/texto';

export type ValoresPerfil = {
  nombre: string;
  apellido: string;
  profesion: string;
  ciudad: string;
  matricula: string;
  mostrarMatricula: boolean;
  contactoTipo: '' | 'whatsapp' | 'instagram';
  contactoValor: string;
};

export type EstadoFormPerfil = {
  // Cambia en cada envío: vuelve a montar el formulario con los valores que mandó.
  intento: number;
  ok?: boolean;
  errores?: Partial<Record<keyof ValoresPerfil | 'foto' | 'acepto', string>>;
  valores?: ValoresPerfil;
  // Si había elegido una foto: el formulario vuelve sin ella y hay que pedirle que la elija de nuevo.
  habiaArchivo?: boolean;
};

export function FormularioPerfil({
  accion,
  iniciales,
  fotoUrl,
  pedirConsentimiento = false,
  textoBoton,
  textoOk,
}: {
  accion: (prev: EstadoFormPerfil, fd: FormData) => Promise<EstadoFormPerfil>;
  iniciales: ValoresPerfil;
  fotoUrl: string | null;
  pedirConsentimiento?: boolean;
  textoBoton: string;
  textoOk?: string;
}) {
  const [estado, enviar] = useActionState(accion, { intento: 0 });
  const valores = estado.valores ?? iniciales;
  const e = estado.errores ?? {};
  const hayErrores = Object.keys(e).length > 0;
  return (
    <form key={estado.intento} action={enviar} onSubmit={esperarImagenes} className="space-y-8" noValidate>
      {hayErrores && (
        <Aviso tono="error" titulo="Revisá los datos marcados">
          {e.foto
            ? 'Elegí otra foto o seguí sin foto.'
            : estado.habiaArchivo
              ? 'Corregilos y volvé a elegir la foto: la guardamos recién cuando está todo bien.'
              : 'Corregilos y volvé a intentar.'}
        </Aviso>
      )}
      {estado.ok && textoOk && <Aviso tono="exito">{textoOk}</Aviso>}

      {pedirConsentimiento && (
        <fieldset className="rounded-tarjeta border border-borde-suave bg-papel p-5 sm:p-6">
          <legend className="px-1 text-[1.1875rem] font-bold">Antes de empezar</legend>
          <p className="mb-4 text-tinta-suave">
            Para activar tu pasaporte necesitamos que aceptes cómo usamos tus datos. Tu perfil arranca privado.
          </p>
          <Casilla name="acepto" value="si" error={e.acepto}>
            Leí y acepto los{' '}
            <Link href="/terminos" target="_blank" className="font-semibold underline underline-offset-4">
              términos
            </Link>{' '}
            y la{' '}
            <Link href="/privacidad" target="_blank" className="font-semibold underline underline-offset-4">
              política de privacidad
            </Link>
            .
          </Casilla>
        </fieldset>
      )}

      <Foto fotoUrl={fotoUrl} nombre={valores.nombre} apellido={valores.apellido} error={e.foto} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Campo etiqueta="Nombre" name="nombre" autoComplete="given-name" defaultValue={valores.nombre} error={e.nombre} required />
        <Campo etiqueta="Apellido" name="apellido" autoComplete="family-name" defaultValue={valores.apellido} error={e.apellido} required />
      </div>

      <Profesion inicial={valores.profesion} error={e.profesion} />

      <Campo
        etiqueta="Ciudad"
        name="ciudad"
        opcional
        autoComplete="address-level2"
        defaultValue={valores.ciudad}
        error={e.ciudad}
        ayuda="Donde atendés. Por ejemplo: Neuquén."
      />

      <div className="space-y-3">
        <Campo
          etiqueta="Matrícula"
          name="matricula"
          opcional
          defaultValue={valores.matricula}
          error={e.matricula}
          ayuda="Se muestra como declarada por vos, sin sello."
        />
        <Casilla name="mostrarMatricula" value="si" defaultChecked={valores.mostrarMatricula}>
          Mostrarla en mi perfil
        </Casilla>
      </div>

      <Contacto tipoInicial={valores.contactoTipo} valorInicial={valores.contactoValor} error={e.contactoValor} />

      <BotonEnviar tamano="lg" anchoCompleto textoEnviando="Guardando…">
        {textoBoton}
      </BotonEnviar>
    </form>
  );
}

function Foto({ fotoUrl, nombre, apellido, error }: { fotoUrl: string | null; nombre: string; apellido: string; error?: string }) {
  const [vista, setVista] = useState<string | null>(null);
  const [quitar, setQuitar] = useState(false);
  // El error del navegador (la foto pesa demasiado) se muestra igual que el del servidor.
  const [errorLocal, setErrorLocal] = useState<string | undefined>();
  const [preparando, setPreparando] = useState(false);
  const mostrada = vista ?? (quitar ? null : fotoUrl);
  const errorFoto = errorLocal ?? error;
  return (
    <div>
      <p id="foto-etiqueta" className="mb-3 font-semibold">
        Foto de perfil <span className="font-normal text-tinta-suave">(opcional)</span>
      </p>
      <div className="flex items-center gap-5">
        <Avatar fotoUrl={mostrada} nombre={nombre || ' '} apellido={apellido || ' '} tamano="lg" />
        <div className="space-y-2">
          <label
            htmlFor="campo-foto"
            className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-full border border-borde bg-papel px-5 font-semibold hover:bg-crema-claro has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-tierra"
          >
            <Icono nombre="foto" />
            {mostrada ? 'Cambiar foto' : 'Elegir foto'}
            <input
              id="campo-foto"
              name="foto"
              type="file"
              accept="image/*"
              className="sr-only"
              aria-describedby={errorFoto ? 'campo-foto-error' : 'campo-foto-ayuda'}
              aria-invalid={errorFoto ? true : undefined}
              onChange={async (ev) => {
                // Se achica antes de subirla: el hosting rechaza envíos de más de 4,5 MB.
                setPreparando(true);
                const { archivo, error: e } = await prepararCampoImagen(ev.currentTarget);
                setPreparando(false);
                setErrorLocal(e);
                setVista(archivo ? URL.createObjectURL(archivo) : null);
                if (archivo) setQuitar(false);
              }}
            />
          </label>
          {fotoUrl && !vista && (
            <Casilla name="quitarFoto" value="si" checked={quitar} onChange={(ev) => setQuitar(ev.currentTarget.checked)}>
              Quitar la foto
            </Casilla>
          )}
        </div>
      </div>
      <p id="campo-foto-ayuda" className="mt-2 text-[0.9375rem] text-tinta-suave">
        Una foto tuya, de frente y con buena luz. Si no subís ninguna, se muestran tus iniciales.
      </p>
      <p aria-live="polite" className="text-[0.9375rem] font-medium text-tinta">
        {preparando ? 'Preparando la foto…' : ''}
      </p>
      {errorFoto && (
        <p id="campo-foto-error" className="mt-1.5 text-[0.9375rem] font-medium text-error">
          {errorFoto}
        </p>
      )}
    </div>
  );
}

function Profesion({ inicial, error }: { inicial: string; error?: string }) {
  const conocida = (PROFESIONES as readonly string[]).includes(inicial);
  const [eleccion, setEleccion] = useState(inicial === '' ? '' : conocida ? inicial : 'otra');
  return (
    <div className="space-y-3">
      <Selector
        etiqueta="Profesión"
        name="profesion"
        opcional
        value={eleccion}
        onChange={(ev) => setEleccion(ev.currentTarget.value)}
        error={eleccion === 'otra' ? undefined : error}
        opciones={[
          { valor: '', texto: 'Elegí una opción' },
          ...PROFESIONES.map((p) => ({ valor: p, texto: p })),
          { valor: 'otra', texto: 'Otra' },
        ]}
      />
      {eleccion === 'otra' && (
        <Campo etiqueta="¿Cuál?" name="profesionOtra" defaultValue={conocida ? '' : inicial} error={error} />
      )}
    </div>
  );
}

function Contacto({ tipoInicial, valorInicial, error }: { tipoInicial: ValoresPerfil['contactoTipo']; valorInicial: string; error?: string }) {
  const [tipo, setTipo] = useState(tipoInicial);
  return (
    <div className="space-y-3">
      <Selector
        etiqueta="Cómo te pueden contactar"
        name="contactoTipo"
        opcional
        value={tipo}
        onChange={(ev) => setTipo(ev.currentTarget.value as ValoresPerfil['contactoTipo'])}
        ayuda="Aparece como un botón en tu perfil. Tu mail nunca se muestra."
        opciones={[
          { valor: '', texto: 'No mostrar contacto' },
          { valor: 'whatsapp', texto: 'WhatsApp' },
          { valor: 'instagram', texto: 'Instagram' },
        ]}
      />
      {tipo === 'whatsapp' && (
        <Campo
          etiqueta="Tu número de WhatsApp"
          name="contactoValor"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          defaultValue={tipoInicial === 'whatsapp' ? valorInicial : ''}
          error={error}
          ayuda="Con código de área. Por ejemplo: 299 412 3456."
        />
      )}
      {tipo === 'instagram' && (
        <Campo
          etiqueta="Tu usuario de Instagram"
          name="contactoValor"
          autoCapitalize="none"
          spellCheck={false}
          defaultValue={tipoInicial === 'instagram' ? valorInicial : ''}
          error={error}
          ayuda="Por ejemplo: @tu.usuario."
        />
      )}
    </div>
  );
}
