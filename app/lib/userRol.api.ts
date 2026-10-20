import { logError } from '@/app/lib/logger';
import { notifyError, notifySuccess } from './notificationService';
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
export const createUserRol = async (userRolDetails: any) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiUrl}/userrol`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(userRolDetails),
    });
    if (!response.ok) {
      notifyError( 'No se pudo cargar el perfil');
      throw new Error('No se pudo crear el perfil');
    }
    notifySuccess('Operación realizada correctamente');
    return await response.json();
  };

  export const getUserRolById = async (Id: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiUrl}/userrol/${Id}`, {
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
      throw new Error('No se pudo obtener el rol del usuario');
    }
    return await response.json();
  };

  export const updateUserRol = async (id: string, updatedUserRolDetails: any) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiUrl}/userrol/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updatedUserRolDetails),
    });
    if (!response.ok) {
      notifyError( 'No se pudo actualizar el rol');
      throw new Error('No se pudo actualizar el rol');
    }
    notifySuccess('Role updated successfully');
    return await response.json();
  };

  export const getUserRolUserById = async (userId: string, cliente: bigint | null )=> {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/userrol/user/${userId}/${cliente}`, {
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
  
      // Si hay otro tipo de error, lanza una excepción
      if (!response.ok) {
        throw new Error('No se pudo obtener el usuario');
      }
  
      return await response.json();
    } catch (error) {
      logError('Error al obtener el perfil del user rl:', error);
      // Si ocurre cualquier otro error, retorna un array vacío
      return [];
    }
  };

  export const deleteUserRol = async (Id: string, cliente: bigint | null) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiUrl}/userrol/${Id}/${cliente}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('No se pudo eliminar el usuario');
    }
    return await response.json();
  };
  