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

export interface UsuarioVinculado {
  id: number; // id del vínculo
  user_id: number;
  nombre: string;
  avisos: boolean;
  /** avisos prendidos Y el usuario tiene acceso a Pedidos */
  recibe_avisos: boolean;
  created_at: string;
  ultimo_uso_at: string | null;
}

export interface CanalTelegram {
  id: number;
  provider: 'telegram';
  nombre: string; // @username del bot
  status: CanalStatus;
  url_bot: string | null;
  vinculados?: UsuarioVinculado[];
}

export interface MiTelegram {
  bot: Pick<CanalTelegram, 'id' | 'nombre' | 'url_bot'> | null;
  vinculo: {
    id: number;
    avisos: boolean;
    created_at: string;
    ultimo_uso_at: string | null;
  } | null;
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

/** Admin: le saca el Telegram vinculado a un usuario del comercio. */
export const quitarVinculado = async (vinculoId: number) =>
  (await apiClient.delete(`/canales/vinculados/${vinculoId}`)).data;

// ─── Mi Telegram (cada usuario, su propio chat) ─────────────────────────────

export const getMiTelegram = async (): Promise<MiTelegram> =>
  (await apiClient.get('/mi-telegram')).data;

/** Link de un solo uso (10 min) para abrir en Telegram y vincular el chat. */
export const generarVinculacion = async (): Promise<{
  url: string;
  expira_en: number;
  bot: string;
}> => (await apiClient.post('/mi-telegram/vinculacion')).data;

export const setMisAvisos = async (avisos: boolean) =>
  (await apiClient.patch('/mi-telegram', { avisos })).data;

export const desvincularMiTelegram = async () =>
  (await apiClient.delete('/mi-telegram')).data;

/** Mensaje legible de un error de axios contra /api/canales. */
export function mensajeError(
  err: any,
  fallback = 'No se pudo completar la acción.',
): string {
  return err?.response?.data?.error || fallback;
}
