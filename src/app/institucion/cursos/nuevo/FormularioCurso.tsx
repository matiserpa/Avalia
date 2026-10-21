'use client';

import { useActionState, useState } from 'react';
import { Aviso } from '@/components/ui/Aviso';
import { BotonEnviar } from '@/components/ui/BotonEnviar';
import { Campo, Selector } from '@/components/ui/Campo';
import { fechaLarga } from '@/lib/texto';
import { nuevoCurso, type EstadoCurso } from '../../acciones';

const TIPOS = [
  { valor: '', texto: 'Elegí una opción' },
  { valor: 'formacion', texto: 'Formación' },
  { valor: 'masterclass', texto: 'Masterclass' },
  { valor: 'congreso', texto: 'Congreso' },
  { valor: 'jornada', texto: 'Jornada' },
  { valor: 'workshop', texto: 'Taller (workshop)' },
];

export function FormularioCurso() {
  const [estado, enviar] = useActionState<EstadoCurso, FormData>(nuevoCurso, { intento: 0 });
  const v = estado.valores;
  const e = estado.errores ?? {};
  // La fecha elegida, escrita en palabras: según el idioma del navegador, el campo muestra mm/dd.
  const [fecha, setFecha] = useState(v?.fecha ?? '');
  return (
    <form key={estado.intento} action={enviar} className="space-y-6" noValidate>
      {Object.keys(e).length > 0 && <Aviso tono="error">Revisá los datos marcados.</Aviso>}
      <Campo
        etiqueta="Nombre del curso"
        name="nombre"
        defaultValue={v?.nombre}
        error={e.nombre}
        ayuda="Tal como querés que figure en el certificado."
        required
      />
      <div className="grid gap-6 sm:grid-cols-2">
        <Selector etiqueta="Tipo" name="tipo" defaultValue={v?.tipo ?? ''} error={e.tipo} opciones={TIPOS} required />
        <Campo
          etiqueta="Carga horaria"
          name="cargaHoraria"
          inputMode="decimal"
          defaultValue={v?.cargaHoraria}
          error={e.cargaHoraria}
          ayuda="En horas. Por ejemplo: 16 o 2,5."
          required
        />
      </div>
      <Campo
        etiqueta="Fecha"
        name="fecha"
        type="date"
        defaultValue={v?.fecha}
        onChange={(ev) => setFecha(ev.currentTarget.value)}
        error={e.fecha}
        ayuda={
          <>
            La de realización, o la de finalización si duró varios meses. Es la que figura en el certificado.
            {/^\d{4}-\d{2}-\d{2}$/.test(fecha) && (
              <>
                {' '}
                Elegiste el <strong className="text-tinta">{fechaLarga(fecha)}</strong>: revisá el día y el mes.
              </>
            )}
          </>
        }
        required
      />
      <Campo etiqueta="Docente o disertante" name="docente" opcional defaultValue={v?.docente} error={e.docente} />
      <Aviso tono="info">Una vez que emitas certificados, el curso no se puede editar: así el certificado no cambia después.</Aviso>
      <BotonEnviar tamano="lg" textoEnviando="Creando…">
        Crear curso
      </BotonEnviar>
    </form>
  );
}
