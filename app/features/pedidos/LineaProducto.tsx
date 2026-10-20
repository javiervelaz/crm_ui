'use client';

import { Minus, Plus, X } from 'lucide-react';
import { Producto, ProductoPedido } from './types';

interface Props {
  linea: ProductoPedido;
  index: number;
  info?: Producto;
  subtotal: number;
  onCambiar: (index: number, field: keyof ProductoPedido, value: any) => void;
  onEliminar: (index: number) => void;
}

/** Boton mas/menos. h-11 w-11 = 44px, el minimo tactil para uso en tablet. */
function Stepper({
  label, valor, onMenos, onMas, onEscribir, min = 0, max, resaltado,
}: {
  label: string; valor: number; onMenos: () => void; onMas: () => void;
  onEscribir: (v: number) => void; min?: number; max?: number; resaltado?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <label className="mb-1 text-center text-xs text-brand-300">{label}</label>
      <div className="flex items-center">
        <button
          type="button"
          onClick={onMenos}
          disabled={valor <= min}
          aria-label={'Restar ' + label}
          className="flex h-11 w-11 items-center justify-center rounded-l-lg bg-brand-100 text-brand-800 transition-colors hover:bg-brand-200 disabled:opacity-40"
        >
          <Minus size={16} />
        </button>
        <input
          type="number"
          min={min}
          max={max}
          value={valor}
          onChange={(e) => onEscribir(parseInt(e.target.value) || 0)}
          className={
            'h-11 w-14 border-y border-brand-200 text-center text-base ' +
            (resaltado ? 'bg-accent-400/20' : '')
          }
        />
        <button
          type="button"
          onClick={onMas}
          disabled={max !== undefined && valor >= max}
          aria-label={'Sumar ' + label}
          className="flex h-11 w-11 items-center justify-center rounded-r-lg bg-brand-100 text-brand-800 transition-colors hover:bg-brand-200 disabled:opacity-40"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}

export default function LineaProducto({
  linea, index, info, subtotal, onCambiar, onEliminar,
}: Props) {
  const permiteMitad = Boolean(info?.permite_mitad);

  return (
    <div className="rounded-lg border border-brand-200 bg-white p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="font-medium text-brand-800">{info?.nombre || 'Producto'}</span>
        <button
          type="button"
          onClick={() => onEliminar(index)}
          aria-label="Quitar producto"
          className="flex h-9 w-9 items-center justify-center rounded-md text-red-600 transition-colors hover:bg-red-50"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <Stepper
          label="Unidades"
          valor={linea.cantidad}
          onMenos={() => onCambiar(index, 'cantidad', Math.max(0, (linea.cantidad || 0) - 1))}
          onMas={() => onCambiar(index, 'cantidad', (linea.cantidad || 0) + 1)}
          onEscribir={(v) => onCambiar(index, 'cantidad', v)}
        />

        {permiteMitad && (
          <Stepper
            label="Medias"
            valor={linea.cantidad_mitad ?? 0}
            max={1}
            resaltado
            onMenos={() => onCambiar(index, 'cantidad_mitad', Math.max(0, (linea.cantidad_mitad || 0) - 1))}
            onMas={() => onCambiar(index, 'cantidad_mitad', Math.min(1, (linea.cantidad_mitad || 0) + 1))}
            onEscribir={(v) => onCambiar(index, 'cantidad_mitad', Math.min(Math.max(v, 0), 1))}
          />
        )}

        <div className="flex flex-col">
          <label className="mb-1 text-xs text-brand-300">Precio</label>
          <span className="flex h-11 w-24 items-center justify-center rounded-lg bg-brand-50 text-base">
            {'$' + linea.precio_unitario}
          </span>
        </div>

        <div className="flex flex-col">
          <label className="mb-1 text-xs text-brand-300">Adicional</label>
          <input
            type="number"
            value={linea.monto_adicional}
            onChange={(e) =>
              onCambiar(index, 'monto_adicional', e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)
            }
            onFocus={(e) => { if (e.target.value === '0') e.target.value = ''; }}
            onBlur={(e) => { if (e.target.value === '') onCambiar(index, 'monto_adicional', 0); }}
            className="h-11 w-24 rounded-lg border border-brand-200 px-2 text-base"
          />
        </div>

        <div className="ml-auto flex flex-col">
          <label className="mb-1 text-xs text-brand-300">Subtotal</label>
          <span className="flex h-11 w-28 items-center justify-center rounded-lg bg-brand-50 text-base font-semibold text-brand-800">
            {'$' + subtotal.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="mt-3">
        <label className="mb-1 block text-xs text-brand-300">Observaciones (opcional)</label>
        <textarea
          rows={2}
          placeholder="Ej: sin mucho queso, bien cocida..."
          value={linea.observaciones || ''}
          onChange={(e) => onCambiar(index, 'observaciones', e.target.value)}
          className="w-full resize-y rounded-lg border border-brand-200 px-2 py-1.5 text-sm"
        />
      </div>

      {permiteMitad && linea.cantidad_mitad > 0 && (
        <p className="mt-2 text-xs font-semibold text-green-600">Incluye media unidad</p>
      )}
    </div>
  );
}
