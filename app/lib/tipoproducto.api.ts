import { notifyError, notifySuccess } from './notificationService';
const apiUrl = process.env.NEXT_PUBLIC_API_URL;


export const getTipoProductoList = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiUrl}/tipo-producto/list`, {
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
        throw new Error('Failed to load producto list');
      }
      return await response.json();
  };

  export const createTipoProducto = async (data: any) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiUrl}/tipo-producto`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      notifyError( 'Failed to load tipo producto');
      throw new Error('Failed to create tipo producto');
    }
    notifySuccess('tipo producto loaded successfully');
    return await response.json();
  }

  export const getTipoProductoById = async (Id: number | string | string[]) => {
    const response = await fetch(`${apiUrl}/tipo-producto/${Id}`, {
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
      throw new Error('Failed to fetch tipo producto');
    }
    return await response.json();
  };

  export const updateTipoProducto = async (id: number | string | string[], data: any) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiUrl}/tipo-producto/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update producto');
    }
    return await response.json();
  };

  export const deleteTipoProducto = async (id: number | string | string[]) => {
    const response = await fetch(`${apiUrl}/tipo-producto/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to delete tipo producto');
    }
    return await response.json();
  };
  
  