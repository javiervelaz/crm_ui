'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useCart } from './CartContext';

export default function CartBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { total, totalQuantity } = useCart();

  if (totalQuantity === 0) return null;
  if (pathname === '/catalogo/carrito' || pathname === '/catalogo/checkout') {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-brand-200 bg-white/95 shadow-[0_-4px_12px_rgba(75,45,103,0.12)]">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <button
          type="button"
          className="flex flex-1 items-center gap-3 text-left"
          onClick={() => router.push('/catalogo/carrito')}
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent-500 text-sm font-semibold text-white shadow-accent">
            🛒
          </span>
          <div className="flex flex-col">
            <span className="text-xs text-brand-300">
              {totalQuantity} producto{totalQuantity > 1 ? 's' : ''} en el carrito
            </span>
            <span className="text-sm font-bold text-brand-800">
              Total: ${total.toLocaleString('es-AR')}
            </span>
          </div>
        </button>
        <button
          type="button"
          onClick={() => router.push('/catalogo/carrito')}
          className="rounded-full bg-accent-500 px-5 py-2.5 text-sm font-semibold text-white shadow-accent hover:bg-accent-400 transition-colors"
        >
          Ver pedido
        </button>
      </div>
    </div>
  );
}
