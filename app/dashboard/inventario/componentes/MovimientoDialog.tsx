'use client';

import Dialog from '@/components/ui/Dialog';
import SelectMedioPagoGasto from '@/app/ui/dashboard/operaciones/admin/components/gastos/SelectMedioPagoGasto';
import { getGastosConfig } from '@/app/lib/gastosSinCaja.api';
import {
  formatCantidad,
  formatPesos,
  parseNumero,
  unidadesDeIngreso,
  UnidadIngreso,
  validarCantidad,
} from '@/app/lib/inventario';
import {
  codigoError,
  mensajeError,
  MovimientoInput,
  registrarMovimiento,
  StockItem,
} from '@/app/lib/inventario.api';
import { getMedioPagoList } from '@/app/lib/mediopago.api';
import { medioDeFila, MedioPagoOpcion } from '@/app/lib/medioPagoGasto';
import { notifySuccess } from '@/app/lib/notificationService';
import useCajaAbierta from '@/app/lib/useCajaAbierta';
import { Plus, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export type TipoAccion = 'compra' | 'ajuste' | 'merma';

const TITULOS: Record<TipoAccion, string> = {
  compra: 'Cargar compra',
  ajuste: 'Contar stock',
  merma: 'Registrar merma',
};

const MOTIVOS_MERMA = [
  'Se venció',
  'Se rompió',
  'Consumo del personal',
  'Error de preparación',
];

const campo =
  'w-full min-h-[44px] rounded-lg border border-brand-200 bg-white px-3 text-base text-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-600/20';

/** Buscador de ítems con alta al vuelo ("Crear 'Queso rallado'"). */
function ItemPicker({
  items,
  onElegir,
  onCrear,
}: {
  items: StockItem[];
  onElegir: (item: StockItem) => void;
  onCrear: (nombre: string) => void;
}) {
  const [q, setQ] = useState('');
  const filtro = q.trim().toLowerCase();
  const visibles = useMemo(
    () =>
      (filtro
        ? items.filter((i) => i.nombre.toLowerCase().includes(filtro))
        : items
      ).slice(0, 8),
    [items, filtro],
  );
  const exacto = items.some((i) => i.nombre.toLowerCase() === filtro);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search
          size={18}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-300"
        />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="¿Qué compraste? Ej: mozzarella"
          className={`${campo} pl-10`}
        />
      </div>
      <ul className="divide-y divide-brand-50 rounded-lg border border-brand-100">
        {visibles.map((i) => (
          <li key={i.id}>
            <button
              type="button"
              onClick={() => onElegir(i)}
              className="flex min-h-[48px] w-full items-center justify-between px-3 text-left hover:bg-brand-50"
            >
              <span className="font-medium text-brand-800">{i.nombre}</span>
              <span className="text-sm text-brand-300">
                {formatCantidad(i.stock, i.unidad)}
              </span>
            </button>
          </li>
        ))}
        {filtro && !exacto && (
          <li>
            <button
              type="button"
              onClick={() => onCrear(q.trim())}
              className="flex min-h-[48px] w-full items-center gap-2 px-3 text-left font-medium text-brand-600 hover:bg-brand-50"
            >
              <Plus size={18} /> Crear “{q.trim()}”
            </button>
          </li>
        )}
        {!visibles.length && !filtro && (
          <li className="px-3 py-4 text-sm text-brand-300">
            Todavía no cargaste ítems. Escribí el nombre para crear el primero.
          </li>
        )}
      </ul>
    </div>
  );
}

/**
 * Compra, conteo o merma de un ítem. Si no viene `item`, primero se elige
 * (o se crea) en el mismo diálogo.
 */
export default function MovimientoDialog({
  tipo,
  item: itemInicial,
  items,
  onClose,
  onRegistrado,
  onCrearItem,
}: {
  tipo: TipoAccion;
  item?: StockItem | null;
  items: StockItem[];
  onClose: () => void;
  onRegistrado: (item: StockItem) => void;
  onCrearItem: (nombre: string) => void;
}) {
  const [item, setItem] = useState<StockItem | null>(itemInicial ?? null);
  const unidades = item ? unidadesDeIngreso(item.unidad) : [];
  const [unidad, setUnidad] = useState<UnidadIngreso | null>(
    item?.unidad ?? null,
  );
  const [cantidad, setCantidad] = useState('');
  const [costo, setCosto] = useState('');
  const [nota, setNota] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Gasto en caja: sólo para compras
  const { cajaAbierta, loading: cargandoCaja } = useCajaAbierta();
  const [requiereCaja, setRequiereCaja] = useState<boolean | null>(null);
  const [registrarGasto, setRegistrarGasto] = useState(false);
  const [tocoGasto, setTocoGasto] = useState(false);
  const [medios, setMedios] = useState<MedioPagoOpcion[]>([]);
  const [medio, setMedio] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (tipo !== 'compra') return;
    getGastosConfig()
      .then((c) => setRequiereCaja(c.requiereCaja))
      .catch(() => setRequiereCaja(true));
    getMedioPagoList()
      .then((m: MedioPagoOpcion[]) => setMedios(Array.isArray(m) ? m : []))
      .catch(() => setMedios([]));
  }, [tipo]);

  const puedeGasto = requiereCaja === false || cajaAbierta;
  // Marcado por defecto cuando se puede, hasta que el usuario lo toque
  useEffect(() => {
    if (!tocoGasto && requiereCaja !== null && !cargandoCaja)
      setRegistrarGasto(puedeGasto);
  }, [puedeGasto, requiereCaja, cargandoCaja, tocoGasto]);

  useEffect(() => {
    setUnidad(item?.unidad ?? null);
  }, [item]);

  const elegir = (i: StockItem) => {
    setItem(i);
    setError(null);
  };

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item || !unidad) return;
    const v = validarCantidad(cantidad, { permitirCero: tipo === 'ajuste' });
    if (!v.ok) return setError(v.error!);

    let input: MovimientoInput;
    if (tipo === 'compra') {
      const costo_total = costo.trim() === '' ? null : parseNumero(costo);
      if (costo.trim() !== '' && (costo_total === null || costo_total < 0))
        return setError('El costo tiene que ser un número');
      if (registrarGasto && !(costo_total && costo_total > 0))
        return setError('Para registrarlo como gasto poné cuánto pagaste');
      input = {
        tipo,
        stock_item_id: item.id,
        cantidad: v.valor!,
        unidad,
        costo_total,
        registrar_gasto: registrarGasto,
        medio_pago_id: registrarGasto
          ? (medioDeFila(medio, medios) ?? null)
          : null,
        nota: nota.trim() || null,
      };
    } else if (tipo === 'merma') {
      input = {
        tipo,
        stock_item_id: item.id,
        cantidad: v.valor!,
        unidad,
        nota: nota.trim() || null,
      };
    } else {
      input = {
        tipo,
        stock_item_id: item.id,
        contado: v.valor!,
        unidad,
        nota: nota.trim() || null,
      };
    }

    setGuardando(true);
    setError(null);
    try {
      const r = await registrarMovimiento(input);
      if (r.sin_cambios)
        notifySuccess('El stock ya estaba bien: no hubo cambios');
      else if (r.gasto) notifySuccess('Compra cargada y registrada como gasto');
      else
        notifySuccess(
          tipo === 'compra'
            ? 'Compra cargada'
            : tipo === 'merma'
              ? 'Merma registrada'
              : 'Stock corregido',
        );
      onRegistrado(r.item);
    } catch (err: any) {
      if (codigoError(err) === 'CAJA_CERRADA') {
        setRegistrarGasto(false);
        setTocoGasto(true);
      }
      if (err?.response?.status !== 403)
        setError(mensajeError(err, 'No se pudo registrar.'));
    } finally {
      setGuardando(false);
    }
  };

  const etiquetaCantidad =
    tipo === 'ajuste'
      ? '¿Cuánto hay ahora?'
      : tipo === 'merma'
        ? '¿Cuánto se perdió?'
        : '¿Cuánto compraste?';

  return (
    <Dialog titulo={TITULOS[tipo]} onClose={onClose} bloquear={guardando}>
      {!item ? (
        <ItemPicker items={items} onElegir={elegir} onCrear={onCrearItem} />
      ) : (
        <form onSubmit={enviar} className="space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-brand-50 px-3 py-2">
            <div>
              <p className="font-semibold text-brand-800">{item.nombre}</p>
              <p className="text-sm text-brand-300">
                Hay {formatCantidad(item.stock, item.unidad)}
              </p>
            </div>
            {!itemInicial && (
              <button
                type="button"
                onClick={() => setItem(null)}
                className="min-h-[44px] px-2 text-sm text-brand-600 underline"
              >
                Cambiar
              </button>
            )}
          </div>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-brand-700">
              {etiquetaCantidad}
            </span>
            <div className="flex gap-2">
              <input
                autoFocus
                inputMode="decimal"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                placeholder="0"
                className={campo}
              />
              {unidades.length > 1 ? (
                <div
                  className="flex shrink-0 overflow-hidden rounded-lg border border-brand-200"
                  role="group"
                  aria-label="Unidad"
                >
                  {unidades.map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setUnidad(u)}
                      aria-pressed={unidad === u}
                      className={`min-h-[44px] w-12 text-sm font-medium ${unidad === u ? 'bg-brand-600 text-white' : 'bg-white text-brand-700'}`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              ) : (
                <span className="flex w-12 shrink-0 items-center justify-center text-sm text-brand-300">
                  {item.unidad}
                </span>
              )}
            </div>
          </label>

          {tipo === 'compra' && (
            <>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-brand-700">
                  ¿Cuánto pagaste en total?{' '}
                  <span className="font-normal text-brand-300">(opcional)</span>
                </span>
                <input
                  inputMode="decimal"
                  value={costo}
                  onChange={(e) => setCosto(e.target.value)}
                  placeholder="$ 0"
                  className={campo}
                />
              </label>

              <div className="rounded-lg border border-brand-100 p-3">
                <label className="flex min-h-[44px] items-center gap-3 text-sm text-brand-800">
                  <input
                    type="checkbox"
                    checked={registrarGasto}
                    disabled={!puedeGasto}
                    onChange={(e) => {
                      setTocoGasto(true);
                      setRegistrarGasto(e.target.checked);
                    }}
                    className="h-5 w-5 rounded border-brand-200 text-brand-600 disabled:opacity-40"
                  />
                  <span>
                    Registrar como gasto en caja
                    {registrarGasto && parseNumero(costo) ? (
                      <span className="block text-xs text-brand-300">
                        Sale {formatPesos(parseNumero(costo))} como gasto
                        variable
                      </span>
                    ) : null}
                  </span>
                </label>
                {!puedeGasto && !cargandoCaja && requiereCaja !== null && (
                  <p className="mt-1 text-xs text-amber-700">
                    Con la caja cerrada la compra se carga sólo en el stock.
                  </p>
                )}
                {registrarGasto && medios.length > 0 && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-brand-700">
                    <span>Pagado con</span>
                    <SelectMedioPagoGasto
                      medios={medios}
                      value={medio}
                      onChange={setMedio}
                      className="min-h-[40px]"
                    />
                  </div>
                )}
              </div>
            </>
          )}

          {tipo === 'merma' && (
            <div className="flex flex-wrap gap-2">
              {MOTIVOS_MERMA.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setNota(m)}
                  aria-pressed={nota === m}
                  className={`min-h-[36px] rounded-full border px-3 text-sm ${
                    nota === m
                      ? 'border-brand-600 bg-brand-600 text-white'
                      : 'border-brand-200 text-brand-700'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          )}

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-brand-700">
              Nota{' '}
              <span className="font-normal text-brand-300">(opcional)</span>
            </span>
            <input
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              maxLength={200}
              className={campo}
            />
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
            {guardando ? 'Guardando…' : TITULOS[tipo]}
          </button>
        </form>
      )}
    </Dialog>
  );
}
