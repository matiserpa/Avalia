'use client';

// Carga de la planilla en dos pasos: pegar (o subir un CSV) y revisar antes de confirmar.

import { useActionState, useState } from 'react';
import { Aviso } from '@/components/ui/Aviso';
import { Boton } from '@/components/ui/Boton';
import { BotonEnviar } from '@/components/ui/BotonEnviar';
import { AreaTexto } from '@/components/ui/Campo';
import { ElegirArchivo } from '@/components/ui/ElegirArchivo';
import { Icono } from '@/components/ui/Icono';
import { cantidad } from '@/lib/texto';
import { confirmarCarga, revisarPlanilla, type EstadoPlanilla } from '../../../acciones';

const EJEMPLO = `Nombre\tApellido\tMail
Camila\tSosa\tcamila@ejemplo.com
Lucía\tNavarro\tlucia@ejemplo.com`;

export function CargaPlanilla({ cursoId }: { cursoId: string }) {
  const [estado, enviar] = useActionState<EstadoPlanilla, FormData>(revisarPlanilla, { paso: 'pegar' });
  const [volver, setVolver] = useState(false);

  if (estado.paso === 'revisar' && !volver) {
    const validas = estado.filas.filter((f) => !f.error);
    const conError = estado.filas.length - validas.length;
    return (
      <div className="space-y-6">
        <div className="space-y-3">
          {estado.avisos.map((a) => (
            <Aviso key={a} tono="info">
              {a}
            </Aviso>
          ))}
          <Aviso tono={conError > 0 ? 'atencion' : 'exito'} titulo={`${cantidad(validas.length, 'egresada lista', 'egresadas listas')} para cargar`}>
            {conError > 0
              ? conError === 1
                ? '1 fila tiene algo para revisar y no se va a cargar. Corregila en la planilla y volvé a pegarla, o agregala a mano.'
                : `${conError} filas tienen algo para revisar y no se van a cargar. Corregilas en la planilla y volvé a pegarlas, o agregalas a mano.`
              : 'Revisá que los nombres estén bien: así van a figurar en los certificados.'}
          </Aviso>
        </div>

        {/* En el celular, una tarjeta por fila; en pantallas grandes, la tabla. */}
        <ul className="divide-y divide-borde-suave rounded-tarjeta border border-borde-suave bg-papel sm:hidden">
          {estado.filas.map((f) => (
            <li key={f.fila} className={`p-4 ${f.error ? 'bg-error-claro/50' : ''}`}>
              <p className="text-[0.875rem] text-tinta-suave">Fila {f.fila}</p>
              <p className="font-semibold">
                {f.nombre} {f.apellido}
              </p>
              <p className="break-all text-[0.9375rem] text-tinta-suave">{f.email}</p>
              <EstadoFila error={f.error} />
            </li>
          ))}
        </ul>
        <div className="hidden overflow-x-auto rounded-tarjeta border border-borde-suave bg-papel sm:block">
          <table className="w-full min-w-[36rem] text-left text-[0.9375rem]">
            <caption className="sr-only">Filas de la planilla</caption>
            <thead className="border-b border-borde-suave bg-crema-claro">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Fila</th>
                <th scope="col" className="px-4 py-3 font-semibold">Nombre</th>
                <th scope="col" className="px-4 py-3 font-semibold">Apellido</th>
                <th scope="col" className="px-4 py-3 font-semibold">Mail</th>
                <th scope="col" className="px-4 py-3 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borde-suave">
              {estado.filas.map((f) => (
                <tr key={f.fila} className={f.error ? 'bg-error-claro/50' : undefined}>
                  <td className="numeros-tabulares px-4 py-3 text-tinta-suave">{f.fila}</td>
                  <td className="px-4 py-3">{f.nombre}</td>
                  <td className="px-4 py-3">{f.apellido}</td>
                  <td className="break-all px-4 py-3">{f.email}</td>
                  <td className="px-4 py-3">
                    <EstadoFila error={f.error} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          {validas.length > 0 && (
            <form action={confirmarCarga}>
              <input type="hidden" name="cursoId" value={cursoId} />
              <input
                type="hidden"
                name="filas"
                value={JSON.stringify(validas.map(({ nombre, apellido, email }) => ({ nombre, apellido, email })))}
              />
              <BotonEnviar tamano="lg" icono="check" textoEnviando="Cargando…" anchoCompleto>
                {validas.length === 1 ? 'Cargar 1 egresada' : `Cargar ${validas.length} egresadas`}
              </BotonEnviar>
            </form>
          )}
          <Boton type="button" variante="secundario" tamano="lg" onClick={() => setVolver(true)}>
            Volver a pegar
          </Boton>
        </div>
      </div>
    );
  }

  const error = estado.paso === 'pegar' ? estado.error : undefined;
  const errorArchivo = estado.paso === 'pegar' ? estado.errorArchivo : undefined;
  const texto = estado.paso === 'pegar' ? estado.texto : undefined;
  return (
    <form action={(fd) => { setVolver(false); return enviar(fd); }} className="space-y-6" noValidate>
      <input type="hidden" name="cursoId" value={cursoId} />
      <AreaTexto
        etiqueta="Pegá las filas de tu planilla"
        name="filas"
        defaultValue={texto}
        error={error}
        placeholder={EJEMPLO}
        spellCheck={false}
        className="[&_textarea]:min-h-56 [&_textarea]:font-mono [&_textarea]:text-[0.9375rem]"
        ayuda="Seleccioná en Excel o Google Sheets las columnas Nombre, Apellido y Mail, con el encabezado, copialas y pegalas acá. Si la planilla tiene DNI, no pasa nada: lo ignoramos."
      />
      <ElegirArchivo
        etiqueta="O subí la planilla guardada como CSV"
        opcional
        textoBoton="Elegir archivo CSV"
        name="archivo"
        icono="planilla"
        accept=".csv,text/csv"
        ayuda="En Excel: Archivo › Guardar como › CSV. En Google Sheets: Archivo › Descargar › CSV."
        error={errorArchivo}
      />
      <BotonEnviar tamano="lg" textoEnviando="Leyendo la planilla…">
        Revisar
      </BotonEnviar>
    </form>
  );
}

function EstadoFila({ error }: { error?: string }) {
  return error ? (
    <span className="inline-flex items-start gap-1.5 font-medium text-error">
      <Icono nombre="alerta" className="mt-0.5 size-4 shrink-0" />
      {error}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-tinta-suave">
      <Icono nombre="check" className="size-4" />
      Lista
    </span>
  );
}
