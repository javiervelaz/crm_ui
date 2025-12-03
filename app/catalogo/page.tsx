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

  // 🔹 Cuando tengamos session del handoff, la persistimos para catalogConfig
  useEffect(() => {
    if (!session) return;

    // Si tu session ya trae estos campos, los usamos tal cual.
    // Si trae más cosas, no pasa nada: los extra se ignoran donde no se usen.
    setMicrositeSession({
      cliente_id: session.clienteId,
      // por si querés guardar algo más:
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

      {loading && (
        <p className="text-sm text-slate-500">Cargando productos...</p>
      )}

      {error && !loading && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {!loading && !error && (
        <div className="mt-2 flex flex-col gap-3 pb-4">
          {filtered.length === 0 ? (
            <p className="text-sm text-slate-500">
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
