'use client';

import { getClienteId } from '@/app/lib/authService';
import { notifyError, notifySuccess } from '@/app/lib/notificationService';
import { getModulosWithPermisos, getPermisosByModuloId, getUserPermisosById, saveUsuarioModulosPermisos } from '@/app/lib/permisos.api';
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
  permisos: Permiso[];
  selected?: boolean;
  expanded?: boolean;
}

interface UsuarioPermisosFormProps {
  userId: number;
}

export default function UsuarioPermisosForm({ userId }: UsuarioPermisosFormProps) {
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const cliente_id = getClienteId();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1️⃣ Obtener todos los módulos del cliente
        const allModules  = await getModulosWithPermisos(getClienteId());

        // 2️⃣ Obtener módulos/permisos actuales del usuario (si tiene)
        const  userData  =  await getUserPermisosById(userId,getClienteId());
        //console.log("user data pern",userData);
     
        // 3️⃣ Construir estructura combinada
        const formattedModules = await Promise.all(
          allModules.map(async (mod: any) => {
            //console.log("MOD ",mod);
            // Obtener permisos asociados al módulo
            const permisos = await getPermisosByModuloId(cliente_id, mod.id);
            console.log("perm asociados",permisos);
            // Verificar si el usuario ya tiene este módulo
            const userModule = userData.find((u: any) => u.modulo_id === mod.id);
            console.log("userModule",userModule);
            const selected = !!userModule;
            console.log("selected",selected);
            // Mapear permisos marcando los seleccionados
            const permisosWithSelection = permisos.map((perm: Permiso) => ({
              ...perm,
              selected: userModule
                ? userModule.permisos.some((p: any) => p.id === perm.id)
                : false,
            }));

            return {
              id: mod.id,
              codigo: mod.codigo,
              descripcion: mod.descripcion,
              selected,
              expanded: selected,
              permisos: permisosWithSelection,
            };
          })
        );

        setModulos(formattedModules);
      } catch (error) {
        console.error('Error al cargar módulos y permisos:', error);
        notifyError('Error al cargar módulos y permisos.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, cliente_id]);

  const handleModuloToggle = (moduloId: number) => {
    setModulos((prev) =>
      prev.map((mod) =>
        mod.id === moduloId ? { ...mod, expanded: !mod.expanded } : mod
      )
    );
  };

  const handleModuloSelect = (moduloId: number) => {
    setModulos((prev) =>
      prev.map((mod) =>
        mod.id === moduloId
          ? {
              ...mod,
              selected: !mod.selected,
              expanded: !mod.selected ? true : false,
              permisos: mod.permisos.map((p) => ({
                ...p,
                selected: !mod.selected ? true : false,
              })),
            }
          : mod
      )
    );
  };

  const handlePermisoSelect = (moduloId: number, permisoId: number) => {
    setModulos((prev) =>
      prev.map((mod) =>
        mod.id === moduloId
          ? {
              ...mod,
              permisos: mod.permisos.map((perm) =>
                perm.id === permisoId
                  ? { ...perm, selected: !perm.selected }
                  : perm
              ),
            }
          : mod
      )
    );
  };

  const handleGuardar = async () => {
    try {
      setSaving(true);

      // Crear payload con módulos seleccionados y permisos activos
      const payload = modulos
        .filter((m) => m.selected)
        .map((m) => ({
          modulo_id: m.id,
          permisos: m.permisos
            .filter((p) => p.selected)
            .map((p) => p.id),
        }));
        console.log(payload);
      const result = await saveUsuarioModulosPermisos(userId,getClienteId(),payload)
      if(!result.error){
        notifySuccess('Permisos actualizados correctamente');
      }
      
    } catch (error) {
      console.error('Error al guardar permisos:', error);
      notifyError('Error al guardar los permisos del usuario');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-gray-600 italic">Cargando módulos y permisos...</div>;
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-medium text-gray-700 border-b pb-2">
        Módulos y Permisos
      </h2>

      {modulos.length === 0 ? (
        <p className="text-gray-500">No hay módulos configurados para este cliente.</p>
      ) : (
        <div className="space-y-3">
          {modulos.map((mod) => (
            <div
              key={mod.id}
              className="border border-gray-200 rounded-lg bg-white shadow-sm p-4"
            >
              {/* Checkbox de Módulo */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mod.selected || false}
                    onChange={() => handleModuloSelect(mod.id)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="font-semibold text-gray-800">{mod.descripcion}</span>
                </label>

                {/* Botón desplegar */}
                <button
                  type="button"
                  onClick={() => handleModuloToggle(mod.id)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {mod.expanded ? 'Ocultar permisos ▲' : 'Mostrar permisos ▼'}
                </button>
              </div>

              {/* Lista de permisos */}
              {mod.expanded && (
                <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2 pl-4">
                  {mod.permisos.map((perm) => (
                    <label key={perm.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={perm.selected || false}
                        onChange={() => handlePermisoSelect(mod.id, perm.id)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{perm.descripcion}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end mt-6">
        <button
          onClick={handleGuardar}
          disabled={saving}
          className={`px-4 py-2 rounded-lg shadow-sm text-white ${
            saving ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {saving ? 'Guardando...' : 'Guardar Permisos'}
        </button>
      </div>
    </section>
  );
}
