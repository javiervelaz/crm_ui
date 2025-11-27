'use client';

import { useRouter } from 'next/navigation';
import type { CatalogProduct } from './types';
import { useCart } from './CartContext';

interface Props {
  product: CatalogProduct;
}

export default function ProductCard({ product }: Props) {
  const router = useRouter();
  const { addItem } = useCart();

  return (
    <article className="flex overflow-hidden rounded-2xl border bg-white shadow-sm">
      {product.imageUrl && (
        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden sm:h-28 sm:w-28">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col justify-between p-3 sm:p-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            {product.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs text-slate-500">
            {product.description}
          </p>
          {product.tags && product.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-900">
            ${product.price.toLocaleString('es-AR')}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push(`/catalogo/producto/${product.id}`)}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700"
            >
              Ver detalle
            </button>
            <button
              type="button"
              onClick={() => addItem(product, 1)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
