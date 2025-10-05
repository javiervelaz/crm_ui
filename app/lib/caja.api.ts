const apiUrl = process.env.NEXT_PUBLIC_API_URL;
export const getRegistrosDiarios = async (filtro: 'dia' | 'semana' | 'mes' = 'dia',cliente:BigInt) => {
    
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiUrl}/operaciones/registros-diarios/${filtro}/${cliente}`, {
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
        throw new Error('Failed to load tipo categoria list');
      }
      return await response.json();

  };
  
  export const getRegistroDiarioDetalle = async (id: number,cliente: BigInt) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiUrl}/operaciones/registros-diarios/${id}/detalle/${cliente}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    if (!response.ok) throw new Error('Error fetching detalle del registro');
    return response.json();
  };