// Lectura centralizada de variables de entorno. Ver .env.example para la lista completa.

export function urlBase(): string {
  const url = process.env.APP_URL || 'http://localhost:3000';
  return url.replace(/\/+$/, '');
}

// Modo demo: bandeja de mails en pantalla, accesos rápidos y botón para reiniciar los datos.
// NUNCA en el ambiente del piloto: cualquiera podría entrar como cualquiera.
export function modoDemo(): boolean {
  return process.env.DEMO_MODE === 'true';
}

// 'bandeja': los mails no salen, quedan en la base y se ven en /demo/bandeja (demo y desarrollo).
// 'resend': salen de verdad por Resend.
export function modoCorreo(): 'bandeja' | 'resend' {
  return process.env.MAIL_MODE === 'resend' ? 'resend' : 'bandeja';
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

export function cookieSegura(): boolean {
  return urlBase().startsWith('https://');
}
