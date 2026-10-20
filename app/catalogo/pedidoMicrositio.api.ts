// app/catalogo/pedidoMicrositio.api.ts
'use client';

import { CartItem } from './types';
import { micrositioFetch } from './micrositioApi';

export interface CrearPedidoParams {
  token: string;
  name: string;
  /** Sólo cuando el canal no trae teléfono (link público, Telegram) */
  phone?: string;
  address: string;
  deliveryType: 'delivery' | 'pickup';
  extraNotes: string;
  items: CartItem[];
  medio_pago_id: number;
  paga_efectivo?: number;
}

export interface CrearPedidoResult {
  status: string;
  idPedido: number;
  total: number; // calculado por el servidor con los precios del comercio
  vuelto: number;
}

/**
 * POST /micrositio/pedidos. El servidor resuelve comercio, sucursal, usuario,
 * teléfono, conversación y precios: acá sólo viaja lo que eligió el cliente.
 */
export async function crearPedidoDesdeMicrositio(
  params: CrearPedidoParams,
): Promise<CrearPedidoResult> {
  const {
    token,
    name,
    phone,
    address,
    deliveryType,
    extraNotes,
    items,
    medio_pago_id,
    paga_efectivo,
  } = params;

  if (!items.length) throw new Error('El carrito está vacío');
  if (!medio_pago_id) throw new Error('Elegí un medio de pago');

  return micrositioFetch<CrearPedidoResult>('/pedidos', token, {
    method: 'POST',
    body: JSON.stringify({
      nombre: name,
      telefono: phone || undefined,
      tipo_entrega: deliveryType,
      direccion: deliveryType === 'delivery' ? address : '',
      observaciones: extraNotes,
      medio_pago_id,
      paga_efectivo: paga_efectivo || undefined,
      items: items.map((it) => ({
        producto_id: Number(it.product.id),
        cantidad: it.quantity,
        observaciones: it.notes ?? '',
      })),
    }),
  });
}
