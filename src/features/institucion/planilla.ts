// Lectura de la planilla de egresadas: filas pegadas desde Excel o Google Sheets (separadas por
// tabulador) o un CSV (con coma o punto y coma, como exporta Excel en español).
//
// Reconoce las columnas por su encabezado (Nombre, Apellido, Mail, "Apellido y nombre"...). Si no
// hay encabezado, busca la columna con @ para el mail y usa las de texto para el nombre.
// La columna DNI, si viene, se ignora: no guardamos DNI. Sin encabezado se reconoce por su
// contenido, y un nombre con números se rechaza (por si el DNI cayó en la columna equivocada).

import Papa from 'papaparse';
import { capitalizarNombre, emailValido, normalizarEmail } from '@/lib/texto';

export const MAX_FILAS = 500;

export type FilaPlanilla = {
  // Número de fila en la planilla (para que la institución la encuentre).
  fila: number;
  nombre: string;
  apellido: string;
  email: string;
  error?: string;
};

export type ResultadoPlanilla = {
  filas: FilaPlanilla[];
  // Avisos generales: "Ignoramos la columna DNI", "Separamos nombre y apellido"...
  avisos: string[];
  error?: string;
};

type Columna = 'nombre' | 'apellido' | 'email' | 'completo' | 'apellidoNombre' | 'ignorar' | 'dni';

// "30123456", "30.123.456", "DNI 30.123.456": letras sólo al principio y 6 dígitos o más.
function pareceDocumento(celda: string) {
  return celda.replace(/\D/g, '').length >= 6 && /^[a-zº°.:#\s]*[\d][\d.\s-]*$/i.test(celda.trim());
}

// ¿La mayoría de las celdas con algo cumplen la condición?
function laMayoria(datos: string[][], i: number, condicion: (celda: string) => boolean) {
  const llenas = datos.map((r) => r[i] ?? '').filter(Boolean);
  return llenas.length > 0 && llenas.filter(condicion).length * 2 > llenas.length;
}

function sinTildes(s: string) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

function tipoDeEncabezado(celda: string): Columna | null {
  const c = sinTildes(celda).replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!c) return null;
  if (/\b(dni|documento|cuit|cuil)\b/.test(c)) return 'dni';
  if (/\b(mail|email|e mail|correo)\b/.test(c)) return 'email';
  if (/^apellidos? (y|,)? ?nombres?$/.test(c)) return 'apellidoNombre';
  if (/^nombres? (y|,)? ?apellidos?$|^nombre completo$|^alumn[ao]s?$|^egresad[ao]s?$/.test(c)) return 'completo';
  if (/^apellidos?$/.test(c)) return 'apellido';
  if (/^nombres?$/.test(c)) return 'nombre';
  return 'ignorar';
}

// "López, Martina" → { apellido: 'López', nombre: 'Martina' }; "Martina López" → al revés.
function separar(texto: string, formato: 'completo' | 'apellidoNombre'): { nombre: string; apellido: string } {
  const t = texto.trim().replace(/\s+/g, ' ');
  if (t.includes(',')) {
    const [a, n] = t.split(',', 2).map((x) => x.trim());
    return { nombre: n ?? '', apellido: a ?? '' };
  }
  const partes = t.split(' ');
  if (partes.length < 2) return { nombre: t, apellido: '' };
  return formato === 'apellidoNombre'
    ? { apellido: partes[0], nombre: partes.slice(1).join(' ') }
    : { nombre: partes.slice(0, -1).join(' '), apellido: partes[partes.length - 1] };
}

// Excel en Windows guarda el CSV en Windows-1252 (no en UTF-8): si no es UTF-8 válido, se lee así
// para no romper tildes y eñes.
export function textoDeArchivo(bytes: Uint8Array): string {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return new TextDecoder('windows-1252').decode(bytes);
  }
}

export function leerPlanilla(texto: string): ResultadoPlanilla {
  const limpio = String(texto || '').replace(/^﻿/, '').trim();
  if (!limpio) return { filas: [], avisos: [], error: 'Pegá las filas de tu planilla o elegí un archivo.' };

  const parseado = Papa.parse<string[]>(limpio, { skipEmptyLines: 'greedy', delimitersToGuess: ['\t', ';', ','] });
  const datos = parseado.data.map((r) => r.map((c) => String(c ?? '').trim())).filter((r) => r.some(Boolean));
  if (datos.length === 0) return { filas: [], avisos: [], error: 'No encontramos filas con datos.' };

  const avisos: string[] = [];
  // ¿La primera fila es un encabezado? Sí, si alguna celda es Nombre, Apellido, Mail...
  const posibles = datos[0].map(tipoDeEncabezado);
  const conEncabezado = posibles.some((t) => t && t !== 'ignorar') && !datos[0].some((c) => c.includes('@'));
  let columnas: Columna[];
  let cuerpo: string[][];
  let primeraFila: number;
  if (conEncabezado) {
    columnas = posibles.map((t) => t ?? 'ignorar');
    cuerpo = datos.slice(1);
    primeraFila = 2;
  } else {
    // Sin encabezado: el mail es la columna con @; las de texto son el nombre. Una columna de
    // números de documento se descarta aunque alguna celda diga "s/d".
    const ancho = Math.max(...datos.map((r) => r.length));
    const conArroba = Array.from({ length: ancho }, (_, i) => datos.filter((r) => (r[i] ?? '').includes('@')).length);
    const iMail = conArroba.indexOf(Math.max(...conArroba));
    const indices = Array.from({ length: ancho }, (_, i) => i).filter((i) => i !== iMail);
    const deDocumento = indices.filter((i) => laMayoria(datos, i, (c) => pareceDocumento(c) || !/[a-záéíóúñ]/i.test(c)) && datos.some((r) => pareceDocumento(r[i] ?? '')));
    const deTexto = indices.filter((i) => !deDocumento.includes(i) && laMayoria(datos, i, (c) => /[a-záéíóúñ]/i.test(c) && !pareceDocumento(c)));
    columnas = Array.from({ length: ancho }, () => 'ignorar' as Columna);
    for (const i of deDocumento) columnas[i] = 'dni';
    columnas[iMail] = 'email';
    if (deTexto.length >= 2) {
      columnas[deTexto[0]] = 'nombre';
      columnas[deTexto[1]] = 'apellido';
    } else if (deTexto.length === 1) {
      columnas[deTexto[0]] = 'completo';
    }
    cuerpo = datos;
    primeraFila = 1;
    avisos.push('La planilla no tiene encabezados: tomamos la columna con @ como mail y las dos primeras de texto como nombre y apellido. Revisalo abajo.');
  }

  if (!columnas.includes('email')) {
    return { filas: [], avisos, error: 'No encontramos una columna de mail. Agregá una columna "Mail" a la planilla.' };
  }
  if (columnas.includes('dni')) avisos.push('Ignoramos la columna DNI: no lo guardamos.');
  const formatoJunto = columnas.includes('apellidoNombre') ? 'apellidoNombre' : columnas.includes('completo') ? 'completo' : null;
  if (formatoJunto && !(columnas.includes('nombre') && columnas.includes('apellido'))) {
    avisos.push('Nombre y apellido venían en una sola columna: los separamos. Revisá que hayan quedado bien.');
  }
  if (cuerpo.length > MAX_FILAS) {
    return { filas: [], avisos, error: `La planilla tiene ${cuerpo.length} filas. Cargá hasta ${MAX_FILAS} por vez.` };
  }

  const vistos = new Set<string>();
  const filas = cuerpo.map((r, i): FilaPlanilla => {
    const celda = (t: Columna) => r[columnas.indexOf(t)] ?? '';
    let nombre = celda('nombre');
    let apellido = celda('apellido');
    if ((!nombre || !apellido) && formatoJunto) {
      const s = separar(celda(formatoJunto), formatoJunto);
      nombre ||= s.nombre;
      apellido ||= s.apellido;
    }
    const fila: FilaPlanilla = {
      fila: primeraFila + i,
      nombre: capitalizarNombre(nombre),
      apellido: capitalizarNombre(apellido),
      email: normalizarEmail(celda('email')),
    };
    if (!fila.nombre || !fila.apellido) fila.error = 'Falta el nombre o el apellido.';
    else if (/\d/.test(fila.nombre + fila.apellido)) fila.error = 'El nombre o el apellido tiene números: revisá que no sea el DNI.';
    else if ((fila.nombre + fila.apellido).includes('\uFFFD')) fila.error = 'Hay letras que no se leyeron bien. Guardá la planilla como "CSV UTF-8" y volvé a subirla.';
    else if (!emailValido(fila.email)) fila.error = fila.email ? 'El mail no es válido.' : 'Falta el mail.';
    else if (vistos.has(fila.email)) fila.error = 'Este mail está repetido en la planilla.';
    vistos.add(fila.email);
    return fila;
  });
  return { filas, avisos };
}
