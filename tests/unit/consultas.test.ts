// Formulario de contacto del sitio comercial: validación, protección contra el spam, demo y
// conservación de los datos.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { desc, eq, sql } from 'drizzle-orm';
import { db } from '@/db';
import { consultas, correos } from '@/db/schema';
import { MARCA } from '@/config/marca';
import { listarConsultas, recibirConsulta, validarConsulta, type DatosConsulta } from '@/features/comercial/consultas';
import { VERSION_LEGALES } from '@/lib/legales';

const base: DatosConsulta = {
  tipo: 'instituto',
  nombre: '  Paula   Gómez ',
  email: 'Paula.Gomez@Demo.Example',
  telefono: '299 412 3456',
  organizacion: 'Escuela Prueba de Estética',
  ciudad: 'Neuquén',
  mensaje: 'Hola.\r\n\r\n\r\n\r\nQueremos sumarnos.',
  acepto: true,
  trampa: '',
};

beforeEach(async () => {
  await db.execute(sql`truncate table consultas, correos restart identity cascade`);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('validación', () => {
  it('limpia los espacios, pasa el mail a minúsculas y deja como mucho una línea en blanco en el mensaje', () => {
    const r = validarConsulta(base);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.valores.nombre).toBe('Paula Gómez');
    expect(r.valores.email).toBe('paula.gomez@demo.example');
    expect(r.valores.mensaje).toBe('Hola.\n\nQueremos sumarnos.');
  });

  it('marca cada campo con su error', () => {
    const r = validarConsulta({ ...base, tipo: 'cualquiera', nombre: ' ', email: 'no-es-un-mail', telefono: 'llamame', acepto: false });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(Object.keys(r.errores).sort()).toEqual(['acepto', 'email', 'nombre', 'telefono', 'tipo']);
  });

  it('el teléfono, la institución, la ciudad y el mensaje son opcionales', () => {
    const r = validarConsulta({ ...base, telefono: '', organizacion: '', ciudad: '', mensaje: '' });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.valores).toMatchObject({ telefono: null, organizacion: null, ciudad: null, mensaje: null });
  });

  it('rechaza textos demasiado largos', () => {
    const r = validarConsulta({ ...base, mensaje: 'x'.repeat(2001) });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.errores.mensaje).toBeTruthy();
  });
});

describe('recibir una consulta', () => {
  it('la guarda con el consentimiento y le avisa a la agencia, con respuesta a quien escribió', async () => {
    expect(await recibirConsulta(base)).toEqual({ ok: true, demo: false });
    const [c] = await db.select().from(consultas);
    expect(c).toMatchObject({ tipo: 'instituto', email: 'paula.gomez@demo.example', versionLegales: VERSION_LEGALES });
    expect(c.aceptoPrivacidadEn).toBeInstanceOf(Date);
    const [m] = await db.select().from(correos).where(eq(correos.para, MARCA.emailContacto)).orderBy(desc(correos.creadoEn));
    expect(m.asunto).toBe('Consulta nueva: Escuela Prueba de Estética');
    expect(m.texto).toContain('paula.gomez@demo.example');
  });

  it('escapa lo que escribió la persona en el aviso', async () => {
    await recibirConsulta({ ...base, organizacion: '<img src=x onerror=alert(1)>', mensaje: '<script>alert(1)</script>' });
    const [m] = await db.select().from(correos);
    expect(m.html).not.toContain('<script>');
    expect(m.html).not.toContain('<img src=x');
    expect(m.html).toContain('&lt;script&gt;');
  });

  it('si viene lleno el campo trampa, responde que salió bien pero no guarda ni avisa', async () => {
    expect(await recibirConsulta({ ...base, trampa: 'https://spam.example' })).toEqual({ ok: true, demo: false });
    expect(await db.select().from(consultas)).toHaveLength(0);
    expect(await db.select().from(correos)).toHaveLength(0);
  });

  it('con errores no guarda nada', async () => {
    const r = await recibirConsulta({ ...base, email: 'mal' });
    expect(r.ok).toBe(false);
    expect(await db.select().from(consultas)).toHaveLength(0);
  });

  it('acepta hasta 3 consultas por mail por día; las de más no se guardan', async () => {
    for (let i = 0; i < 5; i++) expect((await recibirConsulta(base)).ok).toBe(true);
    expect(await db.select().from(consultas)).toHaveLength(3);
    expect(await db.select().from(correos)).toHaveLength(3);
  });

  it('con demasiadas consultas en la última hora pide que prueben más tarde', async () => {
    const ahora = new Date();
    await db.insert(consultas).values(
      Array.from({ length: 60 }, (_, i) => ({
        tipo: 'otro' as const,
        nombre: `Persona ${i}`,
        email: `persona${i}@demo.example`,
        aceptoPrivacidadEn: ahora,
        versionLegales: VERSION_LEGALES,
      })),
    );
    const r = await recibirConsulta(base);
    expect(r).toMatchObject({ ok: false });
    expect('error' in r && r.error).toContain(MARCA.emailContacto);
  });

  it('en la demo no guarda ni manda nada, aunque los datos estén bien', async () => {
    vi.stubEnv('DEMO_MODE', 'true');
    expect(await recibirConsulta(base)).toEqual({ ok: true, demo: true });
    expect(await db.select().from(consultas)).toHaveLength(0);
    expect(await db.select().from(correos)).toHaveLength(0);
  });

  it('borra las consultas de hace más de 12 meses', async () => {
    const vieja = new Date(Date.now() - 366 * 24 * 60 * 60 * 1000);
    await db.insert(consultas).values({
      tipo: 'otro',
      nombre: 'Vieja',
      email: 'vieja@demo.example',
      aceptoPrivacidadEn: vieja,
      versionLegales: VERSION_LEGALES,
      creadaEn: vieja,
    });
    await recibirConsulta(base);
    const lista = await listarConsultas();
    expect(lista.map((c) => c.nombre)).toEqual(['Paula Gómez']);
  });
});
