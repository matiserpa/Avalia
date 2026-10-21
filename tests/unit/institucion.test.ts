import { beforeEach, describe, expect, it } from 'vitest';
import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { certificados, correos, cursos, egresadas, instituciones, usuarios } from '@/db/schema';
import { reiniciarDemo, DEMO } from '@/lib/demo/semilla';
import { crearCurso, egresadasDelCurso, listarCursos, obtenerCurso } from '@/features/institucion/cursos';
import { agregarEgresada, cargarFilas, editarEgresada, quitarEgresada } from '@/features/institucion/egresadas';
import { anularCertificado, emitirCurso, linkParaCompartir, pendientesDeEmitir, reenviarMail } from '@/features/institucion/emision';
import { verificarCodigo } from '@/features/publico/verificacion';

async function ids() {
  const [instituto] = await db.select().from(instituciones).where(eq(instituciones.nombre, 'Instituto Demo'));
  const [asociacion] = await db.select().from(instituciones).where(eq(instituciones.nombre, 'Asociación Demo de Cosmiatría'));
  const [congreso] = await db.select().from(cursos).where(eq(cursos.nombre, 'Congreso Demo 2026'));
  return { instituto: instituto.id, asociacion: asociacion.id, congreso: congreso.id };
}

describe('panel de la institución', () => {
  beforeEach(async () => {
    await reiniciarDemo();
  });

  it('emite un certificado por egresada pendiente y manda un mail a cada una', async () => {
    const { instituto, congreso } = await ids();
    expect(await pendientesDeEmitir(instituto, congreso)).toHaveLength(5);
    const r = await emitirCurso(instituto, congreso);
    expect(r).toEqual({ emitidos: 5, mailsConError: 0 });
    expect(await pendientesDeEmitir(instituto, congreso)).toHaveLength(0);
    const certs = await db.select().from(certificados).where(eq(certificados.cursoId, congreso));
    expect(certs).toHaveLength(5);
    expect(certs.every((c) => c.mailEnviadoEn && !c.mailError && c.estado === 'valido')).toBe(true);
    const [mail] = await db.select().from(correos).where(eq(correos.para, DEMO.emailCamila));
    expect(mail.html).toContain('/activar/');
    // Volver a emitir no duplica nada.
    expect((await emitirCurso(instituto, congreso)).emitidos).toBe(0);
  });

  it('si la egresada ya tiene su pasaporte, el certificado se suma directo y el mail no trae link de activación', async () => {
    const { instituto, congreso } = await ids();
    await agregarEgresada(instituto, congreso, { nombre: 'valentina', apellido: 'RÍOS', email: DEMO.emailValentina });
    await emitirCurso(instituto, congreso);
    const [u] = await db.select().from(usuarios).where(eq(usuarios.email, DEMO.emailValentina));
    const [c] = await db.select().from(certificados).where(and(eq(certificados.cursoId, congreso), eq(certificados.email, DEMO.emailValentina)));
    expect(c.usuarioId).toBe(u.id);
    expect(c.titularNombre).toBe('Valentina');
    const mails = await db.select().from(correos).where(eq(correos.para, DEMO.emailValentina));
    expect(mails.at(-1)!.html).not.toContain('/activar/');
    expect((await linkParaCompartir(instituto, c.id)).ok).toBe(false);
  });

  it('anular deja a la egresada sin certificado, para corregirla y volver a emitir', async () => {
    const { instituto, congreso } = await ids();
    await emitirCurso(instituto, congreso);
    const [camila] = (await egresadasDelCurso(instituto, congreso)).filter((e) => e.email === DEMO.emailCamila);
    expect((await anularCertificado(instituto, camila.certificado!.id, 'x')).ok).toBe(false);
    expect((await anularCertificado(instituto, camila.certificado!.id, 'El apellido estaba mal escrito')).ok).toBe(true);
    expect((await verificarCodigo(camila.certificado!.codigo)).estado).toBe('anulado');
    expect((await editarEgresada(instituto, camila.id, { nombre: 'Camila', apellido: 'Sosa Paz', email: DEMO.emailCamila })).ok).toBe(true);
    expect((await emitirCurso(instituto, congreso)).emitidos).toBe(1);
    // Con historial, no se puede quitar.
    expect((await quitarEgresada(instituto, camila.id)).ok).toBe(false);
  });

  it('una institución no puede ver ni tocar los cursos ni los certificados de otra', async () => {
    const { asociacion, congreso, instituto } = await ids();
    expect(await obtenerCurso(asociacion, congreso)).toBeNull();
    expect(await egresadasDelCurso(asociacion, congreso)).toEqual([]);
    expect((await emitirCurso(asociacion, congreso)).emitidos).toBe(0);
    expect((await agregarEgresada(asociacion, congreso, { nombre: 'A', apellido: 'B', email: 'a@demo.example' })).ok).toBe(false);
    expect(await cargarFilas(asociacion, congreso, [{ nombre: 'A', apellido: 'B', email: 'a@demo.example' }])).toBe(0);
    await emitirCurso(instituto, congreso);
    const [c] = await db.select().from(certificados).where(eq(certificados.cursoId, congreso));
    expect((await anularCertificado(asociacion, c.id, 'Un motivo cualquiera')).ok).toBe(false);
    expect((await reenviarMail(asociacion, c.id)).ok).toBe(false);
    expect((await linkParaCompartir(asociacion, c.id)).ok).toBe(false);
    expect((await listarCursos(asociacion)).some((x) => x.id === congreso)).toBe(false);
  });

  it('crea cursos con validación y carga planillas sin duplicar', async () => {
    const { instituto } = await ids();
    const mal = await crearCurso(instituto, { nombre: '', tipo: 'otra', cargaHoraria: 'muchas', fecha: '', docente: '' });
    expect(mal.ok).toBe(false);
    if (!mal.ok) expect(Object.keys(mal.errores).sort()).toEqual(['cargaHoraria', 'fecha', 'nombre', 'tipo']);
    const bien = await crearCurso(instituto, { nombre: 'Masterclass Demo: Rosácea', tipo: 'masterclass', cargaHoraria: '2,5', fecha: '2026-10-10', docente: '' });
    expect(bien.ok).toBe(true);
    if (!bien.ok) return;
    const filas = [
      { nombre: 'ana', apellido: 'GÓMEZ', email: 'Ana@Demo.example' },
      { nombre: 'Ana', apellido: 'Gómez', email: 'ana@demo.example' },
      { nombre: 'Sol', apellido: 'Paz', email: 'no-es-mail' },
    ];
    expect(await cargarFilas(instituto, bien.id, filas)).toBe(1);
    expect(await cargarFilas(instituto, bien.id, filas)).toBe(0);
    const [e] = await db.select().from(egresadas).where(eq(egresadas.cursoId, bien.id));
    expect(e).toMatchObject({ nombre: 'Ana', apellido: 'Gómez', email: 'ana@demo.example' });
  });
});
