// Pixel de Meta + atribución del alta. Las funciones puras no tocan window,
// así se pueden verificar sin navegador.

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '';

const MAX_LEN = 150;

export interface AtribucionAlta {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  fbclid?: string;
}

const val = (params: URLSearchParams, key: string): string | undefined => {
  const v = (params.get(key) || '').trim().slice(0, MAX_LEN);
  return v || undefined;
};

/** La landing pasa utm_* y fbclid en la URL del alta. */
export function leerAtribucion(search: string): AtribucionAlta {
  const p = new URLSearchParams(search);
  return {
    utmSource: val(p, 'utm_source'),
    utmMedium: val(p, 'utm_medium'),
    utmCampaign: val(p, 'utm_campaign'),
    utmContent: val(p, 'utm_content'),
    fbclid: val(p, 'fbclid'),
  };
}

/** Lee una cookie de un string tipo document.cookie. */
export function leerCookie(cookies: string, nombre: string): string | undefined {
  for (const parte of cookies.split(';')) {
    const [k, ...resto] = parte.trim().split('=');
    if (k === nombre) {
      const v = resto.join('=');
      return v ? v.slice(0, 255) : undefined;
    }
  }
  return undefined;
}

/** event_id compartido entre el Pixel y la API de Conversiones (dedupe). */
export function nuevoEventId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `ev-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

type Fbq = (...args: unknown[]) => void;

/** Evento estándar del Pixel con event_id. No hace nada si el Pixel no cargó. */
export function trackPixel(evento: string, data: Record<string, unknown>, eventId?: string): void {
  if (typeof window === 'undefined') return;
  const fbq = (window as unknown as { fbq?: Fbq }).fbq;
  if (typeof fbq !== 'function') return;
  if (eventId) fbq('track', evento, data, { eventID: eventId });
  else fbq('track', evento, data);
}
