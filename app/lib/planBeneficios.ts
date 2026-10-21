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
  [key: string]: unknown;
}

export interface OfertaPlan {
  precio_mensual: number | null;
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
  return `$ ${p.toLocaleString('es-AR')} / mes`;
}
