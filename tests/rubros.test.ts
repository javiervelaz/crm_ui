import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RUBRO_DEFAULT, rubroInicial, type Rubro } from '@/app/lib/rubros';

const CATALOGO: Rubro[] = [
  { codigo: 'educacion', nombre: 'Educación' },
  { codigo: 'gastronomia', nombre: 'Gastronomía' },
];

describe('rubroInicial', () => {
  it('sin parámetro: gastronomía (el funnel actual no cambia)', () => {
    expect(rubroInicial(null, CATALOGO)).toBe(RUBRO_DEFAULT);
  });

  it('respeta ?rubro= de la landing, sin importar mayúsculas ni espacios', () => {
    expect(rubroInicial(' Educacion ', CATALOGO)).toBe('educacion');
  });

  it('un rubro que no existe en el catálogo cae en gastronomía', () => {
    expect(rubroInicial('gimnasio', CATALOGO)).toBe('gastronomia');
  });

  it('si el catálogo no trae gastronomía, usa el primero', () => {
    expect(rubroInicial(null, [{ codigo: 'educacion', nombre: 'Educación' }])).toBe('educacion');
  });

  it('catálogo vacío: sin rubro (el formulario bloquea el envío)', () => {
    expect(rubroInicial('educacion', [])).toBe('');
  });
});

describe('registerSaasCliente envía el rubro', () => {
  const BASE = {
    plan: 'FREE' as const,
    comercioNombre: 'Academia Do Re Mi',
    cuit: '30-71234567-1',
    adminNombre: 'Ana',
    adminApellido: 'Paz',
    adminEmail: ' Ana@Ejemplo.com ',
    password: 'Contrasena123',
    aceptaTerminos: true,
  };

  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.test/api');
    fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ requiereVerificacion: true }) });
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  const bodyEnviado = () => JSON.parse(fetchMock.mock.calls[0][1].body);

  it('incluye el rubro elegido', async () => {
    const { registerSaasCliente } = await import('@/app/lib/saas.api');
    await registerSaasCliente({ ...BASE, rubro: 'educacion' });

    expect(fetchMock.mock.calls[0][0]).toBe('https://api.test/api/signup');
    expect(bodyEnviado().rubro).toBe('educacion');
    expect(bodyEnviado().cuit).toBe('30712345671');
  });

  it('sin rubro no manda la clave (el backend asume gastronomía)', async () => {
    const { registerSaasCliente } = await import('@/app/lib/saas.api');
    await registerSaasCliente({ ...BASE, rubro: '  ' });

    expect('rubro' in bodyEnviado()).toBe(false);
  });

  it('propaga field y code de un RUBRO_INVALIDO del backend', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'El rubro elegido no es válido', code: 'RUBRO_INVALIDO', field: 'rubro' }),
    });
    const { registerSaasCliente, SignupError } = await import('@/app/lib/saas.api');

    const err = await registerSaasCliente({ ...BASE, rubro: 'gimnasio' }).catch((e) => e);
    expect(err).toBeInstanceOf(SignupError);
    expect(err.field).toBe('rubro');
    expect(err.code).toBe('RUBRO_INVALIDO');
  });
});
