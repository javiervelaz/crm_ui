// app/catalogo/pedidoMicrositio.api.ts
'use client';

import { CartItem } from './types';
import {
  getApiBaseUrl,
  getMicrositeClienteId,
  getMicrositeSucursalId,
  getMicrositeUsuarioId,
} from './catalogConfig';

const API_BASE_URL = getApiBaseUrl();

interface CheckCajaResponse {
  caja_abierta: boolean;
  fecha: string;
  registro_diario_id: number;
}

export interface CrearPedidoParams {
  // datos del cliente
  name: string;
  phone: string;
  address: string;
  deliveryType: 'delivery' | 'pickup';
  extraNotes: string;

  // carrito
  items: CartItem[];
  total: number;

  // pago
  medio_pago_id: number;
  paga_efectivo?: number;
  vuelto_pago_efectivo?: number;

  // sesión / contexto
  clienteId?: number; 
  conversation_id?: number;     // opcional → si no viene usamos getMicrositeClienteId
}

/**
 * Llama a /operaciones/check-caja para obtener el registro_diario_id abierto hoy.
 */
async function getRegistroDiarioIdOrThrow(
  clienteId: number,
): Promise<number> {
  const today = new Date();
  const fecha = today.toISOString().slice(0, 10); // YYYY-MM-DD

  const res = await fetch(`${API_BASE_URL}/operaciones/check-caja`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fecha, cliente_id: clienteId }),
  });

  if (!res.ok) {
    throw new Error('No se pudo consultar la caja abierta');
  }

  const data: CheckCajaResponse | false = await res.json();

  if (!data || data === false || !data.caja_abierta) {
    throw new Error(
      'No hay caja abierta para hoy. Abrí la caja desde el CRM antes de tomar pedidos del micrositio.',
    );
  }

  return data.registro_diario_id;
}

/**
 * Crea el pedido en el backend usando /operaciones/crear-pedido
 */
export async function crearPedidoDesdeMicrositio(
  params: CrearPedidoParams,
): Promise<{ status: string; idPedido: number }> {
  const {
    name,
    phone,
    address,
    deliveryType,
    extraNotes,
    items,
    total,
    medio_pago_id,
    paga_efectivo,
    vuelto_pago_efectivo,
    clienteId: clienteIdFromSession,
    conversation_id: conversation_id
  } = params;

  if (!items.length) {
    throw new Error('El carrito está vacío');
  }

  if (!medio_pago_id) {
    throw new Error('Debe seleccionar un medio de pago');
  }

  const clienteId = clienteIdFromSession ?? getMicrositeClienteId();
  const sucursalId = getMicrositeSucursalId();
  const usuarioId = getMicrositeUsuarioId();
  const conversationId =  conversation_id;
  // 1) Obtenemos el registro_diario_id de la caja abierta
  const registroDiarioId = await getRegistroDiarioIdOrThrow(clienteId);

  // 2) Mapeamos items del carrito → productos que espera el backend
  const productos = items.map((it) => ({
    producto_id: Number(it.product.id),
    cantidad: it.quantity,
    cantidad_mitad: 0,
    precio_unitario: it.product.price,
    observaciones: it.notes ?? '',
    monto_adicional: 0,
  }));

  // 3) Payload compatible con operacionesDiariasService.crearPedido
  const body = {
    cliente_nombre: name,
    cliente_telefono: phone,
    cliente_casa_nro: deliveryType === 'delivery' ? address : '',
    cliente_barrio: deliveryType === 'delivery' ? '' : '',
    pedido_obs: [
      deliveryType === 'delivery' ? 'Delivery' : 'Retiro en local',
      extraNotes || '',
    ]
      .filter(Boolean)
      .join(' - '),
    productos,
    registro_diario_id: registroDiarioId,
    monto_total: total,
    usuario_id: usuarioId,
    sucursal_id: sucursalId,
    medio_pago_id,
    user_cliente_id: clienteId,
    paga_efectivo: paga_efectivo ?? 0,
    vuelto_pago_efectivo: vuelto_pago_efectivo ?? 0,
    cliente_id: clienteId,
    monto_adicional: 0,
    conversation_id:conversationId
  };

  const res = await fetch(`${API_BASE_URL}/operaciones/crear-pedido`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let msg = 'No se pudo crear el pedido';
    try {
      const errBody = await res.json();
      if (errBody?.message) msg = errBody.message;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }

  const data = await res.json();
  // controlador devuelve {status:'OK', idPedido: pedidoId}
  return data;
}
