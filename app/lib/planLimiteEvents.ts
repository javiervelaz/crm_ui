/**
 * Evento de límite de plan (tarea 4.2).
 *
 * apiClient lo emite cuando el backend responde 403 por tier; el
 * PlanLimiteProvider lo escucha y abre el modal. Así la capa de red no
 * necesita saber nada de UI ni de routing.
 *
 * `tipo: 'limite'` es el tope numérico del plan (pedidos del mes, productos,
 * ítems de stock): se distingue de "esta función no está en tu plan" porque el
 * título, la ayuda y el destino son otros.
 */
export const PLAN_LIMITE_EVENT = 'plan-limite';

export interface PlanLimiteDetail {
  mensaje: string;
  tipo?: 'limite';
  limitKey?: string;
}

export function emitPlanLimite(
  mensaje: string,
  extra: Omit<PlanLimiteDetail, 'mensaje'> = {}
): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<PlanLimiteDetail>(PLAN_LIMITE_EVENT, { detail: { mensaje, ...extra } })
  );
}

export const CODIGO_LIMITE_PLAN = 'LIMITE_PLAN';

/**
 * Para los *.api.ts que usan fetch (no pasan por el interceptor de apiClient):
 * abre el modal con el mensaje del backend y devuelve un Error marcado, así el
 * formulario que lo atrapa puede saltear su toast genérico ("Reintentá"), que
 * sería engañoso: un tope de plan no se arregla reintentando.
 */
export function errorLimitePlan(body: { error?: string; limitKey?: string } | null | undefined): Error {
  const mensaje = body?.error || 'Alcanzaste el límite de tu plan.';
  emitPlanLimite(mensaje, { tipo: 'limite', limitKey: body?.limitKey });
  return Object.assign(new Error(mensaje), { code: CODIGO_LIMITE_PLAN });
}

export const esErrorLimitePlan = (e: unknown): boolean =>
  (e as { code?: string } | null)?.code === CODIGO_LIMITE_PLAN;
