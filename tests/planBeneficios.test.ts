import { describe, expect, it } from 'vitest';
import {
  beneficiosDe,
  esPagable,
  etiquetaPrecio,
  puedeCambiarA,
} from '@/app/lib/planBeneficios';

describe('planBeneficios', () => {
  it('gastronomía FREE: link con límites, sin bot ni reportes', () => {
    expect(
      beneficiosDe({
        canUsePedidosOnline: true,
        maxPedidosMensuales: 50,
        maxProductos: 5,
        canUseBot: false,
        canUseReports: false,
      }),
    ).toEqual([
      'Link de pedidos online (hasta 50 pedidos/mes)',
      'Hasta 5 productos',
    ]);
  });

  it('educación PREMIUM: sin link de pedidos, con bot y reportes', () => {
    expect(
      beneficiosDe({
        canUsePedidosOnline: false,
        canUseBot: true,
        canUseReports: true,
        maxProductos: null,
      }),
    ).toEqual(['Bot de Telegram para vos y tu equipo', 'Reportes']);
  });

  it('inventario: BASIC con tope y sin recetas; PREMIUM sin tope y con recetas; FREE sin inventario', () => {
    expect(
      beneficiosDe({
        canUseInventario: true,
        canUseRecetas: false,
        maxStockItems: 50,
      }),
    ).toEqual([
      'Inventario: stock, compras y faltantes (hasta 50 ítems)',
      'Lo que vendés tal cual (gaseosas, bebidas) descuenta stock solo',
    ]);
    expect(
      beneficiosDe({
        canUseInventario: true,
        canUseRecetas: true,
        maxStockItems: null,
      }),
    ).toEqual([
      'Inventario: stock, compras y faltantes sin límite',
      'Recetas: cada venta descuenta sus insumos',
    ]);
    expect(
      beneficiosDe({
        canUseInventario: false,
        canUseRecetas: false,
        canUseReports: true,
      }),
    ).toEqual(['Reportes']);
  });

  it('sin features → vacío (el caller usa su texto)', () => {
    expect(beneficiosDe(undefined)).toEqual([]);
    expect(beneficiosDe({})).toEqual([]);
  });

  it('precio: no disponible o pago en $0 → Próximamente; FREE → Sin costo', () => {
    expect(etiquetaPrecio({ precio_mensual: 25000, disponible: false })).toBe(
      'Próximamente',
    );
    expect(etiquetaPrecio({ precio_mensual: 0, disponible: true })).toBe(
      'Próximamente',
    );
    expect(
      etiquetaPrecio({ precio_mensual: 0, disponible: true }, { gratis: true }),
    ).toBe('Sin costo');
    expect(etiquetaPrecio({ precio_mensual: 150, disponible: true })).toMatch(
      /150/,
    );
    expect(etiquetaPrecio(undefined)).toBe('—');
    expect(
      etiquetaPrecio({
        precio_mensual: 120000,
        duracion_meses: 12,
        disponible: true,
      }),
    ).toMatch(/por 12 meses$/);
  });

  it('pagable solo si está disponible y tiene precio', () => {
    expect(esPagable({ precio_mensual: 150, disponible: true })).toBe(true);
    expect(esPagable({ precio_mensual: 150 })).toBe(true); // API vieja sin `disponible`
    expect(esPagable({ precio_mensual: 0, disponible: true })).toBe(false);
    expect(esPagable({ precio_mensual: 150, disponible: false })).toBe(false);
  });

  it('puedeCambiarA: solo hacia arriba, y de PREMIUM mensual al anual sí', () => {
    expect(puedeCambiarA('FREE', 'BASIC')).toBe(true);
    expect(puedeCambiarA('FREE', 'CUSTOM')).toBe(true);
    expect(puedeCambiarA('BASIC', 'PREMIUM')).toBe(true);
    expect(puedeCambiarA('PREMIUM', 'CUSTOM')).toBe(true);
    expect(puedeCambiarA('PREMIUM', 'BASIC')).toBe(false);
    expect(puedeCambiarA('CUSTOM', 'PREMIUM')).toBe(false);
    expect(puedeCambiarA('BASIC', 'BASIC')).toBe(false);
    expect(puedeCambiarA(null, 'BASIC')).toBe(true);
    expect(puedeCambiarA('basic', 'premium')).toBe(true);
    expect(puedeCambiarA('FREE', 'INVENTADO')).toBe(false);
  });

  it('con los precios de lanzamiento, los planes pagos se pueden contratar', () => {
    expect(esPagable({ precio_mensual: 1000, duracion_meses: 1, disponible: true })).toBe(true);
    expect(esPagable({ precio_mensual: 10000, duracion_meses: 12, disponible: true })).toBe(true);
    expect(esPagable({ precio_mensual: 1000, duracion_meses: 1, disponible: false })).toBe(false);
    expect(esPagable({ precio_mensual: 0, duracion_meses: 1, disponible: true })).toBe(false);
    expect(etiquetaPrecio({ precio_mensual: 10000, duracion_meses: 12, disponible: true })).toBe('$ 10.000 por 12 meses');
  });
});
