'use client';

/**
 * Cliente de /api/canales (crm_api, rama canales). El tenant sale del JWT y
 * sólo el admin del comercio puede usarlo. Nunca viajan credenciales de vuelta.
 */
import apiClient from '@/app/lib/apiClient';

export type CanalStatus = 'active' | 'suspended' | 'disconnected';

export interface CanalLink {
  id: number;
  provider: 'link';
  slug: string;
  url: string;
  status: CanalStatus;
}

export interface CanalTelegram {
  id: number;
  provider: 'telegram';
  nombre: string; // @username del bot
  status: CanalStatus;
  url_bot: string | null;
  url_avisos: string | null;
  chats_avisos: number;
}

export interface CanalesEstado {
  link: CanalLink | null;
  telegram: CanalTelegram[];
  whatsapp: {
    habilitado: boolean;
    cuentas: { id: number; nombre: string; status: CanalStatus }[];
  };
}

export const getCanales = async (): Promise<CanalesEstado> =>
  (await apiClient.get('/canales')).data;

export const crearLink = async (): Promise<CanalLink> =>
  (await apiClient.post('/canales/link')).data;

export const conectarTelegram = async (token: string): Promise<CanalTelegram> =>
  (await apiClient.post('/canales/telegram', { token })).data;

export const desconectarCanal = async (id: number) =>
  (await apiClient.delete(`/canales/${id}`)).data;

/** Mensaje legible de un error de axios contra /api/canales. */
export function mensajeError(
  err: any,
  fallback = 'No se pudo completar la acción.',
): string {
  return err?.response?.data?.error || fallback;
}
