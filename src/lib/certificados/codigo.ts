// Código de certificado: 8 caracteres en base 32 de Crockford (sin I, L, O ni U, que se
// confunden), al azar: ~1 billón de combinaciones, imposible de adivinar o recorrer.
// Se muestra como XXXX-XXXX y se acepta escrito de cualquier forma.

import { randomInt } from 'node:crypto';

const ALFABETO = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
export const LARGO_CODIGO = 8;

export function generarCodigo(): string {
  let c = '';
  for (let i = 0; i < LARGO_CODIGO; i++) c += ALFABETO[randomInt(0, ALFABETO.length)];
  return c;
}

// Lo que la persona escribió → el código guardado, o null si no puede ser un código.
// Acepta minúsculas, espacios, guiones, y las confusiones típicas: O por 0, I y L por 1.
export function normalizarCodigo(entrada: string): string | null {
  const limpio = String(entrada || '')
    .toUpperCase()
    .replace(/[\s\-_.]/g, '')
    .replace(/O/g, '0')
    .replace(/[IL]/g, '1');
  if (limpio.length !== LARGO_CODIGO) return null;
  for (const ch of limpio) if (!ALFABETO.includes(ch)) return null;
  return limpio;
}

export function formatearCodigo(codigo: string): string {
  return codigo.length === LARGO_CODIGO ? `${codigo.slice(0, 4)}-${codigo.slice(4)}` : codigo;
}
