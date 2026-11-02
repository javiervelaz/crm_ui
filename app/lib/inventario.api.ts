'use client';

/**
 * Cliente de /api/inventario (crm_api, Fase 1a). Tenant y usuario salen del
 * JWT: nunca se mandan cliente_id ni usuario_id. Los 403 de plan los maneja
 * el interceptor de apiClient (modal de upgrade).
 */
import apiClient from '@/app/lib/apiClient';
import type {
  EstadoStock,
  TipoItem,
  TipoMovimiento,
  UnidadIngreso,
  UnidadItem,
} from '@/app/lib/inventario';

export interface StockItem {
  id: number;
  nombre: string;
  tipo: TipoItem;
  unidad: UnidadItem;
  stock: number;
  stock_minimo: number | null;
  costo_unitario: number | null;
  activo: boolean;
  estado: EstadoStock;
  faltante?: number;
}

export interface Movimiento {
  id: number;
  stock_item_id: number;
  item: string;
  unidad: UnidadItem;
  tipo: TipoMovimiento;
  cantidad: number;
  costo_total: number | null;
  pedido_id: number | null;
  salida_caja_id: number | null;
  nota: string | null;
  created_at: string;
  usuario: string | null;
}

export interface ItemInput {
  nombre: string;
  tipo: TipoItem;
  unidad: UnidadItem;
  stock_minimo: number | null;
}

export type MovimientoInput =
  | {
      tipo: 'compra';
      stock_item_id: number;
      cantidad: number;
      unidad?: UnidadIngreso;
      costo_total?: number | null;
      registrar_gasto?: boolean;
      medio_pago_id?: number | null;
      nota?: string | null;
    }
  | {
      tipo: 'merma';
      stock_item_id: number;
      cantidad: number;
      unidad?: UnidadIngreso;
      nota?: string | null;
    }
  | {
      tipo: 'ajuste';
      stock_item_id: number;
      contado: number;
      unidad?: UnidadIngreso;
      nota?: string | null;
    };

export interface MovimientoResultado {
  movimiento: Movimiento | null;
  gasto: { id: number } | null;
  item: StockItem;
  sin_cambios?: boolean;
}

export const getItems = async (
  params: { q?: string; bajo_minimo?: boolean; tipo?: TipoItem } = {},
) => (await apiClient.get<StockItem[]>('/inventario/items', { params })).data;

export const crearItem = async (input: ItemInput) =>
  (await apiClient.post<StockItem>('/inventario/items', input)).data;

export const actualizarItem = async (
  id: number,
  cambios: Partial<ItemInput> & { activo?: boolean },
) => (await apiClient.put<StockItem>(`/inventario/items/${id}`, cambios)).data;

export const darDeBajaItem = async (id: number) =>
  (await apiClient.delete(`/inventario/items/${id}`)).data;

export const registrarMovimiento = async (input: MovimientoInput) =>
  (await apiClient.post<MovimientoResultado>('/inventario/movimientos', input))
    .data;

export const getMovimientos = async (
  params: { stock_item_id?: number; limit?: number; offset?: number } = {},
) =>
  (
    await apiClient.get<{
      data: Movimiento[];
      meta: { limit: number; offset: number };
    }>('/inventario/movimientos', { params })
  ).data;

export const getAlertas = async () =>
  (await apiClient.get<StockItem[]>('/inventario/alertas')).data;

/** Mensaje del backend, o el genérico. Los 403 de plan ya los mostró el interceptor. */
export function mensajeError(
  err: any,
  fallback = 'No se pudo completar la acción.',
): string {
  return err?.response?.data?.error || fallback;
}

export const codigoError = (err: any): string | null =>
  err?.response?.data?.code ?? null;
