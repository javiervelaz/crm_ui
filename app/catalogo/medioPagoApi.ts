// app/catalogo/medioPagoApi.ts
'use client';

import { logError } from '@/app/lib/logger';
import { micrositioFetch } from './micrositioApi';

export interface MedioPago {
  id: number;
  descripcion: string;
  codigo?: string; // 'EFE' = efectivo
}

export async function fetchMedioPagoList(token: string): Promise<MedioPago[]> {
  try {
    const data = await micrositioFetch<any>('/medios-pago', token);
    return Array.isArray(data) ? (data as MedioPago[]) : [];
  } catch (error) {
    logError('Error al obtener los medios de pago', error);
    return [];
  }
}
