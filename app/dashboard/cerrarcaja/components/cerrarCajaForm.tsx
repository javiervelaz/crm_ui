"use client";

import { getClienteId } from "@/app/lib/authService";
import { gatosMontoTotalDiario } from "@/app/lib/gasto";
import {
  cerrarCaja,
  checkAperturaCaja,
  getCajaInicial,
  pedidoMontoTotalDiario,
} from "@/app/lib/operaciones.api";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentDate } from "@/app/lib/utils";

interface DecodedToken {
  userId: number;
  sucursal: string;
}

const CerrarCajaForm = () => {
  const [montoFinal, setMontoFinal] = useState(0); // ventas del día
  const [gastosAdministrativos, setGastosAdministrativos] = useState(0); // egreso manual
  const [otrosIngresos, setOtrosIngresos] = useState(0); // ingreso manual
  const [mensaje, setMensaje] = useState("");
  const [isRedirect, setIsRedirect] = useState(false);
  const [cajaAbierta, setCajaAbierta] = useState(false);
  const [registroDiario, setRegistroDiario] = useState("");
  const [montoGastoSueldo, setGastoSueldos] = useState(0);
  const [montoGastoFijo, setGastoFijo] = useState(0);
  const [montoGastoVariable, setGastoVariable] = useState(0);
  const [montoCajaInicial, setMontoCajaInicial] = useState(0);
  const [ingresosTotales, setIngresosTotales] = useState(0);
  const [otrosEgresos, setOtrosEgresos] = useState(0);
  const [montoContadoCaja, setMontoContadoCaja] = useState<string>(""); // efectivo contado

  const router = useRouter();

  // 1) Verificar si hay caja abierta y obtener id de registro_diario
  useEffect(() => {
    const verificarCaja = async () => {
      try {
        const data = { cliente_id: getClienteId() } as any;
        const res = await checkAperturaCaja(data);
        if (res.caja_abierta) {
          setCajaAbierta(true);
          setRegistroDiario(res.registro_diario_id);
        }
      } catch (error) {
        console.error("Error al verificar la caja:", error);
      }
    };

    verificarCaja();
  }, [router]);

  // 2) Cuando tengo registro_diario, traigo todos los montos
  useEffect(() => {
    if (!registroDiario) return;

    const obtenerMontoPedidos = async () => {
      try {
        const montoPedidos = await pedidoMontoTotalDiario(
          registroDiario,
          getClienteId(),
        );
        setMontoFinal(Number(montoPedidos.sum) || 0);
      } catch (error) {
        console.error("Error al obtener pedidos del día:", error);
        setMontoFinal(0);
      }
    };

    const obtenerMontoGastoSueldos = async () => {
      try {
        const monto = await gatosMontoTotalDiario(
          registroDiario,
          "sueldos",
          getClienteId(),
        );
        const montoNumerico = parseFloat(monto);
        setGastoSueldos(isNaN(montoNumerico) ? 0 : montoNumerico);
      } catch (error) {
        console.error("Error al obtener gastos de sueldo", error);
        setGastoSueldos(0);
      }
    };

    const obtenerMontoGastoFijo = async () => {
      try {
        const monto = await gatosMontoTotalDiario(
          registroDiario,
          "fijo",
          getClienteId(),
        );
        const montoNumerico = parseFloat(monto);
        setGastoFijo(isNaN(montoNumerico) ? 0 : montoNumerico);
      } catch (error) {
        console.error("Error al obtener gastos fijos", error);
        setGastoFijo(0);
      }
    };

    const obtenerMontoGastoVariable = async () => {
      try {
        const monto = await gatosMontoTotalDiario(
          registroDiario,
          "variable",
          getClienteId(),
        );
        const montoNumerico = parseFloat(monto);
        setGastoVariable(isNaN(montoNumerico) ? 0 : montoNumerico);
      } catch (error) {
        console.error("Error al obtener gastos variables", error);
        setGastoVariable(0);
      }
    };

    const obtenerCajaInicial = async () => {
      try {
        const monto = await getCajaInicial(registroDiario, getClienteId());
        const montoNumerico = parseFloat(monto.sum) || 0;
        setMontoCajaInicial(isNaN(montoNumerico) ? 0 : montoNumerico);
      } catch (error) {
        console.error("Error al obtener caja inicial", error);
        setMontoCajaInicial(0);
      }
    };

    obtenerMontoPedidos();
    obtenerMontoGastoSueldos();
    obtenerMontoGastoFijo();
    obtenerMontoGastoVariable();
    obtenerCajaInicial();
  }, [registroDiario]);

  // 3) Recalcular ingresos/egresos totales cuando cambian montos
  useEffect(() => {
    const totalEgresos =
      montoGastoVariable + montoGastoFijo + montoGastoSueldo;
    setOtrosEgresos(totalEgresos);

    const totalIngresos =
      Number(montoCajaInicial) + Number(montoFinal) + Number(otrosIngresos);
    setIngresosTotales(totalIngresos);
  }, [
    montoGastoVariable,
    montoGastoFijo,
    montoGastoSueldo,
    montoCajaInicial,
    montoFinal,
    otrosIngresos,
  ]);

  // 4) Redirección al cerrar caja
  useEffect(() => {
    if (isRedirect) {
      router.replace("/dashboard/operaciones/empleado");
      router.refresh();
    }
  }, [isRedirect, router]);

  // 5) Cálculo teórico de caja final
  const calcularMontoFinal = () => {
    const ingresos = (
      Number(montoFinal) +
      Number(otrosIngresos) +
      Number(montoCajaInicial)
    ).toFixed(2);
    const egresos = (
      Number(otrosEgresos) + Number(gastosAdministrativos)
    ).toFixed(2);

    return (parseFloat(ingresos) - parseFloat(egresos)).toFixed(2);
  };

  const montoFinalTeorico = Number(calcularMontoFinal());
  const diferenciaCaja =
    montoContadoCaja !== ""
      ? (Number(montoContadoCaja) - montoFinalTeorico).toFixed(2)
      : null;

  const handleRedirect = () => {
    router.push("/dashboard/operaciones/empleado");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      if (token) {
        const decoded: DecodedToken = jwtDecode(token);

        const data = {
          id: registroDiario,
          monto_final: parseFloat(calcularMontoFinal()),
          usuario_cierre_id: decoded.userId,
          sucursal_id: decoded.sucursal,
          cliente_id: getClienteId(),
          detalles: {
            gastos_administrativos: parseFloat(
              gastosAdministrativos.toFixed(2),
            ),
            otros_ingresos: parseFloat(otrosIngresos.toFixed(2)),
            otros_egresos: parseFloat(otrosEgresos.toFixed(2)),
            // si después querés guardar efectivo contado / diferencia,
            // podés agregar estos campos y ajustamos backend
            // efectivo_contado: montoContadoCaja ? Number(montoContadoCaja) : null,
            // diferencia_caja: diferenciaCaja ? Number(diferenciaCaja) : null,
          },
        };

        await cerrarCaja(data);
        setMensaje("Caja cerrada correctamente.");
        setIsRedirect(true);
      }
    } catch (error) {
      console.log(error);
      setMensaje("Error al cerrar la caja. Por favor, intente de nuevo.");
    }
  };

  if (!cajaAbierta) {
    return (
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-3 text-lg font-bold text-slate-900">
          No hay caja abierta
        </h2>
        <p className="mb-4 text-sm text-slate-600">
          Para cerrar una caja primero necesitás abrirla desde el módulo de
          operaciones.
        </p>
        <button
          className="rounded bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
          onClick={handleRedirect}
        >
          Ir a abrir caja
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      {/* Encabezado / resumen de contexto */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Cerrar Caja</h2>
          <p className="text-xs text-slate-500">
            Fecha: <span className="font-medium">{getCurrentDate().fecha}</span> ·
            Caja ID: <span className="font-mono">{registroDiario}</span>
          </p>
        </div>
      </div>

      {mensaje && (
        <p
          className={`mb-4 text-sm ${
            mensaje.includes("Error") ? "text-red-600" : "text-green-600"
          }`}
        >
          {mensaje}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Resumen de ingresos / egresos */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Panel ingresos */}
          <div className="rounded-xl border border-slate-200 p-4">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">
              Ingresos
            </h3>

            <div className="mb-2 space-y-1 text-xs">
              <label className="block text-slate-600">Caja inicial</label>
              <input
                type="number"
                value={montoCajaInicial}
                readOnly
                className="w-full rounded border border-slate-200 px-3 py-2 text-sm bg-slate-50"
              />
            </div>

            <div className="mb-2 space-y-1 text-xs">
              <label className="block text-slate-600">Ventas del día</label>
              <input
                type="number"
                value={montoFinal}
                readOnly
                className="w-full rounded border border-slate-200 px-3 py-2 text-sm bg-slate-50"
              />
            </div>

            <div className="mb-2 space-y-1 text-xs">
              <label className="block text-slate-600">
                Otros ingresos (manual)
              </label>
              <input
                type="number"
                value={otrosIngresos}
                onChange={(e) => setOtrosIngresos(Number(e.target.value) || 0)}
                className="w-full rounded border border-slate-200 px-3 py-2 text-sm"
              />
            </div>

            <div className="mt-3 flex items-center justify-between border-t pt-2 text-xs">
              <span className="font-medium text-slate-700">
                Ingresos totales
              </span>
              <span className="font-semibold text-slate-900">
                ${ingresosTotales.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Panel egresos */}
          <div className="rounded-xl border border-slate-200 p-4">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">
              Egresos
            </h3>

            <div className="mb-2 grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-slate-600">Sueldos</label>
                <input
                  type="number"
                  value={montoGastoSueldo}
                  readOnly
                  className="w-full rounded border border-slate-200 px-3 py-2 text-sm bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-slate-600">Gastos fijos</label>
                <input
                  type="number"
                  value={montoGastoFijo}
                  readOnly
                  className="w-full rounded border border-slate-200 px-3 py-2 text-sm bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-slate-600">Gastos variables</label>
                <input
                  type="number"
                  value={montoGastoVariable}
                  readOnly
                  className="w-full rounded border border-slate-200 px-3 py-2 text-sm bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-slate-600">
                  Otros egresos (adm. manual)
                </label>
                <input
                  type="number"
                  value={gastosAdministrativos}
                  onChange={(e) =>
                    setGastosAdministrativos(Number(e.target.value) || 0)
                  }
                  className="w-full rounded border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between border-t pt-2 text-xs">
              <span className="font-medium text-slate-700">
                Egresos totales
              </span>
              <span className="font-semibold text-slate-900">
                ${(otrosEgresos + gastosAdministrativos).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Resumen final + efectivo contado */}
        <div className="rounded-xl border border-slate-200 p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-900">
            Resumen de cierre
          </h3>

          <div className="mb-3 space-y-1 text-xs">
            <label className="block text-slate-600">
              Monto final teórico (según sistema)
            </label>
            <input
              type="number"
              value={montoFinalTeorico.toFixed(2)}
              readOnly
              className="w-full rounded border border-slate-200 px-3 py-2 text-sm bg-slate-50"
            />
          </div>

          <div className="mb-2 space-y-1 text-xs">
            <label className="block text-slate-600">
              Efectivo contado en caja
            </label>
            <input
              type="number"
              value={montoContadoCaja}
              onChange={(e) => setMontoContadoCaja(e.target.value)}
              className="w-full rounded border border-slate-200 px-3 py-2 text-sm"
              placeholder="Lo que realmente hay en la caja"
            />
          </div>

          {diferenciaCaja !== null && (
            <p
              className={`mt-1 text-xs font-medium ${
                Number(diferenciaCaja) === 0
                  ? "text-green-600"
                  : "text-amber-600"
              }`}
            >
              {Number(diferenciaCaja) === 0
                ? "Sin diferencias de caja."
                : `Diferencia de caja: $${diferenciaCaja}`}
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Cerrar caja
          </button>
        </div>
      </form>
    </div>
  );
};

export default CerrarCajaForm;
