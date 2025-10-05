const apiUrl = process.env.NEXT_PUBLIC_API_URL;
export const getGastoCategorias = async (cliente: BigInt) => {
    
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiUrl}/categoria-salida/list/${cliente}`, {
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

  export const getGastosPorRegistro = async (id:number, cliente: BigInt) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiUrl}/salida-caja/list/${id}/${cliente}`, {
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

  export const getGastosCategoriaTipo = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiUrl}/categoria-tipo/list`, {
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

  export const crearGasto = async (data: any) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiUrl}/salida-caja`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
     
      throw new Error('Failed to create medio pago');
    }
    return await response.json();
  };

  export const crearCategoriaSalida = async (data: any) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiUrl}/categoria-salida`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
     
      throw new Error('Failed to create medio pago');
    }
    return await response.json();
  };


  export const gatosMontoTotalDiario =  async (id: number, data: any,cliente: BigInt) => {
    try {
      const token = localStorage.getItem('token');
      const payload = { "salida_categoria_id": data, "cliente_id" : cliente}
      const response =await fetch(`${apiUrl}/salida-caja/monto-gastos/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload)
      });
      console.log(response);
      if (!response.ok) {
        const errorData = await response.json(); // Obtener el cuerpo de la respuesta
        throw new Error(`Error: ${errorData.message || 'Error desconocido en la API'}`);
      }
      return await response.json();
    } catch (error) {
      throw new Error('Falló monto gastos ');
    } 
  }

  export const updateCategoriaSalida = async (id: number , data: any) => {
    const token = localStorage.getItem('token');
    console.log("data from upadte",data)
    const response = await fetch(`${apiUrl}/categoria-salida/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update tipo salida');
    }
    return await response.json();
  };

  export const getCategoriaSalidaById = async (Id: number | string | string[], cliente : BigInt) => {
    const response = await fetch(`${apiUrl}/categoria-salida/${Id}/${cliente}`, {
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
      throw new Error('Failed to fetch tipo salida');
    }
    return await response.json();
  };

  export const deleteCategoriaSalida = async (id: number | string | string[], cliente:BigInt) => {
    const response = await fetch(`${apiUrl}/categoria-salida/${id}/${cliente}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to delete  categoria salida');
    }
    return await response.json();
  };
  