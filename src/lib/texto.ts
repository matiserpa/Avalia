// Utilidades de texto y formato, en español rioplatense.

import type { TipoCurso } from '@/db/schema';

export function normalizarEmail(email: string): string {
  return String(email || '').trim().toLowerCase();
}

// Validación de mail pragmática: algo@algo.algo, sin espacios.
export function emailValido(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalizarEmail(email));
}

// "  maría   josé " → "María José". Respeta partículas: "de", "del", "la".
export function capitalizarNombre(s: string): string {
  const minusculas = new Set(['de', 'del', 'la', 'las', 'los', 'y', 'da', 'do', 'dos', 'van', 'von']);
  return String(s || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .split(' ')
    .map((p, i) =>
      i > 0 && minusculas.has(p)
        ? p
        : p
            .split('-')
            .map((q) => q.charAt(0).toLocaleUpperCase('es-AR') + q.slice(1))
            .join('-'),
    )
    .join(' ');
}

export function nombreCompleto(p: { nombre: string; apellido: string }): string {
  return `${p.nombre} ${p.apellido}`.trim();
}

export function iniciales(p: { nombre: string; apellido: string }): string {
  return `${p.nombre.charAt(0)}${p.apellido.charAt(0)}`.toUpperCase();
}

// "Valentina Ríos Peña" → "valentina-rios-pena"
export function slugificar(s: string): string {
  return String(s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

const ZONA = 'America/Argentina/Buenos_Aires';

// Fecha de calendario guardada como 'AAAA-MM-DD' (sin hora): no pasa por zonas horarias.
export function fechaLarga(fecha: string | Date): string {
  if (typeof fecha === 'string') {
    const [a, m, d] = fecha.split('-').map(Number);
    return `${d} de ${MESES[m - 1]} de ${a}`;
  }
  return new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: ZONA }).format(
    fecha,
  );
}

export function fechaCorta(fecha: string | Date): string {
  if (typeof fecha === 'string') {
    const [a, m, d] = fecha.split('-').map(Number);
    return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${a}`;
  }
  return new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: ZONA }).format(
    fecha,
  );
}

// "21 de octubre de 2026, 15:30": para dejar constancia de cuándo se consultó algo.
export function fechaHora(fecha: Date): string {
  const dia = fechaLarga(fecha);
  const hora = new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: ZONA }).format(fecha);
  return `${dia}, ${hora}`;
}

export function anioDe(fecha: string | Date): number {
  return typeof fecha === 'string' ? Number(fecha.slice(0, 4)) : Number(new Intl.DateTimeFormat('es-AR', { year: 'numeric', timeZone: ZONA }).format(fecha));
}

export const MESES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

export const TIPOS_CURSO: Record<TipoCurso, { nombre: string; articulo: string }> = {
  formacion: { nombre: 'Formación', articulo: 'la formación' },
  masterclass: { nombre: 'Masterclass', articulo: 'la masterclass' },
  congreso: { nombre: 'Congreso', articulo: 'el congreso' },
  workshop: { nombre: 'Workshop', articulo: 'el workshop' },
};

// 2 → "2 horas", 2.5 → "2,5 horas", 1 → "1 hora"
export function horas(n: number): string {
  const num = Number.isInteger(n) ? String(n) : n.toLocaleString('es-AR', { maximumFractionDigits: 1 });
  return `${num} ${n === 1 ? 'hora' : 'horas'}`;
}

export const PROFESIONES = [
  'Cosmetóloga',
  'Cosmetólogo',
  'Cosmiatra',
  'Dermatocosmiatra',
  'Médica estética',
  'Médico estético',
] as const;

// WhatsApp: lo que la persona escribe ("299 15-412 3456", "+54 9 299 4123456") → link wa.me.
// Para Argentina el formato internacional de celular es 54 9 + área + número, sin 0 ni 15.
export function linkWhatsapp(valor: string): string | null {
  let d = String(valor || '').replace(/\D/g, '');
  if (!d) return null;
  if (d.startsWith('00')) d = d.slice(2);
  if (d.startsWith('54')) {
    d = d.slice(2);
    if (d.startsWith('9')) d = d.slice(1);
  }
  if (d.startsWith('0')) d = d.slice(1);
  // Saca el 15 después del código de área (2, 3 o 4 dígitos) si quedó un número de 12 dígitos.
  if (d.length === 12) {
    for (const largoArea of [2, 3, 4]) {
      if (d.slice(largoArea, largoArea + 2) === '15') {
        d = d.slice(0, largoArea) + d.slice(largoArea + 2);
        break;
      }
    }
  }
  if (d.length !== 10) return null;
  return `https://wa.me/549${d}`;
}

// Instagram: "@valen.cosmiatra", "valen.cosmiatra" o la URL → usuario limpio.
export function usuarioInstagram(valor: string): string | null {
  let v = String(valor || '').trim();
  v = v.replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/[/?#].*$/, '').replace(/^@/, '');
  return /^[A-Za-z0-9._]{1,30}$/.test(v) ? v : null;
}

export function linkContacto(tipo: 'whatsapp' | 'instagram' | null, valor: string | null): string | null {
  if (!tipo || !valor) return null;
  if (tipo === 'whatsapp') return linkWhatsapp(valor);
  const u = usuarioInstagram(valor);
  return u ? `https://instagram.com/${u}` : null;
}

// ["a", "b", "c"] → "a, b y c"
export function listaConY(items: string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  return `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`;
}

// (1, 'certificado', 'certificados') → "1 certificado"; (3, ...) → "3 certificados"
export function cantidad(n: number, singular: string, plural: string): string {
  return `${n} ${n === 1 ? singular : plural}`;
}
