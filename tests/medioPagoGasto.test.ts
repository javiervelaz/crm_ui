import { describe, expect, it } from 'vitest';
import { efectivoEsperado } from '@/app/lib/cierreCaja';
import { medioDeFila, medioEfectivoId, MedioPagoOpcion } from '@/app/lib/medioPagoGasto';

const medios: MedioPagoOpcion[] = [
  { id: 1, descripcion: 'Efectivo', codigo: 'EFE' },
  { id: 2, descripcion: 'Débito', codigo: 'DEB' },
  { id: 4, descripcion: 'Transferencia', codigo: 'TRANS' },
];

describe('medio de pago de los gastos', () => {
  it('efectivo se identifica por código, no por posición ni id', () => {
    expect(medioEfectivoId(medios)).toBe(1);
    expect(medioEfectivoId([medios[1], { id: 9, descripcion: 'Efectivo', codigo: 'EFE' }])).toBe(9);
    expect(medioEfectivoId([medios[1]])).toBeUndefined();
  });

  it('una fila sin elegir usa efectivo; una elegida se respeta', () => {
    expect(medioDeFila(undefined, medios)).toBe(1);
    expect(medioDeFila(4, medios)).toBe(4);
    expect(medioDeFila(undefined, [])).toBeUndefined();
  });

  it('un gasto por transferencia no baja el efectivo esperado del cajón', () => {
    const base = { cajaInicial: 1000, ventasEfectivo: 5000, otrosIngresos: 0, gastosAdministrativos: 0 };
    // gastos: 700 en efectivo + 3000 por transferencia -> sólo 700 salen del cajón
    expect(efectivoEsperado({ ...base, egresos: 700 })).toBe(5300);
  });
});
