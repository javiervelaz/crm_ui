'use client';

import DynamicMenu from '@/app/lib/dynamicMenu';
import { usePathname } from 'next/navigation';

type SidebarProps = {
  className?: string;
  onRequestClose?: () => void;
};

export default function Sidebar({ className = '', onRequestClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={`w-72 max-w-[85vw] md:w-64 bg-gray-900 text-gray-200 flex flex-col border-r border-gray-800 ${className}`}>
      <div className="h-16 flex items-center justify-between px-4 font-bold text-xl border-b border-gray-800 bg-gray-950">
        <span className="select-none">🍕 CRM</span>
        {onRequestClose && (
          <button
            type="button"
            onClick={onRequestClose}
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-200 hover:bg-gray-800"
            aria-label="Cerrar menú"
          >
            ✕
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <DynamicMenu key={pathname} />
      </div>

      <div className="text-center text-xs text-gray-500 py-3 border-t border-gray-800 bg-gray-950">
        CRM v1.0 • {new Date().getFullYear()}
      </div>
    </aside>
  );
}
