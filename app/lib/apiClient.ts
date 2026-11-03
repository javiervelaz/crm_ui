'use client';

import { emitPlanLimite } from '@/app/lib/planLimiteEvents';
import { refrescarSesion } from '@/app/lib/sesion';
import axios from 'axios';
import { toast } from 'react-toastify';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** Heurística del middleware de features del backend. */
function esErrorDePlan(msg: string): boolean {
  const m = msg.toLowerCase();
  return m.includes('tu plan actual') || (m.includes('plan') && m.includes('no tiene acceso'));
}

/** 403 por módulo o permiso: puede ser un token viejo (el dueño cambió el rol). */
const CODIGOS_PERMISO = ['SIN_MODULO', 'SIN_PERMISO'];

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.response) {
      toast.error('Error de conexión con el servidor.');
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    if (status === 401) {
      toast.warning('Sesión expirada. Iniciá sesión nuevamente.');
      localStorage.removeItem('token');
      window.location.href = '/';
      return Promise.reject(error);
    }

    // Token con permisos viejos: se pide uno nuevo y, si cambió algo, se
    // reintenta UNA vez (el interceptor de request pone el token nuevo).
    if (status === 403 && CODIGOS_PERMISO.includes(data?.code) && error.config && !error.config._reintentoSesion) {
      if (await refrescarSesion(15_000)) {
        return apiClient({ ...error.config, _reintentoSesion: true } as typeof error.config);
      }
    }

    if (status === 403) {
      const raw = data?.error || 'Acción no permitida. No tenés permisos suficientes.';

      if (typeof raw === 'string' && esErrorDePlan(raw)) {
        // [4.2] Antes: toast + window.location.href a upgrade-plan después de
        // 1,5 s. El usuario perdía el formulario que estaba completando sin
        // poder hacer nada. Ahora se emite un evento y el modal decide.
        emitPlanLimite(raw);
      } else if (!['SIN_FICHA', 'PASSWORD_TEMPORAL'].includes(data?.code)) {
        // SIN_FICHA lo muestra Mis clases; PASSWORD_TEMPORAL ya redirige al
        // cambio de contraseña (useAuthCheck). toastId: varios
        // requests en paralelo con el mismo 403 muestran un solo aviso.
        toast.error(raw, { position: 'top-right', autoClose: 3000, toastId: `403:${raw}` });
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
