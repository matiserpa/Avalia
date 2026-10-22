// Configuración del sitio publicado: la cadena de la base y lo que falta configurar.

import { afterEach, describe, expect, it, vi } from 'vitest';
import { urlDeLaBase } from '@/db';
import { faltaConfigurar } from '@/lib/config';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('cadena de conexión a la base', () => {
  it('saca los parámetros que Postgres no entiende, como el channel_binding de Neon', () => {
    vi.stubEnv('DATABASE_URL', 'postgresql://u:p@ep-demo-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');
    expect(urlDeLaBase()).toBe('postgresql://u:p@ep-demo-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require');
  });

  it('saca los parámetros de la integración de Supabase y usa POSTGRES_URL si no hay DATABASE_URL', () => {
    vi.stubEnv('DATABASE_URL', '');
    vi.stubEnv('POSTGRES_URL', 'postgres://u:p@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x&pgbouncer=true');
    expect(urlDeLaBase()).toBe('postgres://u:p@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?sslmode=require');
  });

  it('con sslrootcert=system pide verificar el certificado', () => {
    vi.stubEnv('DATABASE_URL', 'postgres://u:p@base.example/db?sslrootcert=system');
    expect(urlDeLaBase()).toBe('postgres://u:p@base.example/db?sslmode=verify-full');
  });
});

describe('lo que falta configurar', () => {
  it('fuera de producción no pide nada', () => {
    vi.stubEnv('VERCEL', '1');
    vi.stubEnv('DATABASE_URL', '');
    expect(faltaConfigurar()).toEqual([]);
  });

  it('la demo en Vercel sólo necesita la base', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VERCEL', '1');
    vi.stubEnv('DEMO_MODE', 'true');
    vi.stubEnv('DATABASE_URL', '');
    vi.stubEnv('POSTGRES_URL', '');
    vi.stubEnv('APP_URL', '');
    expect(faltaConfigurar()).toEqual(['base']);
    vi.stubEnv('POSTGRES_URL', 'postgres://u:p@base.example/db');
    expect(faltaConfigurar()).toEqual([]);
  });

  it('el piloto necesita la dirección, la clave y los mails por Resend', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('DEMO_MODE', '');
    vi.stubEnv('DATABASE_URL', 'postgres://u:p@base.example/db');
    vi.stubEnv('APP_URL', '');
    vi.stubEnv('AUTH_SECRET', 'corta');
    vi.stubEnv('MAIL_MODE', '');
    expect(faltaConfigurar()).toEqual(['APP_URL', 'AUTH_SECRET', 'MAIL_MODE']);
    vi.stubEnv('APP_URL', 'https://avalya.example');
    vi.stubEnv('AUTH_SECRET', 'x'.repeat(32));
    vi.stubEnv('MAIL_MODE', 'resend');
    vi.stubEnv('RESEND_API_KEY', '');
    expect(faltaConfigurar()).toEqual(['RESEND_API_KEY']);
    vi.stubEnv('RESEND_API_KEY', 're_prueba');
    expect(faltaConfigurar()).toEqual([]);
  });
});
