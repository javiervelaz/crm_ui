'use client';

import { menuModules } from '@/app/lib/modules';
import { useAuthCheck } from '@/app/lib/useAuthCheck';
import { LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

/**
 * Menú lateral. Ya no define orden, íconos ni etiquetas: todo sale de
 * app/lib/modules.ts (tarea 2.1).
 */
export default function DynamicMenu() {
  // TODO(2.2): el guard vive en app/dashboard/layout.tsx.
  // Borrar esta línea Y el bloque if (loading) return <skeleton/> de abajo.
  const { modules, loading } = useAuthCheck();
  const router = useRouter();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="animate-pulse space-y-2 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-9 rounded-md bg-brand-700" />
        ))}
      </div>
    );
  }

  const items = menuModules(modules ?? []);

  if (items.length === 0) {
    return (
      <div className="p-4 text-sm text-white/60">
        Tu usuario no tiene módulos asignados. Pedile a un administrador que te
        habilite al menos uno.
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.dispatchEvent(new Event('storage'));
    router.push('/');
  };

  return (
    <nav className="flex flex-1 flex-col overflow-y-auto">
      <ul className="flex flex-col gap-2 p-4">
        {items.map(({ key, href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <li key={key}>
              <Link
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-md px-3 py-2 transition-colors ${
                  isActive
                    ? 'bg-brand-600 text-white'
                    : 'text-white/70 hover:bg-brand-700 hover:text-white'
                }`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto border-t border-brand-700 p-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-white/50 transition-colors hover:text-accent-600"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}
