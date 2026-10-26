// app/lib/useTiers.ts
'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/app/lib/apiClient';
import type { PlanFeatures } from '@/app/lib/planBeneficios';

/** Oferta de un tier EN un rubro (GET /api/tiers?rubro=). Precio y features cambian por rubro. */
export interface Tier {
  id: number;
  code: string; // FREE / BASIC / PREMIUM / CUSTOM
  nombre_publico: string;
  descripcion: string | null;
  precio_mensual: number | null;
  es_activo: boolean;
  es_personalizado: boolean;
  duracion_meses: number;
  rubro_codigo?: string;
  /** false → todavía no se puede contratar en este rubro (se muestra "Próximamente"). */
  disponible?: boolean;
  features?: PlanFeatures;
}

/**
 * Planes del rubro pedido.
 * - `rubro` string → /tiers?rubro=<rubro>
 * - `rubro` null → todavía no se sabe el rubro: no pide nada (evita mostrar precios de otro rubro)
 * - sin argumento → /tiers (el backend usa gastronomía)
 */
export function useTiers(rubro?: string | null) {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(rubro !== null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (rubro === null) return;
    let cancelled = false;

    const fetchTiers = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiClient.get('/tiers', {
          params: rubro ? { rubro } : undefined,
        });
        if (!cancelled) setTiers(res.data || []);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'Error cargando planes');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchTiers();
    return () => {
      cancelled = true;
    };
  }, [rubro]);

  return { tiers, loading, error };
}
