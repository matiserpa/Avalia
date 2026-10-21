import { describe, expect, it } from 'vitest';
import { leerPlanilla } from '@/features/institucion/planilla';

describe('lectura de planillas', () => {
  it('lee filas pegadas desde Excel con encabezado e ignora el DNI', () => {
    const r = leerPlanilla('Nombre\tApellido\tDNI\tMail\nMARÍA JOSÉ\tFERNÁNDEZ\t30111222\tMaria@Demo.example\nLucía\tNavarro\t28999888\tlucia@demo.example');
    expect(r.error).toBeUndefined();
    expect(r.filas).toEqual([
      { fila: 2, nombre: 'María José', apellido: 'Fernández', email: 'maria@demo.example' },
      { fila: 3, nombre: 'Lucía', apellido: 'Navarro', email: 'lucia@demo.example' },
    ]);
    expect(r.avisos.join(' ')).toContain('DNI');
    expect(JSON.stringify(r.filas)).not.toContain('30111222');
  });

  it('lee un CSV con punto y coma y "Apellido y nombre" en una columna', () => {
    const r = leerPlanilla('Apellido y nombre;Correo electrónico\nLópez, Martina;martina@demo.example\nde la Fuente, Ana;ana@demo.example');
    expect(r.filas.map((f) => [f.nombre, f.apellido])).toEqual([
      ['Martina', 'López'],
      ['Ana', 'De la Fuente'],
    ]);
  });

  it('sin encabezado, usa la columna con @ como mail', () => {
    const r = leerPlanilla('Rocío,Giménez,rocio@demo.example\nMicaela,Torres,micaela@demo.example');
    expect(r.filas[0]).toMatchObject({ fila: 1, nombre: 'Rocío', apellido: 'Giménez', email: 'rocio@demo.example' });
    expect(r.avisos[0]).toContain('no tiene encabezados');
  });

  it('marca errores fila por fila: mail inválido, faltante o repetido', () => {
    const r = leerPlanilla('Nombre,Apellido,Mail\nAna,Paz,ana@demo.example\nLuz,,luz@demo.example\nSol,Ríos,sol@\nEva,Gil,ANA@demo.example');
    expect(r.filas.map((f) => f.error ?? 'ok')).toEqual([
      'ok',
      'Falta el nombre o el apellido.',
      'El mail no es válido.',
      'Este mail está repetido en la planilla.',
    ]);
  });

  it('avisa si no hay columna de mail o está vacía', () => {
    expect(leerPlanilla('').error).toBeTruthy();
    expect(leerPlanilla('Nombre,Apellido\nAna,Paz').error).toContain('columna de mail');
  });
});
