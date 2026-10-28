"use client";

import { logError } from '@/app/lib/logger';
import { getClienteId } from "@/app/lib/authService";
import { medioDeFila, MedioPagoOpcion } from '@/app/lib/medioPagoGasto';
import { getMedioPagoList } from '@/app/lib/mediopago.api';
import { crearGasto, getGastoCategorias, getGastosPorRegistro, eliminarGasto, getRegistrosDiarios } from '@/app/lib/gasto';
import { Trash2 } from 'lucide-react';
import { notifyError, notifySuccess } from '@/app/lib/notificationService';
import { getCajaInicial, pedidoMontoTotalDiario } from '@/app/lib/operaciones.api';
import { getGastosConfig, getGastosPorPeriodo } from '@/app/lib/gastosSinCaja.api';
import { mesActual, nombreMes, rangoMes } from '@/app/lib/gastosPeriodo';
import useCajaAbierta from '@/app/lib/useCajaAbierta';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import PlanillaCajaInicial from "./PlanillaCajaInicial";
import PlanillaFijos from "./PlanillaFijos";
import PlanillaSueldos from "./PlanillaSueldos";
import PlanillaVariables from "./PlanillaVariables";
import ResumenGastos from "./ResumenGastos";

const tabs = [
  { id: "cajaInicial", label: "Caja Inicial" },
  { id: "fijos",       label: "Fijos" },
  { id: "sueldos",     label: "Sueldos" },
  { id: "variables",   label: "Variables" },
  { id: "resumen",     label: "Resumen" },
];

const TIPO_POR_SOLAPA = {
  fijos:       1,
  sueldos:     3,
  variables:   2,
  cajaInicial: 4,
};

const CATEGORIA_POR_TIPO = {
  fijos:    1,
  sueldos:  3,
  variables: 2,
};

export default function GastoWizard() {
  const [activeTab, setActiveTab] = useState("cajaInicial");
  const [categoriasCompletas, setCategoriasCompletas] = useState<any[]>([]);
  const [categoriasFiltradas, setCategoriasFiltradas] = useState<any[]>([]);
  const [gastosExistentes, setGastosExistentes] = useState<any[]>([]);
  const [medios, setMedios] = useState<MedioPagoOpcion[]>([]);
  const { cajaAbierta, registroDiarioId } = useCajaAbierta();
  const router = useRouter();

  // Modo sin caja: un tenant sin el módulo 'operaciones' (ej. academia) no
  // abre caja. Mismas solapas y planillas; los gastos se guardan sin id de
  // operación (registro_diario_id) y se agrupan por mes en vez de por caja.
  // La API decide (GET /salida-caja/config) y valida lo mismo al guardar.
  const [requiereCaja, setRequiereCaja] = useState<boolean | null>(null);
  const sinCaja = requiereCaja === false;
  const [mes, setMes] = useState(mesActual());
  const tabsVisibles = sinCaja ? tabs.filter((t) => t.id !== 'cajaInicial') : tabs;

  useEffect(() => {
    let cancelado = false;
    getGastosConfig()
      .then((cfg) => { if (!cancelado) setRequiereCaja(cfg.requiereCaja); })
      .catch((error) => {
        // Si no se puede consultar, comportamiento previo: con caja.
        logError('No se pudo consultar la config de gastos', error);
        if (!cancelado) setRequiereCaja(true);
      });
    return () => { cancelado = true; };
  }, []);

  useEffect(() => {
    if (sinCaja && activeTab === 'cajaInicial') setActiveTab('fijos');
  }, [sinCaja, activeTab]);

  /** Gastos de la caja abierta, o del mes elegido en modo sin caja. */
  const cargarGastos = async (): Promise<any[]> => {
    if (sinCaja) {
      const rango = rangoMes(mes);
      return rango ? getGastosPorPeriodo(rango.desde, rango.hasta) : [];
    }
    return registroDiarioId ? getGastosPorRegistro(registroDiarioId, getClienteId()) : [];
  };

  // bug 39: vista histórica read-only cuando no hay caja abierta
  const [histRegistros, setHistRegistros] = useState<any[]>([]);
  const [histSelId, setHistSelId] = useState<number | null>(null);
  const [histGastos, setHistGastos] = useState<any[]>([]);
  const [histVentas, setHistVentas] = useState<number>(0);
  const [histLoading, setHistLoading] = useState(false);

  const INITIAL_FORM = {
    fijos:       [] as { servicio: string; monto: number; medio_pago_id?: number }[],
    sueldos:     [] as { empleado: string; monto: number; medio_pago_id?: number }[],
    variables:   [] as { concepto: string; monto: number; medio_pago_id?: number }[],
    cajaInicial: { inicio: 0, ventas: 0 },
  };

  const [form, setForm] = useState(INITIAL_FORM);

  useEffect(() => {
    if (requiereCaja === null) return;
    const conCaja = !sinCaja && registroDiarioId;
    const fetchData = async () => {
      try {
        const [categoriasData, gastosData, montoVentas, montoCajaInicial] = await Promise.all([
          getGastoCategorias(getClienteId()),
          cargarGastos(),
          conCaja ? pedidoMontoTotalDiario(registroDiarioId, getClienteId()) : Promise.resolve({ sum: 0 }),
          conCaja ? getCajaInicial(registroDiarioId, getClienteId()) : Promise.resolve({ sum: 0 }),
        ]);
        getMedioPagoList().then((m: MedioPagoOpcion[]) => setMedios(Array.isArray(m) ? m : []));
        setCategoriasCompletas(categoriasData);
        setGastosExistentes(gastosData);
        setForm(prev => ({
          ...prev,
          cajaInicial: {
            inicio: Number(montoCajaInicial.sum) || 0,
            ventas: Number(montoVentas.sum) || 0,
          },
        }));
        const tipoId = TIPO_POR_SOLAPA[activeTab as keyof typeof TIPO_POR_SOLAPA];
        setCategoriasFiltradas(categoriasData.filter((c: any) => c.categoria_tipo_id === tipoId));
      } catch (error) {
        logError("Error cargando datos:", error);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registroDiarioId, requiereCaja, mes]);

  // bug 39: cargar registros de los últimos 30 días cuando la caja está cerrada
  useEffect(() => {
    if (cajaAbierta || requiereCaja !== true) return;
    (async () => {
      try {
        const regs = await getRegistrosDiarios('mes', getClienteId());
        setHistRegistros(Array.isArray(regs) ? regs : []);
      } catch (error) {
        logError('Error cargando registros históricos:', error);
      }
    })();
  }, [cajaAbierta, requiereCaja]);

  const verFlujoHistorico = async (registroId: number) => {
    setHistSelId(registroId);
    if (!registroId) { setHistGastos([]); setHistVentas(0); return; }
    setHistLoading(true);
    try {
      const [gastos, ventas] = await Promise.all([
        getGastosPorRegistro(registroId, getClienteId()),
        pedidoMontoTotalDiario(registroId, getClienteId()),
      ]);
      setHistGastos(Array.isArray(gastos) ? gastos : []);
      setHistVentas(Number(ventas?.sum) || 0);
    } catch (error) {
      logError('Error cargando flujo histórico:', error);
      notifyError('No se pudo cargar el flujo de ese día');
    } finally {
      setHistLoading(false);
    }
  };

  useEffect(() => {
    if (categoriasCompletas.length > 0) {
      const tipoId = TIPO_POR_SOLAPA[activeTab as keyof typeof TIPO_POR_SOLAPA];
      setCategoriasFiltradas(categoriasCompletas.filter((c: any) => c.categoria_tipo_id === tipoId));
    }
  }, [activeTab, categoriasCompletas]);

  const handleGuardarGastos = async (tipo: keyof typeof CATEGORIA_POR_TIPO) => {
    if (!sinCaja && !registroDiarioId) { notifyError('No hay registro diario activo'); return; }
    const token = localStorage.getItem('token');
    if (!token) { notifyError('No hay sesión activa'); return; }

    try {
      const decoded = jwtDecode<{ userId: number }>(token);
      const usuario_id = decoded.userId;
      const categoriaId = CATEGORIA_POR_TIPO[tipo];

      let payload: any[] = [];
      if (tipo === 'fijos') {
        payload = form.fijos.filter((g: any) => g.servicio && g.monto).map((g: any) => ({
          descripcion: g.servicio, monto: g.monto,
          categoria_salida_id: categoriaId, registro_diario_id: sinCaja ? null : registroDiarioId,
          usuario_id, cliente_id: getClienteId(),
          medio_pago_id: medioDeFila(g.medio_pago_id, medios) ?? null,
        }));
      } else if (tipo === 'sueldos') {
        payload = form.sueldos.filter((g: any) => g.empleado && g.monto).map((g: any) => ({
          descripcion: g.empleado, monto: g.monto,
          categoria_salida_id: categoriaId, registro_diario_id: sinCaja ? null : registroDiarioId,
          usuario_id, cliente_id: getClienteId(),
          medio_pago_id: medioDeFila(g.medio_pago_id, medios) ?? null,
        }));
      } else if (tipo === 'variables') {
        payload = form.variables.filter((g: any) => g.concepto && g.monto).map((g: any) => ({
          descripcion: g.concepto, monto: g.monto,
          categoria_salida_id: categoriaId, registro_diario_id: sinCaja ? null : registroDiarioId,
          usuario_id, cliente_id: getClienteId(),
          medio_pago_id: medioDeFila(g.medio_pago_id, medios) ?? null,
        }));
      }

      if (payload.length === 0) { notifyError('Ingresá al menos un gasto válido'); return; }
      await crearGasto(payload);
      notifySuccess('Gastos registrados correctamente');
      // Sin caja el gasto queda con fecha de hoy: si se miraba otro mes, se vuelve al actual.
      if (sinCaja && mes !== mesActual()) setMes(mesActual());
      else setGastosExistentes(await cargarGastos());
      setForm(prev => ({ ...prev, [tipo]: [] }));
    } catch (error) {
      logError('Error al guardar gastos:', error);
      notifyError('Error al registrar los gastos');
    }
  };

  const handleEliminarGasto = async (id: number) => {
    if (!id) return;
    if (!confirm('¿Eliminar este gasto?')) return;
    try {
      await eliminarGasto(id, getClienteId());
      notifySuccess('Gasto eliminado');
      if (sinCaja || registroDiarioId) setGastosExistentes(await cargarGastos());
    } catch (error: any) {
      logError('No se pudo eliminar el gasto', error);
      notifyError(error?.message || 'No se pudo eliminar el gasto');
    }
  };

  const handleGuardarSolapaActual = () => {
    if (activeTab === 'fijos')    return handleGuardarGastos('fijos');
    if (activeTab === 'sueldos')  return handleGuardarGastos('sueldos');
    if (activeTab === 'variables') return handleGuardarGastos('variables');
    notifyError('Esta solapa no tiene guardado');
  };

  // bug 39: sin caja abierta -> no bloquear; permitir consultar flujo histórico read-only
  if (requiereCaja === null) {
    return (
      <div className="animate-pulse space-y-4" aria-busy="true">
        <div className="h-8 w-48 rounded-md bg-brand-100" />
        <div className="h-64 rounded-xl bg-brand-100" />
      </div>
    );
  }

  if (!cajaAbierta && !sinCaja) {
    const totalHistGastos = histGastos.reduce((acc: number, g: any) => acc + (Number(g.monto) || 0), 0);
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-brand-300 text-sm mb-4">
            No hay caja abierta. Podés consultar el flujo de días anteriores o abrir operaciones.
          </p>
          <button
            onClick={() => router.push('/dashboard/operaciones/empleado')}
            className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-brand hover:bg-brand-700 transition-colors"
          >
            Abrir operaciones
          </button>
        </div>

        <div className="rounded-xl border border-brand-100 bg-white p-4 shadow-card">
          <h3 className="mb-3 text-sm font-semibold text-brand-800">Flujo de días anteriores</h3>
          {histRegistros.length === 0 ? (
            <p className="text-sm text-brand-300">No hay registros diarios en los últimos 30 días.</p>
          ) : (
            <>
              <select
                value={histSelId ?? ''}
                onChange={(e) => verFlujoHistorico(Number(e.target.value))}
                className="w-full rounded-md border border-brand-200 px-3 py-2 text-sm"
              >
                <option value="">Elegí una fecha…</option>
                {histRegistros.map((r: any) => (
                  <option key={r.id} value={r.id}>
                    {String(r.fecha).slice(0, 10)}
                  </option>
                ))}
              </select>

              {histLoading && <p className="mt-3 text-sm text-brand-300">Cargando…</p>}

              {!histLoading && histSelId && (
                <div className="mt-4 space-y-3">
                  <div className="flex justify-between rounded-md bg-brand-50 px-3 py-2 text-sm">
                    <span className="text-brand-600">Ventas del día</span>
                    <span className="font-bold text-brand-800">${histVentas.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between rounded-md bg-brand-50 px-3 py-2 text-sm">
                    <span className="text-brand-600">Total gastos</span>
                    <span className="font-bold text-brand-800">${totalHistGastos.toFixed(2)}</span>
                  </div>
                  {histGastos.length === 0 ? (
                    <p className="text-sm text-brand-300">Sin gastos registrados ese día.</p>
                  ) : (
                    <ul className="divide-y divide-brand-100">
                      {histGastos.map((g: any, i: number) => (
                        <li key={g.id ?? i} className="flex items-center justify-between py-2 text-sm">
                          <span className="text-brand-700 truncate pr-3">
                            {g.descripcion}
                            {g.categoria_nombre && (
                              <span className="ml-1.5 rounded-full bg-brand-100 px-1.5 py-0.5 text-[10px] font-semibold text-brand-600">
                                {g.categoria_nombre}
                              </span>
                            )}
                            {g.medio_pago_codigo && g.medio_pago_codigo !== 'EFE' && (
                              <span className="ml-1.5 rounded-full bg-accent-400/15 px-1.5 py-0.5 text-[10px] font-semibold text-brand-600">
                                {g.medio_pago}
                              </span>
                            )}
                          </span>
                          <span className="shrink-0 font-bold text-brand-800">${g.monto}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Título */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-2xl text-brand-800">Flujo de caja</h1>
        {sinCaja && (
          <label className="text-sm text-brand-600">
            <span className="mb-1 block font-medium">Mes</span>
            <input
              type="month"
              value={mes}
              max={mesActual()}
              onChange={(e) => e.target.value && setMes(e.target.value)}
              className="rounded-md border border-brand-200 px-3 py-2 text-sm"
            />
          </label>
        )}
      </div>

      {/* Tabs — scrollables en mobile */}
      <div className="flex gap-2 overflow-x-auto pb-1 border-b border-brand-200 scrollbar-hide">
        {tabsVisibles.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 rounded-t-lg px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === tab.id
                ? 'bg-brand-600 text-white'
                : 'bg-brand-50 text-brand-600 hover:bg-brand-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Panel activo */}
      <div className="rounded-xl border border-brand-100 bg-white p-4 shadow-card">
        {activeTab === "cajaInicial" && <PlanillaCajaInicial data={form.cajaInicial} />}
        {activeTab === "fijos"       && (
          <PlanillaFijos
            data={form.fijos}
            onUpdate={(val) => setForm(p => ({ ...p, fijos: val }))}
            categorias={categoriasFiltradas}
            medios={medios}
          />
        )}
        {activeTab === "sueldos"     && (
          <PlanillaSueldos
            data={form.sueldos}
            onUpdate={(val) => setForm(p => ({ ...p, sueldos: val }))}
            categorias={categoriasFiltradas}
            medios={medios}
          />
        )}
        {activeTab === "variables"   && (
          <PlanillaVariables
            data={form.variables}
            onUpdate={(val) => setForm(p => ({ ...p, variables: val }))}
            categorias={categoriasFiltradas}
            medios={medios}
          />
        )}
        {activeTab === "resumen"     && (
          <ResumenGastos
            data={form}
            gastosExistentes={gastosExistentes}
            registroDiarioId={sinCaja ? null : registroDiarioId}
            sinCaja={sinCaja}
            periodo={sinCaja ? nombreMes(mes) : undefined}
          />
        )}

        {['fijos', 'sueldos', 'variables'].includes(activeTab) && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleGuardarSolapaActual}
              className="rounded-full bg-accent-500 px-6 py-2.5 text-sm font-semibold text-white shadow-accent hover:bg-accent-400 transition-colors"
            >
              Guardar {tabs.find(t => t.id === activeTab)?.label}
            </button>
          </div>
        )}
      </div>

      {/* Gastos registrados hoy */}
      {activeTab !== 'resumen' && (gastosExistentes.length > 0 || sinCaja) && (
        <div className="rounded-xl border border-brand-100 bg-white p-4 shadow-card">
          <h3 className="mb-3 text-sm font-semibold text-brand-800">
            {sinCaja ? `Gastos de ${nombreMes(mes)}` : 'Gastos registrados hoy'}
          </h3>
          {sinCaja && gastosExistentes.length === 0 && (
            <p className="text-sm text-brand-300">Sin gastos registrados en este mes.</p>
          )}
          <ul className="divide-y divide-brand-100">
            {gastosExistentes.map((g: any, i: number) => (
              <li key={g.id ?? i} className="flex items-center justify-between py-2 text-sm">
                <span className="text-brand-700 truncate pr-3">
                  {sinCaja && g.fecha && (
                    <span className="mr-2 tabular-nums text-brand-300">
                      {String(g.fecha).slice(0, 10).split('-').reverse().slice(0, 2).join('/')}
                    </span>
                  )}
                  {g.descripcion}
                  {g.categoria_nombre && (
                    <span className="ml-1.5 rounded-full bg-brand-100 px-1.5 py-0.5 text-[10px] font-semibold text-brand-600">
                      {g.categoria_nombre}
                    </span>
                  )}
                </span>
                <span className="flex shrink-0 items-center gap-3">
                  <span className="font-bold text-brand-800">${g.monto}</span>
                  <button
                    onClick={() => handleEliminarGasto(g.id)}
                    title="Eliminar gasto"
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
