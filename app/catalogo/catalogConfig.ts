// app/catalogo/catalogConfig.ts
//
// El micrositio no tiene cliente_id/sucursal/usuario propios: todo sale del
// token de handoff que firma la API. Acá sólo queda la base URL y dónde se
// guarda el token para sobrevivir a un refresh dentro de la misma pestaña.

const HANDOFF_TOKEN_KEY = 'counter_handoff_token';

export function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL;
  if (!raw) throw new Error('Falta NEXT_PUBLIC_API_URL');
  return raw.replace(/\/+$/, '');
}

export function readStoredHandoffToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage.getItem(HANDOFF_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function storeHandoffToken(token: string | null) {
  if (typeof window === 'undefined') return;
  try {
    if (token) window.sessionStorage.setItem(HANDOFF_TOKEN_KEY, token);
    else window.sessionStorage.removeItem(HANDOFF_TOKEN_KEY);
  } catch {
    // modo privado / storage bloqueado: el token vive sólo en memoria
  }
}
