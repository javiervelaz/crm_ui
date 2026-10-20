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
    <div className="rounded-xl border border-brand-100 bg-white shadow-card overflow-hidden">
      {/* Filtro */}
      <div className="flex items-center gap-3 border-b border-brand-100 bg-brand-50 px-4 py-3">
        <select
          value={filterTipo}
          onChange={(e) => setFilterTipo(e.target.value)}
          className="flex-1 min-w-0 rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm text-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
        >
          <option value="all">Todos los tipos</option>
          {getUniqueTipos().map((tipo) => (
            <option key={tipo.id} value={tipo.id}>
              {tipo.nombre}
            </option>
          ))}
        </select>
        <span className="shrink-0 text-xs text-brand-300">
          {sortedAndFilteredProductos.length} de {productos.length}
        </span>
      </div>

      {/* ── MOBILE: cards ─────────────────────────────── */}
      <div className="md:hidden divide-y divide-brand-100">
        {sortedAndFilteredProductos.length === 0 ? (
          <p className="py-10 text-center text-sm text-brand-300">
            No se encontraron productos
          </p>
        ) : (
          sortedAndFilteredProductos.map((producto) => {
            const imageUrl = getImageUrl(producto);
            return (
              <div key={producto.id} className="flex gap-3 px-4 py-3 hover:bg-brand-50 transition-colors">
                {/* Thumbnail */}
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-brand-100 bg-brand-50 flex items-center justify-center">
                  {imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`https://res.cloudinary.com/droqhxpim/image/upload/v1/${imageUrl}?_a=BAMAMifm0`}
                      alt={producto.nombre}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-[9px] text-brand-300 text-center leading-tight px-1">Sin imagen</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-brand-800 truncate">
                    {producto.nombre}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold text-brand-600">
                      {producto.tipo_producto_nombre || `Tipo ${producto.tipo_producto_id}`}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      producto.permite_mitad
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {producto.permite_mitad ? 'Mitad ✓' : 'Mitad ✗'}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm font-bold text-brand-800">
                    ${Number(producto.precio_unitario).toLocaleString('es-AR')}
                  </p>
                </div>

                {/* Actions column */}
                <div className="flex flex-col justify-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onView(producto.id)}
                    className="h-8 w-8 flex items-center justify-center rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                    title="Ver detalle"
                  >
                    <FontAwesomeIcon icon={faEye} className="text-xs" />
                  </button>
                  <button
                    onClick={() => onEdit(producto.id)}
                    className="h-8 w-8 flex items-center justify-center rounded-full bg-brand-50 text-brand-600 hover:bg-brand-100 transition-colors"
                    title="Editar"
                  >
                    <FontAwesomeIcon icon={faEdit} className="text-xs" />
                  </button>
                  <button
                    onClick={() => onDelete(producto.id)}
                    className="h-8 w-8 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                    title="Eliminar"
                  >
                    <FontAwesomeIcon icon={faTrashAlt} className="text-xs" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── DESKTOP: table ────────────────────────────── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-[700px] w-full divide-y divide-brand-100">
          <thead className="bg-brand-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-brand-600 uppercase tracking-wider">
                Imagen
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-brand-600 uppercase tracking-wider cursor-pointer hover:text-brand-800"
                onClick={() => handleSort('nombre')}
              >
                <div className="flex items-center gap-1">
                  Producto <SortIcon field="nombre" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-brand-600 uppercase tracking-wider cursor-pointer hover:text-brand-800"
                onClick={() => handleSort('precio')}
              >
                <div className="flex items-center gap-1">
                  Precio <SortIcon field="precio" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-brand-600 uppercase tracking-wider cursor-pointer hover:text-brand-800"
                onClick={() => handleSort('tipo')}
              >
                <div className="flex items-center gap-1">
                  Tipo <SortIcon field="tipo" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-brand-600 uppercase tracking-wider cursor-pointer hover:text-brand-800"
                onClick={() => handleSort('permite_mitad')}
              >
                <div className="flex items-center gap-1">
                  Permite Mitad <SortIcon field="permite_mitad" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-brand-600 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-brand-100">
            {sortedAndFilteredProductos.map((producto) => {
              const imageUrl = getImageUrl(producto);
              return (
                <tr key={producto.id} className="hover:bg-brand-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="h-11 w-11 overflow-hidden rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center">
                      {imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`https://res.cloudinary.com/droqhxpim/image/upload/v1/${imageUrl}?_a=BAMAMifm0`}
                          alt={producto.nombre}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-[9px] text-brand-300">Sin img</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold text-brand-800">{producto.nombre}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-bold text-brand-800">
                      ${Number(producto.precio_unitario).toLocaleString('es-AR')}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-700">
                      {producto.tipo_producto_nombre || `Tipo ${producto.tipo_producto_id}`}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      producto.permite_mitad
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {producto.permite_mitad ? 'Sí' : 'No'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onView(producto.id)}
                        className="h-8 w-8 flex items-center justify-center rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                        title="Ver detalle"
                      >
                        <FontAwesomeIcon icon={faEye} className="text-xs" />
                      </button>
                      <button
                        onClick={() => onEdit(producto.id)}
                        className="h-8 w-8 flex items-center justify-center rounded-full bg-brand-50 text-brand-600 hover:bg-brand-100 transition-colors"
                        title="Editar"
                      >
                        <FontAwesomeIcon icon={faEdit} className="text-xs" />
                      </button>
                      <button
                        onClick={() => onDelete(producto.id)}
                        className="h-8 w-8 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                        title="Eliminar"
                      >
                        <FontAwesomeIcon icon={faTrashAlt} className="text-xs" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
