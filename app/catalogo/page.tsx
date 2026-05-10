'use client';

import { useEffect, useMemo, useState } from 'react';
import type { CatalogProduct } from './types';
import { fetchCatalogProducts } from './catalogApi';
import ProductCard from './ProductCard';
import { useHandoffSession } from './HandoffSessionContext';
import { setMicrositeSession } from './catalogConfig';

export default function CatalogPage() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { session } = useHandoffSession();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('Todas');

  useEffect(() => {
    if (!session) return;
    setMicrositeSession({
      cliente_id: session.clienteId,
      ...session,
    });
  }, [session]);

  useEffect(() => {
    let cancelled = false;

    if (!session) {
      setLoading(false);
      return;
    }

    async function loadProducts() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchCatalogProducts(session);
        if (!cancelled) {
          setProducts(data);
        }
      } catch (err: any) {
        console.error(err);
        if (!cancelled) {
          setError(err.message ?? 'Error al cargar productos');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [session]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(p.category));
    return ['Todas', ...Array.from(set)];
  }, [products]);

  const filtered = useMemo(
    () =>
      products.filter((p) => {
        const matchesCategory =
          category === 'Todas' || p.category === category;
        const term = search.trim().toLowerCase();
        const matchesSearch =
          term.length === 0 ||
          p.name.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term);
        return matchesCategory && matchesSearch;
      }),
    [category, search, products],
  );

  if (!session && !loading && !error) {
    return (
      <main className="p-4">
        <p className="text-sm text-red-500">
          El enlace no es válido o la sesión expiró. Volvé a pedir el link desde WhatsApp.
        </p>
      </main>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="space-y-3">
        <input
          type="text"
          value={search}
          placeholder="Buscar productos..."
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-full border border-brand-200 bg-white px-4 py-2.5 text-sm outline-none placeholder:text-brand-300 focus:ring-2 focus:ring-brand-600/20"
        />
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => {
            const isActive = cat === category;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-brand'
                    : 'bg-brand-100 text-brand-700 hover:bg-brand-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {loading && (
        <p className="text-sm text-brand-300">Cargando productos...</p>
      )}

      {error && !loading && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {!loading && !error && (
        <div className="mt-2 flex flex-col gap-3 pb-4">
          {filtered.length === 0 ? (
            <p className="text-sm text-brand-300">
              No encontramos productos para esos filtros.
            </p>
          ) : (
            filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                session={session}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
