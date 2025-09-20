import { notifyError, notifySuccess } from './notificationService';
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
export const createProfile = async (profileDetails: any) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiUrl}/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(profileDetails),
    });
    
    if (!response.ok) {
      notifyError( 'Failed to load profile');
      throw new Error('Failed to create profile');
    }
    notifySuccess('profile loaded successfully');
    return await response.json();
  };

  export const getProfileById = async (Id: string) => {
    const response = await fetch(`${apiUrl}/profile/${Id}`, {
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
      throw new Error('Failed to fetch user');
    }
    return await response.json();
  };

  export const getProfileUserById = async (userId: string) => {
    try {
      const response = await fetch(`${apiUrl}/profile/user/${userId}`, {
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
      console.error('Error al obtener el perfil del usuario:', error);
      // Si ocurre cualquier otro error, retorna un array vacío
      return [];
    }
  };

  export const updateProfile = async (id: string, updatedProfileDetails: any) => {
    const response = await fetch(`${apiUrl}/profile/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedProfileDetails),
    });
    if (!response.ok) {
      throw new Error('Failed to update profile');
    }
    return await response.json();
  };

  export const getClienteByTelefono  = async (telefono: string) => {
    try {
      const response = await fetch(`${apiUrl}/users/cliente/${telefono}`, {
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
      console.error('Error al obtener el perfil del usuario:', error);
      // Si ocurre cualquier otro error, retorna un array vacío
      return [];
    }
  };
  