import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  mesActual,
  rangoMes,
  totalGastos,
  totalesPorTipo,
  validarGasto,
} from '@/app/lib/gastosPeriodo';

describe('rangoMes', () => {
  it('mes de 31 días', () => {
    expect(rangoMes('2026-10')).toEqual({ desde: '2026-10-01', hasta: '2026-10-31' });
  });

  it('febrero común y bisiesto', () => {
    expect(rangoMes('2026-02')?.hasta).toBe('2026-02-28');
    expect(rangoMes('2028-02')?.hasta).toBe('2028-02-29');
  });

  it('diciembre no se pasa al año siguiente', () => {
    expect(rangoMes('2026-12')).toEqual({ desde: '2026-12-01', hasta: '2026-12-31' });
  });

  it('valores inválidos → null', () => {
    for (const v of ['', '2026-13', '2026-00', '10/2026', '2026-1']) expect(rangoMes(v), v).toBeNull();
  });
});

describe('mesActual', () => {
  it('formatea con cero a la izquierda', () => {
    expect(mesActual(new Date(2026, 2, 15))).toBe('2026-03');
  });
});

describe('totales', () => {
  const gastos = [
    { monto: '150000.00', categoria_salida_id: 1 },
    { monto: '80000.50', categoria_salida_id: 3 },
    { monto: 12000, categoria_salida_id: 2 },
    { monto: '3000', categoria_salida_id: 2 },
    { monto: 'basura', categoria_salida_id: 2 },
  ];

  it('suma montos que llegan como string desde Postgres e ignora inválidos', () => {
    expect(totalGastos(gastos)).toBeCloseTo(245000.5);
  });

  it('total por tipo en el orden Fijo, Sueldo, Variable', () => {
    expect(totalesPorTipo(gastos).map((t) => [t.label, t.total])).toEqual([
      ['Fijo', 150000],
      ['Sueldo', 80000.5],
      ['Variable', 15000],
    ]);
  });

  it('listado vacío → 0', () => {
    expect(totalGastos([])).toBe(0);
  });
});

describe('validarGasto', () => {
  it('pide descripción', () => {
    expect(validarGasto('   ', '100')).toMatch(/descripción/);
  });

  it('pide monto mayor a cero', () => {
    for (const m of ['', '0', '-5', 'abc']) expect(validarGasto('Luz', m), m).toMatch(/monto/);
  });

  it('acepta datos válidos', () => {
    expect(validarGasto('Luz', '15000.50')).toBeNull();
  });
});

describe('gastosSinCaja.api', () => {
  const get = vi.fn();
  const post = vi.fn();

  beforeEach(() => {
    vi.resetModules();
    vi.doMock('@/app/lib/apiClient', () => ({ default: { get, post, delete: vi.fn() } }));
    get.mockReset();
    post.mockReset();
  });

  afterEach(() => vi.doUnmock('@/app/lib/apiClient'));

  it('getGastosConfig: sólo un false explícito saca la caja', async () => {
    const { getGastosConfig } = await import('@/app/lib/gastosSinCaja.api');
    get.mockResolvedValueOnce({ data: { requiereCaja: false } });
    expect(await getGastosConfig()).toEqual({ requiereCaja: false });
    get.mockResolvedValueOnce({ data: {} });
    expect(await getGastosConfig()).toEqual({ requiereCaja: true });
  });

  it('getGastosPorPeriodo manda el rango como query', async () => {
    const { getGastosPorPeriodo } = await import('@/app/lib/gastosSinCaja.api');
    get.mockResolvedValueOnce({ data: [{ id: 1 }] });
    await getGastosPorPeriodo('2026-10-01', '2026-10-31');
    expect(get).toHaveBeenCalledWith('/salida-caja/periodo', { params: { desde: '2026-10-01', hasta: '2026-10-31' } });
  });

  it('crearGastoSinCaja manda un array sin usuario, tenant ni registro diario', async () => {
    const { crearGastoSinCaja } = await import('@/app/lib/gastosSinCaja.api');
    post.mockResolvedValueOnce({ data: [] });
    await crearGastoSinCaja({ descripcion: '  Alquiler ', monto: 150000, tipo: 1 });
    expect(post).toHaveBeenCalledWith('/salida-caja', [
      { descripcion: 'Alquiler', monto: 150000, categoria_salida_id: 1 },
    ]);
  });
});
