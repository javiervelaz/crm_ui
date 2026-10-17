import { describe, expect, it } from 'vitest';
import {
  agruparPorAlumno,
  detalleCuota,
  estadoCuota,
  estadoPago,
  MAX_COMPROBANTE,
  resumenCuotas,
  seleccionable,
  sumaSeleccion,
  tamañoLegible,
  tituloCuota,
  validarComprobante,
  validarFechaPago,
  validarMotivo,
  type Cuota,
} from '../app/lib/edu/cuotas';

const cuota = (o: Partial<Cuota> = {}): Cuota => ({
  id: 1,
  inscripcion_id: 1,
  alumno_id: 1,
  periodo: '2026-10-01',
  tipo: 'mensual',
  importe_base: '10000.00',
  clases_mes: 4,
  clases_cobradas: 4,
  descuento_pct: '0',
  importe: '10000.00',
  vence: '2026-10-10',
  estado: 'pendiente',
  alumno: 'Ana Pérez',
  tutor_id: null,
  clase: 'Guitarra',
  recargo_pct: '0',
  total_hoy: '10000.00',
  ...o,
});

describe('estados', () => {
  it('pendiente vencida se muestra como Vencida', () => {
    expect(estadoCuota(cuota({ vencida: true })).texto).toBe('Vencida');
    expect(estadoCuota(cuota()).texto).toBe('Pendiente');
  });
  it('en revisión y pagada', () => {
    expect(estadoCuota(cuota({ estado: 'en_revision' })).texto).toBe('En revisión');
    expect(estadoCuota(cuota({ estado: 'pagada', vencida: true })).tono).toBe('ok');
  });
  it('estados de pago', () => {
    expect(estadoPago('aprobado').tono).toBe('ok');
    expect(estadoPago('rechazado').texto).toBe('Rechazado');
    expect(estadoPago('pendiente').texto).toMatch(/revisión/);
  });
  it('solo las pendientes se seleccionan', () => {
    expect(seleccionable(cuota())).toBe(true);
    expect(seleccionable(cuota({ estado: 'en_revision' }))).toBe(false);
    expect(seleccionable(cuota({ estado: 'pagada' }))).toBe(false);
  });
});

describe('detalleCuota', () => {
  it('mes de alta proporcional y descuento', () => {
    expect(detalleCuota(cuota({ tipo: 'alta', clases_cobradas: 2, descuento_pct: '25' }))).toEqual([
      'Mes de alta: 2 de 4 clases',
      'Descuento 25% por varios instrumentos',
    ]);
  });
  it('cuota común sin detalle', () => {
    expect(detalleCuota(cuota())).toEqual([]);
  });
  it('alta con todas las clases no marca proporcional', () => {
    expect(detalleCuota(cuota({ tipo: 'alta' }))).toEqual([]);
  });
});

describe('montos', () => {
  const cs = [
    cuota({ id: 1, importe: '0.10', total_hoy: '0.10' }),
    cuota({ id: 2, importe: '0.20', total_hoy: '0.25' }),
    cuota({ id: 3, importe: '500', total_hoy: '575' }),
  ];
  it('suma sin errores de coma flotante', () => {
    expect(sumaSeleccion(cs, [1, 2])).toBe(0.3);
    expect(sumaSeleccion(cs, [2, 3], 'total_hoy')).toBe(575.25);
    expect(sumaSeleccion(cs, [])).toBe(0);
  });
  it('resumen: por cobrar con recargo, vencidas y en revisión', () => {
    const r = resumenCuotas([
      cuota({ id: 1, total_hoy: '11500', vencida: true }),
      cuota({ id: 2, total_hoy: '10000' }),
      cuota({ id: 3, estado: 'en_revision' }),
      cuota({ id: 4, estado: 'pagada', total_hoy: '999' }),
    ]);
    expect(r).toEqual({ porCobrar: 21500, vencidas: 1, enRevision: 1 });
  });
});

describe('agrupar y títulos', () => {
  it('agrupa por alumno, período descendente', () => {
    const g = agruparPorAlumno([
      cuota({ id: 1, alumno_id: 2, alumno: 'Zoe', periodo: '2026-09-01' }),
      cuota({ id: 2, alumno_id: 1, alumno: 'Ana', periodo: '2026-09-01' }),
      cuota({ id: 3, alumno_id: 1, alumno: 'Ana', periodo: '2026-10-01' }),
    ]);
    expect(g.map((x) => x.alumno)).toEqual(['Ana', 'Zoe']);
    expect(g[0].cuotas.map((c) => c.id)).toEqual([3, 2]);
  });
  it('título con mes en español', () => {
    expect(tituloCuota({ clase: 'Piano', periodo: '2026-10-01' })).toBe('Piano · octubre 2026');
  });
});

describe('validarComprobante', () => {
  const f = (o = {}) => ({ name: 'c.png', size: 1000, type: 'image/png', ...o });
  it('requerido', () => expect(validarComprobante(null)).toMatch(/Subí/));
  it('acepta jpg, png, webp, pdf', () => {
    for (const type of ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']) {
      expect(validarComprobante(f({ type }))).toBeNull();
    }
  });
  it('rechaza otros formatos', () => {
    expect(validarComprobante(f({ type: 'application/zip' }))).toMatch(/Formato/);
    expect(validarComprobante(f({ type: 'image/gif' }))).toMatch(/Formato/);
  });
  it('rechaza vacío y mayor a 5 MB; acepta justo 5 MB', () => {
    expect(validarComprobante(f({ size: 0 }))).toMatch(/vacío/);
    expect(validarComprobante(f({ size: MAX_COMPROBANTE + 1 }))).toMatch(/5 MB/);
    expect(validarComprobante(f({ size: MAX_COMPROBANTE }))).toBeNull();
  });
});

describe('validarFechaPago', () => {
  it('requerida, válida y no futura', () => {
    expect(validarFechaPago('', '2026-10-15')).toMatch(/Indicá/);
    expect(validarFechaPago('2026-02-30', '2026-10-15')).toMatch(/inválida/);
    expect(validarFechaPago('2026-10-16', '2026-10-15')).toMatch(/futura/);
    expect(validarFechaPago('2026-10-15', '2026-10-15')).toBeNull();
    expect(validarFechaPago('2026-09-01', '2026-10-15')).toBeNull();
  });
});

describe('validarMotivo', () => {
  it('3 a 500 caracteres', () => {
    expect(validarMotivo('  ab ')).toMatch(/Indicá/);
    expect(validarMotivo('Monto incorrecto')).toBeNull();
    expect(validarMotivo('x'.repeat(501))).toMatch(/500/);
    expect(validarMotivo('x'.repeat(500))).toBeNull();
  });
});

describe('tamañoLegible', () => {
  it('KB y MB', () => {
    expect(tamañoLegible(10)).toBe('1 KB');
    expect(tamañoLegible(2048)).toBe('2 KB');
    expect(tamañoLegible(5 * 1024 * 1024)).toBe('5.0 MB');
  });
});
