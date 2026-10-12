// app/lib/gastosSinCaja.api.ts
// Gastos para tenants sin caja (sin módulo 'operaciones'). Usa apiClient:
// token, 401 y toasts de error los resuelve el interceptor.
import apiClient from '@/app/lib/apiClient';
import type { GastoPeriodo, TipoGastoId } from '@/app/lib/gastosPeriodo';

/** ¿El tenant necesita caja abierta para cargar gastos? */
export async function getGastosConfig(): Promise<{ requiereCaja: boolean }> {
  const { data } = await apiClient.get('/salida-caja/config');
  return { requiereCaja: data?.requiereCaja !== false };
}

export async function getGastosPorPeriodo(desde: string, hasta: string): Promise<GastoPeriodo[]> {
  const { data } = await apiClient.get('/salida-caja/periodo', { params: { desde, hasta } });
  return Array.isArray(data) ? data : [];
}

/** Usuario y tenant los pone la API desde el JWT. */
export async function crearGastoSinCaja(gasto: {
  descripcion: string;
  monto: number;
  tipo: TipoGastoId;
}) {
  const { data } = await apiClient.post('/salida-caja', [
    { descripcion: gasto.descripcion.trim(), monto: gasto.monto, categoria_salida_id: gasto.tipo },
  ]);
  return data;
}

export async function eliminarGastoSinCaja(id: number, clienteId: bigint | number | null) {
  const { data } = await apiClient.delete(`/salida-caja/${id}/${clienteId}`);
  return data;
}
