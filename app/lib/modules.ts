import {
  BarChart3,
  CalendarDays,
  CreditCard,
  GraduationCap,
  KeyRound,
  MessageCircle,
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
 *   description  frase corta para el tooltip del ítem (components/ui/AppTooltip)
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
  description?: string;
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
    description: 'Pedidos y flujo de operaciones diarias',
    icon: ShoppingCart,
    href: '/dashboard/operaciones',
    prefix: true,
  },
  productos: {
    order: 2,
    label: 'Productos',
    description: 'Catálogo, precios y stock de productos',
    icon: Package, // antes: Pizza — herencia de pizzeria-ui
    href: '/dashboard/productos',
    prefix: true,
  },
  roles: {
    order: 3,
    label: 'Roles',
    description: 'Roles y permisos por módulo',
    icon: ShieldCheck,
    href: '/dashboard/roles',
    prefix: true, // faltaba por completo en MODULE_PERMISSIONS
    hidden: true, // se accede desde el menú de configuración del admin (Header)
  },
  // Rubro educación (crm_api 015): clases, personas, inscripciones y agenda.
  alumnos: {
    order: 3,
    label: 'Academia',
    description: 'Alumnos, profesores, clases, inscripciones y agenda',
    icon: GraduationCap,
    href: '/dashboard/academia',
    prefix: true,
  },
  // Profesor, tutor y alumno: no tienen módulos en el token (son usuarios
  // externos); el front les asigna este módulo virtual (sessionModules).
  'mis-clases': {
    order: 0,
    label: 'Mis clases',
    description: 'Tus clases, horarios y alumnos',
    icon: CalendarDays,
    href: '/dashboard/mis-clases',
    prefix: true,
  },
  gasto: {
    order: 4,
    label: 'Gastos',
    description: 'Registrá y controlá los gastos del negocio',
    icon: DollarSign,
    href: '/dashboard/gasto',
    prefix: true,
  },
  flujo: {
    order: 5,
    label: 'Flujo de caja',
    description: 'Ingresos y egresos de caja',
    icon: Wallet,
    href: '/dashboard/flujo',
    prefix: true,
  },
  cerrarcaja: {
    order: 6,
    label: 'Cierre de caja',
    description: 'Cerrá la caja y conciliá el efectivo del día',
    icon: Wallet,
    href: '/dashboard/cerrarcaja',
    prefix: true, // faltaba en MODULE_PERMISSIONS
  },
  reportes: {
    order: 7,
    label: 'Reportes',
    description: 'Estadísticas de ventas, gastos y caja',
    icon: BarChart3,
    href: '/dashboard/reportes',
    prefix: true,
  },
  usuarios: {
    order: 8,
    label: 'Usuarios',
    description: 'Alta, edición y permisos de usuarios',
    icon: Users,
    href: '/dashboard/usuarios',
    prefix: true,
    hidden: true, // se accede desde el menú de configuración del admin (Header)
  },
  plan: {
    order: 9,
    label: 'Plan',
    description: 'Tu plan contratado y límites de uso',
    icon: CreditCard,
    href: '/dashboard/plan',
    prefix: true, // faltaba en MODULE_PERMISSIONS
    hidden: true, // se accede desde el menú de configuración del admin (Header)
  },

  // Link de pedidos, bot de Telegram y (más adelante) WhatsApp. Se entra desde
  // el menú de configuración del admin; la API rechaza a quien no es admin.
  canales: {
    order: 10,
    label: 'Canales de pedidos',
    description: 'Link de pedidos online, bot de Telegram y WhatsApp',
    icon: MessageCircle,
    href: '/dashboard/canales',
    prefix: true,
    hidden: true,
    alwaysOpen: true,
  },

  // --- Auxiliares: accesibles siempre, fuera del menú ---
  profile: {
    order: 90,
    label: 'Mi perfil',
    description: 'Editar tus datos personales',
    icon: Users,
    href: '/dashboard/profile',
    prefix: true,
    hidden: true,
    alwaysOpen: true,
  },
  'upgrade-plan': {
    order: 91,
    label: 'Mejorar plan',
    description: 'Mejorá tu plan para desbloquear más funciones',
    icon: CreditCard,
    href: '/dashboard/upgrade-plan',
    prefix: true,
    hidden: true,
    alwaysOpen: true,
  },

  cuenta: {
    order: 92,
    label: 'Cambiar contraseña',
    description: 'Cambiá tu contraseña',
    icon: KeyRound,
    href: '/dashboard/cuenta',
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

/** Campos del JWT que deciden qué ve el usuario. */
export interface SessionToken {
  modules?: string[];
  role?: string[];
  tipo?: string | null;
  debeCambiarPassword?: boolean;
}

/** Profesor, tutor y alumno: usuarios externos al staff (crm_api cuentaGuards). */
export const TIPOS_EXTERNOS = ['PROF', 'TUT', 'ALU'] as const;
export const esExterno = (t: SessionToken | null | undefined): boolean =>
  !!t?.tipo && (TIPOS_EXTERNOS as readonly string[]).includes(t.tipo);

export const RUTA_CAMBIO_PASSWORD = '/dashboard/cuenta/password';

/**
 * Módulos efectivos de la sesión. Los externos no traen módulos en el token:
 * su único módulo es "Mis clases". El staff usa los del token.
 */
export function sessionModules(t: SessionToken | null | undefined): string[] {
  if (!t) return [];
  if (esExterno(t)) return ['mis-clases'];
  return Array.isArray(t.modules) ? t.modules : [];
}

/** Módulos del token, ordenados y filtrados a los que existen en el registro. */
export function menuModules(
  userModules: string[],
): (ModuleDef & { key: string })[] {
  return userModules
    .filter((k): k is ModuleKey => k in MODULES)
    .map((k) => ({ ...(MODULES[k] as ModuleDef), key: k }))
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
    if (path === def.href || (def.prefix && path.startsWith(def.href + '/')))
      return true;
  }

  return userModules.some((key) => {
    const def = (MODULES as Record<string, ModuleDef>)[key];
    if (!def) return false;
    if (path === def.href) return true;
    if (def.prefix && path.startsWith(def.href + '/')) return true;
    return (def.routes ?? []).some((r) =>
      typeof r === 'string' ? path === r.toLowerCase() : r.test(path),
    );
  });
}

/**
 * Aterrizaje post-login.
 *
 * Gastronomía conserva su comportamiento: el admin cae en el panel de
 * operaciones y el empleado en su caja. Pero esas rutas existen sólo si el
 * tenant tiene el módulo 'operaciones'; un tenant de otro rubro (academia)
 * no lo tiene y aterrizaba en "No tenés acceso". En ese caso va al primer
 * módulo de su menú.
 */
const ROLE_LANDING: Record<string, string> = {
  admin: '/dashboard/operaciones/admin',
  empleado: '/dashboard/operaciones/empleado',
};
const ROLE_PRIORITY = ['admin', 'empleado'];

export function landingRoute(
  roles: string[] | undefined,
  userModules: string[] | undefined,
  opciones: { debeCambiarPassword?: boolean } = {},
): string {
  // Contraseña temporal: la API sólo deja usar /api/cuenta hasta cambiarla.
  if (opciones.debeCambiarPassword) return RUTA_CAMBIO_PASSWORD;
  const mods = userModules ?? [];
  const conocidos = (roles ?? [])
    .filter((r) => r in ROLE_LANDING)
    .sort((a, b) => ROLE_PRIORITY.indexOf(a) - ROLE_PRIORITY.indexOf(b));
  // Sin rol conocido, el comportamiento histórico era la caja del empleado.
  const porRol = ROLE_LANDING[conocidos[0]] ?? ROLE_LANDING.empleado;

  if (canAccess(porRol, mods)) return porRol;
  return defaultRouteFor(mods) ?? '/dashboard';
}

/** Aterrizaje a partir del token completo (staff, externos y contraseña temporal). */
export function landingForToken(t: SessionToken): string {
  return landingRoute(t.role, sessionModules(t), { debeCambiarPassword: t.debeCambiarPassword === true });
}

/**
 * Accesos del menú de configuración del header (AdminSettingsMenu) que el
 * usuario efectivamente tiene. Si Counter le desactiva uno al tenant, el
 * acceso desaparece en vez de llevar a "No tenés acceso".
 */
const SETTINGS_KEYS = ['usuarios', 'roles', 'plan'] as const;
export type SettingsKey = (typeof SETTINGS_KEYS)[number];

export function settingsModules(
  userModules: string[] | undefined,
): SettingsKey[] {
  const mods = userModules ?? [];
  return SETTINGS_KEYS.filter((k) => mods.includes(k));
}
