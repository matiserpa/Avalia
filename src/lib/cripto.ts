import { createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import { secreto } from './config';

// Token aleatorio para links y sesiones: 32 bytes en base64url (43 caracteres).
export function tokenAleatorio(): string {
  return randomBytes(32).toString('base64url');
}

// Hash con secreto: si alguien se lleva la base, no puede usar los tokens ni probar códigos.
export function hashSecreto(valor: string): string {
  return createHmac('sha256', secreto()).update(valor).digest('hex');
}

export function igualesSeguro(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function codigoNumerico(digitos = 6): string {
  return String(randomInt(0, 10 ** digitos)).padStart(digitos, '0');
}
