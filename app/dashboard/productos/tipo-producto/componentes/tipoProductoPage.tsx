'use client';

import { getClienteId } from '@/app/lib/authService';
import { deleteTipoProducto, getTipoProductoList } from '@/app/lib/tipoproducto.api';
import { logError } from '@/app/lib/logger';
import { notifyError, notifySuccess } from '@/app/lib/notificationService';
import { TableSkeleton } from '@/app/ui/TableSkeleton';
import ErrorState from '@/components/ui/ErrorState';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import SearchTipoProducto from './searchTipoProducto';
import TipoProductoTable from './TipoProductoTable';

/**
 * Tipos de producto — versión canónica (3.3).
 *
 * Cambios respecto de la copia que estaba viva en tipo-producto/componentes/:
 *   [3.3] Es la única. La otra se borra y su ruta queda como redirect.
 *   [2.2] Sin useAuthCheck() — el guard está en dashboard/layout.tsx.
 *   [4.1] ErrorState en vez de tragarse el error con un console.error.
 *   [4.3] TipoProductoTable migrada a ResponsiveTable.
 *   Eliminar recarga la lista en vez de filtrar el estado local.
 */

interface TipoProducto {
  id: number;
  nombre: string;
}

export default function TipoProductoPage() {
  const [tipos, setTipos] = useState<TipoProducto[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [error, setError] = useState(false);
  const router = useRouter();

  const fetchTipos = useCallback(async () => {
    try {
      setError(false);
      setLoading(true);
      const data = await getTipoProductoList(getClienteId());
      setTipos(data ?? []);
    } catch (err) {
      logError('Error al cargar tipos de producto', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTipos();
  }, [fetchTipos]);

  const handleEdit = (id: number) => {
    router.push(`/dashboard/productos/tipo-producto/${id}/edit`);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este tipo de producto?')) return;
    try {
      await deleteTipoProducto(id);
      notifySuccess('Tipo de producto eliminado');
      fetchTipos();
    } catch (err) {
      logError('Error al eliminar el tipo de producto', err);
      notifyError('No se pudo eliminar el tipo de producto');
    }
  };

  const filtrados = tipos.filter((t) => t.nombre.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="w-full p-4 md:p-6">
      <h1 className="mb-4 font-display text-2xl text-brand-800">Tipos de producto</h1>

      <div className="mb-6 mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between md:mt-8">
        <SearchTipoProducto placeholder="Buscar tipo de producto..." onSearch={setQuery} />
        <button
          type="button"
          onClick={() => router.push('/dashboard/productos/tipo-producto/create')}
          className="min-h-[44px] shrink-0 rounded-lg bg-brand-600 px-5 text-sm font-semibold text-white shadow-brand transition-colors hover:bg-brand-700"
        >
          Nuevo tipo
        </button>
      </div>

      {loading ? (
        <TableSkeleton rows={5} cols={1} withFilter={false} />
      ) : error ? (
        <ErrorState onRetry={fetchTipos} />
      ) : (
        <TipoProductoTable
          tipos={filtrados}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCrear={() => router.push('/dashboard/productos/tipo-producto/create')}
        />
      )}
    </div>
  );
}
