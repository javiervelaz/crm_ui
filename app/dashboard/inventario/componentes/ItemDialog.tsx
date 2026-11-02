'use client';

import Dialog from '@/components/ui/Dialog';
import { notifySuccess } from '@/app/lib/notificationService';
import {
  parseNumero,
  TipoItem,
  UNIDADES,
  UnidadItem,
} from '@/app/lib/inventario';
import {
  actualizarItem,
  crearItem,
  mensajeError,
  StockItem,
} from '@/app/lib/inventario.api';
import { useState } from 'react';

const campo =
  'w-full min-h-[44px] rounded-lg border border-brand-200 bg-white px-3 text-base text-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-600/20 disabled:bg-brand-50 disabled:text-brand-300';

/** Alta y edición de un ítem. La unidad sólo se elige al crear. */
export default function ItemDialog({
  item,
  nombreInicial = '',
  onClose,
  onGuardado,
}: {
  item?: StockItem | null;
  nombreInicial?: string;
  onClose: () => void;
  onGuardado: (item: StockItem) => void;
}) {
  const editando = !!item;
  const [nombre, setNombre] = useState(item?.nombre ?? nombreInicial);
  const [tipo, setTipo] = useState<TipoItem>(item?.tipo ?? 'insumo');
  const [unidad, setUnidad] = useState<UnidadItem>(item?.unidad ?? 'kg');
  const [minimo, setMinimo] = useState(
    item?.stock_minimo != null
      ? String(item.stock_minimo).replace('.', ',')
      : '',
  );
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    const limpio = nombre.trim();
    if (!limpio) return setError('Poné un nombre');
    const stock_minimo = minimo.trim() === '' ? null : parseNumero(minimo);
    if (minimo.trim() !== '' && (stock_minimo === null || stock_minimo < 0)) {
      return setError('El mínimo tiene que ser un número positivo');
    }

    setGuardando(true);
    setError(null);
    try {
      const guardado = editando
        ? await actualizarItem(item!.id, { nombre: limpio, tipo, stock_minimo })
        : await crearItem({ nombre: limpio, tipo, unidad, stock_minimo });
      notifySuccess(editando ? 'Ítem actualizado' : 'Ítem creado');
      onGuardado(guardado);
    } catch (err: any) {
      // Los 403 (plan, límite, permiso) ya los muestra el interceptor de apiClient
      if (err?.response?.status !== 403)
        setError(mensajeError(err, 'No se pudo guardar el ítem.'));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Dialog
      titulo={editando ? 'Editar ítem' : 'Nuevo ítem'}
      onClose={onClose}
      bloquear={guardando}
    >
      <form onSubmit={guardar} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-brand-700">
            Nombre
          </span>
          <input
            autoFocus
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            maxLength={120}
            placeholder="Ej: Mozzarella"
            className={campo}
          />
        </label>

        <fieldset>
          <legend className="mb-1 block text-sm font-medium text-brand-700">
            Se mide en
          </legend>
          <div className="grid grid-cols-3 gap-2">
            {UNIDADES.map((u) => (
              <button
                key={u.value}
                type="button"
                disabled={editando}
                onClick={() => setUnidad(u.value)}
                aria-pressed={unidad === u.value}
                className={`min-h-[44px] rounded-lg border text-sm font-medium transition-colors disabled:opacity-50 ${
                  unidad === u.value
                    ? 'border-brand-600 bg-brand-600 text-white'
                    : 'border-brand-200 bg-white text-brand-700 hover:bg-brand-50'
                }`}
              >
                {u.label}
              </button>
            ))}
          </div>
          {editando && (
            <p className="mt-1 text-xs text-brand-300">
              La unidad no se cambia: cambiaría el sentido de todo el historial.
            </p>
          )}
        </fieldset>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-brand-700">
            Avisarme cuando baje de{' '}
            <span className="font-normal text-brand-300">(opcional)</span>
          </span>
          <div className="flex items-center gap-2">
            <input
              inputMode="decimal"
              value={minimo}
              onChange={(e) => setMinimo(e.target.value)}
              placeholder="Ej: 5"
              className={campo}
            />
            <span className="w-8 text-sm text-brand-300">
              {editando ? item!.unidad : unidad}
            </span>
          </div>
        </label>

        <label className="flex min-h-[44px] items-center gap-3 text-sm text-brand-700">
          <input
            type="checkbox"
            checked={tipo === 'producto'}
            onChange={(e) => setTipo(e.target.checked ? 'producto' : 'insumo')}
            className="h-5 w-5 rounded border-brand-200 text-brand-600"
          />
          Es un producto que vendo tal cual (gaseosa, cerveza)
        </label>

        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={guardando}
          className="min-h-[48px] w-full rounded-lg bg-brand-600 text-base font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {guardando
            ? 'Guardando…'
            : editando
              ? 'Guardar cambios'
              : 'Crear ítem'}
        </button>
      </form>
    </Dialog>
  );
}
