'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { Boton } from '@/components/ui/Boton';
import { BotonEnviar } from '@/components/ui/BotonEnviar';
import { Campo } from '@/components/ui/Campo';
import { Aviso } from '@/components/ui/Aviso';
import { accionIngreso, type EstadoIngreso } from './acciones';

const ESPERA_REENVIO = 60;

export function FormularioIngreso({ emailInicial = '' }: { emailInicial?: string }) {
  const [estado, accion] = useActionState<EstadoIngreso, FormData>(accionIngreso, { paso: 'email', email: emailInicial });
  const [forzarEmail, setForzarEmail] = useState(false);
  const paso = forzarEmail ? 'email' : estado.paso;

  if (paso === 'email') {
    return (
      <form
        action={(fd) => {
          setForzarEmail(false);
          return accion(fd);
        }}
        className="space-y-5"
        noValidate
      >
        <input type="hidden" name="intencion" value="pedir" />
        <Campo
          etiqueta="Tu mail"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          required
          defaultValue={estado.email}
          error={estado.paso === 'email' ? estado.error : undefined}
          ayuda="El mismo que le diste a tu institución."
        />
        <BotonEnviar anchoCompleto tamano="lg" textoEnviando="Enviando el código…">
          Mandame el código
        </BotonEnviar>
      </form>
    );
  }

  return <PasoCodigo key={estado.pedidoEn} estado={estado} accion={accion} alCambiarMail={() => setForzarEmail(true)} />;
}

function PasoCodigo({
  estado,
  accion,
  alCambiarMail,
}: {
  estado: EstadoIngreso;
  accion: (fd: FormData) => void;
  alCambiarMail: () => void;
}) {
  const [restante, setRestante] = useState(ESPERA_REENVIO);
  const campo = useRef<HTMLInputElement>(null);

  // La cuenta regresiva arranca de nuevo con cada código pedido: el componente se vuelve a
  // montar porque su key es el momento del pedido.
  useEffect(() => {
    const t = setInterval(() => setRestante((r) => (r > 0 ? r - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    campo.current?.focus();
  }, [estado.pedidoEn, estado.error]);

  return (
    <div className="space-y-6">
      <Aviso tono="exito" titulo="Revisá tu mail">
        Si <strong className="break-all">{estado.email}</strong> tiene certificados o una cuenta, te llega un código de 6
        números en unos minutos.
      </Aviso>
      <form action={accion} className="space-y-5" noValidate>
        <input type="hidden" name="intencion" value="ingresar" />
        <input type="hidden" name="email" value={estado.email} />
        <Campo
          ref={campo}
          etiqueta="Código de 6 números"
          name="codigo"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          maxLength={7}
          required
          className="[&_input]:text-center [&_input]:text-2xl [&_input]:font-bold [&_input]:tracking-[0.4em]"
          error={estado.paso === 'codigo' ? estado.error : undefined}
        />
        <BotonEnviar anchoCompleto tamano="lg" textoEnviando="Verificando…">
          Ingresar
        </BotonEnviar>
      </form>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
        <form action={accion}>
          <input type="hidden" name="intencion" value="reenviar" />
          <input type="hidden" name="email" value={estado.email} />
          <Boton type="submit" variante="fantasma" tamano="sm" disabled={restante > 0}>
            {restante > 0 ? `Reenviar código en ${restante} s` : 'Reenviar código'}
          </Boton>
        </form>
        <Boton type="button" variante="fantasma" tamano="sm" onClick={alCambiarMail}>
          Usar otro mail
        </Boton>
      </div>

      <details className="rounded-2xl border border-borde-suave bg-papel p-4">
        <summary className="flex min-h-12 cursor-pointer items-center font-semibold">¿No te llega el código?</summary>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-tinta-suave">
          <li>Esperá un par de minutos y revisá las carpetas de spam y promociones.</li>
          <li>Si pediste varios códigos seguidos, esperá una hora antes de pedir otro.</li>
          <li>Fijate que el mail esté bien escrito: {estado.email}.</li>
          <li>Probá con el mail que le diste a la institución que te emitió el certificado.</li>
          <li>Si nada de eso funciona, pedile a tu institución que te reenvíe el link de activación.</li>
        </ul>
      </details>
    </div>
  );
}
