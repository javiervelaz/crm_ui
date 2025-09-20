import { notifyError } from './notificationService';
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
export const getRolList = async () => {
    const response = await fetch(`${apiUrl}/rol/list`, {
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
        notifyError( 'Failed to load rol');
        throw new Error('Failed to fetch rol list');
    }
    return await response.json();
  };