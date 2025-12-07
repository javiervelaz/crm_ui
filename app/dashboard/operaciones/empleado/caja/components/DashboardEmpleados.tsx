import { getClienteId } from "@/app/lib/authService";
import {
  checkAperturaCaja,
  getPedidosByRegistroId,
} from "@/app/lib/operaciones.api";
import { jwtDecode } from "jwt-decode";
import { useCallback, useEffect, useMemo, useState } from "react";
import Modal from "./Modal";
import PedidoForm from "./PedidoForm";
import PedidosGrid from "./PedidosGrid";
import AbrirCajaForm from "./abrirCajaForm";

interface DecodedToken {
  userId: number;
  sucursalId: string;
}

// Aseguramos el tipo de Pedido alineado con PedidosGrid
interface Pedido {
  id: number;
  status: boolean;
  comanda_nro?: string;
  nombre?: string;
  telefono?: string;
  monto_total: number;
  created_at: string;
}

const DashboardEmpleados = () => {
  const [cajaAbierta, setCajaAbierta] = useState(false);
  const [fechaApertura, setFechaApertura] = useState("");
  const [registroDiario, setRegistroDiario] = useState<number | null>(null);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [showPedidoForm, setShowPedidoForm] = useState(false);
  const [showAbrirCajaForm, setShowAbrirCajaForm] = useState(false);
  const [usuario, setUsuario] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"abiertos" | "cerrados">(
    "abiertos",
  );
  const [loading, setLoading] = useState(false);

  // 1) Verificar caja abierta
  useEffect(() => {
    const verificarCaja = async () => {
      try {
        const data = { cliente_id: getClienteId() } as any;
        const res = await checkAperturaCaja(data);
        if (res.caja_abierta) {
          setCajaAbierta(true);
          setFechaApertura(res.fecha);
          setRegistroDiario(res.registro_diario_id);
        }
      } catch (error) {
        console.error("Error al verificar la caja:", error);
      }
    };

    verificarCaja();
  }, []);

  // 2) fetchPedidos por registro_diario (día actual)
  const fetchPedidos = useCallback(async () => {
    try {
      if (!registroDiario) return;
      setLoading(true);
      const response = await getPedidosByRegistroId(
        registroDiario,
        getClienteId(),
      );
      setPedidos(response);
    
    } catch (error) {
      console.error("Error al cargar pedidos:", error);
    } finally {
      setLoading(false);
    }
  }, [registroDiario]);

  // 3) Obtener usuario del token y disparar carga de pedidos
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode<DecodedToken>(token);
      setUsuario(decoded.userId);
    }

    if (registroDiario) {
      fetchPedidos();
    }
  }, [registroDiario, fetchPedidos]);

  const handlePedidoFormClose = () => {
    setShowPedidoForm(false);
    fetchPedidos();
  };

  // 4) Separar pedidos en abiertos/cerrados según status
  const pedidosAbiertos = useMemo(
    () => pedidos.filter((p) => !p.pedido_terminado),
    [pedidos],
  );

  const pedidosCerrados = useMemo(
    () => pedidos.filter((p) => p.pedido_terminado),
    [pedidos],
  );

  const tabBase =
    "px-3 pb-2 text-sm border-b-2 -mb-px transition-colors duration-150";
  const tabActive = `${tabBase} border-slate-900 text-slate-900 font-semibold`;
  const tabInactive = `${tabBase} border-transparent text-slate-500 hover:text-slate-800`;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold mb-2">Pedidos</h1>

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
        <>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Pedidos del día</h2>
              <p className="text-xs text-gray-500">
                Caja abierta el:{" "}
                <span className="font-medium">
                  {new Date(fechaApertura).toLocaleString()}
                </span>
              </p>
            </div>

            {/* Tabs Abiertos / Cerrados */}
            <div className="flex gap-4 border-b">
              <button
                type="button"
                className={
                  activeTab === "abiertos" ? tabActive : tabInactive
                }
                onClick={() => setActiveTab("abiertos")}
              >
                Abiertos hoy ({pedidosAbiertos.length})
              </button>
              <button
                type="button"
                className={
                  activeTab === "cerrados" ? tabActive : tabInactive
                }
                onClick={() => setActiveTab("cerrados")}
              >
                Cerrados hoy ({pedidosCerrados.length})
              </button>
            </div>
          </div>

          {/* Botón de alta solo en tab de abiertos */}
          {activeTab === "abiertos" && (
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowPedidoForm(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Alta de Pedido
              </button>
            </div>
          )}

          {/* Contenido según tab */}
          <div className="mt-2">
            {loading && (
              <p className="text-sm text-gray-500">Cargando pedidos...</p>
            )}

            {!loading && activeTab === "abiertos" && (
              <PedidosGrid
                pedidos={pedidosAbiertos}
                fetchPedidos={fetchPedidos}
                mode="abiertos"
              />
            )}

            {!loading && activeTab === "cerrados" && (
              <PedidosGrid
                pedidos={pedidosCerrados}
                fetchPedidos={fetchPedidos}
                mode="cerrados"
              />
            )}
          </div>

          {/* Modal Alta de Pedido */}
          {showPedidoForm && (
            <Modal onClose={handlePedidoFormClose}>
              {registroDiario !== null && usuario !== null && (
                <PedidoForm
                  onClose={handlePedidoFormClose}
                  registroDiario={registroDiario}
                  usuario_id={usuario}
                />
              )}
            </Modal>
          )}
        </>
      )}
    </div>
  );
};

export default DashboardEmpleados;
