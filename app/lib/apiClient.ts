'use client';

import { emitPlanLimite } from '@/app/lib/planLimiteEvents';
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

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
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

    if (status === 403) {
      const raw = data?.error || 'Acción no permitida. No tenés permisos suficientes.';

      if (typeof raw === 'string' && esErrorDePlan(raw)) {
        // [4.2] Antes: toast + window.location.href a upgrade-plan después de
        // 1,5 s. El usuario perdía el formulario que estaba completando sin
        // poder hacer nada. Ahora se emite un evento y el modal decide.
        emitPlanLimite(raw);
      } else {
        toast.error(raw, { position: 'top-right', autoClose: 3000 });
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
