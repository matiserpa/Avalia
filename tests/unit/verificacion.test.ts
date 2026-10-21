import { beforeAll, describe, expect, it } from 'vitest';
import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { certificados, eventos, perfiles } from '@/db/schema';
import { reiniciarDemo, DEMO } from '@/lib/demo/semilla';
import { registrarVerificacion, verificarCodigo } from '@/features/publico/verificacion';

async function contar(tipo: 'verificacion' | 'verificacion_fallida', canal: string) {
  const filas = await db
    .select({ id: eventos.id })
    .from(eventos)
    .where(and(eq(eventos.tipo, tipo), eq(eventos.canal, canal as 'qr')));
  return filas.length;
}

describe('verificación pública', () => {
  beforeAll(async () => {
    await reiniciarDemo();
  });

  it('encuentra un certificado válido aunque el código esté mal tipeado, con link al perfil público', async () => {
    const r = await verificarCodigo('vr4k 7m2p');
    expect(r.estado).toBe('valido');
    if (r.estado !== 'valido') return;
    expect(r.certificado.titularApellido).toBe('Ríos');
    expect(r.certificado.institucion.nombre).toBe('Instituto Demo');
    expect(r.certificado.perfil?.slug).toBe(DEMO.slugValentina);
    // Nunca expone el mail de la titular.
    expect(JSON.stringify(r)).not.toContain('@');
  });

  it('no linkea al perfil si el certificado está oculto o el perfil es privado', async () => {
    await db.update(certificados).set({ visibleEnPerfil: false }).where(eq(certificados.codigo, DEMO.codigoValentinaMasterclass));
    const oculto = await verificarCodigo(DEMO.codigoValentinaMasterclass);
    expect(oculto.estado).toBe('valido');
    if (oculto.estado === 'valido') expect(oculto.certificado.perfil).toBeNull();

    await db.update(perfiles).set({ publico: false }).where(eq(perfiles.slug, DEMO.slugValentina));
    const privado = await verificarCodigo(DEMO.codigoValentinaFormacion);
    if (privado.estado === 'valido') expect(privado.certificado.perfil).toBeNull();
    await db.update(perfiles).set({ publico: true }).where(eq(perfiles.slug, DEMO.slugValentina));
  });

  it('distingue anulado y no encontrado, sin mostrar el motivo de la anulación', async () => {
    const anulado = await verificarCodigo(DEMO.codigoAnulado);
    expect(anulado.estado).toBe('anulado');
    expect(JSON.stringify(anulado)).not.toContain('mal escrito');
    expect((await verificarCodigo('AB12CD34')).estado).toBe('no_encontrado');
    expect(await verificarCodigo('basura')).toEqual({ estado: 'no_encontrado', codigo: null });
  });

  it('cuenta las verificaciones del público con su canal, pero no las de la titular ni la institución', async () => {
    const r = await verificarCodigo(DEMO.codigoValentinaFormacion);
    const antes = await contar('verificacion', 'qr');
    await registrarVerificacion(r, 'publico', 'qr');
    expect(await contar('verificacion', 'qr')).toBe(antes + 1);
    await registrarVerificacion(r, 'titular', 'qr');
    await registrarVerificacion(r, 'institucion', 'qr');
    await registrarVerificacion(r, 'admin', 'qr');
    expect(await contar('verificacion', 'qr')).toBe(antes + 1);

    const fallidas = await contar('verificacion_fallida', 'codigo');
    await registrarVerificacion(await verificarCodigo('AB12CD34'), 'publico', 'codigo');
    expect(await contar('verificacion_fallida', 'codigo')).toBe(fallidas + 1);
  });
});
