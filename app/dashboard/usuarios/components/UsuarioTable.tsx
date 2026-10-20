'use client'

import useAuthCheck from '@/app/lib/useAuthCheck';
import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  telefono: number;
  user_type_id: number;
  user_type_codigo?: string;
  user_type_descripcion?: string;
  cliente_id: BigInt;
}

interface UsuarioTableProps {
  usuarios: Usuario[];
  onDelete: (id: number, cliente_id: BigInt) => void;
  onEdit: (id: number) => void;
}

export default function UsuarioTable({ usuarios, onEdit, onDelete }: UsuarioTableProps) {
  useAuthCheck();

  if (usuarios.length === 0) {
    return (
      <div className="rounded-xl border border-brand-100 bg-white py-12 text-center shadow-card">
        <p className="text-sm text-brand-300">No se encontraron usuarios</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-brand-100 bg-white shadow-card overflow-hidden">

      {/* Mobile: cards */}
      <div className="md:hidden divide-y divide-brand-100">
        {usuarios.map((usuario) => (
          <div key={usuario.id} className="px-4 py-3 hover:bg-brand-50 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-brand-800 truncate">
                  {usuario.apellido}, {usuario.nombre}
                </p>
                <p className="text-xs text-brand-400 truncate mt-0.5">{usuario.email}</p>
                {usuario.telefono && (
                  <p className="text-xs text-brand-400 mt-0.5">{usuario.telefono}</p>
                )}
                <span className="mt-1.5 inline-block rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold text-brand-600">
                  {usuario.user_type_descripcion || `Tipo ${usuario.user_type_id}`}
                </span>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button
                  onClick={() => onEdit(usuario.id)}
                  className="h-8 w-8 flex items-center justify-center rounded-full bg-brand-50 text-brand-600 hover:bg-brand-100 transition-colors"
                  title="Editar"
                >
                  <FontAwesomeIcon icon={faEdit} className="text-xs" />
                </button>
                <button
                  onClick={() => onDelete(usuario.id, usuario.cliente_id)}
                  className="h-8 w-8 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                  title="Eliminar"
                >
                  <FontAwesomeIcon icon={faTrashAlt} className="text-xs" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-brand-100">
          <thead className="bg-brand-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-brand-600 uppercase tracking-wider">Apellido</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-brand-600 uppercase tracking-wider">Nombre</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-brand-600 uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-brand-600 uppercase tracking-wider">Teléfono</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-brand-600 uppercase tracking-wider">Tipo</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-brand-600 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-brand-100">
            {usuarios.map((usuario) => (
              <tr key={usuario.id} className="hover:bg-brand-50 transition-colors">
                <td className="px-4 py-3 text-sm font-semibold text-brand-800 whitespace-nowrap">
                  {usuario.apellido}
                </td>
                <td className="px-4 py-3 text-sm text-brand-800 whitespace-nowrap">
                  {usuario.nombre}
                </td>
                <td className="px-4 py-3 text-sm text-brand-700 whitespace-nowrap">
                  {usuario.email}
                </td>
                <td className="px-4 py-3 text-sm text-brand-700 whitespace-nowrap">
                  {usuario.telefono}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="rounded-full bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-700">
                    {usuario.user_type_descripcion || `Tipo ${usuario.user_type_id}`}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(usuario.id)}
                      className="h-8 w-8 flex items-center justify-center rounded-full bg-brand-50 text-brand-600 hover:bg-brand-100 transition-colors"
                      title="Editar"
                    >
                      <FontAwesomeIcon icon={faEdit} className="text-xs" />
                    </button>
                    <button
                      onClick={() => onDelete(usuario.id, usuario.cliente_id)}
                      className="h-8 w-8 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                      title="Eliminar"
                    >
                      <FontAwesomeIcon icon={faTrashAlt} className="text-xs" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
