'use client';

import {
  faEdit,
  faEye,
  faSort,
  faSortDown,
  faSortUp,
  faTrashAlt,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';

interface Producto {
  id: number;
  nombre: string;
  precio_unitario: number;
  tipo_producto_id: number;
  tipo_producto_nombre?: string;
  permite_mitad: boolean;
  // nuevos campos posibles para imagen
  imagen_url?: string;
  image_url?: string;
  imageUrl?: string;
}

interface ProductosTableProps {
  productos: Producto[];
  onDelete: (id: number) => void;
  onEdit: (id: number) => void;
  onView: (id: number) => void;
}

type SortField = 'nombre' | 'precio' | 'tipo' | 'permite_mitad';
type SortDirection = 'asc' | 'desc';

export default function ProductosTable({
  productos,
  onDelete,
  onEdit,
  onView,
}: ProductosTableProps) {
  const [sortField, setSortField] = useState<SortField>('nombre');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filterTipo, setFilterTipo] = useState<string>('all');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedAndFilteredProductos = productos
    .filter(
      (producto) =>
        filterTipo === 'all' ||
        producto.tipo_producto_id.toString() === filterTipo,
    )
    .sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortField) {
        case 'precio':
          aValue = Number(a.precio_unitario);
          bValue = Number(b.precio_unitario);
          break;
        case 'tipo':
          aValue = a.tipo_producto_nombre || '';
          bValue = b.tipo_producto_nombre || '';
          break;
        case 'permite_mitad':
          aValue = a.permite_mitad;
          bValue = b.permite_mitad;
          break;
        default:
          aValue = a.nombre.toLowerCase();
          bValue = b.nombre.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const getUniqueTipos = () => {
    const tipos = new Set(productos.map((p) => p.tipo_producto_id));
    return Array.from(tipos).map((id) => ({
      id,
      nombre:
        productos.find((p) => p.tipo_producto_id === id)
          ?.tipo_producto_nombre || `Tipo ${id}`,
    }));
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field)
      return (
        <FontAwesomeIcon
          icon={faSort}
          className="ml-1 opacity-50"
        />
      );
    return (
      <FontAwesomeIcon
        icon={sortDirection === 'asc' ? faSortUp : faSortDown}
        className="ml-1"
      />
    );
  };

  const getImageUrl = (p: Producto): string | undefined =>
    p.imagen_url || p.image_url || p.imageUrl || undefined;

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Filtros */}
      <div className="p-4 bg-gray-50 border-b">
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="all">Todos los tipos</option>
            {getUniqueTipos().map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {/* Nueva columna: Imagen */}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Imagen
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('nombre')}
              >
                <div className="flex items-center">
                  Producto
                  <SortIcon field="nombre" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('precio')}
              >
                <div className="flex items-center">
                  Precio
                  <SortIcon field="precio" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('tipo')}
              >
                <div className="flex items-center">
                  Tipo
                  <SortIcon field="tipo" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('permite_mitad')}
              >
                <div className="flex items-center">
                  Permite Mitad
                  <SortIcon field="permite_mitad" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedAndFilteredProductos.map((producto) => {
              const imageUrl = getImageUrl(producto);

              return (
                <tr key={producto.id} className="hover:bg-gray-50">
                  {/* Celda de imagen */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="h-12 w-12 overflow-hidden rounded-md bg-gray-100 flex items-center justify-center">
                      {imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={'https://res.cloudinary.com/droqhxpim/image/upload/v1/'+imageUrl+'?_a=BAMAMifm0'}
                          alt={producto.nombre}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-[10px] text-gray-400">
                          Sin imagen
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {producto.nombre}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-mono">
                      $
                      {Number(
                        producto.precio_unitario,
                      ).toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {producto.tipo_producto_nombre ||
                        `Tipo ${producto.tipo_producto_id}`}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        producto.permite_mitad
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {producto.permite_mitad ? 'Sí' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => onView(producto.id)}
                      className="text-green-600 hover:text-green-900"
                      title="Ver detalle"
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    <button
                      onClick={() => onEdit(producto.id)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Editar"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      onClick={() => onDelete(producto.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Eliminar"
                    >
                      <FontAwesomeIcon icon={faTrashAlt} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Paginación (implementar según necesidad) */}
      <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Mostrando{' '}
            <span className="font-medium">
              {sortedAndFilteredProductos.length}
            </span>{' '}
            de{' '}
            <span className="font-medium">
              {productos.length}
            </span>{' '}
            productos
          </div>
          {/* Aquí iría la paginación */}
        </div>
      </div>
    </div>
  );
}
