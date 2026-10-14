import { describe, expect, it } from 'vitest';
import {
  esRolExterno,
  rolesAsignables,
  tieneRolExterno,
  tiposDeStaff,
} from '../app/lib/rolesStaff';

const roles = [
  { id: 1, descripcion: 'admin', externo: false },
  { id: 2, descripcion: 'empleado' },
  { id: 5, descripcion: 'profesor', externo: true },
  { id: 6, descripcion: 'tutor', externo: true },
];

describe('rolesStaff', () => {
  it('esRolExterno sólo con externo === true', () => {
    expect(roles.map(esRolExterno)).toEqual([false, false, true, true]);
    expect(esRolExterno(null)).toBe(false);
  });
  it('rolesAsignables saca los de Academia', () => {
    expect(rolesAsignables(roles).map((r) => r.id)).toEqual([1, 2]);
  });
  it('tieneRolExterno con ids numéricos o de texto', () => {
    expect(tieneRolExterno([2], roles)).toBe(false);
    expect(tieneRolExterno([1, 6], roles)).toBe(true);
    expect(tieneRolExterno(['5' as unknown as number], roles)).toBe(true);
    expect(tieneRolExterno([], roles)).toBe(false);
  });
  it('tiposDeStaff saca PROF, TUT y ALU', () => {
    const tipos = ['ADMIN', 'EMP', 'CLI', 'PROF', 'TUT', 'ALU'].map(
      (codigo, id) => ({ id, codigo }),
    );
    expect(tiposDeStaff(tipos).map((t) => t.codigo)).toEqual([
      'ADMIN',
      'EMP',
      'CLI',
    ]);
  });
});
