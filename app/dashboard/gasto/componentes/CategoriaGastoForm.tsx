'use client';

import { getClienteId } from '@/app/lib/authService';
import {
  crearCategoriaSalida,
  getCategoriaSalidaById,
  getGastosCategoriaTipo,
  updateCategoriaSalida,
} from '@/app/lib/gasto';
import { logError } from '@/app/lib/logger';
import { notifyError, notifySuccess } from '@/app/lib/notificationService';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * Formulario ÚNICO de categoría de gasto: crea y edita.
 *
 * [3.3] Reemplaza cuatro archivos que eran el mismo formulario:
 *   tipo-salida/componentes/createTipoSalidaForm.tsx
 *   gasto/componentes/createTipoSalidaForm.tsx
 *   tipo-salida/[id]/edit/page.tsx
 *   gasto/[id]/edit/page.tsx
 *
 * Las dos páginas de ruta ahora solo pasan el id (o no lo pasan).
 */

interface CategoriaTipo {
  id: number;
  descripcion: string;
}

const LISTA = '/dashboard/gasto';

export default function CategoriaGastoForm({ id }: { id?: number }) {
  const router = useRouter();
  const esEdicion = typeof id === 'number' && !Number.isNaN(id);

  const [nombre, setNombre] = useState('');
  const [categoriaTipoId, setCategoriaTipoId] = useState('');
  const [tipos, setTipos] = useState<CategoriaTipo[]>([]);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setTipos((await getGastosCategoriaTipo()) ?? []);
      } catch (err) {
        logError('Error cargando tipos de categoría', err);
      }
    })();
  }, []);

  useEffect(() => {
    if (!esEdicion) return;
    (async () => {
      try {
        const data = await getCategoriaSalidaById(Number(id), getClienteId());
        setNombre(data.nombre ?? '');
        setCategoriaTipoId(String(data.categoria_tipo_id ?? ''));
      } catch (err) {
        logError('Error cargando la categoría de gasto', err);
        notifyError('No se pudo cargar la categoría');
      }
    })();
  }, [esEdicion, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enviando) return; // sin doble submit
    setEnviando(true);

    const payload = {
      nombre: nombre.trim(),
      categoria_tipo_id: parseInt(categoriaTipoId, 10),
      cliente_id: getClienteId(),
    };

    try {
      if (esEdicion) {
        await updateCategoriaSalida(Number(id), payload);
        notifySuccess('Categoría actualizada');
      } else {
        // [3.3] El create real: la versión anterior de [id]/edit tenía la rama
        // de creación muerta (nunca llegaba sin id) y el form de create no
        // sabía editar. Ahora es el mismo componente y las dos ramas se usan.
        await crearCategoriaSalida(payload);
        notifySuccess('Categoría creada');
      }
      router.push(LISTA);
    } catch (err) {
      logError('Error guardando la categoría de gasto', err);
      notifyError('No se pudo guardar la categoría');
    } finally {
      setEnviando(false);
    }
  };

  const campo =
    'h-11 w-full rounded-lg border border-brand-200 px-3 text-sm outline-none transition-colors focus:border-brand-600';

  return (
    <div className="mx-auto w-full max-w-md p-4 md:p-6">
      <h1 className="mb-6 font-display text-2xl text-brand-800">
        {esEdicion ? 'Editar' : 'Nueva'} categoría de gasto
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
            placeholder="Ej: Insumos, Servicios, Sueldos"
          />
        </div>

        <div>
          <label htmlFor="categoria_tipo_id" className="mb-1 block text-sm text-brand-700">
            Tipo de categoría *
          </label>
          <select
            id="categoria_tipo_id"
            required
            value={categoriaTipoId}
            onChange={(e) => setCategoriaTipoId(e.target.value)}
            className={campo}
          >
            <option value="">Seleccionar tipo</option>
            {tipos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.descripcion}
              </option>
            ))}
          </select>
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
