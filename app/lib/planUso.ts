import apiClient from '@/app/lib/apiClient';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

/** Límites numéricos del plan que el backend informa en GET /cliente-plan/uso. */
export type LimitKey = 'maxPedidosMensuales' | 'maxProductos' | 'maxStockItems';

export interface UsoLimite {
  usado: number;
  limite: number;
  porcentaje: number;
  /** 80 = cerca del tope, 100 = en el tope, null = lejos. */
  nivel: 80 | 100 | null;
}

export interface PlanUso {
  tierCode: string;
  tierNombre: string;
  uso: Partial<Record<LimitKey, UsoLimite>>;
}

export const RECURSO: Record<LimitKey, string> = {
  maxPedidosMensuales: 'pedidos de este mes',
  maxProductos: 'productos',
  maxStockItems: 'ítems de stock',
};

/** Qué pasa al llegar al tope, por límite (lo usa el banner y el modal). */
export const AYUDA_LIMITE: Record<LimitKey, string> = {
  maxPedidosMensuales: 'El contador de pedidos se reinicia cada mes, o podés mejorar tu plan para seguir cargando ahora.',
  maxProductos: 'Podés borrar productos que ya no uses o mejorar tu plan para cargar más.',
  maxStockItems: 'Podés dar de baja ítems que ya no uses o mejorar tu plan para cargar más.',
};

export const esLimitKey = (k: unknown): k is LimitKey =>
  k === 'maxPedidosMensuales' || k === 'maxProductos' || k === 'maxStockItems';

/** Avisa al banner que el uso cambió (se creó un pedido o un producto). */
export const PLAN_USO_EVENT = 'plan-uso-cambio';
export const emitPlanUsoCambio = (): void => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(PLAN_USO_EVENT));
};

export const getPlanUso = async (): Promise<PlanUso> => (await apiClient.get('/cliente-plan/uso')).data;

/**
 * Uso del plan del comercio. Se vuelve a pedir al cambiar de página, al volver
 * a la pestaña y cuando se crea un pedido o un producto. Si el plan no tiene
 * límites numéricos (Premium, Anual) no se vuelve a preguntar: no hay nada que
 * cambie sin que cambie el plan.
 */
export function usePlanUso(): PlanUso | null {
  const pathname = usePathname();
  const [data, setData] = useState<PlanUso | null>(null);
  const ilimitado = useRef(false);

  useEffect(() => {
    let cancelado = false;
    const cargar = () => {
      if (ilimitado.current || !localStorage.getItem('token')) return;
      getPlanUso()
        .then((d) => {
          if (cancelado) return;
          ilimitado.current = Object.keys(d.uso ?? {}).length === 0;
          setData(d);
        })
        .catch(() => { /* el banner es accesorio: si falla, no se muestra */ });
    };

    cargar();
    const alVolver = () => { if (document.visibilityState === 'visible') cargar(); };
    document.addEventListener('visibilitychange', alVolver);
    window.addEventListener(PLAN_USO_EVENT, cargar);
    return () => {
      cancelado = true;
      document.removeEventListener('visibilitychange', alVolver);
      window.removeEventListener(PLAN_USO_EVENT, cargar);
    };
  }, [pathname]);

  return data;
}
