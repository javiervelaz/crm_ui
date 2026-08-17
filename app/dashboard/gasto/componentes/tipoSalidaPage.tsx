'use client';

import { getClienteId } from '@/app/lib/authService';
import { deleteCategoriaSalida, getGastoCategorias } from '@/app/lib/gasto';
import { logError } from '@/app/lib/logger';
import { notifyError, notifySuccess } from '@/app/lib/notificationService';
import { TableSkeleton } from '@/app/ui/TableSkeleton';
import ErrorState from '@/components/ui/ErrorState';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import SearchTipoSalida from './searchTipoSalida';
import TipoSalidaTable from './TipoSalidaTable';

/**
 * Categorías de gasto — versión canónica (3.3).
 *
 * Cambios respecto de la copia que estaba viva en tipo-salida/componentes/:
 *   [3.3] Es la única. La otra se borra y su ruta queda como redirect.
 *   [2.2] Sin useAuthCheck() — el guard está en dashboard/layout.tsx.
 *   [4.1] ErrorState en vez de un <div className="text-red-600"> pelado.
 *   [4.3] Renderiza la TipoSalidaTable migrada a ResponsiveTable (ya en el repo).
 *   Se borró el estado `productos` y su interface Producto: declarados y jamás usados.
 *   Se borró la verificación manual de token del useEffect: la hace el layout.
 */

interface TipoSalida {
  id: number;
  categoria_tipo_id: number;
  descripcion: string;
  nombre: string;
}

export default function TipoSalidaPage() {
  const [tipoSalida, setTipoSalida] = useState<TipoSalida[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [error, setError] = useState(false);
  const router = useRouter();

  const fetchTipoSalida = useCallback(async () => {
    try {
      setError(false);
      setLoading(true);
      const data = await getGastoCategorias(getClienteId());
      setTipoSalida(data ?? []);
    } catch (err) {
      logError('Error al cargar categorías de gasto', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTipoSalida();
  }, [fetchTipoSalida]);

  const handleEdit = (id: number) => {
    router.push(`/dashboard/gasto/${id}/edit`);
  };

  const handleDelete = async (id: number, cliente: bigint) => {
    if (!confirm('¿Eliminar esta categoría de gasto?')) return;
    try {
      await deleteCategoriaSalida(id, cliente);
      notifySuccess('Categoría de gasto eliminada');
      fetchTipoSalida();
    } catch (err) {
      logError('Error al eliminar categoría de gasto', err);
      notifyError('No se pudo eliminar la categoría');
    }
  };

  const filtradas = tipoSalida.filter((t) => {
    const q = query.toLowerCase();
    return (
      t.nombre.toLowerCase().includes(q) ||
      (t.descripcion ?? '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full p-4 md:p-6">
      <h1 className="mb-4 font-display text-2xl text-brand-800">Categorías de gasto</h1>

      <div className="mb-6 mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between md:mt-8">
        <SearchTipoSalida placeholder="Buscar categoría de gasto..." onSearch={setQuery} />
        <button
          type="button"
          onClick={() => router.push('/dashboard/gasto/create')}
          className="min-h-[44px] shrink-0 rounded-lg bg-brand-600 px-5 text-sm font-semibold text-white shadow-brand transition-colors hover:bg-brand-700"
        >
          Nueva categoría
        </button>
      </div>

      {loading ? (
        <TableSkeleton rows={5} cols={2} withFilter={false} />
      ) : error ? (
        <ErrorState onRetry={fetchTipoSalida} />
      ) : (
        <TipoSalidaTable
          tipoSalida={filtradas}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCrear={() => router.push('/dashboard/gasto/create')}
        />
      )}
    </div>
  );
}
