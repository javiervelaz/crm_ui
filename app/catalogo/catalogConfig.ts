// app/catalogo/catalogConfig.ts

const MICROSITE_SESSION_KEY = 'microsite_session';

export interface MicrositeSession {
  cliente_id: number;
  sucursal_id?: number;
  usuario_id?: number;
  phone?: string;
  [key: string]: any;
}

// 🔹 Lee la sesión del micrositio desde sessionStorage/localStorage
export function getMicrositeSession(): MicrositeSession | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw =
      window.sessionStorage.getItem(MICROSITE_SESSION_KEY) ??
      window.localStorage.getItem(MICROSITE_SESSION_KEY);

    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;

    return parsed as MicrositeSession;
  } catch {
    return null;
  }
}

// 🔹 (Opcional, por si necesitás guardar la sesión desde algún lado)
export function setMicrositeSession(session: MicrositeSession) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(
    MICROSITE_SESSION_KEY,
    JSON.stringify(session),
  );
}

// 🔹 Antes solo leía del .env. Ahora prioriza la sesión.
export function getMicrositeClienteId(): number {
  // 1) Intentar desde la sesión del micrositio
  if (typeof window !== 'undefined') {
    const session = getMicrositeSession();
    if (session?.cliente_id && Number.isFinite(session.cliente_id)) {
      return Number(session.cliente_id);
    }
  }

  // 2) Fallback al .env (modo demo)
  const raw = process.env.NEXT_PUBLIC_MICROSITIO_CLIENTE_ID;
  const id = raw ? Number.parseInt(raw, 10) : NaN;
  if (Number.isNaN(id)) return 1;
  return id;
}

// 🔹 Dejo también helpers para sucursal/usuario por coherencia
export function getMicrositeSucursalIdFromSession(): number | null {
  if (typeof window !== 'undefined') {
    const session = getMicrositeSession();
    if (session?.sucursal_id && Number.isFinite(session.sucursal_id)) {
      return Number(session.sucursal_id);
    }
  }
  return null;
}

export function getMicrositeUsuarioIdFromSession(): number | null {
  if (typeof window !== 'undefined') {
    const session = getMicrositeSession();
    if (session?.usuario_id && Number.isFinite(session.usuario_id)) {
      return Number(session.usuario_id);
    }
  }
  return null;
}

// 🔹 Base URL de la API del CRM
export function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL;
  if (!raw) throw new Error('Falta NEXT_PUBLIC_API_BASE_URL');
  return raw;
}

export function getMicrositeSucursalId(): number {
  const raw = process.env.NEXT_PUBLIC_MICROSITIO_SUCURSAL_ID;
  const id = raw ? Number.parseInt(raw, 10) : NaN;
  // Por defecto usamos 1 como "usuario micrositio"
  if (Number.isNaN(id)) return 1;
  return id;
}

export function getMicrositeUsuarioId(): number {
  const raw = process.env.NEXT_PUBLIC_MICROSITIO_USUARIO_ID;
  const id = raw ? Number.parseInt(raw, 10) : NaN;
  // Por defecto usamos 1 como "usuario micrositio"
  if (Number.isNaN(id)) return 9999;
  return id;
}