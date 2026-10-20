'use client';

import { getClienteId } from '@/app/lib/authService';
import { createRol } from '@/app/lib/rol.api';
import { notifyError, notifySuccess } from '@/app/lib/notificationService';
import { logError } from '@/app/lib/logger';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

export default function CreateRolPage() {
  const router = useRouter();
  const clienteId = getClienteId();
  const [descripcion, setDescripcion] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descripcion.trim()) {
      setError('El nombre del rol es obligatorio');
      return;
    }
    setSaving(true);
    try {
      const nuevo = await createRol(descripcion.trim(), clienteId);
      notifySuccess('Rol creado correctamente');
      // Ir directo a asignarle módulos/permisos.
      if (nuevo?.id) {
        router.push(`/dashboard/roles/${nuevo.id}/permisos`);
      } else {
        router.push('/dashboard/roles');
      }
    } catch (err: any) {
      logError('No se pudo crear el rol', err);
      setError(err?.message || 'No se pudo crear el rol');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="p-4 md:p-6">
      <div className="max-w-lg mx-auto">
        <button
          onClick={() => router.push('/dashboard/roles')}
          className="flex items-center gap-1 text-brand-600 hover:text-brand-800 mb-4"
        >
          <ArrowLeft size={18} /> Volver a roles
        </button>
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Nuevo Rol</h1>
        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre del rol</label>
            <input
              type="text"
              value={descripcion}
              onChange={(e) => { setDescripcion(e.target.value); setError(''); }}
              placeholder="Ej: Cajero, Encargado"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push('/dashboard/roles')}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-brand-600 text-white px-4 py-2 rounded-md hover:bg-brand-700 disabled:opacity-60"
            >
              {saving ? 'Creando...' : 'Crear rol'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
