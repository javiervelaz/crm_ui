'use client';

import { useRouter } from 'next/navigation';
import { useCart } from '../CartContext';

export default function CartPage() {
  const router = useRouter();
  const { items, total, updateQuantity, removeItem } = useCart();

  const deliveryCost = 1000; // demo
  const grandTotal = total + deliveryCost;

  return (
    <div className="flex w-full flex-col gap-4 pb-4">
      <button
        type="button"
        onClick={() => router.push('/catalogo')}
        className="text-xs font-medium text-brand-600 hover:text-brand-700"
      >
        ← Seguir comprando
      </button>

      <h1 className="text-lg font-bold text-brand-800">Mi pedido</h1>

      {items.length === 0 ? (
        <p className="text-sm text-brand-300">
          Todavía no agregaste productos al carrito.
        </p>
      ) : (
        <>
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="flex gap-3 rounded-2xl border border-brand-100 bg-white p-3 shadow-card"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {item.product.imageUrl && (
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="h-16 w-16 rounded-xl object-cover"
                  />
                )}
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <p className="text-sm font-semibold text-brand-800">
                      {item.product.name}
                    </p>
                    {item.notes && (
                      <p className="mt-1 text-[11px] text-brand-300">
                        Nota: {item.notes}
                      </p>
                    )}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-2 py-1">
                      <button
                        type="button"
                        className="h-6 w-6 rounded-full bg-white text-sm font-bold text-brand-700 shadow-sm"
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            Math.max(0, item.quantity - 1),
                          )
                        }
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-xs font-semibold text-brand-800">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        className="h-6 w-6 rounded-full bg-white text-sm font-bold text-brand-700 shadow-sm"
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-bold text-brand-800">
                        $
                        {(
                          item.quantity * item.product.price
                        ).toLocaleString('es-AR')}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeItem(item.product.id)}
                        className="text-[11px] text-brand-300 underline hover:text-red-500 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Totales */}
          <div className="mt-4 space-y-2 rounded-2xl border border-brand-100 bg-white p-4 text-sm text-brand-700 shadow-card">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${total.toLocaleString('es-AR')}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery (demo)</span>
              <span>${deliveryCost.toLocaleString('es-AR')}</span>
            </div>
            <div className="flex justify-between border-t border-brand-100 pt-2 text-base font-bold text-brand-800">
              <span>Total</span>
              <span>${grandTotal.toLocaleString('es-AR')}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push('/catalogo/checkout')}
            className="mt-3 w-full rounded-full bg-accent-500 px-4 py-3.5 text-sm font-semibold text-white shadow-accent hover:bg-accent-400 transition-colors"
          >
            Ir al checkout →
          </button>
        </>
      )}
    </div>
  );
}
