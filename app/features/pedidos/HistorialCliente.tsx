'use client';

import { ClienteEstadistica } from './types';

export default function HistorialCliente({ data }: { data: ClienteEstadistica }) {
  if (data.cantidad_pedidos === 0) return null;

  return (
    <div className="rounded-lg border border-brand-200 bg-brand-50 p-4">
      <h3 className="mb-3 font-display font-semibold text-brand-800">Historial del cliente</h3>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded bg-white p-2 text-center shadow-sm">
          <div className="text-2xl font-bold text-brand-600">{data.cantidad_pedidos}</div>
          <div className="text-xs text-brand-600">Pedidos totales</div>
        </div>

        <div className="rounded bg-white p-2 text-center shadow-sm">
          <div className="text-xl font-bold text-green-600">
            {'$' + data.total_gastado.toFixed(2)}
          </div>
          <div className="text-xs text-green-500">Total gastado</div>
        </div>

        <div className="rounded bg-white p-2 text-center shadow-sm">
          <div className="text-sm font-semibold text-brand-800">
            {data.ultima_compra
              ? new Date(data.ultima_compra).toLocaleDateString('es-AR')
              : 'Nunca'}
          </div>
          <div className="text-xs text-brand-300">Ultima compra</div>
        </div>

        {data.top_medio_pago && (
          <div className="rounded bg-white p-2 text-center shadow-sm">
            <div className="text-sm font-semibold text-brand-600">
              {data.top_medio_pago.medio_pago_descripcion}
            </div>
            <div className="text-xs text-brand-300">Medio favorito</div>
          </div>
        )}
      </div>

      {data.top_3_productos.length > 0 && (
        <div className="mt-4">
          <h4 className="mb-2 text-sm font-medium text-brand-700">Productos frecuentes</h4>
          <div className="flex flex-wrap gap-2">
            {data.top_3_productos.map((p) => (
              <span
                key={p.producto_id}
                className="inline-flex items-center rounded-full bg-brand-100 px-2 py-1 text-xs text-brand-800"
              >
                {p.producto_nombre} ({p.cantidad_total} und)
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
