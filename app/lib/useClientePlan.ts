'use client';

import { useEffect, useState } from 'react';
import  apiClient  from '@/app/lib/apiClient';

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
      try {
        setLoading(true);
        const res = await apiClient.get('/cliente-plan/mi-plan');
        if (!cancelled) {
          setData(res.data);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || 'Error cargando el plan');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchPlan();
    return () => {
      cancelled = true;
    };
  }, []);

  return { plan: data, loading, error };
}
