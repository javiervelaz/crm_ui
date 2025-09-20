'use client'

import { deleteTipoProducto, getTipoProductoList } from '@/app/lib/tipoproducto.api';
import useAuthCheck from '@/app/lib/useAuthCheck';
import { lusitana } from '@/app/ui/fonts';
import { TableSkeleton } from '@/app/ui/TableSkeleton';
import { faEdit, faPlus, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Search from './searchTipoProducto';

interface TipoProducto {
  id: number;
  nombre: string;
}

export default function TipoProductoPage() {
  useAuthCheck();
  const [tipos, setTipos] = useState<TipoProducto[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchTipos();
  }, []);

  const fetchTipos = async () => {
    try {
      const data = await getTipoProductoList();
      setTipos(data);
    } catch (err) {
      console.error('Error cargando tipos de producto:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: number) => {
    router.push(`/dashboard/tipo-producto/${id}/edit`);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar este tipo de producto?')) {
      try {
        await deleteTipoProducto(id);
        setTipos(tipos.filter(tipo => tipo.id !== id));
      } catch (error) {
        console.error('Error eliminando tipo de producto:', error);
      }
    }
  };

  const filteredTipos = tipos.filter(tipo => 
    tipo.nombre.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="w-full p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className={`${lusitana.className} text-2xl`}>Tipos de Producto</h1>
        <button
          onClick={() => router.push('/dashboard/tipo-producto/create')}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Crear Tipo
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8 mb-6">
        <Search placeholder="Buscar tipo..." onSearch={setQuery} />
      </div>

      {loading ? (
        <TableSkeleton />
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTipos.map((tipo) => (
                <tr key={tipo.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {tipo.nombre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(tipo.id)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Editar"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      onClick={() => handleDelete(tipo.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Eliminar"
                    >
                      <FontAwesomeIcon icon={faTrashAlt} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}