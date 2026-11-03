/**
 * Permisos de la sesión, a partir del JWT. Misma regla que crm_api
 * (middleware/acceso.js): hace falta el módulo y el permiso; al admin le
 * alcanza con el módulo. Sirve para OCULTAR lo que la API va a rechazar:
 * la API es la que decide, esto sólo evita botones que dan 403.
 */
import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';
import { AUTH_CHANGED_EVENT } from '@/app/lib/authEvents';

export interface TokenPermisos {
  modules?: string[];
  permissions?: Record<string, string[]>;
  role?: string[];
  tipo?: string | null;
}

export const esAdmin = (t: TokenPermisos | null | undefined): boolean =>
  !!t && (t.tipo === 'ADMIN' || (t.role ?? []).includes('admin'));

/** ¿Puede `t` hacer `codigo` ("inventario.update")? */
export function puede(
  t: TokenPermisos | null | undefined,
  codigo: string,
): boolean {
  if (!t) return false;
  const [modulo] = codigo.split('.');
  if (!(t.modules ?? []).includes(modulo)) return false;
  if (esAdmin(t)) return true;
  const p = t.permissions ?? {};
  return (
    (p[modulo] ?? []).includes(codigo) || (p._global ?? []).includes(codigo)
  );
}

/** Lo que importa de un token para saber si cambiaron los permisos. */
export function huellaPermisos(t: TokenPermisos | null | undefined): string {
  if (!t) return '';
  const permisos = Object.entries(t.permissions ?? {})
    .map(([m, ps]) => `${m}:${[...ps].sort().join(',')}`)
    .sort();
  return JSON.stringify([
    [...(t.modules ?? [])].sort(),
    permisos,
    [...(t.role ?? [])].sort(),
    t.tipo ?? null,
  ]);
}

export function tokenActual(): TokenPermisos | null {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    return jwtDecode<TokenPermisos>(token);
  } catch {
    return null;
  }
}

/** `puede(codigo)` sobre el token actual; se actualiza cuando cambia la sesión. */
export function usePermisos() {
  const [token, setToken] = useState<TokenPermisos | null>(null);
  useEffect(() => {
    const leer = () => setToken(tokenActual());
    leer();
    window.addEventListener(AUTH_CHANGED_EVENT, leer);
    window.addEventListener('storage', leer);
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, leer);
      window.removeEventListener('storage', leer);
    };
  }, []);
  return {
    puede: (codigo: string) => puede(token, codigo),
    cargado: token !== null,
  };
}
