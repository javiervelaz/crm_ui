'use client';

import { getApiBaseUrl } from './catalogConfig';

const API_BASE_URL = getApiBaseUrl();

export interface HandoffSessionPayload {
  token: string;
  clienteId: number;
  userPhoneE164: string;
  waPhoneId: string;
  conversationId: number;
  expiresIn: number | null; // segundos
  exp: number | null;       // epoch seg, opcional
}

export async function validateHandoffToken(
  token: string,
): Promise<HandoffSessionPayload | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/handoff/resolve?c=${token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      //body: JSON.stringify({ token }),
    });

    if (!res.ok) {
      // 401 o lo que sea → token inválido o expirado
      return null;
    }

    const data = await res.json();

    if (!data.valid) {
      return null;
    }

    return {
      token,
      clienteId: data.clienteId,
      userPhoneE164: data.userPhoneE164,
      waPhoneId: data.waPhoneId,
      conversationId: data.conversationId,
      expiresIn: data.expiresIn ?? null,
      exp: data.exp ?? null,
    };
  } catch (err) {
    console.error('Error validating handoff token', err);
    return null;
  }
}
