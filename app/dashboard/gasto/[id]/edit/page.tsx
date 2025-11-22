'use client'

import { getClienteId } from "@/app/lib/authService";
import { getCategoriaSalidaById, getGastosCategoriaTipo, updateCategoriaSalida } from '@/app/lib/gasto';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Interface para los tipos de categoría
interface CategoriaTipo {
  id: number;
  descripcion: string;
}

export default function FormTipoProducto() {
  const { id } = useParams();
  const router = useRouter();
  const [formData, setFormData] = useState({
    nombre: '',
    categoria_tipo_id: ''
  });
  const [categoriaTipos, setCategoriaTipos] = useState<CategoriaTipo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategoriaTipos();
    if (id) {
      fetchTipoSalida();
    }
  }, [id]);

  const fetchCategoriaTipos = async () => {
    try {
      const data = await getGastosCategoriaTipo(); // Necesitarás crear esta función
      setCategoriaTipos(data);
    } catch (error) {
      console.error('Error cargando tipos de categoría:', error);
    }
  };

  const fetchTipoSalida = async () => {
    try {
      const data = await getCategoriaSalidaById(Number(id),getClienteId());
      setFormData({ 
        nombre: data.nombre, 
        categoria_tipo_id: data.categoria_tipo_id.toString(),
        cliente_id: data.cliente_id,
      });
    } catch (error) {
      console.error('Error cargando tipo de salida:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (id) {
        console.log("update",formData);
        await updateCategoriaSalida(Number(id), {
          ...formData,
          categoria_tipo_id: parseInt(formData.categoria_tipo_id)
        });
      }
      router.push('/dashboard/tipo-salida');
    } catch (error) {
      console.error('Error guardando tipo de salida:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="w-full p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {id ? 'Editar' : 'Crear'} Tipo de Salida
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre 
          </label>
          <input
            type="text"
            name="nombre"
            required
            value={formData.nombre}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Categoría
          </label>
          <select
            name="categoria_tipo_id"
            required
            value={formData.categoria_tipo_id}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar tipo de categoría</option>
            {categoriaTipos.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.descripcion}
              </option>
            ))}
          </select>
        </div>
        <div className="flex space-x-4 pt-4">
          <button
            type="button"
            onClick={() => router.push('/dashboard/tipo-salida')}
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