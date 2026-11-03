'use client';

/**
 * Refresco de la sesión: token nuevo con los permisos ACTUALES del usuario
 * (POST /api/cuenta/sesion). Los permisos viajan en el JWT; sin esto, si el
 * dueño le cambiaba un rol a un empleado, el empleado no lo veía hasta volver
 * a loguearse.
 *
 * Cuándo se pide:
 *  · al volver a la pestaña y cada 5 min con la pestaña visible (así también
 *    llegan los permisos que el dueño SACA);
 *  · cuando una llamada da 403 por módulo o permiso (apiClient reintenta una
 *    vez si los permisos cambiaron).
 *
 * El token refrescado vence cuando vencía el anterior: no alarga la sesión.
 * Usa fetch y no apiClient para no depender del interceptor que lo llama.
 */
import { jwtDecode } from 'jwt-decode';
import { notifyAuthChanged } from '@/app/lib/authEvents';
import { huellaPermisos, TokenPermisos } from '@/app/lib/permisos';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
export const INTERVALO_REFRESCO_MS = 5 * 60_000;

let enCurso: Promise<boolean> | null = null;
let ultimo = 0;

const decodificar = (t: string | null): TokenPermisos | null => {
  if (!t) return null;
  try {
    return jwtDecode<TokenPermisos>(t);
  } catch {
    return null;
  }
};

/**
 * Pide un token nuevo si pasó `minIntervaloMs` desde el último pedido.
 * Devuelve true si cambiaron los módulos o permisos de la sesión.
 */
export function refrescarSesion(
  minIntervaloMs = INTERVALO_REFRESCO_MS,
): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);
  const actual = localStorage.getItem('token');
  if (!actual) return Promise.resolve(false);
  if (enCurso) return enCurso;
  if (Date.now() - ultimo < minIntervaloMs) return Promise.resolve(false);

  enCurso = (async () => {
    ultimo = Date.now();
    try {
      const r = await fetch(`${API}/cuenta/sesion`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${actual}` },
      });
      if (r.status === 401) {
        // Usuario dado de baja o token vencido: se cierra la sesión.
        localStorage.removeItem('token');
        notifyAuthChanged();
        window.dispatchEvent(new Event('storage'));
        window.location.href = '/';
        return false;
      }
      if (!r.ok) return false;
      const { token } = await r.json();
      if (!token || token === actual) return false;
      // Si mientras tanto se cerró sesión o se cambió de usuario, no pisar.
      if (localStorage.getItem('token') !== actual) return false;
      localStorage.setItem('token', token);
      const cambio =
        huellaPermisos(decodificar(token)) !==
        huellaPermisos(decodificar(actual));
      if (cambio) {
        notifyAuthChanged();
        window.dispatchEvent(new Event('storage')); // Header y menú escuchan 'storage'
      }
      return cambio;
    } catch {
      return false;
    } finally {
      enCurso = null;
    }
  })();
  return enCurso;
}

/** Arranca el refresco periódico. Devuelve la función para pararlo. */
export function iniciarRefrescoSesion(): () => void {
  if (typeof window === 'undefined') return () => {};
  const alVolver = () => {
    if (document.visibilityState === 'visible') refrescarSesion();
  };
  const timer = window.setInterval(alVolver, INTERVALO_REFRESCO_MS);
  document.addEventListener('visibilitychange', alVolver);
  window.addEventListener('focus', alVolver);
  return () => {
    window.clearInterval(timer);
    document.removeEventListener('visibilitychange', alVolver);
    window.removeEventListener('focus', alVolver);
  };
}

/** Sólo para tests. */
export const _reiniciar = () => {
  enCurso = null;
  ultimo = 0;
};
