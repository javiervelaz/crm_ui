import { getClienteId } from "./authService";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
export const getModulosByCliente = async (cliente_id: bigint | null) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiUrl}/modulo/list/${cliente_id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
       // Si la respuesta es un 404, retorna un array vacío
       if (response.status === 404) {
        return [];
      }
      if (!response.ok) {
        throw new Error('Failed to fetch tipo salida');
      }
      return await response.json();

};



export const getRolModulosPermisos = async (rolId: number) => {
  const clienteId = getClienteId();
  const token = localStorage.getItem('token');
  const response = await fetch(`${apiUrl}/rol/${rolId}/${clienteId}/modulos-permisos`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
   // Si la respuesta es un 404, retorna un array vacío
   if (response.status === 404) {
    return [];
  }
  if (!response.ok) {
    throw new Error('Failed to fetch modulo permiso');
  }
  return await response.json();

};

export const getUserPermisosById = async (userId: number, cliente_id: bigint | null) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiUrl}/users/${userId}/${cliente_id}/modulos-permisos`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
       // Si la respuesta es un 404, retorna un array vacío
       if (response.status === 404) {
        return [];
      }
      if (!response.ok) {
        throw new Error('Failed to fetch tipo salida');
      }
      return await response.json();

};

export const getPermisosByModuloId = async (cliente_id: bigint | null, id_modulo: number) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiUrl}/modulo/${cliente_id}/${id_modulo}/permisos`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
       // Si la respuesta es un 404, retorna un array vacío
       if (response.status === 404) {
        return [];
      }
      if (!response.ok) {
        throw new Error('Failed to fetch tipo salida');
      }
      return await response.json();

  };

  export const saveRolModulosPermisos = async (rolId: number, payload: any) => {
    const clienteId = getClienteId();
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiUrl}/rol/${rolId}/${clienteId}/modulos-permisos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      let msg = 'No se pudieron guardar los permisos del rol';
      try { const e = await response.json(); msg = e?.error || e?.message || msg; } catch {}
      throw new Error(msg);
    }
    return await response.json();
  };

// ✅ Guardar los módulos y permisos asignados a un usuario
export const saveUsuarioModulosPermisos  =  async (userId:Number,cliente_id: bigint | null, data:any) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiUrl}/users/${userId}/${cliente_id}/modulos-permisos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      let msg = 'No se pudieron guardar los permisos del usuario';
      try { const e = await response.json(); msg = e?.error || e?.message || msg; } catch {}
      throw new Error(msg);
    }
    return await response.json();
  } catch (error: any) {
    throw new Error(error?.message || 'No se pudieron guardar los permisos del usuario');
  }
}
