import { getClienteId } from "@/app/lib/authService";
import { checkAperturaCaja, getPedidosByRegistroId } from "@/app/lib/operaciones.api";
import { jwtDecode } from 'jwt-decode';
import { useCallback, useEffect, useState } from 'react';
import { getCurrentDate } from "@/app/lib/utils";
import Modal from './Modal';
import PedidoForm from './PedidoForm';
import PedidosGrid from './PedidosGrid';
import AbrirCajaForm from "./abrirCajaForm";

interface DecodedToken {
  userId: number;
  sucursalId: string;
}

const DashboardEmpleados = () => {
  const [cajaAbierta, setCajaAbierta] = useState(false);
  const [fechaApertura, setFechaApertura] = useState('');
  const [registroDiario, setRegistroDiario] =  useState<number | null>(null);
  const [pedidos, setPedidos] = useState([]);
  const [showPedidoForm, setShowPedidoForm] = useState(false);
  const [showAbrirCajaForm, setShowAbrirCajaForm] = useState(false);
  const [usuario, setUsuario] = useState<number | null>(null);

useEffect(() => {
  const verificarCaja = async () => {
    try {
        const data = {cliente_id:getClienteId()} as any;
        const res = await checkAperturaCaja(data);
        if (res.caja_abierta) {
          setCajaAbierta(true);
          setFechaApertura(res.fecha);
          setRegistroDiario(res.registro_diario_id);
        }
    } catch (error) {
      console.error('Error al verificar la caja:', error);
    }
  };

  verificarCaja();
}, []); 


  // Reemplaza tu función actual con esta versión memoizada
  const fetchPedidos = useCallback(async () => {
    try {
      if (!registroDiario) return;
      const response = await getPedidosByRegistroId(registroDiario,getClienteId());
      setPedidos(response);
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
    }
  }, [registroDiario]); // Solo se recrea cuando registroDiario cambia

  useEffect(() => {
    const token = localStorage.getItem('token');
    if(token) {
      const decoded = jwtDecode<DecodedToken>(token);
      setUsuario(decoded.userId);
      //console.log("ususario",decoded.userId);
    }  
    if (registroDiario) {
      fetchPedidos();
    }
  }, [registroDiario,fetchPedidos,usuario]);

  const handlePedidoFormClose = () => {
    setShowPedidoForm(false);
    fetchPedidos();
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Pedidos</h1>

      {!cajaAbierta ? (
        <div className="flex justify-end">
          <button
            onClick={() => setShowAbrirCajaForm(true)}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Abrir Caja
          </button>
          {showAbrirCajaForm && (
            <Modal onClose={() => setShowAbrirCajaForm(false)}>
              <AbrirCajaForm onClose={() => setShowAbrirCajaForm(false)} />
            </Modal>
          )}
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">Pedidos del Día</h2>
          <p className="text-gray-600">Caja abierta el: {new Date(fechaApertura).toLocaleString()}</p>
        </div>
      )}

      {cajaAbierta && (
        <>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowPedidoForm(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Alta de Pedido
            </button>
          </div>

          <PedidosGrid pedidos={pedidos} fetchPedidos={fetchPedidos} />

          {showPedidoForm && (
            <Modal onClose={handlePedidoFormClose}>
              {registroDiario !== null  && usuario !== null && (
                <PedidoForm onClose={handlePedidoFormClose} registroDiario={registroDiario} usuario_id={usuario}  />
              )}
                </Modal>
          )}
        </>
      )}
    </div>
  );
};

export default DashboardEmpleados;
