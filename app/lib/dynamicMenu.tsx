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
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * Mapeo de íconos y etiquetas por módulo.
 * El backend define `modules: ['usuarios', 'reportes', 'productos']`
 * y aquí definimos cómo mostrarlos.
 */
const MODULE_ICONS: Record<string, any> = {
  usuarios: Users,
  reportes: BarChart3,
  productos: Pizza,
  caja: DollarSign,
  gastos: FileText,
  pedidos: ShoppingCart,
};

const MODULE_LABELS: Record<string, string> = {
  usuarios: 'Usuarios',
  reportes: 'Reportes',
  productos: 'Productos',
  caja: 'Caja',
  gastos: 'Gastos',
  pedidos: 'Pedidos',
  operaciones: 'Operaciones'
};

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  return (
    <nav className="flex flex-col flex-1 overflow-y-auto">
      <ul className="flex flex-col p-4 space-y-2">
        {modules.map((mod) => {
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
