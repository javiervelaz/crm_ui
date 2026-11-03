'use client';

import Dialog from '@/components/ui/Dialog';
import EmptyState from '@/components/ui/EmptyState';
import {
  ESTADOS,
  formatCantidad,
  formatCostoUnitario,
  ordenarPorUrgencia,
} from '@/app/lib/inventario';
import {
  darDeBajaItem,
  getItems,
  mensajeError,
  StockItem,
} from '@/app/lib/inventario.api';
import { notifySuccess } from '@/app/lib/notificationService';
import {
  Boxes,
  ClipboardCheck,
  PackageMinus,
  Pencil,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ItemDialog from './ItemDialog';
import MovimientoDialog, { TipoAccion } from './MovimientoDialog';
import MovimientosLista from './MovimientosLista';
import RecetasLista from './RecetasLista';
import { useClientePlan } from '@/app/lib/useClientePlan';
import { usePermisos } from '@/app/lib/permisos';

type Pestana = 'stock' | 'movimientos' | 'recetas';

const PESTANAS: { key: Pestana; label: string }[] = [
  { key: 'stock', label: 'Stock' },
  { key: 'recetas', label: 'Recetas' },
  { key: 'movimientos', label: 'Movimientos' },
];

type Modal =
  | { tipo: 'movimiento'; accion: TipoAccion; item: StockItem | null }
  | {
      tipo: 'item';
      item: StockItem | null;
      nombreInicial?: string;
      luego?: TipoAccion;
    }
  | { tipo: 'acciones'; item: StockItem }
  | { tipo: 'baja'; item: StockItem }
  | null;

function FilaItem({ item, onClick }: { item: StockItem; onClick: () => void }) {
  const e = ESTADOS[item.estado];
  const costo = formatCostoUnitario(item.costo_unitario, item.unidad);
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="flex min-h-[64px] w-full items-center gap-3 px-4 py-3 text-left hover:bg-brand-50"
      >
        <span
          className={`h-2.5 w-2.5 shrink-0 rounded-full ${e.punto}`}
          aria-hidden
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium text-brand-800">
            {item.nombre}
          </span>
          <span className="block text-xs text-brand-300">
            {item.stock_minimo != null
              ? `Mínimo ${formatCantidad(item.stock_minimo, item.unidad)}`
              : 'Sin mínimo'}
            {costo ? ` · ${costo}` : ''}
          </span>
        </span>
        <span className="shrink-0 text-right">
          <span className="block font-semibold tabular-nums text-brand-800">
            {formatCantidad(item.stock, item.unidad)}
          </span>
          {item.estado !== 'ok' && (
            <span
              className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${e.chip}`}
            >
              {e.label}
            </span>
          )}
        </span>
      </button>
    </li>
  );
}

function BotonAccion({
  icon: Icon,
  label,
  onClick,
  primario = false,
}: {
  icon: any;
  label: string;
  onClick: () => void;
  primario?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl text-xs font-semibold sm:flex-row sm:gap-2 sm:text-sm ${
        primario
          ? 'bg-brand-600 text-white hover:bg-brand-700'
          : 'border border-brand-200 bg-white text-brand-700 hover:bg-brand-50'
      }`}
    >
      <Icon size={20} />
      {label}
    </button>
  );
}

export default function InventarioPage() {
  const [pestana, setPestana] = useState<Pestana>('stock');
  const [items, setItems] = useState<StockItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [soloBajos, setSoloBajos] = useState(false);
  const [modal, setModal] = useState<Modal>(null);
  const [versionMovs, setVersionMovs] = useState(0);
  const { plan } = useClientePlan();
  const puedeRecetas = plan?.features?.canUseRecetas === true;
  // Un empleado carga compras, mermas y conteos; editar ítems, darlos de baja
  // y armar recetas queda para quien tenga esos permisos (la API igual los pide).
  const { puede } = usePermisos();
  const puedeEditar = puede('inventario.update');
  const puedeBorrar = puede('inventario.delete');

  const cargar = useCallback(async () => {
    try {
      setError(null);
      setItems(await getItems());
    } catch (err) {
      setError(mensajeError(err, 'No se pudo cargar el stock.'));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const alertas = useMemo(
    () => items.filter((i) => i.estado !== 'ok').length,
    [items],
  );
  const visibles = useMemo(() => {
    const f = q.trim().toLowerCase();
    return ordenarPorUrgencia(
      items.filter(
        (i) =>
          (!soloBajos || i.estado !== 'ok') &&
          (!f || i.nombre.toLowerCase().includes(f)),
      ),
    );
  }, [items, q, soloBajos]);

  /** Reemplaza el ítem en la lista sin recargar todo. */
  const actualizarEnLista = (item: StockItem) => {
    setItems((prev) =>
      prev.some((i) => i.id === item.id)
        ? prev.map((i) => (i.id === item.id ? item : i))
        : [...prev, item],
    );
    setVersionMovs((v) => v + 1);
  };

  const abrir = (accion: TipoAccion, item: StockItem | null = null) =>
    setModal({ tipo: 'movimiento', accion, item });

  const confirmarBaja = async (item: StockItem) => {
    try {
      await darDeBajaItem(item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      notifySuccess(`${item.nombre} dado de baja`);
      setModal(null);
    } catch (err: any) {
      if (err?.response?.status !== 403)
        setError(mensajeError(err, 'No se pudo dar de baja.'));
    }
  };

  return (
    <main className="mx-auto max-w-3xl pb-28 sm:pb-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-brand-800">
            Inventario
          </h1>
          <p className="mt-1 text-sm text-brand-300">
            Qué tenés, qué te falta y cuánto te costó.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModal({ tipo: 'item', item: null })}
          className="inline-flex min-h-[44px] shrink-0 items-center gap-1 rounded-lg border border-brand-200 bg-white px-3 text-sm font-medium text-brand-700 hover:bg-brand-50"
        >
          <Plus size={18} /> Ítem
        </button>
      </div>

      <div
        className="mb-4 flex gap-1 rounded-xl bg-brand-50 p-1"
        role="tablist"
      >
        {PESTANAS.map(({ key: p, label }) => (
          <button
            key={p}
            role="tab"
            aria-selected={pestana === p}
            onClick={() => setPestana(p)}
            className={`min-h-[40px] flex-1 rounded-lg text-sm font-medium ${pestana === p ? 'bg-white text-brand-800 shadow-card' : 'text-brand-300'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <p className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {pestana === 'stock' ? (
        cargando ? (
          <p className="text-sm text-brand-300">Cargando…</p>
        ) : !items.length ? (
          <EmptyState
            icono={Boxes}
            titulo="Todavía no cargaste stock"
            mensaje="Empezá por lo que más te importa controlar: el queso, la harina, las bebidas. Cargá la compra y el stock arranca solo."
            accion={{
              label: 'Cargar primera compra',
              onClick: () => abrir('compra'),
            }}
          />
        ) : (
          <>
            <div className="mb-3 flex gap-2">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-300"
                />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Buscar"
                  aria-label="Buscar ítem"
                  className="min-h-[44px] w-full rounded-lg border border-brand-200 bg-white pl-10 pr-3 text-base text-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
                />
              </div>
              <button
                type="button"
                onClick={() => setSoloBajos((v) => !v)}
                aria-pressed={soloBajos}
                disabled={!alertas && !soloBajos}
                className={`min-h-[44px] shrink-0 rounded-lg border px-3 text-sm font-medium disabled:opacity-40 ${
                  soloBajos
                    ? 'border-amber-500 bg-amber-50 text-amber-800'
                    : 'border-brand-200 bg-white text-brand-700'
                }`}
              >
                Para comprar{alertas ? ` (${alertas})` : ''}
              </button>
            </div>
            {visibles.length ? (
              <ul className="divide-y divide-brand-50 rounded-xl border border-brand-100 bg-white shadow-card">
                {visibles.map((i) => (
                  <FilaItem
                    key={i.id}
                    item={i}
                    onClick={() => setModal({ tipo: 'acciones', item: i })}
                  />
                ))}
              </ul>
            ) : (
              <p className="py-8 text-center text-sm text-brand-300">
                Nada coincide con la búsqueda.
              </p>
            )}
          </>
        )
      ) : pestana === 'recetas' ? (
        <RecetasLista
          items={items}
          puedeRecetas={puedeRecetas}
          puedeEditar={puedeEditar}
          onCambio={() => setVersionMovs((v) => v + 1)}
        />
      ) : (
        <MovimientosLista version={versionMovs} />
      )}

      {/* Acciones rápidas: fijas abajo en el celular, en línea en desktop */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-brand-100 bg-white/95 p-3 backdrop-blur sm:static sm:mt-5 sm:border-0 sm:bg-transparent sm:p-0">
        <div className="mx-auto flex max-w-3xl gap-2">
          <BotonAccion
            icon={ShoppingBag}
            label="Compra"
            primario
            onClick={() => abrir('compra')}
          />
          <BotonAccion
            icon={ClipboardCheck}
            label="Contar"
            onClick={() => abrir('ajuste')}
          />
          <BotonAccion
            icon={PackageMinus}
            label="Merma"
            onClick={() => abrir('merma')}
          />
        </div>
      </div>

      {modal?.tipo === 'movimiento' && (
        <MovimientoDialog
          tipo={modal.accion}
          item={modal.item}
          items={items}
          onClose={() => setModal(null)}
          onRegistrado={(item) => {
            actualizarEnLista(item);
            setModal(null);
          }}
          onCrearItem={(nombre) =>
            setModal({
              tipo: 'item',
              item: null,
              nombreInicial: nombre,
              luego: modal.accion,
            })
          }
        />
      )}

      {modal?.tipo === 'item' && (
        <ItemDialog
          item={modal.item}
          nombreInicial={modal.nombreInicial}
          onClose={() => setModal(null)}
          onGuardado={(item) => {
            actualizarEnLista(item);
            // Creado al vuelo desde una compra: se vuelve a la compra con el ítem elegido
            setModal(
              modal.luego
                ? { tipo: 'movimiento', accion: modal.luego, item }
                : null,
            );
          }}
        />
      )}

      {modal?.tipo === 'acciones' && (
        <Dialog
          titulo={modal.item.nombre}
          onClose={() => setModal(null)}
          ancho="max-w-sm"
        >
          <p className="-mt-2 mb-4 text-sm text-brand-300">
            Hay {formatCantidad(modal.item.stock, modal.item.unidad)}
          </p>
          <div className="grid gap-2">
            {(
              [
                [
                  ShoppingBag,
                  'Cargar compra',
                  () => abrir('compra', modal.item),
                ],
                [ClipboardCheck, 'Contar', () => abrir('ajuste', modal.item)],
                [
                  PackageMinus,
                  'Registrar merma',
                  () => abrir('merma', modal.item),
                ],
                ...(puedeEditar
                  ? ([
                      [
                        Pencil,
                        'Editar',
                        () => setModal({ tipo: 'item', item: modal.item }),
                      ],
                    ] as const)
                  : []),
                ...(puedeBorrar
                  ? ([
                      [
                        Trash2,
                        'Dar de baja',
                        () => setModal({ tipo: 'baja', item: modal.item }),
                      ],
                    ] as const)
                  : []),
              ] as const
            ).map(([Icon, label, fn]) => (
              <button
                key={label}
                type="button"
                onClick={fn}
                className={`flex min-h-[48px] items-center gap-3 rounded-lg border px-3 text-left text-sm font-medium hover:bg-brand-50 ${
                  label === 'Dar de baja'
                    ? 'border-red-100 text-red-700'
                    : 'border-brand-100 text-brand-800'
                }`}
              >
                <Icon size={18} /> {label}
              </button>
            ))}
          </div>
        </Dialog>
      )}

      {modal?.tipo === 'baja' && (
        <Dialog
          titulo={`¿Dar de baja ${modal.item.nombre}?`}
          onClose={() => setModal(null)}
          ancho="max-w-sm"
        >
          <p className="mb-4 text-sm text-brand-600">
            Deja de aparecer en la lista y en las alertas. El historial de
            movimientos se conserva.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setModal(null)}
              className="min-h-[44px] flex-1 rounded-lg border border-brand-200 text-sm text-brand-700"
            >
              Cancelar
            </button>
            <button
              onClick={() => confirmarBaja(modal.item)}
              className="min-h-[44px] flex-1 rounded-lg bg-red-600 text-sm font-semibold text-white hover:bg-red-700"
            >
              Dar de baja
            </button>
          </div>
        </Dialog>
      )}
    </main>
  );
}
