'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/app/lib/apiClient';
import { AUTH_CHANGED_EVENT } from '@/app/lib/authEvents';

interface ClientePlan {
  clienteId: number;
  clienteNombre: string;
  tierCode: 'FREE' | 'BASIC' | 'PREMIUM' | string;
  tierNombre: string;
  features: {
    canUseReports?: boolean;
    canUseWhatsappBot?: boolean;
    [key: string]: any;
  };
}

export function useClientePlan() {
  const [data, setData] = useState<ClientePlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchPlan = async () => {
      const token = typeof window !== 'undefined'
        ? localStorage.getItem('token')
        : null;

      if (!token) {
        if (!cancelled) {
          setData(null);
          setLoading(false);
        }
        return;
      }

      try {
        if (!cancelled) {
          setLoading(true);
          setError(null);
        }

        const res = await apiClient.get('/cliente-plan/mi-plan');

        if (!cancelled) {
          setData(res.data);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || 'Error cargando el plan');
          setData(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    // 1) al montar
    fetchPlan();

    // 2) escuchar cambios de auth (login/logout)
    const handler = () => {
      fetchPlan();
    };

    window.addEventListener(AUTH_CHANGED_EVENT, handler);

    return () => {
      cancelled = true;
      window.removeEventListener(AUTH_CHANGED_EVENT, handler);
    };
  }, []);

  return { plan: data, loading, error };
}
