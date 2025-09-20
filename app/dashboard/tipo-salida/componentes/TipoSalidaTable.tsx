'use client'

import {
  faEdit,
  faSort,
  faSortDown,
  faSortUp,
  faTrashAlt
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';

interface TipoSalida {
  id: number;
  categoria_tipo_id: number;
  descripcion: string;
  nombre: string;
}

interface ProductosTableProps {
  tipoSalida: TipoSalida[];
  onDelete: (id: number) => void;
  onEdit: (id: number) => void;
  //onView: (id: number) => void;
}

type SortField = 'nombre' | 'precio' | 'tipo' | 'permite_mitad';
type SortDirection = 'asc' | 'desc';

export default function TipoSalidaTable({ tipoSalida, onDelete, onEdit }: ProductosTableProps) {
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

  const sortedAndFilteredProductos = tipoSalida
    .filter(tipoSalida => 
      filterTipo === 'all' || tipoSalida.descripcion.toString() === filterTipo
    )
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'nombre':
          aValue = a.nombre;
          bValue = b.nombre;
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
    const tipos = new Set(tipoSalida.map(p => p.descripcion));
    console.log(tipos);
    return Array.from(tipos).map(id => ({
      id,
      nombre: tipoSalida.find(p => p.descripcion === id)?.descripcion || `Tipo ${id}`
    }));
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <FontAwesomeIcon icon={faSort} className="ml-1 opacity-50" />;
    return (
      <FontAwesomeIcon 
        icon={sortDirection === 'asc' ? faSortUp : faSortDown} 
        className="ml-1" 
      />
    );
  };

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
            {getUniqueTipos().map(tipo => (
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
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('nombre')}
              >
                <div className="flex items-center">
                  Nombre
                  <SortIcon field="nombre" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                
              >
                <div className="flex items-center">
                  Tipo de salida
                </div>
              </th>
             
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedAndFilteredProductos.map((tipoSalida) => (
              <tr key={tipoSalida.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{tipoSalida.nombre}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-mono">
                    {tipoSalida.descripcion}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  
                  <button
                    onClick={() => onEdit(tipoSalida.id)}
                    className="text-blue-600 hover:text-blue-900"
                    title="Editar"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    onClick={() => onDelete(tipoSalida.id)}
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

      {/* Paginación (implementar según necesidad) */}
      <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Mostrando <span className="font-medium">{sortedAndFilteredProductos.length}</span> de{' '}
            <span className="font-medium">{tipoSalida.length}</span> tipos de gastos
          </div>
          {/* Aquí iría la paginación */}
        </div>
      </div>
    </div>
  );
}