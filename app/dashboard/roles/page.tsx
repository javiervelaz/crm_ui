'use client';

import { logError } from '@/app/lib/logger';
import { getClienteId } from '@/app/lib/authService';
import { notifyError, notifySuccess } from '@/app/lib/notificationService';
import { getRolList } from '@/app/lib/rol.api';
import { TableSkeleton } from '@/app/ui/TableSkeleton';
import { PlusCircle, Shield, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Rol {
  id: number;
  descripcion: string;
  cliente_id: number;
}

export default function RolesPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(true);
  const clienteId = Number(getClienteId());

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const data = await getRolList(clienteId);
      setRoles(data);
    } catch (error) {
      logError(error);
      notifyError('Error al obtener la lista de roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('¿Seguro que deseas eliminar este rol?')) return;

    try {
      //await deleteRol(id, clienteId);
      notifySuccess('Rol eliminado correctamente');
      fetchRoles();
    } catch (error) {
      logError(error);
      notifyError('No se pudo eliminar el rol');
    }
  };

  const handleEditPermisos = (id: number) => {
    router.push(`/dashboard/roles/${id}/permisos`);
  };

  return (
    <main className="p-4 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Gestión de Roles</h1>
        <button
          onClick={() => router.push('/dashboard/roles/create')}
          disabled
          className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-md hover:bg-brand-700 self-start sm:self-auto"
        >
          <PlusCircle size={18} />
          Nuevo Rol
        </button>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : roles.length === 0 ? (
        <div className="text-brand-300 text-center py-8 text-sm">
          No hay roles registrados para este cliente.
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {roles.map((rol, index) => (
              <div key={rol.id} className="rounded-xl border border-brand-100 bg-white p-4 shadow-card">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs text-brand-300">#{index + 1}</span>
                    <p className="text-sm font-semibold text-brand-800 mt-0.5">{rol.descripcion}</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-3 border-t border-brand-100 pt-3">
                  <button
                    onClick={() => handleEditPermisos(rol.id)}
                    className="flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-100"
                  >
                    <Shield size={14} />
                    Permisos
                  </button>
                  <button
                    onClick={() => handleDelete(rol.id)}
                    className="flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-100"
                  >
                    <Trash2 size={14} />
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto bg-white shadow rounded-lg">
            <table className="min-w-full text-sm text-brand-700">
              <thead className="bg-brand-50 text-brand-800">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">#</th>
                  <th className="px-4 py-3 text-left font-semibold">Descripción</th>
                  <th className="px-4 py-3 text-center font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((rol, index) => (
                  <tr key={rol.id} className="border-b border-brand-100 hover:bg-brand-50">
                    <td className="px-4 py-3">{index + 1}</td>
                    <td className="px-4 py-3">{rol.descripcion}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => handleEditPermisos(rol.id)}
                          className="text-brand-600 hover:text-brand-800 flex items-center gap-1"
                          title="Editar permisos del rol"
                        >
                          <Shield size={16} />
                          Permisos
                        </button>
                        <button
                          onClick={() => handleDelete(rol.id)}
                          className="text-red-500 hover:text-red-700 flex items-center gap-1"
                          title="Eliminar rol"
                        >
                          <Trash2 size={16} />
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}
