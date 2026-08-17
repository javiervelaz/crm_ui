'use client';

import { getClienteId } from '@/app/lib/authService';
import { logError } from '@/app/lib/logger';
import { notifyError } from '@/app/lib/notificationService';
import { deletePedido, getDetallePedido, terminarPedido } from '@/app/lib/operaciones.api';
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { Fragment, useEffect, useState } from 'react';

/**
 * Grilla de pedidos UNIFICADA.
 *
 * Las dos copias habian divergido en ambas direcciones, asi que esto es un
 * cherry-pick, no una copia:
 *
 *   de empleado/ (496 lineas)  ->  prop mode, detalle expandible con
 *                                  getDetallePedido, calculo de subtotal,
 *                                  notifyError al fallar el borrado
 *   de caja/     (199 lineas)  ->  paleta brand (la otra usaba grises),
 *                                  estado vacio "Sin pedidos activos"
 *
 * Ademas: iconos lucide en vez de FontAwesome (tarea 2.5).
 */

interface PedidoItemDetalle {
  id: number;
  pedido_id: number;
  producto_id: number;
  producto_nombre: string;
  cantidad: number;
  cantidad_mitad: number;
  precio_unitario: number;
  precio_final: number | null;
  monto_adicional: number | null;
  observaciones: string | null;
}

interface Pedido {
  id: number;
  pedido_terminado: boolean;
  comanda_nro?: string;
  nombre?: string;
  telefono?: string;
  monto_total: number;
  created_at: string;
}

interface Props {
  pedidos: Pedido[];
  fetchPedidos: () => Promise<void>;
  /** 'abiertos' = finalizar + cancelar · 'cerrados' = solo lectura */
  mode?: 'abiertos' | 'cerrados';
}

const money = (n: number | string) => '$' + Number(n).toLocaleString('es-AR');

export default function PedidosGrid({ pedidos, fetchPedidos, mode = 'abiertos' }: Props) {
  const [pedidosLocal, setPedidosLocal] = useState<Pedido[]>(pedidos);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [detalle, setDetalle] = useState<Record<number, PedidoItemDetalle[]>>({});
  const [cargandoId, setCargandoId] = useState<number | null>(null);
  const [errorId, setErrorId] = useState<number | null>(null);

  const abiertos = mode === 'abiertos';
  const colSpan = abiertos ? 8 : 6;

  useEffect(() => setPedidosLocal(pedidos), [pedidos]);

  const toggle = async (id: number) => {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    if (detalle[id]) return;
    try {
      setCargandoId(id);
      setErrorId(null);
      const items = await getDetallePedido(id);
      setDetalle((prev) => ({ ...prev, [id]: items }));
    } catch (err) {
      logError('Error obteniendo detalle del pedido', err);
      setErrorId(id);
    } finally {
      setCargandoId(null);
    }
  };

  const finalizar = async (id: number, nuevoStatus: boolean) => {
    if (!abiertos) return;
    if (!confirm('¿Finalizar el pedido?')) return;
    try {
      setPedidosLocal((prev) =>
        prev.map((p) => (p.id === id ? { ...p, pedido_terminado: nuevoStatus } : p))
      );
      await terminarPedido(id, { cliente_id: getClienteId() });
      await fetchPedidos();
    } catch (error: any) {
      logError('Error al actualizar el estado del pedido', error);
      notifyError(error?.message ?? 'No se pudo finalizar el pedido');
      await fetchPedidos(); // revierte el optimismo
    }
  };

  const cancelar = async (id: number) => {
    if (!abiertos) return;
    if (!confirm('¿Cancelar el pedido?')) return;
    try {
      await deletePedido(id, getClienteId());
      await fetchPedidos();
    } catch (error: any) {
      logError('Error eliminando pedido', error);
      notifyError(error?.message ?? 'No se pudo cancelar el pedido');
    }
  };

  const subtotal = (item: PedidoItemDetalle): number => {
    const base = item.precio_final !== null ? Number(item.precio_final) : Number(item.precio_unitario);
    const cantidad = (Number(item.cantidad) || 0) + (Number(item.cantidad_mitad) || 0) * 0.5;
    return base * cantidad + Number(item.monto_adicional || 0);
  };

  if (pedidosLocal.length === 0) {
    return (
      <div className="rounded-lg bg-white p-10 text-center shadow-card">
        <p className="text-sm text-brand-300">
          {abiertos ? 'Sin pedidos activos' : 'Sin pedidos cerrados'}
        </p>
      </div>
    );
  }

  const Detalle = ({ pedido }: { pedido: Pedido }) => (
    <>
      {cargandoId === pedido.id && <p className="text-xs text-brand-300">Cargando detalle...</p>}
      {errorId === pedido.id && <p className="text-xs text-red-500">Error al cargar el detalle.</p>}
      {detalle[pedido.id]?.length ? (
        <ul className="space-y-2">
          {detalle[pedido.id].map((item) => (
            <li key={item.id} className="flex justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-brand-800">{item.producto_nombre}</p>
                {item.observaciones && (
                  <p className="text-xs text-brand-300">Nota: {item.observaciones}</p>
                )}
                <p className="text-xs text-brand-300">
                  Cant: {item.cantidad} · Mitad: {item.cantidad_mitad}
                </p>
              </div>
              <span className="whitespace-nowrap font-medium">{money(subtotal(item))}</span>
            </li>
          ))}
        </ul>
      ) : (
        cargandoId !== pedido.id &&
        errorId !== pedido.id && <p className="text-xs text-brand-300">Sin items.</p>
      )}
    </>
  );

  return (
    <>
      {/* DESKTOP */}
      <div className="hidden md:block">
        <div className="overflow-hidden rounded-lg bg-white shadow-card">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-brand-50">
                <th className="w-10 px-2 py-3" />
                <th className="px-4 py-3 text-sm font-medium text-brand-600">Comanda</th>
                <th className="px-4 py-3 text-sm font-medium text-brand-600">Cliente</th>
                <th className="px-4 py-3 text-sm font-medium text-brand-600">Telefono</th>
                <th className="px-4 py-3 text-sm font-medium text-brand-600">Monto</th>
                <th className="px-4 py-3 text-sm font-medium text-brand-600">Fecha</th>
                {abiertos && (
                  <>
                    <th className="px-4 py-3 text-sm font-medium text-brand-600">Finalizar</th>
                    <th className="px-4 py-3 text-sm font-medium text-brand-600">Cancelar</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {pedidosLocal.map((pedido) => (
                <Fragment key={pedido.id}>
                  <tr className="border-t border-brand-100 transition-colors hover:bg-brand-50">
                    <td className="px-2 py-2">
                      <button
                        type="button"
                        onClick={() => toggle(pedido.id)}
                        aria-expanded={expandedId === pedido.id}
                        aria-label={expandedId === pedido.id ? 'Ocultar detalle' : 'Ver detalle'}
                        className="flex h-9 w-9 items-center justify-center rounded-md text-brand-600 hover:bg-brand-100"
                      >
                        {expandedId === pedido.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </button>
                    </td>
                    <td className="px-4 py-2">{pedido.comanda_nro || 'N/A'}</td>
                    <td className="px-4 py-2">{pedido.nombre || 'MOSTRADOR'}</td>
                    <td className="px-4 py-2">{pedido.telefono || 'N/A'}</td>
                    <td className="px-4 py-2 font-medium text-brand-800">{money(pedido.monto_total)}</td>
                    <td className="px-4 py-2 text-sm">
                      {new Date(pedido.created_at).toLocaleString('es-AR')}
                    </td>
                    {abiertos && (
                      <>
                        <td className="px-4 py-2">
                          <label className="inline-flex cursor-pointer items-center">
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={pedido.pedido_terminado || false}
                              onChange={(e) => finalizar(pedido.id, e.target.checked)}
                            />
                            <div
                              className={
                                'h-5 w-10 rounded-full p-1 transition-colors duration-300 ' +
                                (pedido.pedido_terminado ? 'bg-green-500' : 'bg-brand-200')
                              }
                            >
                              <div
                                className={
                                  'h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300 ' +
                                  (pedido.pedido_terminado ? 'translate-x-5' : 'translate-x-0')
                                }
                              />
                            </div>
                          </label>
                        </td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => cancelar(pedido.id)}
                            title="Cancelar pedido"
                            className="flex h-9 w-9 items-center justify-center rounded-md text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </>
                    )}
                  </tr>

                  {expandedId === pedido.id && (
                    <tr className="bg-brand-50">
                      <td colSpan={colSpan} className="px-6 py-3 text-sm">
                        <Detalle pedido={pedido} />
                        <div className="mt-2 flex justify-between border-t border-brand-200 pt-2 font-semibold text-brand-800">
                          <span>Total</span>
                          <span>{money(pedido.monto_total)}</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MOBILE */}
      <div className="space-y-3 md:hidden">
        {pedidosLocal.map((pedido) => (
          <div key={pedido.id} className="rounded-lg bg-white p-4 shadow-card">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-semibold text-brand-800">
                Comanda #{pedido.comanda_nro || 'N/A'}
              </span>
              <span className="font-semibold text-brand-800">{money(pedido.monto_total)}</span>
            </div>

            <p className="text-sm text-brand-700">{pedido.nombre || 'MOSTRADOR'}</p>
            <p className="text-xs text-brand-300">
              {(pedido.telefono || 'Sin telefono') + ' · ' + new Date(pedido.created_at).toLocaleString('es-AR')}
            </p>

            <button
              type="button"
              onClick={() => toggle(pedido.id)}
              className="mt-3 min-h-[44px] w-full rounded-lg bg-brand-50 text-sm font-medium text-brand-700 hover:bg-brand-100"
            >
              {expandedId === pedido.id ? 'Ocultar detalle' : 'Ver detalle'}
            </button>

            {expandedId === pedido.id && (
              <div className="mt-3 border-t border-brand-100 pt-3 text-sm">
                <Detalle pedido={pedido} />
              </div>
            )}

            {abiertos && (
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => finalizar(pedido.id, true)}
                  className="min-h-[44px] flex-1 rounded-lg bg-green-500 text-sm font-semibold text-white"
                >
                  Finalizar
                </button>
                <button
                  type="button"
                  onClick={() => cancelar(pedido.id)}
                  className="min-h-[44px] flex-1 rounded-lg border border-red-200 text-sm font-semibold text-red-600"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
