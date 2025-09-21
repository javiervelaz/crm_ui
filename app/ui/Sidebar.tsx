// app/ui/Sidebar.tsx
'use client';

import { DollarSign, FileText, Pizza, ShoppingCart, Users } from 'lucide-react';
import { usePathname } from 'next/navigation';
import DynamicMenu from '../lib/dynamicMenu';

const menuItems = [
  { href: '/pedidos', label: 'Pedidos', icon: ShoppingCart },
  { href: '/productos', label: 'Productos', icon: Pizza },
  { href: '/caja', label: 'Caja', icon: DollarSign },
  { href: '/gastos', label: 'Gastos', icon: FileText },
  { href: '/usuarios', label: 'Usuarios', icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-900 text-gray-200 flex flex-col">
      <div className="h-16 flex items-center justify-center font-bold text-xl border-b border-gray-800">
        🍕 Pizzería Pati
      </div>
      <DynamicMenu />
    </aside>
  );
}
