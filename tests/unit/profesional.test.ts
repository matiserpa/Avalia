import { beforeEach, describe, expect, it } from 'vitest';
import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { certificados, correos, enlacesActivacion, eventos, imagenes, perfiles, usuarios } from '@/db/schema';
import { reiniciarDemo, DEMO } from '@/lib/demo/semilla';
import { activarConEnlace, consultarEnlace, crearEnlaceActivacion, sumarCertificadoConEnlace } from '@/lib/auth/activacion';
import { leerFormularioPerfil, publicarPerfil } from '@/features/profesional/perfil';
import { cambiarVisibilidad } from '@/features/profesional/certificados';
import { borrarCuenta } from '@/features/profesional/cuenta';
import { verificarCodigo } from '@/features/publico/verificacion';

const tokenDe = (url: string) => url.split('/activar/')[1];
const certPorCodigo = async (codigo: string) => (await db.select().from(certificados).where(eq(certificados.codigo, codigo)))[0];
const usuarioPorEmail = async (email: string) => (await db.select().from(usuarios).where(eq(usuarios.email, email)))[0];

describe('activación', () => {
  beforeEach(async () => {
    await reiniciarDemo();
  });

  it('activa con el link: consentimiento, perfil privado y certificados vinculados', async () => {
    const cert = await certPorCodigo(DEMO.codigoNoActivado);
    const token = tokenDe(await crearEnlaceActivacion(cert.id));
    expect((await consultarEnlace(token)).estado).toBe('valido');
    const r = await activarConEnlace(token);
    expect(r.ok).toBe(true);
    const u = await usuarioPorEmail('martina.lopez@demo.example');
    expect(u.aceptoLegalesEn).not.toBeNull();
    const [p] = await db.select().from(perfiles).where(eq(perfiles.usuarioId, u.id));
    expect(p.publico).toBe(false);
    // Los dos certificados de Martina (formación y masterclass) quedan en su cuenta.
    const suyos = await db.select().from(certificados).where(eq(certificados.usuarioId, u.id));
    expect(suyos).toHaveLength(2);
    const activaciones = await db.select().from(eventos).where(and(eq(eventos.tipo, 'cuenta_activada'), eq(eventos.perfilUsuarioId, u.id)));
    expect(activaciones).toHaveLength(1);
  });

  it('un link viejo no sirve para entrar una vez que el certificado está en una cuenta', async () => {
    const cert = await certPorCodigo(DEMO.codigoNoActivado);
    const primero = tokenDe(await crearEnlaceActivacion(cert.id));
    const copiadoPorWhatsapp = tokenDe(await crearEnlaceActivacion(cert.id));
    expect((await activarConEnlace(primero)).ok).toBe(true);
    expect((await consultarEnlace(copiadoPorWhatsapp)).estado).toBe('usado');
    expect((await activarConEnlace(copiadoPorWhatsapp)).ok).toBe(false);
  });

  it('suma a la cuenta abierta un certificado emitido a otro mail', async () => {
    const valentina = await usuarioPorEmail(DEMO.emailValentina);
    const [ajeno] = await db.select().from(certificados).where(eq(certificados.email, 'florencia.paz@demo.example'));
    const token = tokenDe(await crearEnlaceActivacion(ajeno.id));
    expect((await sumarCertificadoConEnlace(token, valentina.id)).ok).toBe(true);
    expect((await certPorCodigo(ajeno.codigo)).usuarioId).toBe(valentina.id);
  });
});

describe('perfil de la profesional', () => {
  it('valida el formulario', () => {
    const fd = new FormData();
    fd.set('nombre', '  Martina ');
    fd.set('apellido', '');
    fd.set('profesion', 'otra');
    fd.set('profesionOtra', 'Esteticista');
    fd.set('contactoTipo', 'whatsapp');
    fd.set('contactoValor', '123');
    fd.set('mostrarMatricula', 'si');
    const { campos, errores } = leerFormularioPerfil(fd);
    expect(campos.nombre).toBe('Martina');
    expect(campos.profesion).toBe('Esteticista');
    expect(Object.keys(errores).sort()).toEqual(['apellido', 'contactoValor', 'matricula']);

    const ig = new FormData();
    ig.set('nombre', 'A');
    ig.set('apellido', 'B');
    ig.set('contactoTipo', 'instagram');
    ig.set('contactoValor', 'https://instagram.com/mi.usuario/');
    expect(leerFormularioPerfil(ig).campos.contactoValor).toBe('mi.usuario');
  });

  it('publicar registra el evento sólo la primera vez', async () => {
    await reiniciarDemo();
    const julieta = await usuarioPorEmail('julieta.acosta@demo.example');
    await publicarPerfil(julieta.id);
    await publicarPerfil(julieta.id);
    const ev = await db.select().from(eventos).where(and(eq(eventos.tipo, 'perfil_publicado'), eq(eventos.perfilUsuarioId, julieta.id)));
    expect(ev).toHaveLength(1);
  });

  it('sólo cambia la visibilidad de sus propios certificados, y ocultar no invalida', async () => {
    await reiniciarDemo();
    const valentina = await usuarioPorEmail(DEMO.emailValentina);
    const julieta = await usuarioPorEmail('julieta.acosta@demo.example');
    const cert = await certPorCodigo(DEMO.codigoValentinaFormacion);
    expect(await cambiarVisibilidad(julieta.id, cert.id, false)).toBe(false);
    expect(await cambiarVisibilidad(valentina.id, cert.id, false)).toBe(true);
    expect((await verificarCodigo(cert.codigo)).estado).toBe('valido');
  });
});

describe('borrar la cuenta', () => {
  it('borra sus datos y deja los certificados desvinculados, que siguen verificando', async () => {
    await reiniciarDemo();
    const valentina = await usuarioPorEmail(DEMO.emailValentina);
    // Una foto y un mail registrado, para comprobar que también se van.
    const [img] = await db.insert(imagenes).values({ mime: 'image/webp', datos: new Uint8Array([1, 2, 3]), ancho: 1, alto: 1 }).returning();
    await db.update(perfiles).set({ fotoId: img.id }).where(eq(perfiles.usuarioId, valentina.id));
    await db.insert(correos).values({ para: DEMO.emailValentina, asunto: 'x', plantilla: 'codigo', estado: 'bandeja' });
    const cert = await certPorCodigo(DEMO.codigoValentinaFormacion);
    const viejo = tokenDe(await crearEnlaceActivacion(cert.id));

    await borrarCuenta(valentina.id);

    expect(await usuarioPorEmail(DEMO.emailValentina)).toBeUndefined();
    expect(await db.select().from(perfiles).where(eq(perfiles.usuarioId, valentina.id))).toHaveLength(0);
    expect(await db.select().from(imagenes).where(eq(imagenes.id, img.id))).toHaveLength(0);
    expect(await db.select().from(correos).where(eq(correos.para, DEMO.emailValentina))).toHaveLength(0);
    expect(await db.select().from(eventos).where(eq(eventos.perfilUsuarioId, valentina.id))).toHaveLength(0);
    const despues = await certPorCodigo(DEMO.codigoValentinaFormacion);
    expect(despues.usuarioId).toBeNull();
    expect((await verificarCodigo(cert.codigo)).estado).toBe('valido');
    // Un link de activación viejo no vuelve a abrir una cuenta.
    expect((await consultarEnlace(viejo)).estado).toBe('usado');
    const [enlace] = await db.select().from(enlacesActivacion).where(eq(enlacesActivacion.certificadoId, cert.id));
    expect(enlace.usadoEn).not.toBeNull();
  });
});
