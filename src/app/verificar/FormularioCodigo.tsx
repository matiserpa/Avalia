import Form from 'next/form';
import { Boton } from '@/components/ui/Boton';
import { Campo } from '@/components/ui/Campo';

// Formulario para escribir un código a mano. Va por GET a /verificar, que lo revisa y lleva a la
// verificación: funciona aunque el celular no cargue JavaScript.
export function FormularioCodigo({ valor = '', error }: { valor?: string; error?: string }) {
  return (
    <Form action="/verificar" className="space-y-4" noValidate>
      <Campo
        etiqueta="Código del certificado"
        name="codigo"
        defaultValue={valor}
        error={error}
        ayuda="Son 8 letras y números. Está abajo a la izquierda del certificado, junto al QR."
        placeholder="XXXX-XXXX"
        autoComplete="off"
        autoCapitalize="characters"
        autoCorrect="off"
        spellCheck={false}
        maxLength={20}
        // Si volvió con error, el cursor queda en el campo para corregirlo.
        autoFocus={Boolean(error)}
        className="[&_input]:font-semibold [&_input]:uppercase [&_input]:tracking-[0.12em] [&_input]:placeholder:normal-case [&_input]:placeholder:tracking-normal"
      />
      <Boton type="submit" tamano="lg" anchoCompleto icono="lupa">
        Verificar
      </Boton>
    </Form>
  );
}
