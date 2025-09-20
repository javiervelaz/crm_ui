
import InventarioList from './InventarioList';
import PedidoForm from './PedidoForm';
import SalidaCajaForm from './SalidaCajaForm';

const OperacionesDiarias = () => {
  return (
    <div>
      <section id="abrir-caja" className="my-4 p-4 bg-white shadow-lg rounded-lg">
        <h2 className="text-lg font-bold">Abrir Caja</h2>
      </section>

      <section id="registrar-pedido" className="my-4 p-4 bg-white shadow-lg rounded-lg">
        <h2 className="text-lg font-bold">Registrar Pedido</h2>
        <PedidoForm />
      </section>

      <section id="registrar-salida" className="my-4 p-4 bg-white shadow-lg rounded-lg">
        <h2 className="text-lg font-bold">Registrar Salida de Caja</h2>
        <SalidaCajaForm />
      </section>

      <section id="inventario" className="my-4 p-4 bg-white shadow-lg rounded-lg">
        <h2 className="text-lg font-bold">Inventario de Insumos</h2>
        <InventarioList />
      </section>
    </div>
  );
};

export default OperacionesDiarias;
