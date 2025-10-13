// app/lib/modulePermissions.ts
'use client';

import { DollarSign, FileText, Pizza, ShoppingCart, Users } from 'lucide-react';

export interface ModuleDefinition {
  routes: (string | RegExp)[];
  menu: {
    href: string;
    label: string;
    icon: React.ComponentType<any>;
  };
}

/**
 * Mapeo entre codigo del módulo (de backend) y configuración de frontend.
 * Cada módulo define las rutas permitidas y un ítem de menú asociado.
 */
export const MODULE_PERMISSIONS: Record<string, ModuleDefinition> = {
  usuarios: {
    routes: [
      '/dashboard/usuarios',
      '/dashboard/usuarios/create',
      /^\/dashboard\/usuarios\/\d+\/edit$/,
      '/dashboard/profile'
    ],
    menu: {
      href: '/dashboard/usuarios',
      label: 'Usuarios',
      icon: Users,
    },
  },
  pedidos: {
    routes: ['/dashboard/pedidos', /^\/dashboard\/pedidos\/\d+\/detalle$/],
    menu: {
      href: '/dashboard/pedidos',
      label: 'Pedidos',
      icon: ShoppingCart,
    },
  },
  productos: {
    routes: [
      '/dashboard/productos',
      '/dashboard/productos/create',
      /^\/dashboard\/productos\/\d+\/edit$/,
    ],
    menu: {
      href: '/dashboard/productos',
      label: 'Productos',
      icon: Pizza,
    },
  },
  caja: {
    routes: [
      '/dashboard/caja',
      '/dashboard/operaciones/caja',
      '/dashboard/operaciones/empleado/caja',
    ],
    menu: {
      href: '/dashboard/caja',
      label: 'Caja',
      icon: DollarSign,
    },
  },
  reportes: {
    routes: [
      '/dashboard/reportes',
      '/dashboard/reportes/ventas',
      '/dashboard/reportes/gastos',
      '/dashboard/reportes/clientes',
      '/dashboard/reportes/caja',
    ],
    menu: {
      href: '/dashboard/reportes',
      label: 'Reportes',
      icon: FileText,
    },
  },
  tipo : {
    routes: [
      '/dashboard/tipo-producto',
      '/dashboard/tipo-producto/create',
      /^\/dashboard\/tipo-producto\/\d+\/edit$/,
    ],
    menu: {
      href: '/dashboard/tipo-producto',
      label: 'Tipo Producto',
      icon: FileText,
    }
  }
};
