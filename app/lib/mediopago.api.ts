import { logError } from '@/app/lib/logger';
import { notifyError, notifySuccess } from './notificationService';
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
export const createMedioPago = async (data: any) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiUrl}/medioPago`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      notifyError( 'No se pudo cargar el medio de pago');
      throw new Error('No se pudo crear el medio de pago');
    }
    notifySuccess('Operación realizada correctamente');
    return await response.json();
  };

  export const getMedioPagoById = async (Id: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiUrl}/medioPago/${Id}`, {
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
      throw new Error('No se pudo obtener el medio de pago');
    }
    return await response.json();
  };

  export const updateMedioPago = async (id: string, data: any) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiUrl}/medioPago/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      notifyError( 'No se pudo actualizar el rol');
      throw new Error('No se pudo actualizar el rol');
    }
    notifySuccess('Role updated successfully');
    return await response.json();
  };

  export const getMedioPagoList = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/medioPago/list`, {
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
      logError('Error al obtener el medio de pago', error);
      // Si ocurre cualquier otro error, retorna un array vacío
      return [];
    }
  };

  export const deleteMedioPago = async (Id: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiUrl}/medioPago/${Id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('No se pudo eliminar el medio de pago');
    }
    return await response.json();
  };
  