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
      notifyError( 'Failed to load medio pago');
      throw new Error('Failed to create medio pago');
    }
    notifySuccess('medio pago loaded successfully');
    return await response.json();
  };

  export const getMedioPagoById = async (Id: string) => {
    const response = await fetch(`${apiUrl}/medioPago/${Id}`, {
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
      throw new Error('Failed to fetch medio pago');
    }
    return await response.json();
  };

  export const updateMedioPago = async (id: string, data: any) => {
    const response = await fetch(`${apiUrl}/medioPago/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      notifyError( 'Failed to update Role');
      throw new Error('Failed to update role');
    }
    notifySuccess('Role updated successfully');
    return await response.json();
  };

  export const getMedioPagoList = async () => {
    try {
      const response = await fetch(`${apiUrl}/medioPago/list`, {
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
      console.error('Error al obtener el medio de pago', error);
      // Si ocurre cualquier otro error, retorna un array vacío
      return [];
    }
  };

  export const deleteMedioPago = async (Id: string) => {
    const response = await fetch(`${apiUrl}/medioPago/${Id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to delete medio pago');
    }
    return await response.json();
  };
  