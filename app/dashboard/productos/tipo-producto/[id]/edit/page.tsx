'use client'

import { createTipoProducto, getTipoProductoById, updateTipoProducto } from '@/app/lib/tipoproducto.api';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function FormTipoProducto() {
  const { id } = useParams();
  const router = useRouter();
  const [formData, setFormData] = useState({
    nombre: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTipoProducto();
    }
  }, [id]);

  const fetchTipoProducto = async () => {
    try {
      const data = await getTipoProductoById(Number(id));
      setFormData({ nombre: data.nombre });
    } catch (error) {
      console.error('Error cargando tipo de producto:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (id) {
        await updateTipoProducto(Number(id), formData);
      } else {
        await createTipoProducto(formData);
      }
      router.push('/dashboard/productos/tipo-producto');
    } catch (error) {
      console.error('Error guardando tipo de producto:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {id ? 'Editar' : 'Crear'} Tipo de Producto
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del Tipo
          </label>
          <input
            type="text"
            required
            value={formData.nombre}
            onChange={(e) => setFormData({ nombre: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: Pizza, Bebida, Postre"
          />
        </div>

        <div className="flex space-x-4 pt-4">
          <button
            type="button"
            onClick={() => router.push('/dashboard/productos/tipo-producto')}
            className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : id ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </form>
    </div>
  );
}