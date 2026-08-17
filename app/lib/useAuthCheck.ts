'use client';

import { canAccess, defaultRouteFor } from '@/app/lib/modules';
import { logError } from '@/app/lib/logger';
import { jwtDecode } from 'jwt-decode';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export type AuthStatus = 'checking' | 'ok' | 'denied' | 'anonymous';

interface AuthState {
  status: AuthStatus;
  modules: string[];
  /** A dónde mandar al usuario cuando 'denied'. null = no tiene ningún módulo. */
  fallback: string | null;
  /** Compatibilidad con las páginas que todavía leen { loading }. */
  loading: boolean;
}

/**
 * Verifica el JWT y el acceso por módulos.
 *
 * A partir de la tarea 2.2 este hook se llama UNA sola vez, en
 * app/dashboard/layout.tsx. Las páginas hijas asumen sesión válida y no
 * dibujan su propio skeleton de carga.
 *
 * Diferencia con la versión anterior: no redirige en silencio. Devuelve un
 * status y deja que el layout decida qué mostrar — el usuario sin permiso ve
 * una pantalla que le explica qué pasó, en vez de aparecer en otro módulo sin
 * saber por qué.
 */
export const useAuthCheck = (): AuthState => {
  const router = useRouter();
  const pathname = usePathname();

  const [state, setState] = useState<Omit<AuthState, 'loading'>>({
    status: 'checking',
    modules: [],
    fallback: null,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setState({ status: 'anonymous', modules: [], fallback: null });
      router.push('/');
      return;
    }

    try {
      const decoded: { modules?: string[]; exp?: number } = jwtDecode(token);

      if (!decoded.exp || decoded.exp < Date.now() / 1000) {
        localStorage.removeItem('token');
        setState({ status: 'anonymous', modules: [], fallback: null });
        router.push('/');
        return;
      }

      const userModules = decoded.modules ?? [];
      const fallback = defaultRouteFor(userModules);

      if (userModules.length === 0 || !fallback) {
        setState({ status: 'denied', modules: userModules, fallback: null });
        return;
      }

      // En login con token válido → al primer módulo válido.
      if (pathname === '/' || pathname === '/login') {
        router.push(fallback);
        return;
      }

      setState({
        status: canAccess(pathname, userModules) ? 'ok' : 'denied',
        modules: userModules,
        fallback,
      });
    } catch (error) {
      logError('Error al decodificar el token', error);
      localStorage.removeItem('token');
      setState({ status: 'anonymous', modules: [], fallback: null });
      router.push('/');
    }
  }, [router, pathname]);

  return { ...state, loading: state.status === 'checking' };
};

export default useAuthCheck;
