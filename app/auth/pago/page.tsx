// app/auth/pago/page.tsx
'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import VerificacionPendiente from '@/components/ui/VerificacionPendiente';

function PagoResultado() {
  const params = useSearchParams();
  const status = params.get('status');
  // A propósito NO pasamos el email en la URL de retorno de MercadoPago:
  // quedaría en el historial del navegador, en los logs de MP y en cualquier
  // Referer. El panel lo pide en un input, que cuesta cinco segundos.
  const loggedIn = typeof window !== 'undefined' && !!localStorage.getItem('token');

  const copy = {
    success: {
      title: 'Pago confirmado',
      body: 'Estamos activando tu plan. Puede tardar un par de minutos en reflejarse.',
    },
    pending: {
      title: 'Pago pendiente',
      body: 'MercadoPago todavía está procesando. Te avisamos por mail cuando se acredite.',
    },
    failure: {
      title: 'No se pudo procesar el pago',
      body: 'Tu cuenta está creada. Podés reintentar el pago desde tu panel cuando quieras.',
    },
  }[status ?? 'failure'] ?? { title: 'Estado desconocido', body: 'Revisá tu panel.' };

  // Si no hay sesión, la cuenta todavía no fue verificada: pagó pero no puede
  // entrar. Es el caso que más soporte genera con el gate duro, así que la
  // activación va arriba de todo y el resultado del pago abajo — no al revés.
  const faltaVerificar = !loggedIn;

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-6 px-6 py-12">
      {faltaVerificar && (
        <VerificacionPendiente
          email=""
          titulo="Falta un paso: activá tu cuenta"
          descripcion={
            status === 'success'
              ? 'El pago salió bien, pero todavía no confirmaste tu email. Poné tu dirección y te reenviamos el enlace de activación'
              : 'Todavía no confirmaste tu email. Poné tu dirección y te reenviamos el enlace de activación'
          }
        />
      )}

      <div className="text-center">
        <h1 className="text-2xl font-bold text-brand-900">{copy.title}</h1>
        <p className="mt-3 text-brand-300">{copy.body}</p>

        {!faltaVerificar && (
          <Link
            href="/dashboard"
            className="mt-8 inline-block rounded-full bg-brand-600 px-6 py-3 font-semibold text-white transition hover:bg-brand-700"
          >
            Ir a mi panel
          </Link>
        )}
      </div>
    </main>
  );
}

export default function PagoResultadoPage() {
  return (
    <Suspense fallback={null}>
      <PagoResultado />
    </Suspense>
  );
}
