import { notifyError, notifySuccess } from './notificationService';
import apiClient from "@/app/lib/apiClient";
const apiUrl = process.env.NEXT_PUBLIC_API_URL;



export interface PedidoItemDetalle {
  id: number;
  pedido_id: number;
  producto_id: number;
  producto_nombre: string;
  cantidad: number;
  cantidad_mitad: number;
  precio_unitario: number;
  precio_final: number | null;
  monto_adicional: number | null;
  observaciones: string | null;
  producto_image_public_id: string | null;
}

export const abrirCaja = async (data: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/operaciones/abrir-caja`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json(); // Obtener el cuerpo de la respuesta
        throw new Error(`Error: ${errorData.message || 'Error desconocido en la API'}`);
      }
      notifySuccess('caja loaded successfully');
      return await response.json();
    } catch (error) {
      notifyError( '' + error.message);
      throw new Error('Falló la apertura de la caja');
    }
  };

  export const checkAperturaCaja =  async (data: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/operaciones/check-caja`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json(); // Obtener el cuerpo de la respuesta
        throw new Error(`Error: ${errorData.message || 'Error desconocido en la API'}`);
      }
      return await response.json();
    } catch (error) {
      throw new Error('Falló la check caja abierta');
    } 
  }

  export const crearPedido =  async (data: any) => {
    try {
      console.log(data)
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/operaciones/crear-pedido`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json(); // Obtener el cuerpo de la respuesta
        throw new Error(`Error: ${errorData.message || 'Error desconocido en la API'}`);
      }
      return await response.json();
    } catch (error) {
      throw new Error('Falló crear pedido');
    } 
  }


  export const getPedidosByRegistroId = async (Id: number, cliente: BigInt) => {
    try {
      const response = await apiClient(`${apiUrl}/operaciones/listar-pedidos/${Id}/${cliente}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log(response)
      // Si la respuesta es un 404, retorna un array vacío
      if (response.status === 404) {
        return [];
      }
  
      // Si hay otro tipo de error, lanza una excepción
      if (!response.status === 200) {
        throw new Error('Failed to fetch pedidos list');
      }
  
      return await response.data;
    } catch (error) {
      console.error('Error al obtener el listado de pedidos', error);
      // Si ocurre cualquier otro error, retorna un array vacío
      return [];
    }
  };

  export const terminarPedido =  async (id: number, data: any) => {
    try {
      const token = localStorage.getItem('token');
      const response =await fetch(`${apiUrl}/operaciones/terminar-pedido/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json(); // Obtener el cuerpo de la respuesta
        throw new Error(`Error: ${errorData.message || 'Error desconocido en la API'}`);
      }
      return await response.json();
    } catch (error) {
      throw new Error('Falló TERMINAR pedido');
    } 
  }

  export const deletePedido = async (id: number, cliente: bigint) => {
    const token = localStorage.getItem('token');
      const response = await fetch(
        `${apiUrl}/operaciones/borrar-pedido/${id}/${cliente}`, 
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' ,'Authorization': `Bearer ${token}`},
        }
      );

      // Siempre tratamos de leer el body si viene JSON
      let errorBody: any = null;
      try {
        errorBody = await response.clone().json();
      } catch (e) {
        // puede no ser JSON → lo ignoramos
      }

      console.log("RESPONSE RAW:", response.status, response.statusText);
      console.log("RESPONSE BODY:", errorBody);

      if (response.status === 403) {
        throw new Error(errorBody?.error || 'No tiene permisos para esta operación');
      }

      if (!response.ok) {
        // Si el backend mandó mensaje propio → lo usamos
        const messageBackend = errorBody?.error || errorBody?.message;
        throw new Error(messageBackend || 'Error borrando pedido');
      }

      return await response.json();
  };


  export const pedidoMontoTotalDiario =  async (id: number, cliente: BigInt) => {
    try {
      const token = localStorage.getItem('token');
      const response =await fetch(`${apiUrl}/operaciones/pedido-monto-total/${id}/${cliente}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json(); // Obtener el cuerpo de la respuesta
        throw new Error(`Error: ${errorData.message || 'Error desconocido en la API'}`);
      }
      return await response.json();
    } catch (error) {
      throw new Error('Falló recuprar monto total ventas diario');
    } 
  }

  export const cerrarCaja =  async (data: any) => {
    try {
      console.log(data)
      const token = localStorage.getItem('token');
      const response =await fetch(`${apiUrl}/operaciones/cierre-caja` , {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json(); // Obtener el cuerpo de la respuesta
        throw new Error(`Error: ${errorData.message || 'Error desconocido en la API'}`);
      }
      return await response.json();
    } catch (error) {
      throw new Error('Falló cerrar caja');
    } 
  }

  export const reporteDiario =  async () => {
    try {
      const token = localStorage.getItem('token');
      const response =await fetch(`${apiUrl}/operaciones/registros-diarios` , {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json(); // Obtener el cuerpo de la respuesta
        throw new Error(`Error: ${errorData.message || 'Error desconocido en la API'}`);
      }
      return await response.json();
    } catch (error) {
      throw new Error('Falló reporte registros diarios');
    } 
  }

  export const getCajaInicial =  async (id: number,cliente: BigInt) => {
    try {
      const token = localStorage.getItem('token');
      const response =await fetch(`${apiUrl}/operaciones/caja-inicial/${id}/${cliente}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json(); // Obtener el cuerpo de la respuesta
        throw new Error(`Error: ${errorData.message || 'Error desconocido en la API'}`);
      }
      return await response.json();
    } catch (error) {
      throw new Error('Falló recuprar monto caja incial');
    } 
  }


  export async function getDetallePedido(pedidoId: number): Promise<PedidoItemDetalle[]> {

  const res = await fetch(
    `${apiUrl}/operaciones/detalle-pedido/${pedidoId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    },
  );

  if (!res.ok) {
    throw new Error('Error obteniendo detalle del pedido');
  }

  const data = await res.json();
  return data as PedidoItemDetalle[];
}