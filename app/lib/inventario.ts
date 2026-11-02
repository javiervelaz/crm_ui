/**
 * Inventario: lógica pura (sin React ni red) para que se pueda testear.
 * La API guarda en unidades canónicas (u, kg, l) y acepta g/ml en los
 * movimientos; acá se arma lo que ve y escribe el usuario.
 */

export type UnidadItem = 'u' | 'kg' | 'l';
export type UnidadIngreso = UnidadItem | 'g' | 'ml';
export type TipoItem = 'insumo' | 'producto';
export type EstadoStock = 'ok' | 'bajo' | 'sin_stock' | 'negativo';
export type TipoMovimiento =
  | 'compra'
  | 'ajuste'
  | 'merma'
  | 'venta'
  | 'reversa_venta';

export const UNIDADES: { value: UnidadItem; label: string }[] = [
  { value: 'u', label: 'Unidades' },
  { value: 'kg', label: 'Kilos' },
  { value: 'l', label: 'Litros' },
];

/** Unidades en las que se puede cargar un movimiento de un ítem. */
export function unidadesDeIngreso(unidad: UnidadItem): UnidadIngreso[] {
  if (unidad === 'kg') return ['kg', 'g'];
  if (unidad === 'l') return ['l', 'ml'];
  return ['u'];
}

/**
 * Número escrito a mano en el celular: acepta coma o punto decimal y
 * separador de miles con punto ("1.250,5"). Devuelve null si no es un número.
 */
export function parseNumero(
  texto: string | number | null | undefined,
): number | null {
  if (typeof texto === 'number') return Number.isFinite(texto) ? texto : null;
  if (texto == null) return null;
  let s = String(texto).trim().replace(/\s/g, '').replace(/^\$/, '');
  if (!s) return null;
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
  if (!/^-?\d+(\.\d+)?$/.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

const fmt = (n: number, max = 3) =>
  n.toLocaleString('es-AR', {
    maximumFractionDigits: max,
    minimumFractionDigits: 0,
  });

/** "2,5 kg", "800 g", "12 u". Menos de 1 kg o 1 l se muestra en g o ml. */
export function formatCantidad(cantidad: number, unidad: UnidadItem): string {
  const abs = Math.abs(cantidad);
  if ((unidad === 'kg' || unidad === 'l') && abs > 0 && abs < 1) {
    return `${fmt(cantidad * 1000, 0)} ${unidad === 'kg' ? 'g' : 'ml'}`;
  }
  return `${fmt(cantidad)} ${unidad}`;
}

export function formatPesos(monto: number | null | undefined): string {
  if (monto == null) return '—';
  return monto.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 2,
  });
}

/** Costo por unidad canónica ("$12.000 / kg"). */
export function formatCostoUnitario(
  costo: number | null,
  unidad: UnidadItem,
): string | null {
  if (costo == null) return null;
  return `${formatPesos(costo)} / ${unidad}`;
}

export const ESTADOS: Record<
  EstadoStock,
  { label: string; punto: string; chip: string }
> = {
  ok: {
    label: 'OK',
    punto: 'bg-emerald-500',
    chip: 'bg-emerald-50 text-emerald-700',
  },
  bajo: {
    label: 'Bajo',
    punto: 'bg-amber-500',
    chip: 'bg-amber-50 text-amber-700',
  },
  sin_stock: {
    label: 'Sin stock',
    punto: 'bg-red-500',
    chip: 'bg-red-50 text-red-700',
  },
  negativo: {
    label: 'Negativo',
    punto: 'bg-red-600',
    chip: 'bg-red-100 text-red-800',
  },
};

/** Orden de la lista: lo urgente arriba, después alfabético. */
const PRIORIDAD: Record<EstadoStock, number> = {
  negativo: 0,
  sin_stock: 1,
  bajo: 2,
  ok: 3,
};
export function ordenarPorUrgencia<
  T extends { estado: EstadoStock; nombre: string },
>(items: T[]): T[] {
  return [...items].sort(
    (a, b) =>
      PRIORIDAD[a.estado] - PRIORIDAD[b.estado] ||
      a.nombre.localeCompare(b.nombre, 'es'),
  );
}

export const MOVIMIENTOS: Record<
  TipoMovimiento,
  { label: string; color: string }
> = {
  compra: { label: 'Compra', color: 'text-emerald-700' },
  ajuste: { label: 'Conteo', color: 'text-brand-600' },
  merma: { label: 'Merma', color: 'text-amber-700' },
  venta: { label: 'Venta', color: 'text-brand-800' },
  reversa_venta: { label: 'Venta anulada', color: 'text-brand-300' },
};

/** Cantidad con signo para el historial: "+2,5 kg" / "−300 g". */
export function formatDelta(cantidad: number, unidad: UnidadItem): string {
  const signo = cantidad > 0 ? '+' : '−';
  return `${signo}${formatCantidad(Math.abs(cantidad), unidad)}`;
}

export interface ValidacionMovimiento {
  ok: boolean;
  error?: string;
  valor?: number;
}

/** Validación de la cantidad antes de mandar (el backend vuelve a validar). */
export function validarCantidad(
  texto: string,
  { permitirCero = false } = {},
): ValidacionMovimiento {
  const n = parseNumero(texto);
  if (n === null) return { ok: false, error: 'Ingresá un número' };
  if (n < 0) return { ok: false, error: 'No puede ser negativo' };
  if (!permitirCero && n === 0)
    return { ok: false, error: 'Tiene que ser mayor a cero' };
  return { ok: true, valor: n };
}
