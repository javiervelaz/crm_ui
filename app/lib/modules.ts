import {
  BarChart3,
  CreditCard,
  DollarSign,
  Package,
  ShieldCheck,
  ShoppingCart,
  Users,
  Wallet,
} from 'lucide-react';

/**
 * REGISTRO ÚNICO DE MÓDULOS.
 *
 * Reemplaza las tres fuentes de verdad que existían antes:
 *   - app/lib/modulePermissions.ts   (rutas)
 *   - app/lib/dynamicMenu.tsx        (MODULE_ORDER / MODULE_ICONS / MODULE_LABELS)
 *   - app/lib/useAuthCheck.ts        (auxiliaryRoutes / auxiliaryPrefixRoutes inline)
 *
 * Un módulo nuevo se agrega ACÁ y en ningún otro lado: el menú, el orden, el
 * ícono, la etiqueta y el control de acceso salen todos de este objeto.
 *
 * Campos:
 *   order        posición en el menú
 *   label        etiqueta visible (sustantivo, no verbo)
 *   icon         ícono lucide
 *   href         ruta de aterrizaje del módulo
 *   routes       rutas que el módulo habilita (string exacto o RegExp)
 *   prefix       si es true, cualquier subruta de href queda habilitada
 *   hidden       true = no aparece en el menú, pero sigue siendo accesible
 *   alwaysOpen   true = accesible sin tener el módulo en el token (perfil, upgrade)
 */

export interface ModuleDef {
  order: number;
  label: string;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  href: string;
  routes?: (string | RegExp)[];
  prefix?: boolean;
  hidden?: boolean;
  alwaysOpen?: boolean;
}

export const MODULES = {
  operaciones: {
    order: 1,
    label: 'Pedidos',
    icon: ShoppingCart,
    href: '/dashboard/operaciones',
    prefix: true,
  },
  productos: {
    order: 2,
    label: 'Productos',
    icon: Package, // antes: Pizza — herencia de pizzeria-ui
    href: '/dashboard/productos',
    prefix: true,
  },
  roles: {
    order: 3,
    label: 'Roles',
    icon: ShieldCheck,
    href: '/dashboard/roles',
    prefix: true, // faltaba por completo en MODULE_PERMISSIONS
  },
  gasto: {
    order: 4,
    label: 'Gastos',
    icon: DollarSign,
    href: '/dashboard/gasto',
    prefix: true,
  },
  flujo: {
    order: 5,
    label: 'Flujo de caja',
    icon: Wallet,
    href: '/dashboard/flujo',
    prefix: true,
  },
  cerrarcaja: {
    order: 6,
    label: 'Cierre de caja',
    icon: Wallet,
    href: '/dashboard/cerrarcaja',
    prefix: true, // faltaba en MODULE_PERMISSIONS
  },
  reportes: {
    order: 7,
    label: 'Reportes',
    icon: BarChart3,
    href: '/dashboard/reportes',
    prefix: true,
  },
  usuarios: {
    order: 8,
    label: 'Usuarios',
    icon: Users,
    href: '/dashboard/usuarios',
    prefix: true,
  },
  plan: {
    order: 9,
    label: 'Plan',
    icon: CreditCard,
    href: '/dashboard/plan',
    prefix: true, // faltaba en MODULE_PERMISSIONS
  },

  // --- Auxiliares: accesibles siempre, fuera del menú ---
  profile: {
    order: 90,
    label: 'Mi perfil',
    icon: Users,
    href: '/dashboard/profile',
    prefix: true,
    hidden: true,
    alwaysOpen: true,
  },
  'upgrade-plan': {
    order: 91,
    label: 'Mejorar plan',
    icon: CreditCard,
    href: '/dashboard/upgrade-plan',
    prefix: true,
    hidden: true,
    alwaysOpen: true,
  },

  // [3.3] 'tipo-producto' y 'tipo-salida' se borraron de acá: eran entradas
  // auxiliares redundantes — 'productos' y 'gasto' ya tienen prefix: true y
  // cubren esas subrutas. La de 'tipo-salida' además apuntaba a
  // '/dashboard/gasto/tipo-salida', una ruta que no existe.
} satisfies Record<string, ModuleDef>;

export type ModuleKey = keyof typeof MODULES;

/** Módulos del token, ordenados y filtrados a los que existen en el registro. */
export function menuModules(userModules: string[]): (ModuleDef & { key: string })[] {
  return userModules
    .filter((k): k is ModuleKey => k in MODULES)
    .map((k) => ({ ...MODULES[k], key: k }))
    .filter((m) => !m.hidden)
    .sort((a, b) => a.order - b.order);
}

/** Ruta de aterrizaje para un set de módulos, o null si ninguno sirve. */
export function defaultRouteFor(userModules: string[]): string | null {
  const [first] = menuModules(userModules);
  if (first) return first.href;
  return userModules[0] ? `/dashboard/${userModules[0]}` : null;
}

/** ¿Este path está permitido para estos módulos? */
export function canAccess(pathname: string, userModules: string[]): boolean {
  const path = pathname.toLowerCase().replace(/\/+$/, '') || '/';

  // Módulos siempre abiertos (perfil, upgrade de plan)
  for (const def of Object.values(MODULES) as ModuleDef[]) {
    if (!def.alwaysOpen) continue;
    if (path === def.href || (def.prefix && path.startsWith(def.href + '/'))) return true;
  }

  return userModules.some((key) => {
    const def = (MODULES as Record<string, ModuleDef>)[key];
    if (!def) return false;
    if (path === def.href) return true;
    if (def.prefix && path.startsWith(def.href + '/')) return true;
    return (def.routes ?? []).some((r) =>
      typeof r === 'string' ? path === r.toLowerCase() : r.test(path)
    );
  });
}
