// app/catalogo/catalogConfig.ts

export function getMicrositeClienteId(): number {
  const raw = process.env.NEXT_PUBLIC_MICROSITIO_CLIENTE_ID;
  const id = raw ? Number.parseInt(raw, 10) : NaN;
  if (Number.isNaN(id)) return 1;
  return id;
}

export function getApiBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) {
    throw new Error(
      'Falta configurar NEXT_PUBLIC_API_URL en el entorno del frontend',
    );
  }
  return base.replace(/\/+$/, '');
}

// 🔽 NUEVO: usuario técnico y sucursal para el micrositio

export function getMicrositeUsuarioId(): number {
  const raw = process.env.NEXT_PUBLIC_MICROSITIO_USUARIO_ID;
  const id = raw ? Number.parseInt(raw, 10) : NaN;
  // Por defecto usamos 1 como "usuario micrositio"
  if (Number.isNaN(id)) return 1;
  return id;
}

export function getMicrositeSucursalId(): number {
  const raw = process.env.NEXT_PUBLIC_MICROSITIO_SUCURSAL_ID;
  const id = raw ? Number.parseInt(raw, 10) : NaN;
  // Por ahora usamos sucursal_id = 1 como en el CRM
  if (Number.isNaN(id)) return 1;
  return id;
}
