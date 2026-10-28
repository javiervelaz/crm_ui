import { describe, expect, it } from 'vitest';
import { diferenciaEfectivo, efectivoEsperado } from '@/app/lib/cierreCaja';

describe('cierre de caja (cálculo en pantalla)', () => {
  const base = {
    cajaInicial: 1000,
    ventasEfectivo: 5000,
    otrosIngresos: 200,
    egresos: 700,
    gastosAdministrativos: 100,
  };

  it('el efectivo esperado no incluye las ventas digitales', () => {
    // 1000 + 5000 + 200 - 700 - 100
    expect(efectivoEsperado(base)).toBe(5400);
  });

  it('la diferencia es contado menos esperado (faltante negativo, sobrante positivo)', () => {
    expect(diferenciaEfectivo('5350', 5400)).toBe(-50);
    expect(diferenciaEfectivo('5450', 5400)).toBe(50);
    expect(diferenciaEfectivo('5400', 5400)).toBe(0);
  });

  it('sin contar (campo vacío) no hay diferencia', () => {
    expect(diferenciaEfectivo('', 5400)).toBeNull();
    expect(diferenciaEfectivo('   ', 5400)).toBeNull();
    expect(diferenciaEfectivo('abc', 5400)).toBeNull();
  });

  it('no arrastra errores de coma flotante', () => {
    expect(
      efectivoEsperado({
        ...base,
        cajaInicial: 0.1,
        ventasEfectivo: 0.2,
        otrosIngresos: 0,
        egresos: 0,
        gastosAdministrativos: 0,
      }),
    ).toBe(0.3);
    expect(diferenciaEfectivo('0.3', 0.1 + 0.2)).toBe(0);
  });
});
