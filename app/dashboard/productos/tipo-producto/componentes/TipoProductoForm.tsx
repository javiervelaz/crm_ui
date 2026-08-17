'use client';

import { getClienteId } from '@/app/lib/authService';
import {
  createTipoProducto,
  getTipoProductoById,
  updateTipoProducto,
} from '@/app/lib/tipoproducto.api';
import { logError } from '@/app/lib/logger';
import { notifyError, notifySuccess } from '@/app/lib/notificationService';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * Formulario ÚNICO de tipo de producto: crea y edita.
 *
 * [3.3] Reemplaza cuatro archivos que eran el mismo formulario:
 *   tipo-producto/create/page.tsx
 *   tipo-producto/[id]/edit/page.tsx
 *   productos/tipo-producto/create/page.tsx
 *   productos/tipo-producto/[id]/edit/page.tsx
 *
 * Las dos páginas de ruta ahora solo pasan el id (o no lo pasan).
 */

const LISTA = '/dashboard/productos/tipo-producto';

export default function TipoProductoForm({ id }: { id?: number }) {
  const router = useRouter();
  const esEdicion = typeof id === 'number' && !Number.isNaN(id);

  const [nombre, setNombre] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!esEdicion) return;
    (async () => {
      try {
        const data = await getTipoProductoById(Number(id));
        setNombre(data.nombre ?? '');
      } catch (err) {
        logError('Error cargando el tipo de producto', err);
        notifyError('No se pudo cargar el tipo de producto');
      }
    })();
  }, [esEdicion, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enviando) return; // sin doble submit
    setEnviando(true);

    // [multi-tenant] cliente_id va en el payload por explicitud y paridad con
    // CategoriaGastoForm — el middleware scopeTenant del backend lo pisa con el
    // del JWT de todas formas, así que esto no es lo que hace falta enviar sí o sí.
    const payload = { nombre: nombre.trim(), cliente_id: getClienteId() };

    try {
      if (esEdicion) {
        await updateTipoProducto(Number(id), payload);
        notifySuccess('Tipo de producto actualizado');
      } else {
        await createTipoProducto(payload);
        notifySuccess('Tipo de producto creado');
      }
      router.push(LISTA);
    } catch (err) {
      logError('Error guardando el tipo de producto', err);
      notifyError('No se pudo guardar el tipo de producto');
    } finally {
      setEnviando(false);
    }
  };

  const campo =
    'h-11 w-full rounded-lg border border-brand-200 px-3 text-sm outline-none transition-colors focus:border-brand-600';

  return (
    <div className="mx-auto w-full max-w-md p-4 md:p-6">
      <h1 className="mb-6 font-display text-2xl text-brand-800">
        {esEdicion ? 'Editar' : 'Nuevo'} tipo de producto
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nombre" className="mb-1 block text-sm text-brand-700">
            Nombre *
          </label>
          <input
            id="nombre"
            type="text"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className={campo}
            placeholder="Ej: Pizza, Bebida, Postre"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => router.push(LISTA)}
            className="min-h-[44px] flex-1 rounded-lg border border-brand-200 bg-white text-sm font-medium text-brand-600 transition-colors hover:bg-brand-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={enviando}
            className="min-h-[44px] flex-1 rounded-lg bg-brand-600 text-sm font-semibold text-white shadow-brand transition-colors hover:bg-brand-700 disabled:opacity-50"
          >
            {enviando ? 'Guardando...' : esEdicion ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </form>
    </div>
  );
}
