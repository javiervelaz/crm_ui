'use client';

import type { ReactNode } from 'react';
import Image from 'next/image';
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-50">
        <div className="rounded-xl border border-brand-200 bg-white px-6 py-4 text-sm text-brand-700 shadow-card">
          Validando link de WhatsApp...
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-50 px-4">
        <div className="max-w-md rounded-xl border border-brand-200 bg-white p-6 text-center shadow-card">
          <h1 className="mb-2 text-lg font-semibold text-brand-800">
            Link no válido
          </h1>
          <p className="text-sm text-brand-300">
            El link que usaste ya no es válido o expiró.
            <br />
            Pedí un nuevo acceso por WhatsApp para seguir haciendo pedidos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-brand-50">
      <header className="sticky top-0 z-10 border-b border-brand-200 bg-white/90 backdrop-blur shadow-card">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Image
            src="/assets/Logos/COUNTER CRM/COUNTER CRM Logo horizontal violeta.png"
            alt="Counter CRM"
            width={120}
            height={30}
            className="object-contain"
            priority
          />
          <div className="rounded-full bg-brand-600 px-3 py-1 text-xs font-medium text-white">
            Pedidos online
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
