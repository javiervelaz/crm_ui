import { notifyError, notifySuccess } from './notificationService';
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
export const getProductoList = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiUrl}/producto/list`, {
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

  export const createProduct = async (data: any) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiUrl}/producto`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      notifyError( 'Failed to load producto');
      throw new Error('Failed to create producto');
    }
    notifySuccess('producto loaded successfully');
    return await response.json();
  };

  export const getProductoById = async (Id: number | string | string[]) => {
    const response = await fetch(`${apiUrl}/producto/${Id}`, {
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
      throw new Error('Failed to fetch producto');
    }
    return await response.json();
  };

  export const updateProducto = async (id: number | string | string[], data: any) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiUrl}/producto/${id}`, {
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

  export const deleteProducto = async (id: number | string | string[]) => {
    const response = await fetch(`${apiUrl}/producto/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to delete  producto');
    }
    return await response.json();
  };
  