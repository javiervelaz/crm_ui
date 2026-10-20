'use client';

import { logError } from '@/app/lib/logger';
import { micrositioFetch, MicrositioError } from './micrositioApi';

export interface HandoffSessionPayload {
  token: string;
  clienteId: number;
  userPhoneE164: string;
  conversationId: number | null;
  expiresIn: number | null; // segundos
  exp: number | null; // epoch seg
}

export type HandoffValidation =
  | { ok: true; session: HandoffSessionPayload }
  | { ok: false; code: string; message: string };

/**
 * Valida el token contra /micrositio/sesion: además de la firma chequea que
 * el plan del comercio incluya el bot (PLAN_INACTIVE).
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
