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
  token: string | null;
  expiresIn: string;
  paymentUrl?: string | null;
  paymentWarning?: string;
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