'use client'

import { jwtDecode } from 'jwt-decode';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Usar patrones de ruta en lugar de URLs completas
const ROLE_PERMISSIONS: Record<string, (string | RegExp)[]> = {
  1: [
    '/dashboard/operaciones/admin',
    '/dashboard/operaciones/empleado',
    '/dashboard/usuarios',
    '/dashboard/usuarios/create',
    /^\/dashboard\/profile\/\d+\/edit$/,   // 👈 agregado
    '/dashboard/operaciones/admin/reportes',
    '/dashboard/productos',
    /^\/dashboard\/productos\/\d+\/edit$/, 
    /^\/dashboard\/productos\/\d+\/detalle$/, 
    '/dashboard/productos/create',
    '/dashboard/profile',
    '/dashboard/operaciones/caja',
    '/dashboard/operaciones/admin/reportes/ventas',
    '/dashboard/operaciones/admin/reportes/gastos',
    '/dashboard/tipo-producto',
    /^\/dashboard\/tipo-producto\/\d+\/edit$/, 
    '/dashboard/tipo-producto/create',
    '/dashboard/operaciones/admin/reportes/clientes',
    '/dashboard/operaciones/empleado/caja',
    '/dashboard/tipo-salida',
    /^\/dashboard\/tipo-salida\/\d+\/edit$/, 
    '/dashboard/tipo-salida/create',
    '/dashboard/operaciones/admin/reportes/caja',
    // Patrón para todas las rutas de detalle de caja
    /^\/dashboard\/operaciones\/admin\/reportes\/caja\/\d+\/detalle$/
  ],
  2: [
    '/dashboard/operaciones/empleado',
    '/dashboard/operaciones/empleado/caja',
    '/dashboard/tipo-producto',
    '/dashboard/tipo-producto/create',
    '/dashboard/productos',
    '/dashboard/productos/create',
    '/dashboard/operaciones/caja',
    '/dashboard/tipo-salida',
    '/dashboard/tipo-salida/create',
  ],
};

const ROLE_DEFAULT_ROUTES: Record<string, string> = {
  1: '/dashboard/operaciones/admin',
  2: '/dashboard/operaciones/empleado',
};

// Función para verificar si la ruta tiene acceso
const hasAccess = (pathname: string, allowedRoutes: (string | RegExp)[]): boolean => {
  return allowedRoutes.some(route => {
    if (typeof route === 'string') {
      return pathname === route;
    } else if (route instanceof RegExp) {
      return route.test(pathname);
    }
    return false;
  });
};

export const useAuthCheck = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      let decodedToken: any;
      try {
        decodedToken = jwtDecode(token);
      } catch (error) {
        console.error('Token decoding failed:', error);
        localStorage.removeItem('token');
        router.push('/');
        return;
      }

      const currentTime = Date.now() / 1000;

      if (decodedToken && typeof decodedToken.exp !== 'undefined') {
        if (decodedToken.exp < currentTime) {
          console.warn('Token expired.');
          localStorage.removeItem('token');
          router.push('/');
          return;
        }
      } else {
        console.warn('Token does not have expiration time.');
        localStorage.removeItem('token');
        router.push('/');
        return;
      }

      // Obtener el rol del usuario
      const userRoles: any[] = decodedToken.role || [];
      const mainRole = userRoles[0]?.id_rol;
      
      if (mainRole) {
        setUserRole(mainRole);
        
        // Verificar permisos de rol usando la función hasAccess
        const allowedRoutes = ROLE_PERMISSIONS[mainRole] || [];
        const hasAccessToRoute = hasAccess(pathname, allowedRoutes);
        
        if (!hasAccessToRoute) {
          console.warn(`Access denied for route: ${pathname}`);
          const defaultRoute = ROLE_DEFAULT_ROUTES[mainRole] || '/';
          router.push(defaultRoute);
        }
      } else {
        console.warn('User has no roles');
        router.push('/');
      }
    } else {
      router.push('/');
    }
    
    setLoading(false);
  }, [router, pathname]);

  return { userRole, loading };
};

export default useAuthCheck;