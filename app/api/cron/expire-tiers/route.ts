// app/api/cron/expire-tiers/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  if (process.env.CRON_SECRET && process.env.NODE_ENV === 'production') {
    const auth = req.headers.get('Authorization');
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 });
    }
  }

  const result = await fetch(`${process.env.API_BASE_URL}/api/billing/expire-tiers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await result.json();
  return NextResponse.json({ success: true, downgraded: data.downgraded });
}
