import { describe, expect, it } from 'vitest';
import { estadoRetornoPago } from '@/app/lib/retornoPago';

const q = (s: string) => estadoRetornoPago(new URLSearchParams(s));

describe('estadoRetornoPago', () => {
  it('pago único aprobado (Checkout Pro)', () => {
    expect(q('collection_status=approved&payment_id=1')).toBe('success');
    expect(q('status=approved')).toBe('success');
  });

  it('suscripción autorizada', () => {
    expect(q('preapproval_id=abc&status=authorized')).toBe('success');
  });

  it('suscripción que vuelve solo con preapproval_id: se confirma por webhook, no es un fallo', () => {
    expect(q('preapproval_id=abc')).toBe('confirmando');
  });

  it('pendiente', () => {
    expect(q('collection_status=pending')).toBe('pending');
    expect(q('status=in_process')).toBe('pending');
  });

  it('rechazado, cancelado o sin datos', () => {
    expect(q('collection_status=rejected')).toBe('failure');
    expect(q('collection_status=null&preapproval_id=abc')).toBe('failure');
    expect(q('')).toBe('failure');
  });
});
