/** Medio de pago de un gasto: efectivo es el default (sale del cajón). */
export interface MedioPagoOpcion {
  id: number;
  descripcion: string;
  codigo: string;
}

export const CODIGO_EFECTIVO = 'EFE';

export function medioEfectivoId(medios: MedioPagoOpcion[]): number | undefined {
  return medios.find((m) => m.codigo === CODIGO_EFECTIVO)?.id;
}

/** Id a mostrar/enviar para una fila: el elegido o, si no eligió, efectivo. */
export function medioDeFila(
  medioPagoId: number | undefined,
  medios: MedioPagoOpcion[],
): number | undefined {
  return medioPagoId ?? medioEfectivoId(medios);
}
