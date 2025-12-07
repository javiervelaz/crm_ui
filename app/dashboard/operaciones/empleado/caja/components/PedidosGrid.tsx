import { getClienteId } from '@/app/lib/authService';
import {
  deletePedido,
  terminarPedido,
  getDetallePedido,
} from '@/app/lib/operaciones.api';
import {
  faChevronDown,
  faChevronRight,
  faTrashAlt,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Fragment, useEffect, useState } from 'react';
import { notifyError } from '@/app/lib/notificationService';

// Debe matchear lo que devuelve tu endpoint de detalle
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
  producto_image_public_id: string | null;
}

// Interface para el tipo Pedido
interface Pedido {
  id: number;
  status: boolean;
  comanda_nro?: string;
  nombre?: string;
  telefono?: string;
  monto_total: number;
  created_at: string;
}

// Props del componente
interface PedidosGridProps {
  pedidos: Pedido[];
  fetchPedidos: () => Promise<void>;
  /**
   * 'abiertos' → muestra toggle de finalizar + botón cancelar
   * 'cerrados' → solo lectura + detalle expandible
   */
  mode?: 'abiertos' | 'cerrados';
}

const PedidosGrid = ({
  pedidos,
  fetchPedidos,
  mode = 'abiertos',
}: PedidosGridProps) => {
  const [paginaActual, setPaginaActual] = useState<number>(1);
  const [totalPaginas, setTotalPaginas] = useState<number>(1);
  const [pedidosLocal, setPedidosLocal] = useState<Pedido[]>(pedidos);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // detalle por pedido_id
  const [detallePorPedido, setDetallePorPedido] = useState<
    Record<number, PedidoItemDetalle[]>
  >({});
  const [detalleLoadingId, setDetalleLoadingId] = useState<number | null>(null);
  const [detalleErrorId, setDetalleErrorId] = useState<number | null>(null);

  const isModoAbiertos = mode === 'abiertos';

  // columnas totales, para colSpan del detalle
  const detalleColSpan = isModoAbiertos ? 8 : 6;

  // Sincronizar el estado local con los pedidos prop cuando estos cambien
  useEffect(() => {
    setPedidosLocal(pedidos);
    // TODO: calcular bien totalPaginas cuando implementes paginación real
    setTotalPaginas(2);
  }, [pedidos]);

  const cargarDetalleSiEsNecesario = async (pedidoId: number) => {
    // Si ya tenemos el detalle, no golpeamos al backend de nuevo
    if (detallePorPedido[pedidoId]) return;

    try {
      setDetalleLoadingId(pedidoId);
      setDetalleErrorId(null);
      const items = await getDetallePedido(pedidoId);
      setDetallePorPedido((prev) => ({
        ...prev,
        [pedidoId]: items,
      }));
    } catch (err) {
      console.error('Error obteniendo detalle del pedido', err);
      setDetalleErrorId(pedidoId);
    } finally {
      setDetalleLoadingId(null);
    }
  };

  const toggleExpanded = async (pedidoId: number) => {
    if (expandedId === pedidoId) {
      setExpandedId(null);
      return;
    }

    // Expandir nuevo pedido
    setExpandedId(pedidoId);
    await cargarDetalleSiEsNecesario(pedidoId);
  };

  // Función para cambiar el estado de un pedido (solo en modo abiertos)
  const handleStatusChange = async (pedidoId: number, newStatus: boolean) => {
    if (!isModoAbiertos) return;

    try {
      if (confirm('¿Estás seguro de finalizar el pedido?')) {
        // Actualiza visualmente el estado antes de hacer la llamada a la API
        setPedidosLocal((prevPedidos) =>
          prevPedidos.map((pedido) =>
            pedido.id === pedidoId ? { ...pedido, status: newStatus } : pedido,
          ),
        );
        const data = { cliente_id: getClienteId() };
        await terminarPedido(pedidoId, data);
        await fetchPedidos();
      }
    } catch (error) {
      console.error('Error al actualizar el estado del pedido:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!isModoAbiertos) return;

    if (confirm('¿Estás seguro de cancelar el pedido?')) {
      try {
        await deletePedido(id, getClienteId());
        await fetchPedidos();
      } catch (error) {
        console.error('Error eliminando pedido', error);
        notifyError(error.message)
      }
    }
  };

  const calcularSubtotal = (item: PedidoItemDetalle): number => {
    const baseUnit =
      item.precio_final !== null
        ? Number(item.precio_final)
        : Number(item.precio_unitario);
    const entero = Number(item.cantidad) || 0;
    const mitades = Number(item.cantidad_mitad) || 0;
    const montoAdicional = Number(item.monto_adicional || 0);

    const baseCantidad = entero + mitades * 0.5;
    return baseUnit * baseCantidad + montoAdicional;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <table className="table-auto w-full text-left">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-2 py-2 text-gray-600 font-medium w-8" />
            <th className="px-4 py-2 text-red-600 font-medium">Comanda nro</th>
            <th className="px-4 py-2 text-gray-600 font-medium">Cliente</th>
            <th className="px-4 py-2 text-gray-600 font-medium">Teléfono</th>
            <th className="px-4 py-2 text-gray-600 font-medium">Monto</th>
            <th className="px-4 py-2 text-gray-600 font-medium">Fecha</th>

            {isModoAbiertos && (
              <>
                <th className="px-4 py-2 text-gray-600 font-medium">
                  Finalizar pedido
                </th>
                <th className="px-4 py-2 text-gray-600 font-medium">
                  Cancelar pedido
                </th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {pedidosLocal.map((pedido) => (
            <Fragment key={pedido.id}>
              {/* Fila principal */}
              <tr className="hover:bg-gray-50 transition duration-150 ease-in-out">
                <td className="px-2 py-2 border-b border-gray-200">
                  <button
                    type="button"
                    onClick={() => toggleExpanded(pedido.id)}
                    className="group relative text-gray-600 hover:text-gray-900"
                  >
                    <FontAwesomeIcon
                      icon={
                        expandedId === pedido.id ? faChevronDown : faChevronRight
                      }
                    />

                    {/* Tooltip */}
                    <span
                      className="
                        absolute left-6 top-1/2 -translate-y-1/2 
                        whitespace-nowrap text-xs
                        bg-gray-800 text-white 
                        px-2 py-1 rounded shadow 
                        opacity-0 group-hover:opacity-100 
                        transition-opacity duration-200
                        pointer-events-none
                      "
                    >
                      {expandedId === pedido.id
                        ? 'Ocultar detalle'
                        : 'Ver detalle'}
                    </span>
                  </button>
                </td>
                <td className="px-4 py-2 border-b border-gray-200">
                  {pedido.comanda_nro || 'N/A'}
                </td>
                <td className="px-4 py-2 border-b border-gray-200">
                  {pedido.nombre || 'MOSTRADOR'}
                </td>
                <td className="px-4 py-2 border-b border-gray-200">
                  {pedido.telefono || 'N/A'}
                </td>
                <td className="px-4 py-2 border-b border-gray-200">
                  ${Number(pedido.monto_total).toLocaleString('es-AR')}
                </td>
                <td className="px-4 py-2 border-b border-gray-200">
                  {new Date(pedido.created_at).toLocaleString()}
                </td>

                {isModoAbiertos && (
                  <>
                    <td className="px-4 py-2 border-b border-gray-200">
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={pedido.status || false}
                          onChange={(e) =>
                            handleStatusChange(pedido.id, e.target.checked)
                          }
                        />
                        <div
                          className={`w-10 h-5 rounded-full p-1 ${
                            pedido.status ? 'bg-green-500' : 'bg-gray-300'
                          } transition-colors duration-300`}
                        >
                          <div
                            className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform duration-300 ${
                              pedido.status ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </div>
                      </label>
                    </td>
                    <td className="px-4 py-2 border-b border-gray-200">
                      <button
                        onClick={() => handleDelete(pedido.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100"
                        title="Eliminar"
                      >
                        <FontAwesomeIcon icon={faTrashAlt} />
                      </button>
                    </td>
                  </>
                )}
              </tr>

              {/* Fila de detalle expandible */}
              {expandedId === pedido.id && (
                <tr className="bg-gray-50">
                  <td
                    className="px-4 py-3 border-b border-gray-200 text-xs text-gray-600"
                    colSpan={detalleColSpan}
                  >
                    {/* Estado de carga / error / datos */}
                    {detalleLoadingId === pedido.id && (
                      <p className="text-xs text-gray-500">
                        Cargando detalle del pedido...
                      </p>
                    )}

                    {detalleErrorId === pedido.id && (
                      <p className="text-xs text-red-500">
                        Error al cargar el detalle del pedido.
                      </p>
                    )}

                    {detallePorPedido[pedido.id] &&
                      detallePorPedido[pedido.id].length > 0 &&
                      detalleLoadingId !== pedido.id && (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-gray-700">
                            Detalle del pedido
                          </p>
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-gray-500">
                                <th className="text-left py-1">Producto</th>
                                <th className="text-center py-1">Cant.</th>
                                <th className="text-center py-1">Mitad</th>
                                <th className="text-right py-1">P. Unit.</th>
                                <th className="text-right py-1">Subtotal</th>
                              </tr>
                            </thead>
                            <tbody>
                              {detallePorPedido[pedido.id].map((item) => {
                                const subtotal = calcularSubtotal(item);
                                return (
                                  <tr key={item.id}>
                                    <td className="py-1 pr-2">
                                      {item.producto_nombre}
                                      {item.observaciones && (
                                        <span className="block text-[10px] text-gray-500">
                                          Nota: {item.observaciones}
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-1 text-center">
                                      {item.cantidad}
                                    </td>
                                    <td className="py-1 text-center">
                                      {item.cantidad_mitad}
                                    </td>
                                    <td className="py-1 text-right">
                                      $
                                      {Number(
                                        item.precio_unitario,
                                      ).toLocaleString('es-AR')}
                                    </td>
                                    <td className="py-1 text-right">
                                      ${subtotal.toLocaleString('es-AR')}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>

                          <div className="mt-2 flex justify-between text-xs text-gray-700">
                            <span>
                              Total:{' '}
                              <strong>
                                $
                                {Number(
                                  pedido.monto_total,
                                ).toLocaleString('es-AR')}
                              </strong>
                            </span>
                          </div>
                        </div>
                      )}

                    {detallePorPedido[pedido.id] &&
                      detallePorPedido[pedido.id].length === 0 &&
                      !detalleLoadingId &&
                      detalleErrorId !== pedido.id && (
                        <p className="text-xs text-gray-500">
                          No hay detalle de ítems disponible para este pedido.
                        </p>
                      )}
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PedidosGrid;
