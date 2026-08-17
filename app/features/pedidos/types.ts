import { getClienteId } from '@/app/lib/authService';

export type ModoPedido = 'caja' | 'empleado';

export interface ProductoPedido {
  producto_id: string | number;
  cantidad: number;
  cantidad_mitad: number;
  precio_unitario: number;
  observaciones: string;
  monto_adicional: number;
}

export interface PedidoState {
  cliente_nombre: string;
  cliente_telefono: string;
  cliente_casa_nro: string;
  cliente_barrio: string;
  pedido_obs: string;
  productos: ProductoPedido[];
  registro_diario_id: number;
  monto_total: number;
  usuario_id: number;
  sucursal_id: number;
  medio_pago_id: number | null;
  user_cliente_id: number | null;
  paga_efectivo: number;
  vuelto_pago_efectivo: number;
  cliente_id: bigint | null;
}

export interface Producto {
  id: number;
  nombre: string;
  precio_unitario: number;
  tipo_producto_id: number;
  permite_mitad?: boolean;
  monto_adicional?: number;
  [key: string]: any;
}

export interface MedioPago {
  id: number;
  descripcion: string;
  codigo?: string;
  [key: string]: any;
}

export interface TipoProducto {
  id: number;
  nombre: string;
  [key: string]: any;
}

export interface ProductoEstadistica {
  producto_id: number;
  producto_nombre: string;
  cantidad_total: number;
  veces_comprado: number;
}

export interface MedioPagoEstadistica {
  medio_pago_id: number;
  medio_pago_descripcion: string;
  medio_pago_codigo: string;
  veces_utilizado: number;
}

export interface ClienteEstadistica {
  cantidad_pedidos: number;
  total_gastado: number;
  ultima_compra: string | null;
  top_3_productos: ProductoEstadistica[];
  top_medio_pago: MedioPagoEstadistica | null;
}

export interface ErroresPedido {
  telefono: string;
  nombre: string;
  direccion: string;
  barrio: string;
  pagoEfectivo: string;
}

export const ERRORES_VACIOS: ErroresPedido = {
  telefono: '',
  nombre: '',
  direccion: '',
  barrio: '',
  pagoEfectivo: '',
};

export const ESTADISTICA_VACIA: ClienteEstadistica = {
  cantidad_pedidos: 0,
  total_gastado: 0,
  ultima_compra: null,
  top_3_productos: [],
  top_medio_pago: null,
};

/** Telefono reservado para venta de mostrador: saltea nombre, direccion y barrio. */
export const TELEFONO_MOSTRADOR = '1';

export const pedidoInicial = (registroDiario: number, usuarioId: number): PedidoState => ({
  cliente_nombre: '',
  cliente_telefono: '',
  cliente_casa_nro: '',
  cliente_barrio: '',
  pedido_obs: '',
  productos: [],
  registro_diario_id: registroDiario,
  monto_total: 0,
  usuario_id: usuarioId,
  sucursal_id: 1,
  medio_pago_id: null,
  user_cliente_id: null,
  paga_efectivo: 0,
  vuelto_pago_efectivo: 0,
  cliente_id: getClienteId(),
});

export const LINEA_VACIA: ProductoPedido = {
  producto_id: '',
  cantidad: 1,
  cantidad_mitad: 0,
  precio_unitario: 0,
  observaciones: '',
  monto_adicional: 0,
};
