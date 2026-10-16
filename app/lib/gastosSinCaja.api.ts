// app/lib/gastosSinCaja.api.ts
// Flujo para tenants sin caja (sin módulo 'operaciones'). Usa apiClient:
// token, 401 y toasts de error los resuelve el interceptor.
import apiClient from '@/app/lib/apiClient';
import type { GastoPeriodo } from '@/app/lib/gastosPeriodo';

/** ¿El tenant necesita caja abierta para cargar gastos? Sólo un false explícito la saca. */
export async function getGastosConfig(): Promise<{ requiereCaja: boolean }> {
  const { data } = await apiClient.get('/salida-caja/config');
  return { requiereCaja: data?.requiereCaja !== false };
}

/** Gastos entre dos fechas YYYY-MM-DD (inclusive), en hora de Córdoba. */
export async function getGastosPorPeriodo(desde: string, hasta: string): Promise<GastoPeriodo[]> {
  const { data } = await apiClient.get('/salida-caja/periodo', { params: { desde, hasta } });
  return Array.isArray(data) ? data : [];
}
