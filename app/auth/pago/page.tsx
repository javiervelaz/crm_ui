// app/auth/pago/page.tsx
'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function PagoResultado() {
  const status = useSearchParams().get('status');
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

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 text-center">
      <h1 className="text-2xl font-bold text-slate-900">{copy.title}</h1>
      <p className="mt-3 text-slate-600">{copy.body}</p>
      <Link
        href={loggedIn ? '/dashboard' : '/'}
        className="mt-8 rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white"
      >
        {loggedIn ? 'Ir a mi panel' : 'Iniciar sesión'}
      </Link>
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