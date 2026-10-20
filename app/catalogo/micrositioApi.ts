// app/catalogo/micrositioApi.ts
//
// Cliente HTTP de /api/micrositio. La única credencial es el token de handoff
// del link de WhatsApp; el tenant viaja adentro del token, nunca en la URL.
'use client';

import { getApiBaseUrl } from './catalogConfig';

export class MicrositioError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export async function micrositioFetch<T>(
  path: string,
  token: string,
  init: RequestInit = {},
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${getApiBaseUrl()}/micrositio${path}`, {
      ...init,
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(init.headers || {}),
      },
    });
  } catch {
    throw new MicrositioError(
      'No pudimos conectarnos. Revisá tu conexión.',
      0,
      'NETWORK',
    );
  }

  let body: any = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    throw new MicrositioError(
      mensajePara(body?.code, body?.error),
      res.status,
      body?.code,
    );
  }
  return body as T;
}

function mensajePara(code?: string, fallback?: string): string {
  switch (code) {
    case 'PLAN_INACTIVE':
      return 'Este comercio no tiene pedidos online activos.';
    case 'TOKEN_EXPIRED':
      return 'El link expiró. Escribile de nuevo al comercio por WhatsApp para recibir uno nuevo.';
    case 'TOKEN_INVALID':
    case 'NO_TOKEN':
      return 'El link no es válido. Pedí uno nuevo por WhatsApp.';
    case 'CAJA_CERRADA':
      return 'El comercio no está tomando pedidos en este momento.';
    case 'RATE_LIMIT':
      return 'Hiciste muchos pedidos seguidos. Probá de nuevo en unos minutos.';
    default:
      return fallback || 'Algo salió mal. Probá de nuevo.';
  }
}
