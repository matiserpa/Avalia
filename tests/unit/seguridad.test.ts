// Arreglos de la revisión final: cuentas reservadas, intentos de código, respuestas iguales para
// todos los mails, DNI en planillas, links de perfil sin el mail y consentimiento por versión.

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { certificados, codigosIngreso, correos, cursos, egresadas, eventos, instituciones, perfiles, usuarios } from '@/db/schema';
import { reiniciarDemo, DEMO } from '@/lib/demo/semilla';
import { activarConEnlace, aceptarLegales, consultarEnlace, crearEnlaceActivacion } from '@/lib/auth/activacion';
import { solicitarCodigo, verificarCodigo } from '@/lib/auth/codigos';
import { consentimientoVigente, VERSION_LEGALES } from '@/lib/legales';
import { capitalizarNombre, listaConY } from '@/lib/texto';
import { leerPlanilla, textoDeArchivo } from '@/features/institucion/planilla';
import { agregarEgresada, cargarFilas, MENSAJE_MAIL_RESERVADO, revisarFilas } from '@/features/institucion/egresadas';
import { emitirCurso, firmaDeLista, pendientesDeEmitir } from '@/features/institucion/emision';
import { validarCurso } from '@/features/institucion/cursos';
import { calcularMetricas } from '@/features/admin/metricas';
import { procesarFormularioPerfil, publicarPerfil } from '@/features/profesional/perfil';

const tokenDe = (url: string) => url.split('/activar/')[1];
const usuarioPorEmail = async (email: string) => (await db.select().from(usuarios).where(eq(usuarios.email, email)))[0];

async function institucion(nombre: string) {
  return (await db.select().from(instituciones).where(eq(instituciones.nombre, nombre)))[0];
}

async function cursoDe(institucionId: string) {
  return (await db.select().from(cursos).where(eq(cursos.institucionId, institucionId)))[0];
}

// Un certificado a nombre de un mail cualquiera, emitido por el Instituto (como si se hubiera
// cargado antes de este arreglo).
async function certificadoPara(email: string) {
  const inst = await institucion('Instituto Demo');
  const curso = await cursoDe(inst.id);
  const [e] = await db.insert(egresadas).values({ cursoId: curso.id, nombre: 'Prueba', apellido: 'Reservada', email }).returning();
  await emitirCurso(inst.id, curso.id);
  const [c] = await db.select().from(certificados).where(eq(certificados.egresadaId, e.id));
  return c;
}

async function ultimoCodigo(email: string) {
  const [m] = await db.select().from(correos).where(eq(correos.para, email)).orderBy(desc(correos.creadoEn)).limit(1);
  return /:\s*(\d{6})/.exec(m.asunto)![1];
}

describe('cuentas de la administración y de las instituciones', () => {
  beforeEach(async () => {
    await reiniciarDemo();
  });
  afterEach(() => {
    delete process.env.ADMIN_EMAILS;
  });

  it('una institución no puede cargar como egresada el mail de otra institución ni el de la administración', async () => {
    process.env.ADMIN_EMAILS = 'jefa@demo.example';
    const inst = await institucion('Instituto Demo');
    const curso = await cursoDe(inst.id);
    for (const email of [DEMO.emailAsociacion, 'jefa@demo.example']) {
      const r = await agregarEgresada(inst.id, curso.id, { nombre: 'Ana', apellido: 'Paz', email });
      expect(r).toEqual({ ok: false, errores: { email: MENSAJE_MAIL_RESERVADO } });
    }
    const revisadas = await revisarFilas(inst.id, curso.id, [{ fila: 2, nombre: 'Ana', apellido: 'Paz', email: DEMO.emailAsociacion }]);
    expect(revisadas[0].error).toBe(MENSAJE_MAIL_RESERVADO);
    expect(await cargarFilas(inst.id, curso.id, [{ nombre: 'Ana', apellido: 'Paz', email: 'jefa@demo.example' }])).toBe(0);
  });

  it('el link de un certificado emitido a esos mails no abre la cuenta', async () => {
    process.env.ADMIN_EMAILS = 'jefa@demo.example';
    for (const email of [DEMO.emailAsociacion, 'jefa@demo.example']) {
      const cert = await certificadoPara(email);
      const token = tokenDe(await crearEnlaceActivacion(cert.id));
      expect((await consultarEnlace(token)).estado).toBe('usado');
      expect((await activarConEnlace(token)).ok).toBe(false);
    }
    // No se creó ninguna cuenta para el mail de la administración.
    expect(await usuarioPorEmail('jefa@demo.example')).toBeUndefined();
  });
});

describe('código de ingreso', () => {
  beforeEach(async () => {
    await reiniciarDemo();
  });

  it('cada intento se cuenta antes de comparar, aunque lleguen todos juntos', async () => {
    expect(await solicitarCodigo(DEMO.emailValentina)).toEqual({ ok: true });
    const correcto = await ultimoCodigo(DEMO.emailValentina);
    const incorrecto = correcto === '000000' ? '111111' : '000000';
    const respuestas = await Promise.all([
      ...Array.from({ length: 20 }, () => verificarCodigo(DEMO.emailValentina, incorrecto)),
      verificarCodigo(DEMO.emailValentina, correcto),
    ]);
    const comparados = respuestas.filter((r) => r.ok || !r.error.startsWith('Probaste demasiadas'));
    expect(comparados.length).toBeLessThanOrEqual(5);
    const [fila] = await db.select().from(codigosIngreso).where(eq(codigosIngreso.email, DEMO.emailValentina));
    expect(fila.intentos).toBe(5);
    // Gastados los intentos, el código correcto tampoco sirve.
    expect((await verificarCodigo(DEMO.emailValentina, correcto)).ok).toBe(false);
  });

  it('responde lo mismo a un mail registrado que pidió muchos códigos y a uno desconocido', async () => {
    const haceUnRato = (min: number) => new Date(Date.now() - min * 60 * 1000);
    await db.insert(codigosIngreso).values(
      [10, 20, 30, 40, 50].map((min) => ({ email: DEMO.emailValentina, codigoHash: 'x', creadoEn: haceUnRato(min), expiraEn: haceUnRato(min - 10) })),
    );
    expect(await solicitarCodigo(DEMO.emailValentina)).toEqual({ ok: true });
    expect(await solicitarCodigo('nadie.registrado@demo.example')).toEqual({ ok: true });
    // Pasado el límite no se mandó nada.
    expect(await db.select().from(codigosIngreso).where(eq(codigosIngreso.email, DEMO.emailValentina))).toHaveLength(5);
  });

  it('el mail sale con la tarea que le pasan (después de responder)', async () => {
    const tareas: (() => Promise<void>)[] = [];
    expect(await solicitarCodigo(DEMO.emailValentina, (t) => void tareas.push(t))).toEqual({ ok: true });
    expect(await db.select().from(correos).where(and(eq(correos.para, DEMO.emailValentina), eq(correos.plantilla, 'codigo')))).toHaveLength(0);
    await tareas[0]();
    expect(await db.select().from(correos).where(and(eq(correos.para, DEMO.emailValentina), eq(correos.plantilla, 'codigo')))).toHaveLength(1);
  });

  it('con el mail vacío pide que lo escriban', async () => {
    expect(await solicitarCodigo('  ')).toEqual({ ok: false, error: 'Escribí tu mail.' });
  });
});

describe('DNI en planillas', () => {
  it('sin encabezado, una columna de documentos se ignora aunque alguna celda diga "s/d"', () => {
    const r = leerPlanilla(
      'Martina López\t30123456\tmartina@demo.example\nAna Pérez\ts/d\tana@demo.example\nSol Díaz\tDNI 28.456.789\tsol@demo.example',
    );
    expect(r.filas.map((f) => [f.nombre, f.apellido, f.error])).toEqual([
      ['Martina', 'López', undefined],
      ['Ana', 'Pérez', undefined],
      ['Sol', 'Díaz', undefined],
    ]);
    expect(JSON.stringify(r.filas)).not.toMatch(/30123456|28\.456/);
    expect(r.avisos.join(' ')).toContain('Ignoramos la columna DNI');
  });

  it('un nombre o apellido con números no se carga', async () => {
    const r = leerPlanilla('Nombre,Apellido,Mail\nAna,30123456,ana@demo.example');
    expect(r.filas[0].error).toContain('DNI');
    await reiniciarDemo();
    const inst = await institucion('Instituto Demo');
    const curso = await cursoDe(inst.id);
    const a = await agregarEgresada(inst.id, curso.id, { nombre: 'Ana', apellido: '30.123.456', email: 'ana.nueva@demo.example' });
    expect(a.ok).toBe(false);
  });
});

describe('perfil sin certificados', () => {
  beforeEach(async () => {
    await reiniciarDemo();
  });

  it('el link nunca sale del mail y sigue al nombre hasta que se publica', async () => {
    const [u] = await db.insert(usuarios).values({ email: 'flor.paz.1987@demo.example' }).returning();
    await aceptarLegales(u.id);
    const [p] = await db.select().from(perfiles).where(eq(perfiles.usuarioId, u.id));
    expect(p.slug).toMatch(/^perfil-[0-9a-f]{6}$/);
    expect(p.nombre).toBe('');

    const fd = new FormData();
    fd.set('nombre', 'Florencia');
    fd.set('apellido', 'Paz');
    expect((await procesarFormularioPerfil(u.id, fd, 1)).ok).toBe(true);
    const [conNombre] = await db.select().from(perfiles).where(eq(perfiles.usuarioId, u.id));
    expect(conNombre.slug).toMatch(/^florencia-paz/);

    await publicarPerfil(u.id);
    fd.set('nombre', 'Flor');
    await procesarFormularioPerfil(u.id, fd, 2);
    const [publicado] = await db.select().from(perfiles).where(eq(perfiles.usuarioId, u.id));
    expect(publicado.slug).toBe(conNombre.slug);
  });
});

describe('consentimiento por versión', () => {
  beforeEach(async () => {
    await reiniciarDemo();
  });

  it('si cambian los textos, hay que aceptarlos de nuevo y queda la versión nueva', async () => {
    const v = await usuarioPorEmail(DEMO.emailValentina);
    expect(consentimientoVigente(v)).toBe(true);
    await db.update(usuarios).set({ versionLegales: '2025-vieja' }).where(eq(usuarios.id, v.id));
    expect(consentimientoVigente(await usuarioPorEmail(DEMO.emailValentina))).toBe(false);

    await aceptarLegales(v.id);
    const despues = await usuarioPorEmail(DEMO.emailValentina);
    expect(despues.versionLegales).toBe(VERSION_LEGALES);
    expect(consentimientoVigente(despues)).toBe(true);
    // No cuenta como una activación nueva.
    const activaciones = await db.select().from(eventos).where(and(eq(eventos.tipo, 'cuenta_activada'), eq(eventos.perfilUsuarioId, v.id)));
    expect(activaciones.length).toBeLessThanOrEqual(1);
  });
});

describe('textos', () => {
  it('usa "e" antes de i o hi', () => {
    expect(listaConY(['Asociación Demo', 'Instituto Demo'])).toBe('Asociación Demo e Instituto Demo');
    expect(listaConY(['Agua', 'Hielo'])).toBe('Agua y Hielo');
    expect(listaConY(['Uno', 'Dos', 'Tres'])).toBe('Uno, Dos y Tres');
  });
});

describe('lógica (revisión final)', () => {
  it('respeta los apellidos con apóstrofo y lo que ya viene con mayúsculas y minúsculas', () => {
    expect(capitalizarNombre("D'ALESSANDRO")).toBe("D'Alessandro");
    expect(capitalizarNombre("o'connor")).toBe("O'Connor");
    expect(capitalizarNombre('MacKenzie')).toBe('MacKenzie');
    expect(capitalizarNombre('  maría   josé ')).toBe('María José');
  });

  it('lee un CSV de Excel en Windows (Windows-1252) sin romper tildes ni eñes', () => {
    const latin1 = Uint8Array.from(Buffer.from('Apellido;Nombre;Mail\nMuñoz;María José;maria@demo.example', 'latin1'));
    const r = leerPlanilla(textoDeArchivo(latin1));
    expect(r.filas[0]).toMatchObject({ nombre: 'María José', apellido: 'Muñoz' });
    expect(r.filas[0].error).toBeUndefined();
    expect(textoDeArchivo(new TextEncoder().encode('Peña'))).toBe('Peña');
  });

  it('la carga horaria entiende el punto de miles y la fecha tiene que existir', () => {
    const base = { nombre: 'Formación', tipo: 'formacion', cargaHoraria: '1.200', fecha: '2026-02-28', docente: '' };
    expect(validarCurso(base).datos?.cargaHoraria).toBe(1200);
    expect(validarCurso({ ...base, cargaHoraria: '2,5' }).datos?.cargaHoraria).toBe(2.5);
    expect(validarCurso({ ...base, fecha: '2026-02-31' }).errores.fecha).toBeDefined();
  });

  it('no emite si la lista cambió después de revisarla', async () => {
    await reiniciarDemo();
    const inst = await institucion('Instituto Demo');
    const [congreso] = await db.select().from(cursos).where(and(eq(cursos.institucionId, inst.id), eq(cursos.nombre, 'Congreso Demo 2026')));
    const revisada = firmaDeLista(await pendientesDeEmitir(inst.id, congreso.id));
    await agregarEgresada(inst.id, congreso.id, { nombre: 'Nueva', apellido: 'Sin Revisar', email: 'nueva.sin.revisar@demo.example' });
    expect(await emitirCurso(inst.id, congreso.id, revisada)).toEqual({ emitidos: 0, mailsConError: 0, cambio: true });
    const actual = firmaDeLista(await pendientesDeEmitir(inst.id, congreso.id));
    expect((await emitirCurso(inst.id, congreso.id, actual)).emitidos).toBe(6);
  });

  it('en las métricas, una persona con certificados en dos mails cuenta una vez', async () => {
    await reiniciarDemo();
    const antes = await calcularMetricas({ institucionId: null, semanas: 0 });
    const valentina = await usuarioPorEmail(DEMO.emailValentina);
    const [ajeno] = await db.select().from(certificados).where(eq(certificados.email, 'florencia.paz@demo.example'));
    await db.update(certificados).set({ usuarioId: valentina.id }).where(eq(certificados.id, ajeno.id));
    const despues = await calcularMetricas({ institucionId: null, semanas: 0 });
    expect(despues.personas).toBe(antes.personas - 1);
    expect(despues.activadas).toBe(antes.activadas);
  });
});
