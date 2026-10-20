// app/catalogo/catalogApi.ts
'use client';

import { logWarn } from '@/app/lib/logger';
import type { CatalogProduct } from './types';
import { micrositioFetch } from './micrositioApi';

function mapBackendProductToCatalogProduct(raw: any): CatalogProduct {
  return {
    id: String(raw.id),
    name: raw.nombre ?? '',
    permite_mitad: Boolean(raw.permite_mitad),
    description: raw.description ?? '',
    price: Number(raw.precio_unitario ?? 0),
    category: raw.tipo_producto ?? 'Sin categoría',
    imageUrl: raw.imagen_url ?? undefined,
    tags: raw.tags ?? [],
  };
}

export async function fetchCatalogProducts(
  token: string,
): Promise<CatalogProduct[]> {
  const data = await micrositioFetch<any>('/productos', token);
  if (!Array.isArray(data)) {
    logWarn('Respuesta inesperada de /micrositio/productos:', data);
    return [];
  }
  return data.map(mapBackendProductToCatalogProduct);
}

export async function fetchProductById(
  id: string,
  token: string,
): Promise<CatalogProduct | null> {
  try {
    const raw = await micrositioFetch<any>(
      `/productos/${encodeURIComponent(id)}`,
      token,
    );
    return raw ? mapBackendProductToCatalogProduct(raw) : null;
  } catch (err: any) {
    if (err?.status === 404 || err?.status === 400) return null;
    throw err;
  }
}
