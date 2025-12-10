// app/lib/useTiers.ts
'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/app/lib/apiClient';

export interface Tier {
  id: number;
  code: string;             // FREE / BASIC / PREMIUM
  nombre_publico: string;
  descripcion: string | null;
  precio_mensual: number | null;
  es_activo: boolean;
  es_personalizado:boolean;
  duracion_meses: number;
}

export function useTiers() {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchTiers = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/tiers'); // llama a /api/tiers
        if (!cancelled) {
          setTiers(res.data || []);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || 'Error cargando planes');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchTiers();

    return () => {
      cancelled = true;
    };
  }, []);

  return { tiers, loading, error };
}
