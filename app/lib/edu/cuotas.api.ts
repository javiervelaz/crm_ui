'use client';

/**
 * Cliente de cuotas y pagos de /api/edu (crm_api feat/edu-cuotas). El tenant
 * sale del JWT: ningún request manda cliente_id.
 */
import apiClient from '@/app/lib/apiClient';
import type { Cuota, EstadoCuota, EstadoPago } from './cuotas';

export interface LineaPago {
  cuota_id: number;
  importe: string | number;
  recargo_pct: string | number | null;
  recargo_importe: string | number | null;
  total: string | number | null;
  periodo: string;
  vence: string;
  alumno: string;
  clase: string;
}

export interface Pago {
  id: number;
  origen: 'admin' | 'portal';
  estado: EstadoPago;
  pagador_user_id: number | null;
  fecha_pago: string | null;
  importe_total: string | number | null;
  medio_pago: string | null;
  observacion: string | null;
  fuera_de_termino: boolean;
  comprobante_nombre: string | null;
  comprobante_mime: string | null;
  tiene_comprobante: boolean;
  motivo_rechazo: string | null;
  revisado_at: string | null;
  created_at: string;
  cuotas: LineaPago[];
}

export interface CalculoLinea {
  cuota_id: number;
  importe: number;
  recargo_pct: number;
  recargo_importe: number;
  total: number;
  periodo: string;
  vence: string;
}
export interface Calculo {
  fecha_pago: string;
  total: number;
  lineas: CalculoLinea[];
}

export interface ResultadoGeneracion {
  periodo: string;
  creadas: number;
  existentes: number;
  sin_precio: { inscripcion_id: number; clase: string }[];
}

export interface ComprobanteUrl {
  url: string;
  expira_en: number;
  nombre: string | null;
  mime: string | null;
}

// ─── Administración ───────────────────────────────────────────────────────
export const listarCuotas = async (params?: {
  periodo?: string;
  estado?: EstadoCuota;
  alumno_id?: number;
}) => (await apiClient.get<Cuota[]>('/edu/cuotas', { params })).data;

export const generarCuotas = async (periodo: string) =>
  (
    await apiClient.post<ResultadoGeneracion>('/edu/cuotas/generar', {
      periodo,
    })
  ).data;

export const calcularPago = async (body: {
  cuota_ids?: number[];
  pago_id?: number;
  fecha_pago: string;
}) => (await apiClient.post<Calculo>('/edu/pagos/calcular', body)).data;

export const registrarPago = async (body: {
  cuota_ids: number[];
  fecha_pago: string;
  medio_pago?: string;
  observacion?: string;
}) => (await apiClient.post<Pago>('/edu/pagos', body)).data;

export const listarPagos = async (estado?: EstadoPago) =>
  (await apiClient.get<Pago[]>('/edu/pagos', { params: { estado } })).data;

export const getPago = async (id: number) =>
  (await apiClient.get<Pago>(`/edu/pagos/${id}`)).data;

export const resumenPagos = async () =>
  (await apiClient.get<{ pendientes_revision: number }>('/edu/pagos/resumen'))
    .data;

export const aprobarPago = async (
  id: number,
  body: { fecha_pago: string; medio_pago?: string; observacion?: string },
) => (await apiClient.post<Pago>(`/edu/pagos/${id}/aprobar`, body)).data;

export const rechazarPago = async (id: number, motivo: string) =>
  (await apiClient.post<Pago>(`/edu/pagos/${id}/rechazar`, { motivo })).data;

export const comprobanteDePago = async (id: number) =>
  (await apiClient.get<ComprobanteUrl>(`/edu/pagos/${id}/comprobante`)).data;

// ─── Vista propia (alumno / tutor) ────────────────────────────────────────
export const misCuotas = async () =>
  (await apiClient.get<Cuota[]>('/edu/mis/cuotas')).data;

export const misPagos = async () =>
  (await apiClient.get<Pago[]>('/edu/mis/pagos')).data;

export const informarPago = async (datos: {
  cuota_ids: number[];
  fecha_pago: string;
  observacion?: string;
  comprobante: File;
}) => {
  const fd = new FormData();
  fd.append('cuota_ids', JSON.stringify(datos.cuota_ids));
  fd.append('fecha_pago', datos.fecha_pago);
  if (datos.observacion) fd.append('observacion', datos.observacion);
  fd.append('comprobante', datos.comprobante);
  return (await apiClient.post<Pago>('/edu/mis/pagos', fd)).data;
};

export const miComprobante = async (id: number) =>
  (await apiClient.get<ComprobanteUrl>(`/edu/mis/pagos/${id}/comprobante`))
    .data;
