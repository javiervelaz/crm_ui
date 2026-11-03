'use client';

import EmptyState from '@/components/ui/EmptyState';
import { resumenReceta } from '@/app/lib/inventario';
import {
  getProductosConReceta,
  mensajeError,
  ProductoConReceta,
  StockItem,
} from '@/app/lib/inventario.api';
import { ChefHat, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import RecetaDialog from './RecetaDialog';

/** Productos del catálogo y qué descuenta cada uno al venderse. */
export default function RecetasLista({
  items,
  puedeRecetas,
  puedeEditar = true,
  onCambio,
}: {
  items: StockItem[];
  puedeRecetas: boolean;
  /** inventario.update: sin él la lista se ve pero no se edita. */
  puedeEditar?: boolean;
  onCambio: () => void;
}) {
  const [productos, setProductos] = useState<ProductoConReceta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editando, setEditando] = useState<ProductoConReceta | null>(null);

  const cargar = useCallback(async () => {
    try {
      setError(null);
      setProductos(await getProductosConReceta());
    } catch (err) {
      setError(mensajeError(err, 'No se pudieron cargar las recetas.'));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  if (cargando) return <p className="text-sm text-brand-300">Cargando…</p>;
  if (error)
    return (
      <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>
    );
  if (!productos.length) {
    return (
      <EmptyState
        icono={ChefHat}
        titulo="No hay productos cargados"
        mensaje="Las recetas se arman sobre los productos que vendés. Cargalos primero en Productos."
      />
    );
  }

  const conReceta = productos.filter((p) => p.receta.length).length;

  return (
    <>
      <p className="mb-3 text-sm text-brand-300">
        {conReceta} de {productos.length} productos descuentan stock al
        venderse.{' '}
        {!puedeEditar
          ? 'Las recetas las arma quien administra el inventario.'
          : !puedeRecetas &&
            'En tu plan podés vincular productos que vendés tal cual.'}
      </p>
      <ul className="divide-y divide-brand-50 rounded-xl border border-brand-100 bg-white shadow-card">
        {productos.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => puedeEditar && setEditando(p)}
              disabled={!puedeEditar}
              className="flex min-h-[60px] w-full items-center gap-3 px-4 py-3 text-left hover:bg-brand-50 disabled:cursor-default disabled:hover:bg-transparent"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-brand-800">
                  {p.nombre}
                </span>
                <span
                  className={`block truncate text-xs ${p.receta.length ? 'text-brand-600' : 'text-brand-300'}`}
                >
                  {p.receta.length
                    ? resumenReceta(p.receta)
                    : 'Sin receta: no descuenta stock'}
                </span>
              </span>
              {puedeEditar && (
                <ChevronRight size={18} className="shrink-0 text-brand-300" />
              )}
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-center text-xs text-brand-300">
        ¿Falta un producto?{' '}
        <Link href="/dashboard/productos" className="underline">
          Cargalo en Productos
        </Link>
        .
      </p>

      {editando && (
        <RecetaDialog
          producto={editando}
          items={items}
          puedeRecetas={puedeRecetas}
          onClose={() => setEditando(null)}
          onGuardado={() => {
            setEditando(null);
            cargar();
            onCambio();
          }}
        />
      )}
    </>
  );
}
