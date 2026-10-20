// app/catalogo/micrositioApi.ts
//
// Cliente HTTP de /api/micrositio. La única credencial es el token de handoff
// del link (WhatsApp, Telegram o link público); el tenant viaja adentro del token, nunca en la URL.
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
      return 'El link expiró. Volvé a abrir el link del comercio o escribile para recibir uno nuevo.';
    case 'TOKEN_INVALID':
    case 'NO_TOKEN':
      return 'El link no es válido. Pedile uno nuevo al comercio.';
    case 'CAJA_CERRADA':
      return 'El comercio no está tomando pedidos en este momento.';
    case 'CANAL_INACTIVO':
      return 'Este link de pedidos ya no está activo. Pedile uno nuevo al comercio.';
    case 'LIMITE_PEDIDOS':
      return 'El comercio no está tomando más pedidos online este mes. Contactalo directamente.';
    case 'RATE_LIMIT':
      return 'Hiciste muchos pedidos seguidos. Probá de nuevo en unos minutos.';
    default:
      return fallback || 'Algo salió mal. Probá de nuevo.';
  }
}
