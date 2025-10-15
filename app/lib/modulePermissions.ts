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
      
    ],
    menu: {
      href: '/dashboard/usuarios',
      label: 'Usuarios',
      icon: Users,
    },
  },
 
  operaciones: {
    routes: [  
      '/dashboard/operaciones/admin/reportes',
      '/dashboard/operaciones/caja',
      '/dashboard/operaciones/admin/reportes/ventas',
      '/dashboard/operaciones/admin/reportes/gastos',
      '/dashboard/operaciones/admin/reportes/clientes',
      '/dashboard/operaciones/admin/reportes/caja',
      '/dashboard/operaciones/empleado',
      '/dashboard/operaciones/empleado/caja',
      /^\/dashboard\/operaciones\/admin\/reportes\/caja\/\d+\/detalle$/,
    ],
    menu: {
      href: '/dashboard/operaciones',
      label: 'Operaciones',
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
