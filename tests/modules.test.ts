import { describe, expect, it } from 'vitest';
import {
  canAccess,
  defaultRouteFor,
  landingRoute,
  menuModules,
  settingsModules,
} from '@/app/lib/modules';

// Módulos que el backend pone en el JWT según el rubro (crm_api 009_rubros.sql)
const PIZZERIA = ['usuarios', 'reportes', 'productos', 'cerrarcaja', 'operaciones', 'gasto', 'roles', 'flujo', 'plan'];
const ACADEMIA = ['usuarios', 'roles', 'plan', 'gasto', 'flujo'];

describe('menú por rubro', () => {
  it('pizzería: mismo menú que hoy, en orden', () => {
    expect(menuModules(PIZZERIA).map((m) => m.key)).toEqual([
      'operaciones', 'productos', 'gasto', 'flujo', 'cerrarcaja', 'reportes',
    ]);
  });

  it('academia: sólo gastos y flujo (usuarios, roles y plan van al header)', () => {
    expect(menuModules(ACADEMIA).map((m) => m.key)).toEqual(['gasto', 'flujo']);
  });

  it('ignora módulos que el front no conoce (ej. uno nuevo del backend)', () => {
    expect(menuModules(['gasto', 'alumnos']).map((m) => m.key)).toEqual(['gasto']);
  });
});

describe('guard de rutas por módulo', () => {
  it('academia no entra a pedidos, productos, caja ni reportes por URL directa', () => {
    for (const path of [
      '/dashboard/operaciones',
      '/dashboard/operaciones/admin',
      '/dashboard/productos',
      '/dashboard/productos/12/edit',
      '/dashboard/cerrarcaja',
      '/dashboard/reportes/reportes/ventas',
    ]) {
      expect(canAccess(path, ACADEMIA), path).toBe(false);
    }
  });

  it('academia entra a sus módulos y subrutas', () => {
    for (const path of ['/dashboard/gasto', '/dashboard/gasto/create', '/dashboard/flujo', '/dashboard/usuarios', '/dashboard/roles/3/permisos', '/dashboard/plan']) {
      expect(canAccess(path, ACADEMIA), path).toBe(true);
    }
  });

  it('perfil y upgrade de plan quedan abiertos sin módulo', () => {
    expect(canAccess('/dashboard/profile/5/edit', [])).toBe(true);
    expect(canAccess('/dashboard/upgrade-plan', [])).toBe(true);
  });

  it('no confunde prefijos parecidos', () => {
    expect(canAccess('/dashboard/gastos-raros', ACADEMIA)).toBe(false);
  });
});

describe('defaultRouteFor', () => {
  it('pizzería aterriza en operaciones', () => {
    expect(defaultRouteFor(PIZZERIA)).toBe('/dashboard/operaciones');
  });

  it('academia aterriza en gastos', () => {
    expect(defaultRouteFor(ACADEMIA)).toBe('/dashboard/gasto');
  });

  it('sin módulos → null (pantalla "sin acceso")', () => {
    expect(defaultRouteFor([])).toBeNull();
  });
});

describe('landingRoute (post-login)', () => {
  it('admin de pizzería: panel de operaciones, como siempre', () => {
    expect(landingRoute(['admin'], PIZZERIA)).toBe('/dashboard/operaciones/admin');
  });

  it('empleado de pizzería: su caja, como siempre', () => {
    expect(landingRoute(['empleado'], PIZZERIA)).toBe('/dashboard/operaciones/empleado');
  });

  it('admin tiene prioridad sobre empleado sin importar el orden', () => {
    expect(landingRoute(['empleado', 'admin'], PIZZERIA)).toBe('/dashboard/operaciones/admin');
  });

  it('rol desconocido en pizzería: caja del empleado (comportamiento histórico)', () => {
    expect(landingRoute(['proveedor'], PIZZERIA)).toBe('/dashboard/operaciones/empleado');
  });

  it('admin de academia: primer módulo de su menú, no "sin acceso"', () => {
    expect(landingRoute(['admin'], ACADEMIA)).toBe('/dashboard/gasto');
  });

  it('usuario sin módulos: /dashboard, que muestra la pantalla sin acceso', () => {
    expect(landingRoute(['empleado'], [])).toBe('/dashboard');
  });

  it('tolera token sin role ni modules', () => {
    expect(landingRoute(undefined, undefined)).toBe('/dashboard');
  });
});

describe('settingsModules (menú de configuración del header)', () => {
  it('muestra los accesos que el usuario tiene, en orden fijo', () => {
    expect(settingsModules(['plan', 'gasto', 'usuarios', 'roles'])).toEqual(['usuarios', 'roles', 'plan']);
  });

  it('oculta un acceso desactivado por Counter', () => {
    expect(settingsModules(['usuarios', 'plan'])).toEqual(['usuarios', 'plan']);
  });

  it('sin módulos no muestra ninguno', () => {
    expect(settingsModules(undefined)).toEqual([]);
  });
});
