'use client';

import Dialog from '@/components/ui/Dialog';
import {
  cantidadParaEditar,
  esVinculable,
  parseNumero,
  unidadesDeIngreso,
  UnidadIngreso,
} from '@/app/lib/inventario';
import {
  guardarReceta,
  LineaRecetaInput,
  mensajeError,
  ProductoConReceta,
  StockItem,
} from '@/app/lib/inventario.api';
import { notifySuccess } from '@/app/lib/notificationService';
import { Lock, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

interface Fila {
  key: number;
  stock_item_id: number | null;
  valor: string;
  unidad: UnidadIngreso | null;
}

const campo =
  'min-h-[44px] rounded-lg border border-brand-200 bg-white px-3 text-base text-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-600/20';

let siguienteKey = 1;

/**
 * Receta de un producto: cuánto de cada ítem consume UNA unidad vendida.
 * Con `puedeRecetas` (Premium) lleva cualquier insumo; sin él sólo se vincula
 * un producto terminado 1:1 con su ítem de stock.
 */
export default function RecetaDialog({
  producto,
  items,
  puedeRecetas,
  onClose,
  onGuardado,
}: {
  producto: ProductoConReceta;
  items: StockItem[];
  puedeRecetas: boolean;
  onClose: () => void;
  onGuardado: () => void;
}) {
  const router = useRouter();
  const itemPorId = useMemo(
    () => new Map(items.map((i) => [i.id, i])),
    [items],
  );
  const activos = useMemo(() => items.filter((i) => i.activo), [items]);
  const vinculables = useMemo(() => activos.filter(esVinculable), [activos]);

  const [filas, setFilas] = useState<Fila[]>(() =>
    producto.receta.length
      ? producto.receta.map((l) => ({
          key: siguienteKey++,
          stock_item_id: l.stock_item_id,
          ...cantidadParaEditar(l.cantidad_por_unidad, l.unidad),
        }))
      : [{ key: siguienteKey++, stock_item_id: null, valor: '', unidad: null }],
  );
  // Modo 1:1 (plan sin recetas): un solo ítem, cantidad fija 1
  const actualVinculo =
    producto.receta.length === 1 && esVinculable(producto.receta[0])
      ? producto.receta[0].stock_item_id
      : null;
  const [vinculo, setVinculo] = useState<number | null>(actualVinculo);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Una receta con insumos cargada antes de bajar de plan: se muestra, no se edita
  const recetaFueraDePlan =
    !puedeRecetas && producto.receta.length > 0 && actualVinculo === null;

  const cambiar = (key: number, cambios: Partial<Fila>) =>
    setFilas((prev) =>
      prev.map((f) => (f.key === key ? { ...f, ...cambios } : f)),
    );

  const elegirItem = (key: number, id: number) => {
    const item = itemPorId.get(id);
    cambiar(key, {
      stock_item_id: id,
      unidad: item
        ? item.unidad === 'u'
          ? 'u'
          : item.unidad === 'kg'
            ? 'g'
            : 'ml'
        : null,
    });
  };

  const enviar = async (lineas: LineaRecetaInput[]) => {
    setGuardando(true);
    setError(null);
    try {
      await guardarReceta(producto.id, lineas);
      notifySuccess(lineas.length ? 'Receta guardada' : 'Receta quitada');
      onGuardado();
    } catch (err: any) {
      // Los 403 (plan, permiso) ya los muestra el interceptor de apiClient
      if (err?.response?.status !== 403)
        setError(mensajeError(err, 'No se pudo guardar la receta.'));
    } finally {
      setGuardando(false);
    }
  };

  const guardar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!puedeRecetas)
      return enviar(vinculo ? [{ stock_item_id: vinculo, cantidad: 1 }] : []);

    const usadas = filas.filter(
      (f) => f.stock_item_id !== null || f.valor.trim() !== '',
    );
    const lineas: LineaRecetaInput[] = [];
    const vistos = new Set<number>();
    for (const f of usadas) {
      const item = f.stock_item_id ? itemPorId.get(f.stock_item_id) : null;
      if (!item) return setError('Elegí el ingrediente de cada línea');
      if (vistos.has(item.id))
        return setError(`"${item.nombre}" está repetido`);
      vistos.add(item.id);
      const n = parseNumero(f.valor);
      if (n === null || !(n > 0))
        return setError(`Poné cuánto lleva de ${item.nombre}`);
      lineas.push({
        stock_item_id: item.id,
        cantidad: n,
        unidad: f.unidad ?? item.unidad,
      });
    }
    return enviar(lineas);
  };

  return (
    <Dialog
      titulo={`Receta: ${producto.nombre}`}
      onClose={onClose}
      bloquear={guardando}
    >
      <form onSubmit={guardar} className="space-y-4">
        {!puedeRecetas ? (
          <>
            <p className="text-sm text-brand-600">
              Si vendés este producto tal cual (una gaseosa, una cerveza),
              vinculalo con su ítem de stock y cada venta lo descuenta solo.
            </p>
            {vinculables.length ? (
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-brand-700">
                  Ítem de stock
                </span>
                <select
                  value={vinculo ?? ''}
                  onChange={(e) =>
                    setVinculo(e.target.value ? Number(e.target.value) : null)
                  }
                  className={`${campo} w-full`}
                >
                  <option value="">No descuenta stock</option>
                  {vinculables.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.nombre}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <p className="rounded-lg bg-brand-50 p-3 text-sm text-brand-600">
                Primero creá el ítem en Stock, medido en unidades y marcado como
                “producto que vendo tal cual”.
              </p>
            )}
            {recetaFueraDePlan && (
              <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                Este producto tiene una receta con insumos de un plan anterior.
                Sigue descontando, pero para editarla necesitás Premium.
              </p>
            )}
            <div className="flex items-start gap-3 rounded-lg border border-brand-100 p-3">
              <Lock size={18} className="mt-0.5 shrink-0 text-brand-600" />
              <div className="text-sm">
                <p className="font-medium text-brand-800">
                  Recetas con insumos
                </p>
                <p className="text-brand-300">
                  Con Premium cada pizza descuenta su mozzarella, masa y salsa
                  al venderla.
                </p>
                <button
                  type="button"
                  onClick={() => router.push('/dashboard/upgrade-plan')}
                  className="mt-1 font-semibold text-brand-600 underline"
                >
                  Mejorar plan
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-brand-600">
              Cuánto usa <strong>una</strong> unidad vendida.
              {producto.permite_mitad
                ? ' Media porción descuenta la mitad.'
                : ''}
            </p>
            <ul className="space-y-2">
              {filas.map((f) => {
                const item = f.stock_item_id
                  ? itemPorId.get(f.stock_item_id)
                  : null;
                const unidades = item ? unidadesDeIngreso(item.unidad) : [];
                return (
                  <li
                    key={f.key}
                    className="flex flex-wrap items-center gap-2 rounded-lg border border-brand-100 p-2"
                  >
                    <select
                      aria-label="Ingrediente"
                      value={f.stock_item_id ?? ''}
                      onChange={(e) =>
                        elegirItem(f.key, Number(e.target.value))
                      }
                      className={`${campo} min-w-0 flex-1 basis-full sm:basis-auto`}
                    >
                      <option value="" disabled>
                        Elegí un ingrediente
                      </option>
                      {activos.map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.nombre}
                        </option>
                      ))}
                    </select>
                    <input
                      aria-label="Cantidad"
                      inputMode="decimal"
                      value={f.valor}
                      onChange={(e) =>
                        cambiar(f.key, { valor: e.target.value })
                      }
                      placeholder="0"
                      className={`${campo} w-24`}
                    />
                    {unidades.length > 1 ? (
                      <div
                        className="flex overflow-hidden rounded-lg border border-brand-200"
                        role="group"
                        aria-label="Unidad"
                      >
                        {unidades.map((u) => (
                          <button
                            key={u}
                            type="button"
                            onClick={() => cambiar(f.key, { unidad: u })}
                            aria-pressed={f.unidad === u}
                            className={`min-h-[44px] w-11 text-sm font-medium ${f.unidad === u ? 'bg-brand-600 text-white' : 'bg-white text-brand-700'}`}
                          >
                            {u}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span className="w-10 text-center text-sm text-brand-300">
                        {item?.unidad ?? ''}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setFilas((prev) => prev.filter((x) => x.key !== f.key))
                      }
                      aria-label="Quitar ingrediente"
                      className="flex h-11 w-11 items-center justify-center rounded-lg text-brand-300 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </li>
                );
              })}
            </ul>
            <button
              type="button"
              onClick={() =>
                setFilas((prev) => [
                  ...prev,
                  {
                    key: siguienteKey++,
                    stock_item_id: null,
                    valor: '',
                    unidad: null,
                  },
                ])
              }
              className="inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-brand-600"
            >
              <Plus size={18} /> Agregar ingrediente
            </button>
            {!activos.length && (
              <p className="rounded-lg bg-brand-50 p-3 text-sm text-brand-600">
                Todavía no tenés ítems de stock: creá los insumos en la pestaña
                Stock.
              </p>
            )}
          </>
        )}

        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="flex gap-2">
          {producto.receta.length > 0 && (
            <button
              type="button"
              disabled={guardando}
              onClick={() => enviar([])}
              className="min-h-[48px] rounded-lg border border-red-100 px-4 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
            >
              Quitar
            </button>
          )}
          <button
            type="submit"
            disabled={guardando || recetaFueraDePlan}
            className="min-h-[48px] flex-1 rounded-lg bg-brand-600 text-base font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {guardando ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
