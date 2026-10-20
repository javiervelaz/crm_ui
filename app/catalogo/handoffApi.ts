'use client';

import { logError } from '@/app/lib/logger';
import { micrositioFetch, MicrositioError } from './micrositioApi';
import { getApiBaseUrl } from './catalogConfig';

export interface HandoffSessionPayload {
  token: string;
  clienteId: number;
  userPhoneE164: string;
  conversationId: number | null;
  /** Por dónde entró: link público, Telegram o WhatsApp */
  canal: 'link' | 'telegram' | 'whatsapp';
  /** Nombre del comercio, para el header */
  comercio: string | null;
  /** El canal no trae teléfono: el checkout lo pide */
  pideTelefono: boolean;
  expiresIn: number | null; // segundos
  exp: number | null; // epoch seg
}

export type HandoffValidation =
  | { ok: true; session: HandoffSessionPayload }
  | { ok: false; code: string; message: string };

/**
 * Valida el token contra /micrositio/sesion: además de la firma chequea que
 * el plan del comercio incluya el canal (PLAN_INACTIVE) y que el link o el
 * bot sigan activos (CANAL_INACTIVO).
 */
export async function validateHandoffToken(
  token: string,
): Promise<HandoffValidation> {
  try {
    const data = await micrositioFetch<any>('/sesion', token);
    return {
      ok: true,
      session: {
        token,
        clienteId: data.clienteId,
        userPhoneE164: data.userPhoneE164 ?? '',
        conversationId: data.conversationId ?? null,
        canal: data.canal ?? 'whatsapp',
        comercio: data.comercio ?? null,
        pideTelefono: data.pideTelefono === true,
        expiresIn: data.expiresIn ?? null,
        exp: data.exp ?? null,
      },
    };
  } catch (err) {
    if (err instanceof MicrositioError) {
      return { ok: false, code: err.code || 'ERROR', message: err.message };
    }
    logError('Error validating handoff token', err);
    return { ok: false, code: 'ERROR', message: 'No pudimos validar el link.' };
  }
}

/**
 * Link público /p/{slug}: pide una sesión del micrositio sin bot de por medio.
 */
export async function iniciarSesionPorLink(
  slug: string,
): Promise<
  { ok: true; token: string } | { ok: false; code: string; message: string }
> {
  try {
    const res = await fetch(
      `${getApiBaseUrl()}/publico/pedidos/${encodeURIComponent(slug)}/sesion`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      },
    );
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.token) {
      const code = data?.code || 'ERROR';
      return {
        ok: false,
        code,
        message:
          code === 'PLAN_INACTIVE'
            ? 'Este comercio no tiene pedidos online activos.'
            : code === 'RATE_LIMIT'
              ? 'Demasiados intentos. Probá en unos minutos.'
              : 'Este link de pedidos no existe o ya no está activo.',
      };
    }
    return { ok: true, token: data.token };
  } catch (err) {
    logError('Error iniciando sesión por link', err);
    return {
      ok: false,
      code: 'NETWORK',
      message: 'No pudimos conectarnos. Revisá tu conexión.',
    };
  }
}
