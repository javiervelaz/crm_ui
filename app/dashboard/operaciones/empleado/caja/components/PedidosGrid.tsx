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
      <table className="table-auto w-full text-left">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 text-red-600 font-medium">Comanda nro</th>
            <th className="px-4 py-2 text-gray-600 font-medium">Cliente</th>
            <th className="px-4 py-2 text-gray-600 font-medium">Teléfono</th>
            <th className="px-4 py-2 text-gray-600 font-medium">Monto</th>
            <th className="px-4 py-2 text-gray-600 font-medium">Fecha</th>
            <th className="px-4 py-2 text-gray-600 font-medium">Finalizar pedido</th>
            <th className="px-4 py-2 text-gray-600 font-medium">Cancelar pedido</th>
          </tr>
        </thead>
        <tbody>
          {pedidosLocal.map((pedido) => (
            <tr
              key={pedido.id}
              className="hover:bg-gray-50 transition duration-150 ease-in-out"
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

      {/* Paginación 
      <div className="flex justify-center mt-6">
        <button
          onClick={() => setPaginaActual(paginaActual - 1)}
          disabled={paginaActual === 1}
          className={`px-4 py-2 rounded-l bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed mx-1`}
        >
          Anterior
        </button>
        <button
          onClick={() => setPaginaActual(paginaActual + 1)}
          disabled={paginaActual === totalPaginas}
          className={`px-4 py-2 rounded-r bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed mx-1`}
        >
          Siguiente
        </button>
      </div>*/}
    </div>
  );
};

export default PedidosGrid;