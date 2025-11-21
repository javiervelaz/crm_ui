'use client';

import DynamicMenu from '@/app/lib/dynamicMenu';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-900 text-gray-200 flex flex-col border-r border-gray-800">
      {/* 🔹 Encabezado */}
      <div className="h-16 flex items-center justify-center font-bold text-xl border-b border-gray-800 bg-gray-950">
        🍕 CRM
      </div>

      {/* 🔹 Menú dinámico */}
      <div className="flex-1 overflow-y-auto">
        <DynamicMenu key={pathname} />
      </div>
    
      {/* 🔹 Footer */}
      <div className="text-center text-xs text-gray-500 py-3 border-t border-gray-800 bg-gray-950">
        CRM v1.0 • {new Date().getFullYear()}
      </div>
    </aside>
  );
}
