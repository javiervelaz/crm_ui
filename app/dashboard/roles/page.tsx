'use client';

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
      console.error(error);
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
      console.error(error);
      notifyError('No se pudo eliminar el rol');
    }
  };

  const handleEditPermisos = (id: number) => {
    router.push(`/dashboard/roles/${id}/permisos`);
  };

  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Gestión de Roles</h1>
        <button
          onClick={() => router.push('/dashboard/roles/create')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          <PlusCircle size={18} />
          Nuevo Rol
        </button>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : roles.length === 0 ? (
        <div className="text-gray-600 text-center py-8">
          No hay roles registrados para este cliente.
        </div>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-gray-100 text-gray-800">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">#</th>
                <th className="px-6 py-3 text-left font-semibold">Descripción</th>
                <th className="px-6 py-3 text-center font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((rol, index) => (
                <tr key={rol.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-3">{index + 1}</td>
                  <td className="px-6 py-3">{rol.descripcion}</td>
                  <td className="px-6 py-3 text-center">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => handleEditPermisos(rol.id)}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        title="Editar permisos del rol"
                      >
                        <Shield size={18} />
                        Permisos
                      </button>
                      <button
                        onClick={() => handleDelete(rol.id)}
                        className="text-red-500 hover:text-red-700 flex items-center gap-1"
                        title="Eliminar rol"
                      >
                        <Trash2 size={18} />
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
