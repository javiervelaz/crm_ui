import { describe, expect, it } from 'vitest';
import { ventasPorDia } from '@/app/lib/ventasGrafico';

const fmt = (d: Date) => d.toISOString().slice(0, 10);

describe('ventasPorDia', () => {
  it('suma los productos de un mismo día en una sola barra (el bug: 10-13 mostraba 900 en vez de 15.900)', () => {
    const r = ventasPorDia(
      [
        { fecha: '2026-10-12', total_vendido: '30000.00' },
        { fecha: '2026-10-13', total_vendido: '900.00' },
        { fecha: '2026-10-13', total_vendido: '15000.00' },
      ],
      fmt,
    );
    expect(r).toEqual([
      { dia: '2026-10-12', etiqueta: '10-12', total_vendido: 30000 },
      { dia: '2026-10-13', etiqueta: '10-13', total_vendido: 15900 },
    ]);
  });

  it('ordena por día y no pierde centavos', () => {
    const r = ventasPorDia(
      [
        { fecha: '2026-10-14', total_vendido: 0.1 },
        { fecha: '2026-10-13', total_vendido: 0.1 },
        { fecha: '2026-10-13', total_vendido: 0.2 },
      ],
      fmt,
    );
    expect(r.map((p) => p.dia)).toEqual(['2026-10-13', '2026-10-14']);
    expect(r[0].total_vendido).toBe(0.3);
  });

  it('sin datos → vacío', () => {
    expect(ventasPorDia(undefined, fmt)).toEqual([]);
    expect(ventasPorDia([], fmt)).toEqual([]);
  });
});
