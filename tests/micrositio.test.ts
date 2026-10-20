import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { micrositioFetch, MicrositioError } from '@/app/catalogo/micrositioApi';
import { crearPedidoDesdeMicrositio } from '@/app/catalogo/pedidoMicrositio.api';
import { validateHandoffToken } from '@/app/catalogo/handoffApi';

vi.mock('@/app/lib/logger', () => ({ logError: vi.fn(), logWarn: vi.fn() }));

const respuesta = (status: number, body: unknown) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }) as Response;

describe('micrositio — API con token de handoff', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = 'https://api.countercrm.com/api/';
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  it('manda el token como Bearer y pega a /api/micrositio (sin cliente_id en la URL)', async () => {
    fetchMock.mockResolvedValue(respuesta(200, []));
    await micrositioFetch('/productos', 'tok-123');
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.countercrm.com/api/micrositio/productos');
    expect(init.headers.Authorization).toBe('Bearer tok-123');
    expect(url).not.toMatch(/cliente_id|\/\d+$/);
  });

  it('403 PLAN_INACTIVE → mensaje amable y code', async () => {
    fetchMock.mockResolvedValue(
      respuesta(403, { code: 'PLAN_INACTIVE', error: 'x' }),
    );
    const err = (await micrositioFetch('/productos', 't').catch(
      (e: unknown) => e,
    )) as MicrositioError;
    expect(err).toBeInstanceOf(MicrositioError);
    expect(err.code).toBe('PLAN_INACTIVE');
    expect(err.message).toBe('Este comercio no tiene pedidos online activos.');
  });

  it('validateHandoffToken propaga el code del rechazo', async () => {
    fetchMock.mockResolvedValue(respuesta(401, { code: 'TOKEN_EXPIRED' }));
    const r = await validateHandoffToken('t');
    expect(r).toEqual(
      expect.objectContaining({ ok: false, code: 'TOKEN_EXPIRED' }),
    );
  });

  it('el pedido no manda cliente_id, sucursal, usuario, precios ni total', async () => {
    fetchMock.mockResolvedValue(
      respuesta(201, { status: 'OK', idPedido: 9, total: 17000, vuelto: 3000 }),
    );
    const r = await crearPedidoDesdeMicrositio({
      token: 't',
      name: 'Ana',
      address: 'Belgrano 123',
      deliveryType: 'delivery',
      extraNotes: '',
      medio_pago_id: 1,
      paga_efectivo: 20000,
      items: [
        {
          product: {
            id: '10',
            name: 'Muzza',
            description: '',
            price: 1,
            category: 'Pizzas',
            permite_mitad: false,
          },
          quantity: 2,
        },
      ],
    });
    expect(r.total).toBe(17000);
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body).toEqual({
      nombre: 'Ana',
      tipo_entrega: 'delivery',
      direccion: 'Belgrano 123',
      observaciones: '',
      medio_pago_id: 1,
      paga_efectivo: 20000,
      items: [{ producto_id: 10, cantidad: 2, observaciones: '' }],
    });
  });
});
