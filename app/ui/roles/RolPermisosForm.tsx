'use client';

import { getClienteId } from '@/app/lib/authService';
import { notifyError, notifySuccess } from '@/app/lib/notificationService';
import { getModulosByCliente, getPermisosByModuloId, getRolModulosPermisos, saveRolModulosPermisos } from '@/app/lib/permisos.api';
import { useEffect, useState } from 'react';

interface Permiso {
  id: number;
  codigo: string;
  descripcion: string;
  selected?: boolean;
}

interface Modulo {
  id: number;
  codigo: string;
  descripcion: string;
  permisos?: Permiso[];
  selected?: boolean;
  expanded?: boolean;
}

export default function RolPermisosForm({ rolId }: { rolId: number }) {
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const clienteId = Number(getClienteId());

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);

        // 1) Todos los módulos del cliente
        const allModules: Modulo[] = await getModulosByCliente(clienteId);

        // 2) Permisos ya asignados al rol
        const rolData = await getRolModulosPermisos(Number(rolId));
        // rolData: [{ modulo_id, modulo_descripcion, modulo_codigo, permisos: [{id, descripcion, codigo}] }]
        console.log("rol existente", rolData);
        // Para cada módulo obtenemos sus permisos y marcamos los seleccionados
        const modulesWithPerms: Modulo[] = await Promise.all(
          allModules.map(async (m) => {
            const permisos = await getPermisosByModuloId(clienteId, m.id);
            // buscar si el rol ya tiene este modulo
            const rolModulo = rolData.find((rm: any) => rm.modulo_id === m.id);
            const selected = !!rolModulo;
            const permisosMapped: Permiso[] = permisos.map((p: any) => ({
              id: p.id,
              codigo: p.codigo,
              descripcion: p.descripcion,
              selected: rolModulo ? rolModulo.permisos.some((rp: any) => rp.id === p.id) : false
            }));

            return {
              id: m.id,
              codigo: m.codigo,
              descripcion: m.descripcion,
              permisos: permisosMapped,
              selected,
              expanded: selected
            };
          })
        );

        // ⛔️ Si el rol NO es admin, ocultar el módulo "plan"
        const isAdminRole = rolData?.some((rm: any) => rm.modulo_codigo === 'plan');
        if (!isAdminRole) {
          setModulos(modulesWithPerms.filter((m) => m.codigo !== 'plan'));
        } else {
          setModulos(modulesWithPerms);
        }

      } catch (error) {
        console.error('Error cargando datos de roles/modulos/permiso:', error);
        notifyError('Error al cargar datos de permisos del rol.');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [rolId, clienteId]);

  const toggleModuloSelect = (moduloId: number) => {
    setModulos((prev) =>
      prev.map((m) =>
        m.id === moduloId
          ? {
              ...m,
              selected: !m.selected,
              expanded: !m.selected ? true : false,
              permisos: m.permisos?.map((p) => ({ ...p, selected: !m.selected ? true : false }))
            }
          : m
      )
    );
  };

  const togglePermiso = (moduloId: number, permisoId: number) => {
    setModulos((prev) =>
      prev.map((m) =>
        m.id === moduloId
          ? { ...m, permisos: m.permisos?.map((p) => (p.id === permisoId ? { ...p, selected: !p.selected } : p)) }
          : m
      )
    );
  };

  const toggleExpand = (moduloId: number) => {
    setModulos((prev) => prev.map((m) => (m.id === moduloId ? { ...m, expanded: !m.expanded } : m)));
  };

  const handleGuardar = async () => {
    try {
      setSaving(true);
      // Construir payload
      const payload = modulos
        .filter((m) => m.selected)
        .map((m) => ({
          modulo_id: m.id,
          permisos: m.permisos?.filter((p) => p.selected).map((p) => p.id) || []
        }));
        console.log("pay",payload);
      await saveRolModulosPermisos(Number(rolId), payload);
      notifySuccess('Permisos del rol actualizados correctamente');
    } catch (error: any) {
      console.error('Error guardando permisos del rol:', error);
      notifyError(error?.message || 'Error al guardar permisos');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4 text-gray-600">Cargando permisos...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Módulos y permisos del rol</h2>

      <div className="space-y-3">
        {modulos.map((m) => (
          <div key={m.id} className="border rounded bg-white p-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={!!m.selected} onChange={() => toggleModuloSelect(m.id)} className="h-4 w-4" />
                <span className="font-medium">{m.descripcion}</span>
              </label>

              <div className="flex items-center gap-3">
                <button onClick={() => toggleExpand(m.id)} className="text-sm text-blue-600 hover:underline">
                  {m.expanded ? 'Ocultar' : 'Ver permisos'}
                </button>
              </div>
            </div>

            {m.expanded && (
              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 pl-6">
                {m.permisos?.map((p) => (
                  <label key={p.id} className="flex items-center gap-2">
                    <input type="checkbox" checked={!!p.selected} onChange={() => togglePermiso(m.id, p.id)} className="h-4 w-4" />
                    <span className="text-sm">{p.descripcion}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button onClick={handleGuardar} disabled={saving} className={`px-4 py-2 rounded text-white ${saving ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  );
}
