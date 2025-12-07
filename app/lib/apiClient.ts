'use client';

import axios from 'axios';
import { toast } from 'react-toastify';

// 🔹 Configura tu base URL si es necesario
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
});

// 🔹 Interceptor para adjuntar el token JWT automáticamente
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🔹 Interceptor de respuesta para manejar errores globales
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 403) {
        const rawMsg =
          data?.error ||
          'Acción no permitida. No tienes permisos suficientes.';

        const lowerMsg = typeof rawMsg === 'string' ? rawMsg.toLowerCase() : '';

        // Detectamos si el 403 viene por plan / tier (mensaje del middleware de features)
        const isPlanError =
          lowerMsg.includes('tu plan actual') ||
          (lowerMsg.includes('plan') && lowerMsg.includes('no tiene acceso'));

        const finalMsg = isPlanError
          ? 'Tu plan actual no incluye esta funcionalidad. Podés mejorar el plan para acceder.'
          : rawMsg;

        // Aviso en pantalla
        toast.error(finalMsg, {
          position: 'top-right',
          autoClose: 3000,
        });

        // Si el error viene por plan, redirigimos a una página especial
        if (isPlanError) {
          setTimeout(() => {
            window.location.href = '/dashboard/upgrade-plan';
          }, 1500);
        }
      } else if (status === 401) {
        toast.warning('Sesión expirada. Inicia sesión nuevamente.');
        localStorage.removeItem('token');
        window.location.href = '/';
      }
    } else {
      toast.error('Error de conexión con el servidor.');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
