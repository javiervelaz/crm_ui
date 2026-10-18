"use client";
import { getClienteId } from "@/app/lib/authService";
import { gatosMontoTotalDiario } from '@/app/lib/gasto';
import { pedidoMontoTotalDiario } from '@/app/lib/operaciones.api';
import { totalesPorTipo } from '@/app/lib/gastosPeriodo';
import { useEffect, useState } from 'react';

interface Fijo { servicio: string; monto: number; }
interface Sueldo { empleado: string; monto: number; }
interface Variable { concepto: string; monto: number; }
interface Caja { inicio?: number; ventas?: number; contada?: number; real?: number; }

interface FormData {
  fijos: Fijo[];
  sueldos: Sueldo[];
  variables: Variable[];
  cajaInicial: Caja;
  cajaFinal?: Caja;
}

interface Props {
  data: FormData;
  gastosExistentes?: any[];
  registroDiarioId?: number | null;
  /** Tenant sin caja (sin módulo 'operaciones'): totales del período, sin caja ni ventas. */
  sinCaja?: boolean;
  /** Etiqueta del período en modo sin caja, ej. 'octubre de 2026'. */
  periodo?: string;
}

export default function ResumenGastos({ data, registroDiarioId, gastosExistentes = [], sinCaja = false, periodo }: Props) {
  const [montoFinal, setMontoFinal] = useState(0);
  const [montoGastoSueldo, setGastoSueldos] = useState(0);
  const [montoGastoFijo, setGastoFijo] = useState(0);
  const [montoGastoVariable, setGastoVariable] = useState(0);

  useEffect(() => {
    if (!registroDiarioId) return;
    const rid = registroDiarioId;
    const obtenerMontoPedidos = async () => {
      try {
        const montoPedidos = await pedidoMontoTotalDiario(rid, getClienteId());
        setMontoFinal(montoPedidos.sum);
      } catch { setMontoFinal(0); }
    };
    const obtenerMontoGastoSueldos = async () => {
      try {
        const monto = await gatosMontoTotalDiario(rid, "sueldos", getClienteId());
        const n = parseFloat(monto);
        setGastoSueldos(isNaN(n) ? 0 : n);
      } catch { setGastoSueldos(0); }
    };
    const obtenerMontoGastoFijo = async () => {
      try {
        const monto = await gatosMontoTotalDiario(rid, "fijo", getClienteId());
        const n = parseFloat(monto);
        setGastoFijo(isNaN(n) ? 0 : n);
      } catch { setGastoFijo(0); }
    };
    const obtenerMontoGastoVariable = async () => {
      try {
        const monto = await gatosMontoTotalDiario(rid, "variable", getClienteId());
        const n = parseFloat(monto);
        setGastoVariable(isNaN(n) ? 0 : n);
      } catch { setGastoVariable(0); }
    };
    obtenerMontoGastoFijo();
    obtenerMontoGastoVariable();
    obtenerMontoGastoSueldos();
    obtenerMontoPedidos();
  }, []);

  // Sin caja no hay registro diario: los totales salen de los gastos del período.
  if (sinCaja) {
    const t = totalesPorTipo(gastosExistentes);
    return (
      <ResumenSinCaja fijo={t.fijo} sueldos={t.sueldos} variable={t.variable} periodo={periodo} />
    );
  }

  const totalGastos = montoGastoFijo + montoGastoSueldo + montoGastoVariable;
  const cajaInicial = Number(data.cajaInicial?.inicio || 0);
  const ventas = Number(montoFinal || 0);
  const cajaContada = Number(data.cajaFinal?.contada || 0);
  const cajaReal = Number(data.cajaFinal?.real || 0);
  const resultado = ventas + cajaInicial - totalGastos;

  const fmt = (n: number) => n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div>
      <h2 className="mb-4 text-lg font-bold text-brand-800">Resumen de Gastos</h2>

      {/* Gastos cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="rounded-xl border border-brand-100 bg-brand-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-300 mb-1">Gastos Fijos</p>
          <p className="text-xl font-bold text-brand-800">${fmt(montoGastoFijo)}</p>
        </div>
        <div className="rounded-xl border border-brand-100 bg-brand-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-300 mb-1">Sueldos</p>
          <p className="text-xl font-bold text-brand-800">${fmt(montoGastoSueldo)}</p>
        </div>
        <div className="rounded-xl border border-brand-100 bg-brand-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-300 mb-1">Variables</p>
          <p className="text-xl font-bold text-brand-800">${fmt(montoGastoVariable)}</p>
        </div>
      </div>

      {/* Total gastos */}
      <div className="rounded-xl border border-red-100 bg-red-50 p-4 mb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-red-400 mb-1">Total Gastos</p>
        <p className="text-2xl font-bold text-red-600">${fmt(totalGastos)}</p>
      </div>

      {/* Caja */}
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand-600">Caja</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="rounded-xl border border-brand-100 bg-brand-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-300 mb-1">Caja Inicial</p>
          <p className="text-xl font-bold text-brand-800">${fmt(cajaInicial)}</p>
        </div>
        <div className="rounded-xl border border-brand-100 bg-brand-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-300 mb-1">Ventas</p>
          <p className="text-xl font-bold text-brand-800">${fmt(ventas)}</p>
        </div>
        <div className="rounded-xl border border-brand-100 bg-brand-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-300 mb-1">Caja Contada</p>
          <p className="text-xl font-bold text-brand-800">${fmt(cajaContada)}</p>
        </div>
        <div className="rounded-xl border border-brand-100 bg-brand-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-300 mb-1">Caja Real</p>
          <p className="text-xl font-bold text-brand-800">${fmt(cajaReal)}</p>
        </div>
      </div>

      {/* Resultado neto */}
      <div className={`rounded-xl border p-4 ${resultado >= 0 ? 'border-green-100 bg-green-50' : 'border-red-100 bg-red-50'}`}>
        <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${resultado >= 0 ? 'text-green-500' : 'text-red-400'}`}>
          Resultado Neto
        </p>
        <p className={`text-2xl font-bold ${resultado >= 0 ? 'text-green-700' : 'text-red-600'}`}>
          ${fmt(resultado)}
        </p>
      </div>
    </div>
  );
}

const fmtSinCaja = (n: number) =>
  n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Resumen para tenants sin caja: mismas tarjetas de gastos, sin la sección Caja. */
function ResumenSinCaja({ fijo, sueldos, variable, periodo }: {
  fijo: number; sueldos: number; variable: number; periodo?: string;
}) {
  const total = fijo + sueldos + variable;
  return (
    <div>
      <h2 className="mb-4 text-lg font-bold text-brand-800">
        Resumen de Gastos{periodo ? ` — ${periodo}` : ''}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="rounded-xl border border-brand-100 bg-brand-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-300 mb-1">Gastos Fijos</p>
          <p className="text-xl font-bold text-brand-800">${fmtSinCaja(fijo)}</p>
        </div>
        <div className="rounded-xl border border-brand-100 bg-brand-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-300 mb-1">Sueldos</p>
          <p className="text-xl font-bold text-brand-800">${fmtSinCaja(sueldos)}</p>
        </div>
        <div className="rounded-xl border border-brand-100 bg-brand-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-300 mb-1">Variables</p>
          <p className="text-xl font-bold text-brand-800">${fmtSinCaja(variable)}</p>
        </div>
      </div>
      <div className="rounded-xl border border-red-100 bg-red-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-red-400 mb-1">Total Gastos</p>
        <p className="text-2xl font-bold text-red-600">${fmtSinCaja(total)}</p>
      </div>
    </div>
  );
}
