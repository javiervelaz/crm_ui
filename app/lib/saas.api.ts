// app/lib/saas.api.ts
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export type PlanTier = 'FREE' | 'BASIC' | 'PREMIUM' | 'CUSTOM';

export interface SaaSRegisterFormValues {
  plan: PlanTier;
  comercioNombre: string;
  cuit: string;
  adminNombre: string;
  adminApellido: string;
  adminEmail: string;
  adminDni?: string;
  telefono?: string;
  password: string;
  aceptaTerminos: boolean;
}

export interface SaaSRegisterResponse {
  cliente: { id: number; nombre: string; cuit: string };
  adminUser: { id: number; nombre: string; apellido: string; email: string };
  plan: { code: PlanTier; nombre: string; esPago: boolean };
  /** Siempre true: con el gate de activación el alta no abre sesión. */
  requiereVerificacion: boolean;
  /** Casilla a la que se mandó el link de activación. */
  emailVerificacion: string;
  paymentUrl?: string | null;
  paymentWarning?: string;
}

export interface VerificarEmailResponse {
  ok: true;
  email: string;
  /** true si el link se usó sobre una cuenta que ya estaba activa. */
  yaEstabaActivo: boolean;
  /** Sesión post-activación: un click y entra. Puede faltar si falló armarla. */
  token?: string;
  expiresIn?: string;
}

export type VerificarErrorCode = 'INVALID_TOKEN' | 'TOKEN_EXPIRED' | 'DESCONOCIDO';

export class VerificarError extends Error {
  code: VerificarErrorCode;
  constructor(message: string, code: VerificarErrorCode = 'DESCONOCIDO') {
    super(message);
    this.code = code;
  }
}

export class SignupError extends Error {
  field?: string;
  code?: string;
  constructor(message: string, field?: string, code?: string) {
    super(message);
    this.field = field;
    this.code = code;
  }
}

export async function registerSaasCliente(
  values: SaaSRegisterFormValues
): Promise<SaaSRegisterResponse> {
  if (!apiUrl) throw new SignupError('API URL no configurada (NEXT_PUBLIC_API_URL)');

  // Atribución: la landing pasa ?utm_source=... y lo propagamos
  const params = new URLSearchParams(
    typeof window !== 'undefined' ? window.location.search : ''
  );

  const response = await fetch(`${apiUrl}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...values,
      cuit: values.cuit.replace(/\D/g, ''),
      adminEmail: values.adminEmail.trim().toLowerCase(),
      aceptaTerminos: String(values.aceptaTerminos),
      utmSource: params.get('utm_source') || undefined,
      utmCampaign: params.get('utm_campaign') || undefined,
    }),
  });

  if (!response.ok) {
    let message = 'No se pudo crear la cuenta.';
    let field: string | undefined;
    let code: string | undefined;
    try {
      const data = await response.json();
      message = data?.error || message;
      field = data?.field;
      code = data?.code;
    } catch { /* respuesta sin JSON */ }
    throw new SignupError(message, field, code);
  }

  return response.json();
}

/**
 * Activa la cuenta con el token que llegó por mail.
 * Si el backend pudo armar la sesión, devuelve `token` y el usuario entra
 * directo sin volver a tipear la contraseña.
 */
export async function verificarEmail(token: string): Promise<VerificarEmailResponse> {
  if (!apiUrl) throw new VerificarError('API URL no configurada (NEXT_PUBLIC_API_URL)');

  const response = await fetch(`${apiUrl}/verify-email/${encodeURIComponent(token)}`);

  if (!response.ok) {
    let message = 'No pudimos verificar tu email.';
    let code: VerificarErrorCode = 'DESCONOCIDO';
    try {
      const data = await response.json();
      message = data?.error || message;
      if (data?.code === 'INVALID_TOKEN' || data?.code === 'TOKEN_EXPIRED') code = data.code;
    } catch { /* respuesta sin JSON */ }
    throw new VerificarError(message, code);
  }

  return response.json();
}

/**
 * Reenvía el link de activación.
 *
 * Nunca lanza ni informa si el email existe: el backend responde 200 en todos
 * los casos a propósito, para no convertir el endpoint en un enumerador de
 * cuentas. La UI muestra siempre el mismo mensaje.
 */
export async function reenviarVerificacion(email: string): Promise<void> {
  if (!apiUrl) throw new Error('API URL no configurada (NEXT_PUBLIC_API_URL)');

  await fetch(`${apiUrl}/verify-email/resend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  });
}
