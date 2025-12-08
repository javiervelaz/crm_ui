import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);

  // MercadoPago puede enviar distintos parámetros. Tomamos algunos claves:
  const collectionStatus = url.searchParams.get('collection_status'); // approved, pending, rejected, null
  const status = url.searchParams.get('status'); // authorized, etc.

  // Determinar el resultado final
  let finalStatus: 'success' | 'failed' = 'failed';

  if (
    collectionStatus === 'approved' ||
    status === 'authorized' ||
    status === 'approved'
  ) {
    finalStatus = 'success';
  }

  // Redirigir al plan con el estado
  return NextResponse.redirect(
    new URL(`/dashboard/plan?status=${finalStatus}`, req.url)
  );
}
