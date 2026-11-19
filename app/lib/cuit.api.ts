import apiClient from '@/app/lib/apiClient';

export const CODIGO_CUIT_REQUERIDO = 'CUIT_REQUERIDO';
/** Lo emite quien intenta tomar un pedido sin CUIT; el banner del dashboard lo escucha. */
export const CUIT_REQUERIDO_EVENT = 'cuit-requerido';
export const CUIT_CARGADO_EVENT = 'cuit-cargado';

export const emitCuitRequerido = (): void => {
  if (typeof window !== 'undefined')
    window.dispatchEvent(new Event(CUIT_REQUERIDO_EVENT));
};

export async function getEstadoCuit(): Promise<{ cuitCargado: boolean }> {
  const { data } = await apiClient.get('/cuenta/cuit');
  return { cuitCargado: !!data?.cuitCargado };
}

export async function cargarCuit(cuit: string): Promise<void> {
  await apiClient.post('/cuenta/cuit', { cuit: cuit.replace(/\D/g, '') });
  if (typeof window !== 'undefined')
    window.dispatchEvent(new Event(CUIT_CARGADO_EVENT));
}
