import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { esAdmin, huellaPermisos, puede } from '@/app/lib/permisos';
import { _reiniciar, refrescarSesion } from '@/app/lib/sesion';
import { landingRoute, menuModules } from '@/app/lib/modules';

// Empleado de gastronomía con la plantilla de crm_api 028
const EMPLEADO = {
  role: ['empleado'],
  tipo: 'EMP',
  modules: ['operaciones', 'cerrarcaja', 'inventario'],
  permissions: {
    operaciones: [
      'operaciones.list',
      'operaciones.create',
      'operaciones.update',
    ],
    cerrarcaja: ['cerrarcaja.list', 'cerrarcaja.create'],
    inventario: ['inventario.list', 'inventario.create'],
  },
};

describe('permisos — misma regla que la API', () => {
  it('módulo y permiso', () => {
    expect(puede(EMPLEADO, 'inventario.create')).toBe(true);
    expect(puede(EMPLEADO, 'inventario.update')).toBe(false);
    expect(puede(EMPLEADO, 'operaciones.delete')).toBe(false);
    expect(
      puede({ ...EMPLEADO, modules: ['operaciones'] }, 'inventario.list'),
    ).toBe(false);
  });

  it('admin: alcanza con el módulo (por tipo o por rol)', () => {
    expect(
      puede(
        { tipo: 'ADMIN', modules: ['inventario'], permissions: {} },
        'inventario.delete',
      ),
    ).toBe(true);
    expect(
      puede({ role: ['admin'], modules: ['inventario'] }, 'inventario.update'),
    ).toBe(true);
    expect(puede({ tipo: 'ADMIN', modules: [] }, 'inventario.list')).toBe(
      false,
    );
    expect(esAdmin({ tipo: 'EMP', role: ['empleado'] })).toBe(false);
  });

  it('sin token no puede nada', () => {
    expect(puede(null, 'operaciones.list')).toBe(false);
  });

  it('la huella ignora el orden y detecta cambios de permisos', () => {
    const otroOrden = { ...EMPLEADO, modules: [...EMPLEADO.modules].reverse() };
    expect(huellaPermisos(otroOrden)).toBe(huellaPermisos(EMPLEADO));
    const conGastos = {
      ...EMPLEADO,
      permissions: { ...EMPLEADO.permissions, gasto: ['gasto.create'] },
    };
    expect(huellaPermisos(conGastos)).not.toBe(huellaPermisos(EMPLEADO));
  });
});

describe('permisos — empleado con la plantilla', () => {
  it('menú: Pedidos, Inventario y Cierre de caja; sin Productos, Gastos ni Reportes', () => {
    expect(menuModules(EMPLEADO.modules).map((m) => m.key)).toEqual([
      'operaciones',
      'inventario',
      'cerrarcaja',
    ]);
  });

  it('aterriza en su caja', () => {
    expect(landingRoute(EMPLEADO.role, EMPLEADO.modules)).toBe(
      '/dashboard/operaciones/empleado',
    );
  });
});

// ─── refresco de sesión ───────────────────────────────────────────────────
const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url');
const jwtFalso = (payload: object) =>
  `${b64({ alg: 'HS256' })}.${b64(payload)}.firma`;

describe('sesion — refrescarSesion', () => {
  const almacen = new Map<string, string>();
  const eventos: string[] = [];
  beforeEach(() => {
    _reiniciar();
    almacen.clear();
    eventos.length = 0;
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => almacen.get(k) ?? null,
      setItem: (k: string, v: string) => almacen.set(k, v),
      removeItem: (k: string) => almacen.delete(k),
    });
    vi.stubGlobal('window', {
      dispatchEvent: (e: Event) => eventos.push(e.type),
      location: { href: '/dashboard' },
    });
  });
  afterEach(() => vi.unstubAllGlobals());

  it('guarda el token nuevo y avisa si cambiaron los permisos', async () => {
    const viejo = jwtFalso(EMPLEADO);
    const nuevo = jwtFalso({
      ...EMPLEADO,
      modules: [...EMPLEADO.modules, 'gasto'],
    });
    almacen.set('token', viejo);
    const f = vi
      .fn()
      .mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ token: nuevo }),
      });
    vi.stubGlobal('fetch', f);
    expect(await refrescarSesion(0)).toBe(true);
    expect(almacen.get('token')).toBe(nuevo);
    expect(f.mock.calls[0][1].headers.Authorization).toBe(`Bearer ${viejo}`);
    expect(eventos).toContain('auth-changed');
  });

  it('mismos permisos: guarda el token pero no reintenta ni re-renderiza', async () => {
    almacen.set('token', jwtFalso({ ...EMPLEADO, n: 1 }));
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue({
          ok: true,
          status: 200,
          json: async () => ({ token: jwtFalso({ ...EMPLEADO, n: 2 }) }),
        }),
    );
    expect(await refrescarSesion(0)).toBe(false);
    expect(eventos).toEqual([]);
  });

  it('401 (usuario dado de baja): cierra la sesión', async () => {
    almacen.set('token', jwtFalso(EMPLEADO));
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue({ ok: false, status: 401, json: async () => ({}) }),
    );
    expect(await refrescarSesion(0)).toBe(false);
    expect(almacen.has('token')).toBe(false);
  });

  it('no pide de nuevo antes del intervalo', async () => {
    almacen.set('token', jwtFalso(EMPLEADO));
    const f = vi
      .fn()
      .mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ token: almacen.get('token') }),
      });
    vi.stubGlobal('fetch', f);
    await refrescarSesion(60_000);
    await refrescarSesion(60_000);
    expect(f).toHaveBeenCalledTimes(1);
  });

  it('sin sesión no llama a la API', async () => {
    const f = vi.fn();
    vi.stubGlobal('fetch', f);
    expect(await refrescarSesion(0)).toBe(false);
    expect(f).not.toHaveBeenCalled();
  });
});
