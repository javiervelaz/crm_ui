'use client';

import { useAuthCheck } from '@/app/lib/useAuthCheck';
import {
  BarChart3,
  DollarSign,
  FileText,
  LogOut,
  Pizza,
  ShoppingCart,
  Users,
  CreditCard 
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * Orden maestro de los módulos en el menú.
 * Solo controla el orden visual, no los permisos.
 */
const MODULE_ORDER = [
  'operaciones',
  'productos',
  'roles',
  'gasto',
  'flujo',
  'cerrarcaja',
  'reportes',
  'usuarios',
  'plan', 
];

/**
 * Mapeo de íconos por módulo.
 */
const MODULE_ICONS: Record<string, any> = {
  usuarios: Users,
  reportes: BarChart3,
  productos: Pizza,
  caja: DollarSign,
  gasto: DollarSign,
  operaciones: ShoppingCart,
  flujo: DollarSign,
  cerrarcaja:DollarSign,
   plan: CreditCard, 
};

/**
 * Etiquetas legibles por módulo.
 */
const MODULE_LABELS: Record<string, string> = {
  usuarios: 'Usuarios',
  reportes: 'Reportes',
  productos: 'Productos',
  roles: 'Configurar Roles',
  gasto: 'Agregar Gastos',
  operaciones: 'Tomar Pedidos',
  flujo: 'Flujo de Caja',
  cerrarcaja: 'Cerrar caja',
  plan: 'Mi plan', 
};

/**
 * Ordena la lista de módulos según MODULE_ORDER.
 * Los que no estén definidos en MODULE_ORDER se van al final,
 * ordenados alfabéticamente entre sí.
 */
function sortModules(mods: string[]): string[] {
  return [...mods].sort((a, b) => {
    const indexA = MODULE_ORDER.indexOf(a);
    const indexB = MODULE_ORDER.indexOf(b);

    const aInOrder = indexA !== -1;
    const bInOrder = indexB !== -1;

    if (aInOrder && bInOrder) {
      return indexA - indexB;
    }
    if (aInOrder && !bInOrder) return -1; // a primero
    if (!aInOrder && bInOrder) return 1;  // b primero

    // Ninguno está en MODULE_ORDER → orden alfabético estable
    return a.localeCompare(b);
  });
}

export default function DynamicMenu() {
  const { modules, loading } = useAuthCheck();
  const router = useRouter();
  const pathname = usePathname();
  const [active, setActive] = useState('');

  useEffect(() => {
    setActive(pathname);
  }, [pathname]);

  if (loading) {
    // Skeleton menu loader
    return (
      <aside className="w-64 bg-gray-800 min-h-screen">
        <div className="p-4 animate-pulse">
          <div className="h-8 bg-gray-700 rounded mb-4"></div>
          <div className="h-6 bg-gray-700 rounded mb-2"></div>
          <div className="h-6 bg-gray-700 rounded mb-2"></div>
          <div className="h-6 bg-gray-700 rounded"></div>
        </div>
      </aside>
    );
  }

  if (!modules || modules.length === 0) {
    return (
      <div className="p-4 text-gray-400">
        Sin módulos asignados
      </div>
    );
  }

  const orderedModules = sortModules(modules);

  const handleLogout = () => {
    localStorage.removeItem('token');
     localStorage.removeItem('role');
    window.dispatchEvent(new Event("storage"));
    router.push('/');
  };

  return (
    <nav className="flex flex-col flex-1 overflow-y-auto">
      <ul className="flex flex-col p-4 space-y-2">
        {orderedModules.map((mod) => {
          const Icon = MODULE_ICONS[mod] || FileText;
          const label = MODULE_LABELS[mod] || mod;
          const href = `/dashboard/${mod}`;
          const isActive = active.startsWith(href);

          return (
            <li key={mod}>
              <Link
                href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}
