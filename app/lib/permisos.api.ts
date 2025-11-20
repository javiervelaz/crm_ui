import { getClienteId } from "./authService";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
export const getModulosByCliente = async (cliente_id: BigInt) => {
    const response = await fetch(`${apiUrl}/modulo/list/${cliente_id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
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
  const response = await fetch(`${apiUrl}/rol/${rolId}/${clienteId}/modulos-permisos`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
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

export const getUserPermisosById = async (userId: number, cliente_id: BigInt) => {
    const response = await fetch(`${apiUrl}/users/${userId}/${cliente_id}/modulos-permisos`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
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

export const getPermisosByModuloId = async (cliente_id: BigInt, id_modulo: number) => {
    const response = await fetch(`${apiUrl}/modulo/${cliente_id}/${id_modulo}/permisos`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
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
    try {
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
        const errorData = await response.json(); // Obtener el cuerpo de la respuesta
        throw new Error(`Error: ${errorData.message || 'Error desconocido en la API'}`);
      }
      return await response.json();
    } catch (error) {
      throw new Error('Falló setear permisos');
    } 

  };

// ✅ Guardar los módulos y permisos asignados a un usuario
export const saveUsuarioModulosPermisos  =  async (userId:Number,cliente_id:BigInt, data:any) => {
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
      const errorData = await response.json(); // Obtener el cuerpo de la respuesta
      throw new Error(`Error: ${errorData.message || 'Error desconocido en la API'}`);
    }
    return await response.json();
  } catch (error) {
    throw new Error('Falló setear permisos');
  } 
}
