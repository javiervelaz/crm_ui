import { notifyError, notifySuccess } from './notificationService';
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
export const getProductoList = async (cliente: BigInt) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiUrl}/producto/list/${cliente}`, {
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

  export const postProductoList = async (cliente: BigInt) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiUrl}/producto/list/${cliente}`, {
      method: 'POST',
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
    
    // Siempre tratamos de leer el body si viene JSON
    let errorBody: any = null;
    try {
      errorBody = await response.clone().json();
    } catch (e) {
      // puede no ser JSON → lo ignoramos
    }
    if (response.status === 403) {
        throw new Error(errorBody?.error || 'No tiene permisos para esta operación');
    }

    if (!response.ok) {
      const messageBackend = errorBody?.error || errorBody?.message;
      throw new Error(messageBackend ||'Failed to create producto');
    }
    notifySuccess('producto loaded successfully');
    return await response.json();
  };

  export const getProductoById = async (Id: number | string | string[], cliente: BigInt) => {
    const response = await fetch(`${apiUrl}/producto/${Id}/${cliente}`, {
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

  export const deleteProducto = async (id: number | string | string[],cliente: BigInt) => {
    const response = await fetch(`${apiUrl}/producto/${id}/${cliente}`, {
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
  