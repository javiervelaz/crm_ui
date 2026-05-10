import { getClienteId } from "@/app/lib/authService";
import { deletePedido, terminarPedido } from "@/app/lib/operaciones.api";
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';

// Interface para el tipo Pedido
interface Pedido {
  id: number;
  status: boolean;
  comanda_nro?: string;
  nombre?: string;
  telefono?: string;
  monto_total: number;
  created_at: string;
  // Agrega otras propiedades si son necesarias
}

// Props del componente
interface PedidosGridProps {
  pedidos: Pedido[];
  fetchPedidos: () => Promise<void>;
}

const PedidosGrid = ({ pedidos, fetchPedidos }: PedidosGridProps) => {
  const [paginaActual, setPaginaActual] = useState<number>(1);
  const [totalPaginas, setTotalPaginas] = useState<number>(1);
  const [pedidosLocal, setPedidosLocal] = useState<Pedido[]>(pedidos);

  // Sincronizar el estado local con los pedidos prop cuando estos cambien
  useEffect(() => {
    setPedidosLocal(pedidos);
    // Aquí deberías calcular el total de páginas basado en la cantidad de pedidos
    // Por ahora lo dejamos en 2 como en tu ejemplo original
    setTotalPaginas(2);
  }, [pedidos]);

  // Función para cambiar el estado de un pedido
  const handleStatusChange = async (pedidoId: number, newStatus: boolean) => {
    try {
        if (confirm('¿Estás seguro de finalizar el pedido?')) {
          // Actualiza visualmente el estado antes de hacer la llamada a la API
          setPedidosLocal((prevPedidos) =>
            prevPedidos.map((pedido) =>
              pedido.id === pedidoId ? { ...pedido, status: newStatus } : pedido
            )
          );
          const data = {cliente_id: getClienteId()}
          // Llamada a la API para actualizar el estado del pedido en la base de datos
          await terminarPedido(pedidoId,data);

          // Refresca la lista de pedidos desde la base de datos
          await fetchPedidos();
      }
    } catch (error) {
      console.error('Error al actualizar el estado del pedido:', error);
    }
  };
  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de cancelar el pedido?')) {
      try {
        await deletePedido(id,getClienteId());
        await fetchPedidos();
      } catch (error) {
        console.error('Error eliminando pedido', error);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      {/* Mobile cards — visible on small screens */}
      <div className="md:hidden space-y-3">
        {pedidosLocal.map((pedido) => (
          <div key={pedido.id} className="rounded-xl border border-brand-100 bg-brand-50 p-3 text-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-brand-800">
                Comanda #{pedido.comanda_nro || 'N/A'}
              </span>
              <button
                onClick={() => handleDelete(pedido.id)}
                className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-100"
                title="Cancelar pedido"
              >
                <FontAwesomeIcon icon={faTrashAlt} />
              </button>
            </div>
            <div className="space-y-1 text-brand-700">
              <p><span className="text-brand-400 text-xs">Cliente:</span> {pedido.nombre || 'MOSTRADOR'}</p>
              <p><span className="text-brand-400 text-xs">Teléfono:</span> {pedido.telefono || 'N/A'}</p>
              <p><span className="text-brand-400 text-xs">Monto:</span> <span className="font-semibold text-brand-800">${pedido.monto_total}</span></p>
              <p><span className="text-brand-400 text-xs">Fecha:</span> {new Date(pedido.created_at).toLocaleString()}</p>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-brand-400">Finalizar:</span>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={pedido.status || false}
                  onChange={(e) => handleStatusChange(pedido.id, e.target.checked)}
                />
                <div className={`w-10 h-5 rounded-full p-1 ${pedido.status ? 'bg-green-500' : 'bg-gray-300'} transition-colors duration-300`}>
                  <div className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform duration-300 ${pedido.status ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </div>
              </label>
            </div>
          </div>
        ))}
        {pedidosLocal.length === 0 && (
          <p className="text-center text-sm text-brand-300 py-6">Sin pedidos activos</p>
        )}
      </div>

      {/* Desktop table — hidden on small screens */}
      <div className="hidden md:block overflow-x-auto">
      <table className="table-auto w-full text-left min-w-[700px]">
        <thead>
          <tr className="bg-brand-50">
            <th className="px-4 py-2 text-brand-600 font-medium text-sm">Comanda nro</th>
            <th className="px-4 py-2 text-brand-600 font-medium text-sm">Cliente</th>
            <th className="px-4 py-2 text-brand-600 font-medium text-sm">Teléfono</th>
            <th className="px-4 py-2 text-brand-600 font-medium text-sm">Monto</th>
            <th className="px-4 py-2 text-brand-600 font-medium text-sm">Fecha</th>
            <th className="px-4 py-2 text-brand-600 font-medium text-sm">Finalizar pedido</th>
            <th className="px-4 py-2 text-brand-600 font-medium text-sm">Cancelar pedido</th>
          </tr>
        </thead>
        <tbody>
          {pedidosLocal.map((pedido) => (
            <tr
              key={pedido.id}
              className="hover:bg-brand-50 transition duration-150 ease-in-out"
            >
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
                ${pedido.monto_total}
              </td>
              <td className="px-4 py-2 border-b border-gray-200">
                {new Date(pedido.created_at).toLocaleString()}
              </td>
              <td className="px-4 py-2 border-b border-gray-200">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={pedido.status || false}
                    onChange={(e) => handleStatusChange(pedido.id, e.target.checked)}
                  />
                  <div className={`w-10 h-5 rounded-full p-1 ${pedido.status ? 'bg-green-500' : 'bg-gray-300'} transition-colors duration-300`}>
                    <div className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform duration-300 ${pedido.status ? 'translate-x-5' : 'translate-x-0'}`}></div>
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
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {/* Paginación 
      <div className="flex justify-center mt-6">
        <button
          onClick={() => setPaginaActual(paginaActual - 1)}
          disabled={paginaActual === 1}
          className={`px-4 py-2 rounded-l bg-brand-600 text-white hover:bg-brand-600 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed mx-1`}
        >
          Anterior
        </button>
        <button
          onClick={() => setPaginaActual(paginaActual + 1)}
          disabled={paginaActual === totalPaginas}
          className={`px-4 py-2 rounded-r bg-brand-600 text-white hover:bg-brand-600 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed mx-1`}
        >
          Siguiente
        </button>
      </div>*/}
    </div>
  );
};

export default PedidosGrid;