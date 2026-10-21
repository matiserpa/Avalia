import { beforeAll, describe, expect, it } from 'vitest';
import sharp from 'sharp';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { correos, instituciones, usuarios } from '@/db/schema';
import { reiniciarDemo, DEMO } from '@/lib/demo/semilla';
import { calcularMetricas, inicioSemana } from '@/features/admin/metricas';
import { crearInstitucion, invitarAlEquipo, listarInstituciones } from '@/features/admin/instituciones';

async function logoDePrueba() {
  const png = await sharp({ create: { width: 64, height: 64, channels: 3, background: '#2F3B35' } }).png().toBuffer();
  return new File([new Uint8Array(png)], 'logo.png', { type: 'image/png' });
}

describe('métricas del piloto', () => {
  beforeAll(async () => {
    await reiniciarDemo();
  });

  it('agrupa por semana de lunes a domingo, en hora argentina', () => {
    expect(inicioSemana(new Date('2026-10-21T18:00:00Z'))).toBe('2026-10-19');
    // Domingo 23:30 en Buenos Aires ya es lunes en UTC: cuenta para la semana del domingo.
    expect(inicioSemana(new Date('2026-10-26T02:30:00Z'))).toBe('2026-10-19');
  });

  it('calcula los totales del piloto', async () => {
    const m = await calcularMetricas({ institucionId: null, semanas: 0 });
    expect(m).toMatchObject({ certificados: 12, personas: 6, activadas: 3, publicas: 2, visitas: 46, verificaciones: 17, fallidas: 1 });
    expect(m.compartieron).toBe(2);
    expect(m.visitasPorSemana.reduce((a, s) => a + s.valor, 0)).toBe(46);
    expect(m.visitasPorCanal[0]).toEqual({ clave: 'historia', valor: 20 });
  });

  it('filtra por institución', async () => {
    const [asoc] = await db.select().from(instituciones).where(eq(instituciones.nombre, 'Asociación Demo de Cosmiatría'));
    const m = await calcularMetricas({ institucionId: asoc.id, semanas: 0 });
    expect(m).toMatchObject({ certificados: 3, personas: 2, activadas: 2, fallidas: null });
    expect(m.porInstitucion.map((i) => i.nombre)).toEqual(['Asociación Demo de Cosmiatría']);
    // Sólo las verificaciones de sus certificados.
    expect(m.verificaciones).toBe(m.porInstitucion[0].verificaciones);
  });
});

describe('alta de instituciones', () => {
  beforeAll(async () => {
    await reiniciarDemo();
  });

  it('lista las instituciones con sus cursos, certificados y equipo', async () => {
    const lista = await listarInstituciones();
    expect(lista.map((i) => [i.nombre, i.cursos, i.emitidos, i.equipo])).toEqual([
      ['Asociación Demo de Cosmiatría', 2, 3, [DEMO.emailAsociacion]],
      ['Instituto Demo', 3, 9, [DEMO.emailInstituto]],
    ]);
  });

  it('valida nombre, mail y logo', async () => {
    const r = await crearInstitucion({ nombre: ' ', ciudad: '', email: 'no-es-mail', logo: null });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errores).sort()).toEqual(['email', 'logo', 'nombre']);
  });

  it('no suma al equipo a una profesional ni a alguien de otra institución', async () => {
    const r = await crearInstitucion({ nombre: 'Instituto Demo Sur', ciudad: '', email: DEMO.emailValentina, logo: await logoDePrueba() });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errores.email).toContain('pasaporte de profesional');
    const [asoc] = await db.select().from(instituciones).where(eq(instituciones.nombre, 'Asociación Demo de Cosmiatría'));
    expect((await invitarAlEquipo(asoc.id, DEMO.emailInstituto)).error).toContain('otra institución');
  });

  it('crea la institución, suma a la responsable al equipo y le manda la invitación', async () => {
    const email = 'direccion@instituto-sur.demo.example';
    const r = await crearInstitucion({ nombre: 'Instituto  Demo Sur', ciudad: 'Bariloche', email: 'Direccion@Instituto-Sur.demo.example', logo: await logoDePrueba() });
    expect(r).toEqual({ ok: true, mailOk: true });
    const [inst] = await db.select().from(instituciones).where(eq(instituciones.nombre, 'Instituto Demo Sur'));
    expect(inst.logoId).not.toBeNull();
    const [u] = await db.select().from(usuarios).where(eq(usuarios.email, email));
    expect(u.institucionId).toBe(inst.id);
    const [mail] = await db.select().from(correos).where(eq(correos.para, email));
    expect(mail.plantilla).toBe('invitacion');
  });
});
