// app/lib/saas.api.ts
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export type PlanTier = 'FREE' | 'BASIC' | 'PREMIUM';

export interface SaaSRegisterFormValues {
  plan: PlanTier;
  comercioNombre: string;
  cuit: string;
  adminNombre: string;
  adminApellido: string;
  adminEmail: string;
  adminDni?: string;
  telefono?: string;
  password?: string; // la vamos a mandar para que luego el backend la use
}

export interface SaaSRegisterResponse {
  cliente: {
    id: number;
    nombre: string;
    cuit: string;
  };
  adminUser: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
  };
  // el resto de campos que ya devuelve tu createCliente los dejamos opcionales
  [key: string]: any;
}

export async function registerSaasCliente(
  values: SaaSRegisterFormValues
): Promise<SaaSRegisterResponse> {
  if (!apiUrl) {
    throw new Error('API URL no configurada (NEXT_PUBLIC_API_URL)');
  }

  const payload = {
    // lo que hoy entiende createCliente
    nombre: values.comercioNombre,
    cuit: values.cuit,
    adminNombre: values.adminNombre,
    adminApellido: values.adminApellido,
    adminEmail: values.adminEmail,
    adminDni: values.adminDni || null,
    // campos “de futuro” para cuando ajustes el backend
    plan: values.plan,
    telefono: values.telefono || null,
    adminPassword: values.password || null,
  };

  const response = await fetch(`${apiUrl}/cliente`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = 'No se pudo crear la cuenta.';

    try {
      const data = await response.json();
      if (data?.message) {
        message = data.message;
      }
    } catch {
      // ignore JSON error, usamos el mensaje genérico
    }

    throw new Error(message);
  }

  return response.json();
}
