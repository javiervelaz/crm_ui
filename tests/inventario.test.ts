import { describe, expect, it } from 'vitest';
import {
  formatCantidad,
  formatDelta,
  ordenarPorUrgencia,
  parseNumero,
  unidadesDeIngreso,
  validarCantidad,
} from '@/app/lib/inventario';
import { canAccess, menuModules } from '@/app/lib/modules';

describe('inventario — números escritos a mano', () => {
  it('coma o punto decimal', () => {
    expect(parseNumero('2,5')).toBe(2.5);
    expect(parseNumero('2.5')).toBe(2.5);
    expect(parseNumero(' 12 ')).toBe(12);
  });

  it('miles con punto y pesos', () => {
    expect(parseNumero('1.250,50')).toBe(1250.5);
    expect(parseNumero('30.000')).toBe(30000);
    expect(parseNumero('$1.200.000')).toBe(1200000);
  });

  it('basura → null', () => {
    for (const malo of ['', 'abc', '2,5,1', '1e3', null, undefined])
      expect(parseNumero(malo as any)).toBeNull();
  });
});

describe('inventario — cantidades', () => {
  it('menos de 1 kg o 1 l se muestra en g o ml', () => {
    expect(formatCantidad(0.8, 'kg')).toBe('800 g');
    expect(formatCantidad(0.25, 'l')).toBe('250 ml');
    expect(formatCantidad(2.5, 'kg')).toBe('2,5 kg');
    expect(formatCantidad(12, 'u')).toBe('12 u');
  });

  it('delta con signo', () => {
    expect(formatDelta(2.5, 'kg')).toBe('+2,5 kg');
    expect(formatDelta(-0.3, 'kg')).toBe('−300 g');
  });

  it('unidades de ingreso compatibles con el ítem', () => {
    expect(unidadesDeIngreso('kg')).toEqual(['kg', 'g']);
    expect(unidadesDeIngreso('l')).toEqual(['l', 'ml']);
    expect(unidadesDeIngreso('u')).toEqual(['u']);
  });

  it('validación', () => {
    expect(validarCantidad('0').ok).toBe(false);
    expect(validarCantidad('0', { permitirCero: true })).toEqual({
      ok: true,
      valor: 0,
    });
    expect(validarCantidad('-1').ok).toBe(false);
    expect(validarCantidad('1,5').valor).toBe(1.5);
  });
});

describe('inventario — lista', () => {
  it('lo urgente arriba, después alfabético', () => {
    const items = [
      { nombre: 'Harina', estado: 'ok' as const },
      { nombre: 'Queso', estado: 'bajo' as const },
      { nombre: 'Aceite', estado: 'sin_stock' as const },
      { nombre: 'Tomate', estado: 'negativo' as const },
      { nombre: 'Azúcar', estado: 'ok' as const },
    ];
    expect(ordenarPorUrgencia(items).map((i) => i.nombre)).toEqual([
      'Tomate',
      'Aceite',
      'Queso',
      'Azúcar',
      'Harina',
    ]);
  });
});

describe('inventario — módulo', () => {
  it('aparece en el menú de gastronomía después de Productos', () => {
    const keys = menuModules([
      'operaciones',
      'productos',
      'inventario',
      'gasto',
    ]).map((m) => m.key);
    expect(keys).toEqual(['operaciones', 'productos', 'inventario', 'gasto']);
  });

  it('sin el módulo no entra por URL', () => {
    expect(canAccess('/dashboard/inventario', ['gasto'])).toBe(false);
    expect(canAccess('/dashboard/inventario', ['inventario'])).toBe(true);
  });
});
