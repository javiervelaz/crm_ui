const apiUrl = process.env.NEXT_PUBLIC_API_URL;
export const getGastoCategorias = async (cliente: bigint | null) => {
    
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
        throw new Error('No se pudo cargar la lista de productos');
      }
      return await response.json();
  };

  export const getGastosPorRegistro = async (id:number, cliente: bigint | null) => {
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
        throw new Error('No se pudo cargar la lista de productos');
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
        throw new Error('No se pudo cargar la lista de tipos de categoría');
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
     
      throw new Error('No se pudo crear el medio de pago');
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
     
      throw new Error('No se pudo crear el medio de pago');
    }
    return await response.json();
  };


  export const gatosMontoTotalDiario =  async (id: number, data: any,cliente: bigint | null) => {
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
      if (!response.ok) {
        const errorData = await response.json(); // Obtener el cuerpo de la respuesta
        throw new Error(`Error: ${errorData.message || 'Error desconocido'}`);
      }
      return await response.json();
    } catch (error) {
      throw new Error('Falló monto gastos ');
    } 
  }

  export const updateCategoriaSalida = async (id: number , data: any) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiUrl}/categoria-salida/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('No se pudo actualizar el tipo de salida');
    }
    return await response.json();
  };

  export const getCategoriaSalidaById = async (Id: number | string | string[], cliente: bigint | null) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiUrl}/categoria-salida/${Id}/${cliente}`, {
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
      throw new Error('No se pudo obtener el tipo de salida');
    }
    return await response.json();
  };

  export const deleteCategoriaSalida = async (id: number | string | string[], cliente: bigint | null) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiUrl}/categoria-salida/${id}/${cliente}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('No se pudo eliminar categoria salida');
    }
    return await response.json();
  };

  // bug 38: eliminar un gasto (salida_caja) del día
  export const eliminarGasto = async (id: number, cliente: bigint | null) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiUrl}/salida-caja/${id}/${cliente}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      let msg = 'No se pudo eliminar el gasto';
      try { const e = await response.json(); msg = e?.error || e?.message || msg; } catch {}
      throw new Error(msg);
    }
    return await response.json();
  };

  // bug 39: registros diarios por período (dia | semana | mes) para ver flujo histórico
  export const getRegistrosDiarios = async (filtro: string, cliente: bigint | null) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiUrl}/operaciones/registros-diarios/${filtro}/${cliente}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    if (response.status === 404) return [];
    if (!response.ok) {
      throw new Error('No se pudieron cargar los registros diarios');
    }
    return await response.json();
  };
