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

// 🔹 Interceptor global para manejar errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 403) {
        const msg =
          data?.error ||
          'Acción no permitida. No tienes permisos suficientes.';
        toast.error(msg, {
          position: 'top-right',
          autoClose: 3000,
        });
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
