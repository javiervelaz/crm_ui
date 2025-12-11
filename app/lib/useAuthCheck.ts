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

      // Validar acceso actual (exceptuamos login y rutas públicas)
      const publicRoutes = ['/', '/login'];
      const normalizedPath = pathname.toLowerCase();
      console.log("user modules",userModules);
      // Si está en login y tiene token válido → redirigir al primer módulo
      if (publicRoutes.includes(normalizedPath)) {
        const defaultModule = userModules[3];
        console.log(`➡️ Usuario autenticado, redirigiendo al módulo ${defaultModule}`);
        router.push(`/dashboard/${defaultModule}`);
        setLoading(false);
        return;
      }

      // 🧩 Rutas auxiliares permitidas (no son módulos, pero deben ser accesibles)
      const auxiliaryRoutes = [
        '/dashboard/profile',
        '/dashboard/settings',
        '/dashboard/productos/tipo-producto',
        '/dashboard/home',
        '/dashboard/tipo-salida',
        '/catalogo',
        'dashboard/operaciones/admin/reportes/caja',
        '/dashboard/upgrade-plan'
      ];

      // Verificar acceso por módulo o por ruta auxiliar
      const hasAccess =
        userModules.some((mod) =>
          normalizedPath.startsWith(`/dashboard/${mod}`)
        ) ||
        auxiliaryRoutes.some((aux) => normalizedPath.startsWith(aux));

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
