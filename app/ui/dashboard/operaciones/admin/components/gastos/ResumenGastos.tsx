"use client";
import { getClienteId } from "@/app/lib/authService";
import { gatosMontoTotalDiario } from '@/app/lib/gasto';
import { pedidoMontoTotalDiario } from '@/app/lib/operaciones.api';
import { useEffect, useState } from 'react';

interface Fijo {
  servicio: string;
  monto: number;
}

interface Sueldo {
  empleado: string;
  monto: number;
}

interface Variable {
  concepto: string;
  monto: number;
}

interface Caja {
  inicio?: number;
  ventas?: number;
  contada?: number;
  real?: number;
}

interface FormData {
  fijos: Fijo[];
  sueldos: Sueldo[];
  variables: Variable[];
  cajaInicial: Caja;
  cajaFinal: Caja;
}

interface Props {
  data: FormData;
  gastosExistentes?: any[]; // Si aún necesitas esto
  registroDiarioId?: number ; // Nueva prop
}

export default function ResumenGastos({ data, gastosExistentes = [], registroDiarioId }: Props) {
  const [montoFinal, setMontoFinal] = useState(0); 
  const [ montoGastoSueldo, setGastoSueldos] = useState(0);
  const [ montoGastoFijo, setGastoFijo] = useState(0);
  const [ montoGastoVariable, setGastoVariable] = useState(0);
  useEffect(() => {
    const obtenerMontoPedidos = async () => {
            try {
              const montoPedidos = await pedidoMontoTotalDiario(registroDiarioId,getClienteId());
              setMontoFinal(montoPedidos.sum);
            } catch (error) {
                console.error("Error al obtener pedidos del día:", error);
                setMontoFinal(0);
            } 
    };
    const obtenerMontoGastoSueldos = async () => {
      try { 
        const monto = await gatosMontoTotalDiario(registroDiarioId,"sueldos",getClienteId());
        // Usar parseFloat para manejar decimales
        const montoNumerico = parseFloat(monto);
        if (!isNaN(montoNumerico)) {
          setGastoSueldos(montoNumerico);
        } else {
          console.warn("El monto recibido no es un número válido:", monto);
          setGastoSueldos(0);
        }
      } catch (error){
        console.error("Error al obtener gastos de sueldo", error);
        setGastoSueldos(0);
      }
    }
    const obtenerMontoGastoFijo = async () => {
      try { 
        const monto = await gatosMontoTotalDiario(registroDiarioId,"fijo",getClienteId());
        const montoNumerico = parseFloat(monto);
        if (!isNaN(montoNumerico)) {
          setGastoFijo(Number(monto));
        } else {
          console.warn("El monto recibido no es un número válido:", monto);
          setGastoFijo(0);
        }
        
      } catch (error){
        console.error("Error al obtener gastos de fijo", error);
        setGastoFijo(0);
      }
    }
    const obtenerMontoGastoVariable = async () => {
      try { 
        const monto = await gatosMontoTotalDiario(registroDiarioId,"variable",getClienteId());
        const montoNumerico = parseFloat(monto);
        if (!isNaN(montoNumerico)) {
          setGastoVariable(Number(monto));
        } else {
          console.warn("El monto recibido no es un número válido:", monto);
          setGastoVariable(0);
        }
      } catch (error){
        console.error("Error al obtener gastos de variable", error);
        setGastoVariable(0);
      }
    }
    obtenerMontoGastoFijo();
    obtenerMontoGastoVariable();
    obtenerMontoGastoSueldos();
    obtenerMontoPedidos();
}, []);
  const totalFijos = data.fijos.reduce(
    (sum, f) => sum + (Number(f.monto) || 0),
    0
  );
  const totalSueldos = data.sueldos.reduce(
    (sum, s) => sum + (Number(s.monto) || 0),
    0
  );
  const totalVariables = data.variables.reduce(
    (sum, v) => sum + (Number(v.monto) || 0),
    0
  );

  const totalGastos = montoGastoFijo + montoGastoSueldo + montoGastoVariable;
  const cajaInicial = Number(data.cajaInicial?.inicio || 0);
  const ventas = Number(montoFinal || 0);
  const cajaContada = Number(data.cajaFinal?.contada || 0);
  const cajaReal = Number(data.cajaFinal?.real || 0);

  return (
    <div className="mt-6 p-4 border rounded bg-gray-50">
      <h2 className="text-xl font-bold mb-4">📊 Resumen de Gastos</h2>

      <ul className="space-y-2">
        <li>Gastos Fijos: <strong>${montoGastoFijo.toFixed(2)}</strong></li>
        <li>Sueldos: <strong>${montoGastoSueldo.toFixed(2)}</strong></li>
        <li>Gastos Insumos: <strong>${montoGastoVariable.toFixed(2)}</strong></li>
        <li className="font-bold">Total Gastos: ${totalGastos.toFixed(2)}</li>
      </ul>

      <h3 className="text-lg font-semibold mt-4">💰 Caja</h3>
      <ul className="space-y-1">
        <li>Caja Inicial: ${cajaInicial.toFixed(2)}</li>
        <li>Ventas: ${ventas.toFixed(2)}</li>
        <li>Caja Contada: ${cajaContada.toFixed(2)}</li>
        <li>Caja Real: ${cajaReal.toFixed(2)}</li>
      </ul>
    </div>
  );
}
