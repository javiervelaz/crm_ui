/**
 * Reglas puras de cuotas y pagos (sin red). El cálculo de recargos NO vive acá:
 * lo hace la API (POST /edu/pagos/calcular) para no duplicar reglas que cada
 * academia puede configurar.
 */
import { esFecha, nombreMes } from './reglas';

export type EstadoCuota = 'pendiente' | 'en_revision' | 'pagada';
export type EstadoPago = 'pendiente' | 'aprobado' | 'rechazado';
export type Tono = 'neutro' | 'ok' | 'aviso' | 'apagado';

/** Los numeric de Postgres llegan como string. */
type Monto = string | number;

export interface Cuota {
  id: number;
  inscripcion_id: number;
  alumno_id: number;
  periodo: string;
  tipo: 'mensual' | 'alta';
  importe_base: Monto;
  clases_mes: number;
  clases_cobradas: number;
  descuento_pct: Monto;
  importe: Monto;
  vence: string;
  estado: EstadoCuota;
  alumno: string;
  tutor_id: number | null;
  clase: string;
  /** Si se pagara hoy. */
  recargo_pct: Monto;
  total_hoy: Monto;
  vencida?: boolean;
}

export const MAX_COMPROBANTE = 5 * 1024 * 1024;
export const TIPOS_COMPROBANTE = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
] as const;
export const ACCEPT_COMPROBANTE = TIPOS_COMPROBANTE.join(',');

export const num = (v: Monto | null | undefined): number => Number(v ?? 0);

/** Pendiente que ya pasó el vencimiento se muestra como Vencida. */
export function estadoCuota(c: Pick<Cuota, 'estado' | 'vencida'>): {
  texto: string;
  tono: Tono;
} {
  if (c.estado === 'pagada') return { texto: 'Pagada', tono: 'ok' };
  if (c.estado === 'en_revision')
    return { texto: 'En revisión', tono: 'aviso' };
  return c.vencida
    ? { texto: 'Vencida', tono: 'aviso' }
    : { texto: 'Pendiente', tono: 'neutro' };
}

export function estadoPago(estado: EstadoPago): { texto: string; tono: Tono } {
  if (estado === 'aprobado') return { texto: 'Aprobado', tono: 'ok' };
  if (estado === 'rechazado') return { texto: 'Rechazado', tono: 'apagado' };
  return { texto: 'Pendiente de revisión', tono: 'aviso' };
}

/** 'Alta: 4 de 8 clases' / 'Descuento 25%' para el detalle de la cuota. */
export function detalleCuota(
  c: Pick<Cuota, 'tipo' | 'clases_mes' | 'clases_cobradas' | 'descuento_pct'>,
): string[] {
  const out: string[] = [];
  if (c.tipo === 'alta' && c.clases_cobradas < c.clases_mes) {
    out.push(`Mes de alta: ${c.clases_cobradas} de ${c.clases_mes} clases`);
  }
  if (num(c.descuento_pct) > 0) {
    out.push(`Descuento ${num(c.descuento_pct)}% por varios instrumentos`);
  }
  return out;
}

export const seleccionable = (c: Pick<Cuota, 'estado'>): boolean =>
  c.estado === 'pendiente';

export function sumaSeleccion(
  cuotas: Pick<Cuota, 'id' | 'importe' | 'total_hoy'>[],
  ids: Iterable<number>,
  campo: 'importe' | 'total_hoy' = 'importe',
): number {
  const set = new Set(ids);
  const centavos = cuotas
    .filter((c) => set.has(c.id))
    .reduce((s, c) => s + Math.round(num(c[campo]) * 100), 0);
  return centavos / 100;
}

/** Resumen de la lista: cuánto hay por cobrar y cuántas están vencidas. */
export function resumenCuotas(cuotas: Cuota[]): {
  porCobrar: number;
  vencidas: number;
  enRevision: number;
} {
  let centavos = 0;
  let vencidas = 0;
  let enRevision = 0;
  for (const c of cuotas) {
    if (c.estado === 'pendiente') {
      centavos += Math.round(num(c.total_hoy) * 100);
      if (c.vencida) vencidas += 1;
    } else if (c.estado === 'en_revision') enRevision += 1;
  }
  return { porCobrar: centavos / 100, vencidas, enRevision };
}

/** Agrupa por alumno (el tutor ve una tarjeta por hijo), ordenado por período. */
export function agruparPorAlumno(
  cuotas: Cuota[],
): { alumno_id: number; alumno: string; cuotas: Cuota[] }[] {
  const mapa = new Map<
    number,
    { alumno_id: number; alumno: string; cuotas: Cuota[] }
  >();
  for (const c of cuotas) {
    const g = mapa.get(c.alumno_id) ?? {
      alumno_id: c.alumno_id,
      alumno: c.alumno,
      cuotas: [],
    };
    g.cuotas.push(c);
    mapa.set(c.alumno_id, g);
  }
  return [...mapa.values()]
    .map((g) => ({
      ...g,
      cuotas: [...g.cuotas].sort(
        (a, b) => b.periodo.localeCompare(a.periodo) || a.id - b.id,
      ),
    }))
    .sort((a, b) => a.alumno.localeCompare(b.alumno, 'es'));
}

export const tituloCuota = (c: Pick<Cuota, 'periodo' | 'clase'>): string =>
  `${c.clase} · ${nombreMes(c.periodo)}`;

// ─── Validaciones de formularios ─────────────────────────────────────────
export function validarComprobante(
  f: { name: string; size: number; type: string } | null | undefined,
): string | null {
  if (!f) return 'Subí el comprobante de pago';
  if (!(TIPOS_COMPROBANTE as readonly string[]).includes(f.type)) {
    return 'Formato no permitido: subí un JPG, PNG, WEBP o PDF';
  }
  if (f.size === 0) return 'El archivo está vacío';
  if (f.size > MAX_COMPROBANTE) return 'El comprobante pesa más de 5 MB';
  return null;
}

export function validarFechaPago(fecha: string, hoyISO: string): string | null {
  if (!fecha) return 'Indicá la fecha de pago';
  if (!esFecha(fecha)) return 'Fecha inválida';
  if (fecha > hoyISO) return 'La fecha de pago no puede ser futura';
  return null;
}

export const validarMotivo = (motivo: string): string | null => {
  const t = motivo.trim();
  if (t.length < 3) return 'Indicá el motivo del rechazo';
  if (t.length > 500) return 'El motivo admite hasta 500 caracteres';
  return null;
};

export const tamañoLegible = (bytes: number): string =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
