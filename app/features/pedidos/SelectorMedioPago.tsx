'use client';

import { MedioPago, PedidoState } from './types';

interface Props {
  medioPago: MedioPago[];
  pedido: PedidoState;
  error: boolean;
  esEfectivo: boolean;
  onCambiar: (id: number) => void;
  onPagaEfectivo: (valor: number) => void;
}

export default function SelectorMedioPago({
  medioPago, pedido, error, esEfectivo, onCambiar, onPagaEfectivo,
}: Props) {
  return (
    <div>
      <label className="mb-2 block text-sm text-brand-700">Medio de pago *</label>

      <div className="flex flex-wrap gap-2">
        {medioPago.map((mp) => {
          const activo = pedido.medio_pago_id === mp.id;
          return (
            <button
              key={mp.id}
              type="button"
              onClick={() => onCambiar(mp.id)}
              aria-pressed={activo}
              className={
                'min-h-[44px] rounded-lg border px-4 py-2 text-sm font-medium transition-colors ' +
                (activo
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-brand-200 bg-white text-brand-700 hover:bg-brand-50')
              }
            >
              {mp.descripcion}
            </button>
          );
        })}
      </div>

      {error && <p className="mt-2 text-sm text-red-500">Seleccioná un medio de pago.</p>}

      {esEfectivo && (
        <div className="mt-4 rounded-lg border border-accent-400 bg-accent-400/10 p-4">
          <h3 className="mb-3 font-display font-semibold text-brand-800">Pago en efectivo</h3>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-brand-700">Paga con</label>
              <input
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={pedido.paga_efectivo}
                onChange={(e) => onPagaEfectivo(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="h-12 w-full rounded-lg border border-brand-200 px-3 text-lg"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-brand-700">Vuelto</label>
              <output className="flex h-12 w-full items-center rounded-lg bg-green-100 px-3 text-lg font-bold text-green-800">
                {'$' + pedido.vuelto_pago_efectivo.toFixed(2)}
              </output>
              <p className="mt-1 text-xs text-brand-300">
                {'Total $' + pedido.monto_total.toFixed(2) + ' · Paga $' + pedido.paga_efectivo.toFixed(2)}
              </p>
            </div>
          </div>

          {pedido.paga_efectivo < pedido.monto_total && (
            <p className="mt-2 text-sm text-red-500">
              {'Faltan $' + (pedido.monto_total - pedido.paga_efectivo).toFixed(2)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
