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
      '/dashboard/profile',
      /^\/dashboard\/usuarios\/\d+\/edit$/,
      /^\/dashboard\/profile\/\d+\/edit$/,
      
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
      href: '/dashboard/operaciones/admin',
      label: 'Operaciones',
      icon: ShoppingCart,
    },
  },
  productos: {
    routes: [
      '/dashboard/productos',
      '/dashboard/productos/create',
      /^\/dashboard\/productos\/\d+\/edit$/,
      '/dashboard/productos/tipo-producto',
      '/dashboard/productos/tipo-producto/create',
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
      /^\/dashboard\/reportes\/reportes\/caja\/\d+\/detalle$/,
    ],
    menu: {
      href: '/dashboard/reportes',
      label: 'Reportes',
      icon: FileText,
    },
  },
  tipo : {
    routes: [
      '/dashboard/ptoductos/tipo-producto',
      '/dashboard/ptoductos/tipo-producto/create',
      /^\/dashboard\/ptoductos\/tipo-producto\/\d+\/edit$/,
    ],
    menu: {
      href: '/dashboard/productos/tipo-producto',
      label: 'Tipo Producto',
      icon: FileText,
    }
  },
  profile : {
    routes: [
      '/dashboard/profile',
      /^\/dashboard\/profile\/\d+\/edit$/,
    ],
    menu: {
      href: '/dashboard/profile',
      label: 'Profiles',
      icon: FileText,
    }
  },
  flujo: {
    routes: [
      '/dashboard/flujo',
    ],
    menu: {
      href: '/dashboard/flujo',
      label: 'Flujo Caja',
      icon: DollarSign,
    },
  },
};
