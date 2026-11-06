import { NextRequest, NextResponse } from 'next/server';
import { estadoRetornoPago } from '@/app/lib/retornoPago';

// Vuelta de MercadoPago (back_url de las suscripciones). Todo termina en
// /auth/pago, igual que el pago único: esa página sabe distinguir a quien ya
// tiene sesión (link a su plan) de quien recién se dio de alta y todavía no
// verificó el mail ("Falta un paso"). Antes iba a /dashboard/plan y un alta
// nueva caía en el login sin poder entrar.
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const estado = estadoRetornoPago(url.searchParams);
  return NextResponse.redirect(new URL(`/auth/pago?status=${estado}`, req.url));
}
