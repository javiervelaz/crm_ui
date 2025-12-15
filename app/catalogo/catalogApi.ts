// app/catalogo/catalogApi.ts
'use client';

import type { CatalogProduct } from './types';
import { getApiBaseUrl, getMicrositeClienteId } from './catalogConfig';
import { useHandoffSession } from './HandoffSessionContext';

const API_BASE_URL = getApiBaseUrl();

function mapBackendProductToCatalogProduct(raw: any): CatalogProduct {
  return {
    id: String(raw.id),
    name: raw.nombre ?? '',
    // Ajustá estos campos a los nombres reales de tu API:
    permite_mitad: raw.permite_mitad ?? '',
    description: raw.description ?? '',
    price: Number(raw.precio_unitario ?? 0),
    // nombre del tipo de producto, revisá alias del SELECT en el backend
    category:
      //raw.tipo_producto_nombre ??
      raw.tipo_producto ??
      'Sin categoría',
    imageUrl: raw.imagen_url ?? undefined,
    // si más adelante agregás tags, podés mapearlos acá
    tags: raw.tags ?? [],
  };
}

export async function fetchCatalogProducts(session:any): Promise<CatalogProduct[]> {
 
  console.log("session",session)
  const clienteId = session.clienteId ?? getMicrositeClienteId();

  const res = await fetch(
    `${API_BASE_URL}/producto/w/list/${clienteId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    },
  );

  if (!res.ok) {
    console.error('Error al obtener productos del catálogo', res.status);
    throw new Error('No se pudieron cargar los productos');
  }

  const data = await res.json();

  if (!Array.isArray(data)) {
    console.warn('Respuesta inesperada de /producto/list:', data);
    return [];
  }

  return data.map(mapBackendProductToCatalogProduct);
}

export async function fetchProductById(
  id: string,
): Promise<CatalogProduct | null> {
  const clienteId = getMicrositeClienteId();

  const res = await fetch(
    `${API_BASE_URL}/producto/${id}/${clienteId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    },
  );

  if (!res.ok) {
    if (res.status === 404) {
      return null;
    }
    console.error('Error al obtener producto por id', res.status);
    throw new Error('No se pudo cargar el producto');
  }

  const raw = await res.json();
  if (!raw) return null;

  return mapBackendProductToCatalogProduct(raw);
}
