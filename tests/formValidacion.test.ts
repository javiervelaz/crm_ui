import { describe, expect, it } from 'vitest';
import { estaVacio } from '../app/lib/formValidacion';

describe('estaVacio', () => {
  it('vacío: null, undefined, string vacío o con espacios', () => {
    expect(estaVacio(null)).toBe(true);
    expect(estaVacio(undefined)).toBe(true);
    expect(estaVacio('')).toBe(true);
    expect(estaVacio('   ')).toBe(true);
  });

  it('números que vienen de la API no rompen (CP-10: dni numérico)', () => {
    expect(estaVacio(30111222)).toBe(false);
    expect(estaVacio(0)).toBe(false);
  });

  it('texto con contenido no está vacío', () => {
    expect(estaVacio(' 351 555 ')).toBe(false);
    expect(estaVacio('2026-10-13')).toBe(false);
  });
});
