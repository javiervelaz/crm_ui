// app/lib/billing.api.ts
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export async function createBillingCheckout(tierCode: 'BASIC' | 'PREMIUM') {
  if (!apiUrl) throw new Error('API URL no configurada');

  const token = localStorage.getItem('token');
  if (!token) throw new Error('No hay sesión activa');

  const res = await fetch(`${apiUrl}/billing/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ tierCode }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || 'Error iniciando checkout');
  }

  return res.json() as Promise<{ initPoint: string; preapprovalId: string }>;
}

export async function simulateBillingMock(preapprovalId: string) {
  if (!apiUrl) throw new Error('API URL no configurada');

  const res = await fetch(`${apiUrl}/billing/mock`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ preapprovalId }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || 'Error simulando webhook de pago');
  }

  return res.json();
}
