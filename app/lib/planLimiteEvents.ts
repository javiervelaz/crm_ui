/**
 * Evento de límite de plan (tarea 4.2).
 *
 * apiClient lo emite cuando el backend responde 403 por tier; el
 * PlanLimiteProvider lo escucha y abre el modal. Así la capa de red no
 * necesita saber nada de UI ni de routing.
 */
export const PLAN_LIMITE_EVENT = 'plan-limite';

export interface PlanLimiteDetail {
  mensaje: string;
}

export function emitPlanLimite(mensaje: string): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<PlanLimiteDetail>(PLAN_LIMITE_EVENT, { detail: { mensaje } })
  );
}
