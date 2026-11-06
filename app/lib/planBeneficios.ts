// app/lib/planBeneficios.ts
// Beneficios de un plan a partir de sus features (las del rubro, vienen de la API).
// Lógica pura: la usan /dashboard/plan y /saas.

export interface PlanFeatures {
  canUseReports?: boolean;
  canUseBot?: boolean;
  canUseWhatsappBot?: boolean;
  canUsePedidosOnline?: boolean;
  maxProductos?: number | null;
  maxPedidosMensuales?: number | null;
  canUseInventario?: boolean;
  canUseRecetas?: boolean;
  maxStockItems?: number | null;
  [key: string]: unknown;
}

export interface OfertaPlan {
  precio_mensual: number | null;
  /** > 1 → pago único: precio_mensual es el total del período */
  duracion_meses?: number | null;
  disponible?: boolean;
  features?: PlanFeatures;
}

/** Lista de beneficios legibles. Vacía si no hay features (el caller usa su texto por defecto). */
export function beneficiosDe(features?: PlanFeatures | null): string[] {
  if (!features || !Object.keys(features).length) return [];
  const out: string[] = [];

  if (features.canUsePedidosOnline) {
    const max = features.maxPedidosMensuales;
    out.push(
      max
        ? `Link de pedidos online (hasta ${max} pedidos/mes)`
        : 'Link de pedidos online sin límite',
    );
  }
  if (features.canUsePedidosOnline) {
    const max = features.maxProductos;
    out.push(max ? `Hasta ${max} productos` : 'Productos sin límite');
  }
  if (features.canUseBot) out.push('Bot de Telegram para vos y tu equipo');
  if (features.canUseWhatsappBot) out.push('Bot de WhatsApp');
  if (features.canUseReports) out.push('Reportes');
  if (features.canUseInventario) {
    const max = features.maxStockItems;
    out.push(
      max
        ? `Inventario: stock, compras y faltantes (hasta ${max} ítems)`
        : 'Inventario: stock, compras y faltantes sin límite',
    );
    out.push(
      features.canUseRecetas
        ? 'Recetas: cada venta descuenta sus insumos'
        : 'Lo que vendés tal cual (gaseosas, bebidas) descuenta stock solo',
    );
  }
  return out;
}

/** El plan existe en el rubro y se puede contratar. */
export const esContratable = (t: OfertaPlan) => t.disponible !== false;

/** Se puede pagar: contratable y con precio cargado (un plan pago a $0 nunca va a MercadoPago). */
export const esPagable = (t: OfertaPlan) =>
  esContratable(t) && (t.precio_mensual ?? 0) > 0;

export function etiquetaPrecio(
  t: OfertaPlan | undefined,
  { gratis = false } = {},
): string {
  if (!t) return '—';
  if (!esContratable(t)) return 'Próximamente';
  const p = t.precio_mensual;
  if (p == null) return 'Consultar';
  if (p === 0) return gratis ? 'Sin costo' : 'Próximamente';
  const meses = Number(t.duracion_meses) || 1;
  const monto = `$ ${p.toLocaleString('es-AR')}`;
  return meses > 1 ? `${monto} por ${meses} meses` : `${monto} / mes`;
}

/**
 * Orden de los planes para decidir qué se puede contratar desde el panel.
 * CUSTOM (anual) queda arriba de PREMIUM: tiene lo mismo pero pagado por un año,
 * así que pasar de PREMIUM mensual al anual es válido. Al revés (o bajar de
 * plan) no se hace desde el panel: cancelar o cambiar de plan con meses ya
 * pagados lo maneja Counter a mano.
 */
const ORDEN_PLAN: Record<string, number> = { FREE: 0, BASIC: 1, PREMIUM: 2, CUSTOM: 3 };

export function puedeCambiarA(actual: string | null | undefined, destino: string): boolean {
  const a = ORDEN_PLAN[String(actual || 'FREE').toUpperCase()] ?? 0;
  const d = ORDEN_PLAN[String(destino).toUpperCase()];
  return d !== undefined && d > a;
}
