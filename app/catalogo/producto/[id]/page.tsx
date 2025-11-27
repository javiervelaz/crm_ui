'use client';
export const dynamic = 'force-dynamic';
export const revalidate = 0;



import { notFound, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCart } from '../../CartContext';
import type { CatalogProduct } from '../../types';
import { fetchProductById } from '../../catalogApi';

interface Props {
  params: { id: string };
}

export default function ProductDetailPage({ params }: Props) {
  const router = useRouter();
  const { addItem } = useCart();
  const [notes, setNotes] = useState('');
  const [product, setProduct] = useState<CatalogProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchProductById(params.id);
        if (!cancelled) {
          if (!data) {
            // Next maneja este notFound
            notFound();
          } else {
            setProduct(data);
          }
        }
      } catch (err: any) {
        console.error(err);
        if (!cancelled) {
          setError(err.message ?? 'Error al cargar producto');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex w-full flex-col gap-4 pb-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-xs font-medium text-slate-600"
        >
          ← Volver
        </button>
        <p className="text-sm text-slate-500">Cargando producto...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex w-full flex-col gap-4 pb-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-xs font-medium text-slate-600"
        >
          ← Volver
        </button>
        <p className="text-sm text-red-500">
          {error ?? 'No se encontró el producto'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4 pb-4">
      <button
        type="button"
        onClick={() => router.back()}
        className="text-xs font-medium text-slate-600"
      >
        ← Volver
      </button>

      {product.imageUrl && (
        <div className="relative overflow-hidden rounded-2xl border bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-56 w-full object-cover sm:h-64"
          />
        </div>
      )}

      <div className="space-y-2">
        <h1 className="text-xl font-bold text-slate-900">{product.name}</h1>
        <p className="text-lg font-semibold text-slate-900">
          ${product.price.toLocaleString('es-AR')}
        </p>
        {product.tags && product.tags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
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
        <p className="mt-2 text-sm text-slate-600">
          {product.description || 'Sin descripción'}
        </p>
      </div>

      <div className="mt-4 space-y-2">
        <label className="text-xs font-medium text-slate-600">
          Nota para la cocina (opcional)
        </label>
        <textarea
          className="min-h-[80px] w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-slate-900/10 focus:ring-2"
          placeholder="Ej: cortar en 8, sin sal, etc."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <button
        type="button"
        onClick={() => {
          addItem(product, 1, notes || undefined);
          router.push('/catalogo/carrito');
        }}
        className="mt-2 w-full rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
      >
        Agregar al carrito
      </button>
    </div>
  );
}
