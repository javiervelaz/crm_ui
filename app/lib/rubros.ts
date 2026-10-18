// app/lib/rubros.ts
//
// Rubro del negocio: define qué módulos recibe el tenant en el alta
// (ver crm_api/migrations/009_rubros.sql). Funciones puras, sin React.

export interface Rubro {
  codigo: string;
  nombre: string;
}

/** Comportamiento histórico del alta: todo tenant era gastronómico. */
export const RUBRO_DEFAULT = 'gastronomia';

/**
 * Rubro preseleccionado en el formulario de alta.
 *
 * 1. El de la URL (?rubro=educacion), si existe en el catálogo: así la
 *    landing de cada vertical llega con su rubro marcado.
 * 2. Si no, gastronomía, para que el funnel actual no cambie.
 * 3. Si el catálogo no trae gastronomía, el primero disponible.
 */
export function rubroInicial(param: string | null | undefined, rubros: Rubro[]): string {
  const pedido = (param ?? '').trim().toLowerCase();
  if (pedido && rubros.some((r) => r.codigo === pedido)) return pedido;
  if (rubros.some((r) => r.codigo === RUBRO_DEFAULT)) return RUBRO_DEFAULT;
  return rubros[0]?.codigo ?? '';
}
