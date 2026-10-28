/** Fila del reporte de ventas: una por (día, producto). */
export interface FilaVentas {
  fecha: string | Date;
  total_vendido: number | string;
  [key: string]: unknown;
}

export interface PuntoGrafico {
  /** yyyy-MM-dd (clave única: una barra por día) */
  dia: string;
  /** MM-dd (lo que se ve en el eje) */
  etiqueta: string;
  total_vendido: number;
}

const aDia = (fecha: string | Date, formatear: (d: Date) => string): string => formatear(new Date(fecha));

/**
 * Una barra por día. El reporte trae una fila por (día, producto): graficarlas tal
 * cual repite la etiqueta del eje y el tooltip muestra el valor de otra fila del mismo día.
 * Se suma en centavos enteros para no arrastrar error de float.
 */
export function ventasPorDia(
  filas: FilaVentas[] | null | undefined,
  formatear: (d: Date) => string,
): PuntoGrafico[] {
  const centavos = new Map<string, number>();
  for (const f of filas ?? []) {
    const dia = aDia(f.fecha, formatear);
    centavos.set(dia, (centavos.get(dia) ?? 0) + Math.round(Number(f.total_vendido) * 100));
  }
  return [...centavos.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([dia, c]) => ({ dia, etiqueta: dia.slice(5), total_vendido: c / 100 }));
}
