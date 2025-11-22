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
      notifyError( 'Failed to load profile');
      throw new Error('Failed to create profile');
    }
    notifySuccess('profile loaded successfully');
    return await response.json();
  };

  export const getUserRolById = async (Id: string) => {
    const response = await fetch(`${apiUrl}/userrol/${Id}`, {
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
      throw new Error('Failed to fetch user rol');
    }
    return await response.json();
  };

  export const updateUserRol = async (id: string, updatedUserRolDetails: any) => {
    const response = await fetch(`${apiUrl}/userrol/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedUserRolDetails),
    });
    if (!response.ok) {
      notifyError( 'Failed to update Role');
      throw new Error('Failed to update role');
    }
    notifySuccess('Role updated successfully');
    return await response.json();
  };

  export const getUserRolUserById = async (userId: string, cliente: BigInt )=> {
    try {
      const response = await fetch(`${apiUrl}/userrol/user/${userId}/${cliente}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      // Si la respuesta es un 404, retorna un array vacío
      if (response.status === 404) {
        return [];
      }
  
      // Si hay otro tipo de error, lanza una excepción
      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error al obtener el perfil del user rl:', error);
      // Si ocurre cualquier otro error, retorna un array vacío
      return [];
    }
  };

  export const deleteUserRol = async (Id: string, cliente: BigInt) => {
    const response = await fetch(`${apiUrl}/userrol/${Id}/${cliente}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to delete user');
    }
    return await response.json();
  };
  