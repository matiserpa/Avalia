// Campos de formulario con etiqueta real, ayuda y error asociados (aria-describedby).
// El id sale del name. Si el mismo name se repite en la página (por ejemplo, un formulario por
// fila de una lista), pasá `idBase` distinto en cada uno.

type Base = {
  etiqueta: string;
  name: string;
  ayuda?: React.ReactNode;
  error?: string;
  opcional?: boolean;
  className?: string;
  idBase?: string;
};

function ids(name: string, ayuda: unknown, error: unknown) {
  const id = `campo-${name}`;
  const describedBy = [ayuda ? `${id}-ayuda` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined;
  return { id, describedBy };
}

const CLASE_CONTROL =
  'block w-full min-h-12 rounded-xl border border-borde bg-papel px-4 py-3 text-[1.0625rem] text-tinta placeholder:text-tinta-suave/70 aria-[invalid=true]:border-error aria-[invalid=true]:border-2';

export function Etiqueta({ htmlFor, children, opcional }: { htmlFor: string; children: React.ReactNode; opcional?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block font-semibold">
      {children}
      {opcional && <span className="ml-1.5 font-normal text-tinta-suave">(opcional)</span>}
    </label>
  );
}

export function TextoAyuda({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} className="mt-1.5 text-[0.9375rem] text-tinta-suave">
      {children}
    </p>
  );
}

export function TextoError({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} className="mt-1.5 flex items-start gap-1.5 text-[0.9375rem] font-medium text-error">
      {children}
    </p>
  );
}

export function Campo({
  etiqueta,
  name,
  ayuda,
  error,
  opcional,
  className = '',
  idBase,
  ...input
}: Base & Omit<React.ComponentProps<'input'>, 'name'>) {
  const { id, describedBy } = ids(idBase ?? name, ayuda, error);
  return (
    <div className={className}>
      <Etiqueta htmlFor={id} opcional={opcional}>
        {etiqueta}
      </Etiqueta>
      <input
        id={id}
        name={name}
        className={CLASE_CONTROL}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...input}
      />
      {ayuda && <TextoAyuda id={`${id}-ayuda`}>{ayuda}</TextoAyuda>}
      {error && <TextoError id={`${id}-error`}>{error}</TextoError>}
    </div>
  );
}

export function AreaTexto({
  etiqueta,
  name,
  ayuda,
  error,
  opcional,
  className = '',
  idBase,
  ...props
}: Base & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'name'>) {
  const { id, describedBy } = ids(idBase ?? name, ayuda, error);
  return (
    <div className={className}>
      <Etiqueta htmlFor={id} opcional={opcional}>
        {etiqueta}
      </Etiqueta>
      <textarea
        id={id}
        name={name}
        className={`${CLASE_CONTROL} min-h-32`}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...props}
      />
      {ayuda && <TextoAyuda id={`${id}-ayuda`}>{ayuda}</TextoAyuda>}
      {error && <TextoError id={`${id}-error`}>{error}</TextoError>}
    </div>
  );
}

export function Selector({
  etiqueta,
  name,
  ayuda,
  error,
  opcional,
  className = '',
  opciones,
  idBase,
  ...props
}: Base & { opciones: { valor: string; texto: string }[] } & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'name'>) {
  const { id, describedBy } = ids(idBase ?? name, ayuda, error);
  return (
    <div className={className}>
      <Etiqueta htmlFor={id} opcional={opcional}>
        {etiqueta}
      </Etiqueta>
      <select
        id={id}
        name={name}
        className={`${CLASE_CONTROL} appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%230F1210' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat pr-11`}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...props}
      >
        {opciones.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.texto}
          </option>
        ))}
      </select>
      {ayuda && <TextoAyuda id={`${id}-ayuda`}>{ayuda}</TextoAyuda>}
      {error && <TextoError id={`${id}-error`}>{error}</TextoError>}
    </div>
  );
}

// Casilla de verificación con la etiqueta clickeable al lado (área táctil grande).
export function Casilla({
  name,
  children,
  error,
  className = '',
  idBase,
  ...props
}: { name: string; children: React.ReactNode; error?: string; className?: string; idBase?: string } & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'name' | 'type'
>) {
  const id = `campo-${idBase ?? name}`;
  return (
    <div className={className}>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3 rounded-xl py-1">
        <input
          id={id}
          name={name}
          type="checkbox"
          className="mt-0.5 size-6 shrink-0 cursor-pointer rounded-md border-borde accent-tinta"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        />
        <span>{children}</span>
      </label>
      {error && <TextoError id={`${id}-error`}>{error}</TextoError>}
    </div>
  );
}
