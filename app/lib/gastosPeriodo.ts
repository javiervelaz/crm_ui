// app/lib/gastosPeriodo.ts
//
// Lógica pura de la vista de gastos sin caja (Flujo para tenants sin el
// módulo 'operaciones', ej. academias). Sin React ni fetch.

/** Tipos de gasto. El id es el de categoria_tipo, igual que en GastoWizard. */
export const TIPOS_GASTO = [
  { id: 1, label: 'Fijo' },
  { id: 3, label: 'Sueldo' },
  { id: 2, label: 'Variable' },
] as const;

export type TipoGastoId = (typeof TIPOS_GASTO)[number]['id'];

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
  const anio = Number(m[1]);
  const nroMes = Number(m[2]);
  if (nroMes < 1 || nroMes > 12) return null;
  const ultimo = new Date(Date.UTC(anio, nroMes, 0)).getUTCDate();
  return { desde: `${m[1]}-${m[2]}-01`, hasta: `${m[1]}-${m[2]}-${pad(ultimo)}` };
}

/** Total del listado. Ignora montos no numéricos en vez de devolver NaN. */
export function totalGastos(gastos: Pick<GastoPeriodo, 'monto'>[]): number {
  return gastos.reduce((acc, g) => {
    const n = Number(g.monto);
    return acc + (Number.isFinite(n) ? n : 0);
  }, 0);
}

/** Total por tipo, en el orden de TIPOS_GASTO. */
export function totalesPorTipo(gastos: Pick<GastoPeriodo, 'monto' | 'categoria_salida_id'>[]) {
  return TIPOS_GASTO.map((t) => ({
    ...t,
    total: totalGastos(gastos.filter((g) => Number(g.categoria_salida_id) === t.id)),
  }));
}

/** Validación del alta: devuelve el mensaje de error o null si está OK. */
export function validarGasto(descripcion: string, monto: string): string | null {
  if (!descripcion.trim()) return 'Escribí una descripción';
  const n = Number(monto);
  if (!monto.trim() || !Number.isFinite(n) || n <= 0) return 'El monto tiene que ser mayor a cero';
  return null;
}

export const formatoPesos = (n: number) =>
  n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2 });
