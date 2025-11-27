// app/catalogo/medioPagoApi.ts
'use client';

import { getApiBaseUrl } from './catalogConfig';

const API_BASE_URL = getApiBaseUrl();

export interface MedioPago {
  id: number;
  descripcion: string;
  codigo?: string; // en el CRM usan mp.codigo === 'EFE'
  [key: string]: any;
}

export async function fetchMedioPagoList(): Promise<MedioPago[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/medioPago/list`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (res.status === 404) {
      return [];
    }

    if (!res.ok) {
      throw new Error('Error al obtener medios de pago');
    }

    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data as MedioPago[];
  } catch (error) {
    console.error('Error al obtener el medio de pago', error);
    // Igual que en el CRM: ante error, devolvemos []
    return [];
  }
}
