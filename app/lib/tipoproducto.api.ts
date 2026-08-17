import apiClient from '@/app/lib/apiClient';

/**
 * REFERENCIA DE MIGRACIÓN — tarea 2.3.
 *
 * Este archivo es el "antes y después" de todos los *.api.ts basados en fetch.
 * Compará con la versión original (93 líneas) para ver la regla mecánica:
 *
 *   1. Se borra  const token = localStorage.getItem('token')   → lo pone el interceptor
 *   2. Se borra  headers: { Authorization, Content-Type }      → los pone Axios
 *   3. Se borra  if (!response.ok) throw new Error(...)        → Axios ya lanza
 *   4. Se borra  el manejo local de 401/403 y los toasts       → interceptor de respuesta
 *   5. Queda solo el 404 → [] , que es una decisión de negocio, no de transporte
 *
 * Orden de migración sugerido (riesgo ascendente):
 *   tipoproducto → producto → gasto → usuario/rol → operaciones (el del POS, último)
 */

/** 404 significa "todavía no hay ninguno", no un error. */
function emptyOn404(error: any) {
  if (error?.response?.status === 404) return [];
  throw error;
}

export const getTipoProductoList = async (cliente: bigint | string) => {
  try {
    const { data } = await apiClient.get(`/tipo-producto/list/${cliente}`);
    return data;
  } catch (error) {
    return emptyOn404(error);
  }
};

/**
 * [multi-tenant] A diferencia de producto.api.ts y gasto.ts, acá NO va cliente_id
 * en la URL: las rutas reales del backend son '/:id' a secas (sin segmento de
 * tenant) para get-by-id, update y delete. El tenant lo resuelve el middleware
 * global (scopeTenant, montado en /api antes de este router) a partir del JWT
 * y queda disponible server-side como req.clienteId — no hace falta mandarlo.
 * El bug de multi-tenant real estaba en el controller/service del backend, que
 * no reenviaban ese req.clienteId hasta el modelo (corregido ahí, no acá).
 */
export const getTipoProductoById = async (id: number | string) => {
  const { data } = await apiClient.get(`/tipo-producto/${id}`);
  return data;
};

export const createTipoProducto = async (payload: unknown) => {
  const { data } = await apiClient.post('/tipo-producto', payload);
  return data;
};

export const updateTipoProducto = async (id: number | string, payload: unknown) => {
  const { data } = await apiClient.put(`/tipo-producto/${id}`, payload);
  return data;
};

export const deleteTipoProducto = async (id: number | string) => {
  const { data } = await apiClient.delete(`/tipo-producto/${id}`);
  return data;
};

/**
 * Nota sobre los toasts: la versión original disparaba notifySuccess/notifyError
 * dentro de la capa de API. Eso ahora es responsabilidad del componente que
 * llama — la capa de API no sabe si la acción fue visible para el usuario.
 * Los errores 401/403 los sigue avisando el interceptor de apiClient.
 */
