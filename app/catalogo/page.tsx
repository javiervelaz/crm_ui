'use client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;


import { useEffect, useMemo, useState } from 'react';
import type { CatalogProduct } from './types';
import { fetchCatalogProducts } from './catalogApi';
import ProductCard from './ProductCard';
import { useHandoffSession } from './HandoffSessionContext';

export default function CatalogPage() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
   const { session } = useHandoffSession();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('Todas');

  useEffect(() => {
    let cancelled = false;

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
  }, []);

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

  return (
    
    <div className="flex w-full flex-col gap-4">
      {/* Buscador + categorías */}
      <div className="space-y-3">
        <input
          type="text"
          value={search}
          placeholder="Buscar productos..."
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm outline-none ring-slate-900/10 placeholder:text-slate-400 focus:ring-2"
        />
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {categories.map((cat) => {
            const isActive = cat === category;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Estado loading / error */}
      {loading && (
        <p className="text-sm text-slate-500">
          Cargando productos...
        </p>
      )}

      {error && !loading && (
        <p className="text-sm text-red-500">
          {error}
        </p>
      )}

      {/* Listado */}
      {!loading && !error && (
        <div className="mt-2 flex flex-col gap-3 pb-4">
          {filtered.length === 0 ? (
            <p className="text-sm text-slate-500">
              No encontramos productos para esos filtros.
            </p>
          ) : (
            filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
