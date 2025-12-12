'use client';

import { jwtDecode } from 'jwt-decode';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * Hook para validar el token JWT y controlar acceso por módulos.
 * - Redirige al login si no hay token o está expirado.
 * - Permite acceso solo si la ruta pertenece a los módulos del usuario.
 */
export const useAuthCheck = () => {
  const router = useRouter();
  const pathname = usePathname();

  const [modules, setModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      console.warn('⛔ No hay token, redirigiendo al login');
      setLoading(false);
      router.push('/');
      return;
    }

    try {
      const decodedToken: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      // Verificar expiración
      if (decodedToken.exp < currentTime) {
        console.warn('⚠️ Token expirado');
        localStorage.removeItem('token');
        setLoading(false);
        router.push('/');
        return;
      }

      // Verificar módulos
      const userModules: string[] = decodedToken.modules || [];
      console.log(userModules);
      if (userModules.length === 0) {
        console.warn('⚠️ Usuario sin módulos asignados');
        setLoading(false);
        router.push('/');
        return;
      }

      // Guardamos módulos en estado
      setModules(userModules);

      const publicRoutes = ['/', '/login'];
      const normalizedPath = pathname.toLowerCase();
      console.log("user modules", userModules);

      // Si está en login y tiene token válido → redirigir al primer módulo
      if (publicRoutes.includes(normalizedPath)) {
        const defaultModule = userModules[3];
        console.log(`➡️ Usuario autenticado, redirigiendo al módulo ${defaultModule}`);
        router.push(`/dashboard/${defaultModule}`);
        setLoading(false);
        return;
      }

      // Rutas auxiliares fijas permitidas
      const auxiliaryRoutes = [
        '/dashboard/profile',
        '/dashboard/settings',
        '/dashboard/home',
        '/dashboard/tipo-salida',
        '/catalogo',
        '/dashboard/operaciones/admin/reportes/caja',
        '/dashboard/upgrade-plan',
        '/dashboard/gasto',
        '/dashboard/gasto/create'
      ];

      const auxiliaryPrefixRoutes = [
        '/dashboard/tipo-producto',
        '/dashboard/operaciones/admin/reportes',
        '/dashboard/profile',
        '/dashboard/gasto',
        '/dashboard/tipo-salida'
      ];

      // Verificar acceso por módulo o ruta auxiliar
      const cleanedPath = normalizedPath.replace(/\/+$/, ''); // eliminar slash final si existe

      const hasAccess =
        userModules.some((mod) =>
          cleanedPath.startsWith(`/dashboard/${mod}`)
        ) ||
        auxiliaryRoutes.includes(cleanedPath) ||
        auxiliaryPrefixRoutes.some((prefix) =>
          cleanedPath.startsWith(prefix)
        );
        console.log('[ACCESS CHECK] current path:', cleanedPath);

      if (!hasAccess) {
        console.warn(`🚫 Acceso denegado a ${normalizedPath}`);
        const fallback = `/dashboard/${userModules[0]}`;
        router.push(fallback);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      localStorage.removeItem('token');
      setLoading(false);
      router.push('/');
    }
  }, [router, pathname]);

  return { modules, loading };
};

export default useAuthCheck;