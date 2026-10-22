// Lectura centralizada de variables de entorno. Ver .env.example para la lista completa.

// Va en los QR, los mails y los links: en producción tiene que estar definida (si no, todo
// apuntaría a localhost y los mails que salgan no se pueden corregir). Durante la compilación no se
// exige: ahí no se arma ningún link.
export function urlBase(): string {
  // En la demo publicada en Vercel, si falta APP_URL sirve la dirección del proyecto. En el piloto
  // no: la dirección va impresa en los QR y tiene que ser la definitiva, puesta a mano.
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const url = process.env.APP_URL || (modoDemo() && vercel ? `https://${vercel}` : '');
  if (!url && process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE !== 'phase-production-build') {
    throw new Error('Falta APP_URL: la dirección pública del sitio, por ejemplo https://avalya.com.ar');
  }
  return (url || 'http://localhost:3000').replace(/\/+$/, '');
}

// Modo demo: bandeja de mails en pantalla, accesos rápidos y botón para reiniciar los datos.
// NUNCA en el ambiente del piloto: cualquiera podría entrar como cualquiera.
export function modoDemo(): boolean {
  return process.env.DEMO_MODE === 'true';
}

// 'bandeja': los mails no salen, quedan en la base y se ven en /demo/bandeja (demo y desarrollo).
// 'resend': salen de verdad por Resend.
// En el piloto (producción sin modo demo) sólo vale 'resend': la bandeja guarda el cuerpo de los
// mails, con códigos y links de ingreso, y una variable mal puesta no puede activarla sin avisar.
export function modoCorreo(): 'bandeja' | 'resend' {
  if (process.env.MAIL_MODE === 'resend') return 'resend';
  if (process.env.NODE_ENV === 'production' && !modoDemo()) {
    throw new Error('Falta MAIL_MODE=resend. En el piloto los mails tienen que salir por Resend.');
  }
  return 'bandeja';
}

// Si las páginas del sitio comercial se dejan indexar en buscadores. Sólo con INDEXAR=true y
// nunca en la demo: mientras la dirección sea provisoria no se define, y no se indexa nada.
export function indexar(): boolean {
  return process.env.INDEXAR === 'true' && !modoDemo();
}

export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

// En modo demo, la cuenta de administración de prueba siempre es admin.
export const EMAIL_ADMIN_DEMO = 'admin@demo.example';

export function esEmailAdmin(email: string): boolean {
  const e = email.trim().toLowerCase();
  if (modoDemo() && e === EMAIL_ADMIN_DEMO) return true;
  return adminEmails().includes(e);
}

// Secreto para los hashes de códigos y tokens. En producción es obligatorio.
export function secreto(): string {
  const s = process.env.AUTH_SECRET;
  if (s && s.length >= 32) return s;
  if (process.env.NODE_ENV === 'production' && !modoDemo()) {
    throw new Error('Falta AUTH_SECRET (32 caracteres o más). Generalo con: openssl rand -base64 48');
  }
  return 'secreto-de-desarrollo-no-usar-en-produccion-0000';
}

// Lo que falta configurar para que el sitio publicado funcione. Si algo falta, el sitio muestra
// una pantalla que lo explica (src/components/layout/FaltaConfigurar.tsx) en vez de un error
// genérico: quien lo publica no siempre tiene a mano el registro del servidor.
export type Faltante = 'base' | 'APP_URL' | 'AUTH_SECRET' | 'MAIL_MODE' | 'RESEND_API_KEY';

export function faltaConfigurar(): Faltante[] {
  if (process.env.NODE_ENV !== 'production' || process.env.NEXT_PHASE === 'phase-production-build') return [];
  const falta: Faltante[] = [];
  // En Vercel el disco es de sólo lectura: sin una base conectada no puede andar.
  if (process.env.VERCEL && !process.env.DATABASE_URL && !process.env.POSTGRES_URL) falta.push('base');
  if (!modoDemo()) {
    if (!process.env.APP_URL) falta.push('APP_URL');
    if ((process.env.AUTH_SECRET ?? '').length < 32) falta.push('AUTH_SECRET');
    if (process.env.MAIL_MODE !== 'resend') falta.push('MAIL_MODE');
    else if (!process.env.RESEND_API_KEY) falta.push('RESEND_API_KEY');
  }
  return falta;
}

export function cookieSegura(): boolean {
  return urlBase().startsWith('https://');
}
