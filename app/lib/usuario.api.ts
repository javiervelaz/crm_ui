// userService.ts
import apiClient from "@/app/lib/apiClient";
import { notifyError, notifySuccess } from './notificationService';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export const createUser = async (userDetails: any) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiUrl}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(userDetails),
    });
    if (!response.ok) {
      notifyError( 'Failed to load user');
      throw new Error('Failed to create user');
    }
    notifySuccess('Users loaded successfully');
    return await response.json();
  };
  
  export const getUserById = async (userId: string, cliente: BigInt) => {
    const response = await fetch(`${apiUrl}/users/${userId}/${cliente}`, {
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
  
  export const updateUser = async (userId: string, updatedDetails: any) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiUrl}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updatedDetails),
    });
    if (!response.ok) {
      throw new Error('Failed to update user');
    }
    return await response.json();
  };
  
  export const deleteUser = async (userId: number, cliente: BigInt) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiUrl}/users/${userId}/${cliente}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to delete user');
    }
    return await response.json();
  };
  
  export const getUserList = async (cliente :  BigInt) => {
    const token = localStorage.getItem('token');
    const response = await apiClient(`${apiUrl}/users/list/${cliente}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    console.log(response);
     // Si la respuesta es un 404, retorna un array vacío
    if (response.status === 404) {
      return [];
    }
   
    if (!response.status === 200) {
      throw new Error('Failed to fetch user list');
    }
    return await response.data;
  };

  //User type
  export const getUserTypeById = async (userTypeId: string) => {
    const response = await fetch(`${apiUrl}/users/type/${userTypeId}`, {
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
  

  //User Rol
  export const getUserRol = async (userId: string, cliente : BigInt) => {
    const response = await fetch(`${apiUrl}/users/rol/${userId}/${cliente}` , {
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

  export const getUserTypes = async () => {
    const response = await fetch(`${apiUrl}/users/tipo`, {
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
      throw new Error('Failed to fetch user list');
    }
    return await response.json();
  };

  export const getClienteEstadistica = async (id: number) => {
    const response = await fetch(`${apiUrl}/users/estadistica/cliente/${id}`, {
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
      throw new Error('Failed to fetch cliente estadistica');
    }
    return await response.json();
  };
