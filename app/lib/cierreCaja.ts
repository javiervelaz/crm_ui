/**
 * Cálculos del cierre de caja que se muestran en pantalla. El servidor recalcula
 * lo mismo al cerrar (model/registro_diario/db.js en crm_api): si cambia esta
 * fórmula, cambia allá también.
 *
 *   efectivo esperado = caja inicial + ventas en efectivo + otros ingresos
 *                       - egresos (salidas de caja) - gastos administrativos
 *   diferencia        = efectivo contado - efectivo esperado
 *
 * Las ventas con tarjeta o transferencia no entran al cajón, por eso se usan
 * sólo las ventas en efectivo (no el total del día).
 */

const aCentavos = (n: number) => Math.round((Number(n) || 0) * 100);

export function efectivoEsperado(p: {
  cajaInicial: number;
  ventasEfectivo: number;
  otrosIngresos: number;
  egresos: number;
  gastosAdministrativos: number;
}): number {
  const c =
    aCentavos(p.cajaInicial) +
    aCentavos(p.ventasEfectivo) +
    aCentavos(p.otrosIngresos) -
    aCentavos(p.egresos) -
    aCentavos(p.gastosAdministrativos);
  return c / 100;
}

/** null si todavía no se contó el efectivo (campo vacío). */
export function diferenciaEfectivo(
  efectivoContado: string,
  esperado: number,
): number | null {
  if (efectivoContado.trim() === '') return null;
  const contado = Number(efectivoContado);
  if (!Number.isFinite(contado)) return null;
  return (aCentavos(contado) - aCentavos(esperado)) / 100;
}
