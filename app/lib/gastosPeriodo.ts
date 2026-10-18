// app/lib/gastosPeriodo.ts
//
// Lógica pura del Flujo en modo sin caja (tenants sin el módulo 'operaciones',
// ej. academias): los gastos se agrupan por mes en vez de por caja del día.

/** Ids de categoria_tipo, los mismos que usa GastoWizard al guardar. */
export const TIPO_GASTO = { fijo: 1, variable: 2, sueldos: 3 } as const;

export interface GastoPeriodo {
  id: number;
  descripcion: string;
  monto: string | number; // numeric de Postgres llega como string
  categoria_salida_id: number;
  categoria_nombre?: string | null;
  fecha: string; // YYYY-MM-DD (hora de Córdoba, la calcula la API)
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Mes actual en hora local como 'YYYY-MM' (valor de un <input type="month">). */
export function mesActual(hoy: Date = new Date()): string {
  return `${hoy.getFullYear()}-${pad(hoy.getMonth() + 1)}`;
}

/** 'YYYY-MM' → primer y último día del mes. null si el valor no es un mes válido. */
export function rangoMes(mes: string): { desde: string; hasta: string } | null {
  const m = /^(\d{4})-(\d{2})$/.exec(mes);
  if (!m) return null;
  const nroMes = Number(m[2]);
  if (nroMes < 1 || nroMes > 12) return null;
  const ultimo = new Date(Date.UTC(Number(m[1]), nroMes, 0)).getUTCDate();
  return { desde: `${m[1]}-${m[2]}-01`, hasta: `${m[1]}-${m[2]}-${pad(ultimo)}` };
}

/** Total del listado. Ignora montos no numéricos en vez de devolver NaN. */
export function totalGastos(gastos: Pick<GastoPeriodo, 'monto'>[]): number {
  return gastos.reduce((acc, g) => {
    const n = Number(g.monto);
    return acc + (Number.isFinite(n) ? n : 0);
  }, 0);
}

/** Totales por tipo, con las mismas tres categorías del Resumen. */
export function totalesPorTipo(gastos: Pick<GastoPeriodo, 'monto' | 'categoria_salida_id'>[]) {
  const de = (id: number) => totalGastos(gastos.filter((g) => Number(g.categoria_salida_id) === id));
  return { fijo: de(TIPO_GASTO.fijo), sueldos: de(TIPO_GASTO.sueldos), variable: de(TIPO_GASTO.variable) };
}

/** 'YYYY-MM' → 'octubre 2026', para títulos. */
export function nombreMes(mes: string): string {
  const r = rangoMes(mes);
  if (!r) return mes;
  const [a, m] = mes.split('-').map(Number);
  return new Date(a, m - 1, 1).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
}
