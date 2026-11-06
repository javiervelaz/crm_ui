// app/lib/retornoPago.ts
// Traduce los parámetros con los que MercadoPago vuelve a Counter a un estado
// para /auth/pago. Lógica pura (testeada en tests/retornoPago.test.ts).
//
// - Pago único (Checkout Pro): MP agrega collection_status / status.
// - Suscripción (preapproval): MP puede volver solo con ?preapproval_id=…, sin
//   estado. No sabemos el resultado todavía: lo confirma el webhook, así que es
//   'confirmando' y no 'failure' (antes se mostraba "El pago no se completó").

export type EstadoRetorno = 'success' | 'pending' | 'confirmando' | 'failure';

export function estadoRetornoPago(params: URLSearchParams): EstadoRetorno {
  const s = (params.get('collection_status') || params.get('status') || '').toLowerCase();

  if (s === 'approved' || s === 'authorized') return 'success';
  if (s === 'pending' || s === 'in_process') return 'pending';
  if (s === 'rejected' || s === 'cancelled' || s === 'failure' || s === 'null') return 'failure';
  if (params.get('preapproval_id')) return 'confirmando';
  return 'failure';
}
