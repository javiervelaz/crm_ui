import { logError } from '@/app/lib/logger';
import apiClient from './apiClient';
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
      notifyError( 'No se pudo cargar el perfil');
      throw new Error('No se pudo crear el perfil');
    }
    notifySuccess('Operación realizada correctamente');
    return await response.json();
  };

  export const getProfileById = async (Id: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiUrl}/profile/${Id}`, {
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
      throw new Error('No se pudo obtener el usuario');
    }
    return await response.json();
  };

  export const getProfileUserById = async (userId: string, cliente: bigint | null) => {
    try {
      
      const token = localStorage.getItem('token');
      const response = await apiClient(`${apiUrl}/profile/user/${userId}/${cliente}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      // Si hay otro tipo de error, lanza una excepción
      if (response.status !== 200) {
        throw new Error('No se pudo obtener el usuario');
      }

      return await response.data;
    } catch (error: any) {
      // apiClient (axios) rechaza la promesa en cualquier status fuera de 2xx,
      // por lo que un 404 llega acá, no al chequeo de response.status de arriba.
      if (error?.response?.status === 404) {
        return [];
      }
      logError('Error al obtener el perfil del usuario:', error);
      // Si ocurre cualquier otro error, retorna un array vacío
      return [];
    }
  };

  export const updateProfile = async (id: string, updatedProfileDetails: any) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiUrl}/profile/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updatedProfileDetails),
    });
    if (!response.ok) {
      throw new Error('No se pudo actualizar el perfil');
    }
    return await response.json();
  };

  export const getClienteByTelefono  = async (telefono: string,cliente_id: bigint | null) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/users/cliente/${telefono}/${cliente_id}`, {
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
      logError('Error al obtener el perfil del usuario:', error);
      // Si ocurre cualquier otro error, retorna un array vacío
      return [];
    }
  };
  