// app/lib/useRubros.ts
'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/app/lib/apiClient';
import type { Rubro } from '@/app/lib/rubros';

/** Catálogo público de rubros activos (GET /api/rubros). Mismo patrón que useTiers. */
export function useRubros() {
  const [rubros, setRubros] = useState<Rubro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    apiClient
      .get<Rubro[]>('/rubros')
      .then((res) => {
        if (!cancelled) setRubros(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err: any) => {
        if (!cancelled) setError(err?.message || 'Error cargando rubros');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { rubros, loading, error };
}
