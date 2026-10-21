import { describe, expect, it } from 'vitest';
import {
  beneficiosDe,
  esPagable,
  etiquetaPrecio,
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
  });

  it('pagable solo si está disponible y tiene precio', () => {
    expect(esPagable({ precio_mensual: 150, disponible: true })).toBe(true);
    expect(esPagable({ precio_mensual: 150 })).toBe(true); // API vieja sin `disponible`
    expect(esPagable({ precio_mensual: 0, disponible: true })).toBe(false);
    expect(esPagable({ precio_mensual: 150, disponible: false })).toBe(false);
  });
});
