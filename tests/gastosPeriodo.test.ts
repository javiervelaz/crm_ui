import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mesActual, nombreMes, rangoMes, totalGastos, totalesPorTipo } from '@/app/lib/gastosPeriodo';

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

describe('mesActual y nombreMes', () => {
  it('formatea con cero a la izquierda', () => {
    expect(mesActual(new Date(2026, 2, 15))).toBe('2026-03');
  });

  it('nombre del mes en castellano', () => {
    expect(nombreMes('2026-10')).toMatch(/octubre.*2026/);
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

  it('total por tipo con los ids de categoria_tipo', () => {
    expect(totalesPorTipo(gastos)).toEqual({ fijo: 150000, sueldos: 80000.5, variable: 15000 });
  });

  it('listado vacío → 0', () => {
    expect(totalesPorTipo([])).toEqual({ fijo: 0, sueldos: 0, variable: 0 });
  });
});

describe('gastosSinCaja.api', () => {
  const get = vi.fn();

  beforeEach(() => {
    vi.resetModules();
    vi.doMock('@/app/lib/apiClient', () => ({ default: { get } }));
    get.mockReset();
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
});
