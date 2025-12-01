'use client';

import type { ReactNode } from 'react';
import { HandoffSessionProvider, useHandoffSession } from './HandoffSessionContext';
import { CartProvider } from './CartContext';
import CartBar from './CartBar';

export default function CatalogoProviders({ children }: { children: ReactNode }) {
  return (
    <HandoffSessionProvider>
      <CartProvider>
        <CatalogGuard>{children}</CatalogGuard>
      </CartProvider>
    </HandoffSessionProvider>
  );
}

function CatalogGuard({ children }: { children: ReactNode }) {
  const { session, loading } = useHandoffSession();

  // 1) Mientras valida el token → pantalla de carga
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-xl border bg-white px-6 py-4 text-sm text-slate-700 shadow">
          Validando link de WhatsApp...
        </div>
      </div>
    );
  }

  // 2) Token inválido / expirado / inexistente → NO renderizar catálogo
  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-xl border bg-white p-6 text-center shadow">
          <h1 className="mb-2 text-lg font-semibold text-slate-900">
            Link no válido
          </h1>
          <p className="text-sm text-slate-600">
            El link que usaste ya no es válido o expiró.
            <br />
            Pedí un nuevo acceso por WhatsApp para seguir haciendo pedidos.
          </p>
        </div>
      </div>
    );
  }

  // 3) Layout normal cuando la sesión es válida
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Catálogo
            </p>
            <h1 className="text-lg font-bold text-slate-900">App pedidos</h1>
          </div>
          <div className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
            CRM beta
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 px-4 pb-24 pt-4">
        {children}
      </main>

      <CartBar />
    </div>
  );
}
