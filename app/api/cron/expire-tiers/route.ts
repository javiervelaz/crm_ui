// app/api/cron/expire-tiers/route.ts
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  // Seguridad opcional con CRON_SECRET
  if (process.env.NODE_ENV === 'production') {
    const auth = req.headers.get('Authorization');
    const expected = `Bearer ${process.env.CRON_SECRET}`;
    if (auth !== expected) {
      return new Response('Unauthorized', { status: 401 });
    }
  }

  try {
    const res = await fetch(`${process.env.API_BASE_URL}/api/billing/expire-tiers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();
    return NextResponse.json({ downgraded: data.downgraded || 0 });
  } catch (err) {
    console.error('[Cron] Error al degradar planes:', err);
    return new Response('Error al degradar planes', { status: 500 });
  }
}

