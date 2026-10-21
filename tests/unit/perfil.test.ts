import { beforeAll, describe, expect, it } from 'vitest';
import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { certificados, eventos, usuarios } from '@/db/schema';
import { reiniciarDemo, DEMO } from '@/lib/demo/semilla';
import { perfilPorSlug, porAnio, registrarVisitaPerfil } from '@/features/publico/perfil';
import type { SesionActual } from '@/lib/auth/sesion';

async function visitas(usuarioId: string) {
  const filas = await db
    .select({ id: eventos.id })
    .from(eventos)
    .where(and(eq(eventos.tipo, 'perfil_visita'), eq(eventos.perfilUsuarioId, usuarioId)));
  return filas.length;
}

describe('perfil público', () => {
  beforeAll(async () => {
    await reiniciarDemo();
  });

  it('muestra los certificados válidos y visibles, del más nuevo al más viejo, agrupados por año', async () => {
    const datos = await perfilPorSlug('Valentina-Rios');
    expect(datos?.perfil.publico).toBe(true);
    expect(datos?.certificados.map((c) => c.fecha)).toEqual(['2026-04-18', '2025-12-12', '2025-06-07', '2024-11-09']);
    expect(porAnio(datos!.certificados).map((g) => [g.anio, g.certificados.length])).toEqual([
      [2026, 1],
      [2025, 2],
      [2024, 1],
    ]);
  });

  it('no muestra los certificados ocultos ni los anulados', async () => {
    await db.update(certificados).set({ visibleEnPerfil: false }).where(eq(certificados.codigo, DEMO.codigoValentinaMasterclass));
    const datos = await perfilPorSlug(DEMO.slugValentina);
    expect(datos?.certificados).toHaveLength(3);
    expect(datos?.certificados.some((c) => c.codigo === DEMO.codigoValentinaMasterclass)).toBe(false);
    await db.update(certificados).set({ visibleEnPerfil: true }).where(eq(certificados.codigo, DEMO.codigoValentinaMasterclass));
  });

  it('rechaza links raros sin consultar', async () => {
    expect(await perfilPorSlug('../admin')).toBeNull();
    expect(await perfilPorSlug('no-existe')).toBeNull();
  });

  it('cuenta las visitas del público, pero no las de la dueña ni las de la administración', async () => {
    const datos = (await perfilPorSlug(DEMO.slugValentina))!;
    const id = datos.perfil.usuarioId;
    const [duena] = await db.select().from(usuarios).where(eq(usuarios.id, id));
    const antes = await visitas(id);
    await registrarVisitaPerfil(id, null, 'historia');
    expect(await visitas(id)).toBe(antes + 1);
    await registrarVisitaPerfil(id, { usuario: duena, perfil: datos.perfil, esAdmin: false } as SesionActual, 'link');
    await registrarVisitaPerfil(id, { usuario: { ...duena, id: 'otra' }, perfil: null, esAdmin: true } as SesionActual, 'link');
    expect(await visitas(id)).toBe(antes + 1);
  });
});
