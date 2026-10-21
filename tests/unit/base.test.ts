import { describe, expect, it } from 'vitest';
import { writeFile, mkdir } from 'node:fs/promises';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { certificados, perfiles } from '@/db/schema';
import { cargarDemo, DEMO } from '@/lib/demo/semilla';
import { generarCodigo, normalizarCodigo, formatearCodigo } from '@/lib/certificados/codigo';
import { datosPdfDeCertificado, generarPdfCertificado } from '@/lib/certificados/pdf';
import { linkWhatsapp, usuarioInstagram, capitalizarNombre, slugificar, horas } from '@/lib/texto';

describe('códigos de certificado', () => {
  it('genera 8 caracteres del alfabeto y los normaliza', () => {
    for (let i = 0; i < 200; i++) {
      const c = generarCodigo();
      expect(c).toMatch(/^[0-9A-HJKMNP-TV-Z]{8}$/);
      expect(normalizarCodigo(formatearCodigo(c).toLowerCase())).toBe(c);
    }
  });
  it('acepta confusiones típicas y rechaza basura', () => {
    expect(normalizarCodigo('vr4k-7m2p')).toBe('VR4K7M2P');
    expect(normalizarCodigo('SH5A OE9R')).toBe('SH5A0E9R');
    expect(normalizarCodigo('abc')).toBeNull();
    expect(normalizarCodigo('UUUUUUUU')).toBeNull();
  });
});

describe('texto', () => {
  it('arma links de WhatsApp argentinos', () => {
    expect(linkWhatsapp('299 15-412 3456')).toBe('https://wa.me/5492994123456');
    expect(linkWhatsapp('+54 9 299 4123456')).toBe('https://wa.me/5492994123456');
    expect(linkWhatsapp('011 15 1234-5678')).toBe('https://wa.me/5491112345678');
    expect(linkWhatsapp('123')).toBeNull();
  });
  it('limpia usuarios de Instagram', () => {
    expect(usuarioInstagram('@valen.cosmiatra')).toBe('valen.cosmiatra');
    expect(usuarioInstagram('https://www.instagram.com/valen.cosmiatra/?hl=es')).toBe('valen.cosmiatra');
    expect(usuarioInstagram('no válido!')).toBeNull();
  });
  it('capitaliza nombres y arma slugs', () => {
    expect(capitalizarNombre('  maría   DE LOS ángeles ')).toBe('María de los Ángeles');
    expect(slugificar('Valentina Ríos Peña')).toBe('valentina-rios-pena');
    expect(horas(2.5)).toBe('2,5 horas');
    expect(horas(1)).toBe('1 hora');
  });
});

describe('demo y PDF', () => {
  it('carga la demo y genera el PDF de un certificado', async () => {
    await cargarDemo();
    const [p] = await db.select().from(perfiles).where(eq(perfiles.slug, DEMO.slugValentina));
    expect(p.publico).toBe(true);
    const [c] = await db.select().from(certificados).where(eq(certificados.codigo, DEMO.codigoValentinaFormacion));
    const datos = await datosPdfDeCertificado(c.id);
    expect(datos?.titularApellido).toBe('Ríos');
    const bytes = await generarPdfCertificado(datos!);
    expect(bytes.byteLength).toBeGreaterThan(10000);
    await mkdir('.data/pruebas', { recursive: true });
    await writeFile('.data/pruebas/certificado.pdf', bytes);
    const muestra = await generarPdfCertificado({ ...datos!, muestra: true, titularNombre: 'María José', titularApellido: 'Fernández de la Fuente Ibarguren', cursoNombre: 'Formación Superior Demo en Cosmiatría y Cosmetología Aplicada con Orientación en Aparatología' });
    await writeFile('.data/pruebas/muestra.pdf', muestra);
  });
});

describe('datos de demo', () => {
  it('los códigos fijos son válidos (sin I, L, O ni U)', async () => {
    const { DEMO } = await import('@/lib/demo/datos');
    for (const c of [DEMO.codigoValentinaFormacion, DEMO.codigoValentinaMasterclass, DEMO.codigoAnulado, DEMO.codigoNoActivado]) {
      expect(normalizarCodigo(c)).toBe(c);
    }
  });
});
