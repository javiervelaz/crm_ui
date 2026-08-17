"use client";

import { logError } from '@/app/lib/logger';
import { getClienteId } from "@/app/lib/authService";
import { crearGasto, getGastoCategorias, getGastosPorRegistro } from '@/app/lib/gasto';
import { notifyError, notifySuccess } from '@/app/lib/notificationService';
import { getCajaInicial, pedidoMontoTotalDiario } from '@/app/lib/operaciones.api';
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
  { id: "variables",   label: "Insumos" },
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
  const { cajaAbierta, registroDiarioId } = useCajaAbierta();
  const router = useRouter();

  const INITIAL_FORM = {
    fijos:       [] as { servicio: string; monto: number }[],
    sueldos:     [] as { empleado: string; monto: number }[],
    variables:   [] as { concepto: string; monto: number }[],
    cajaInicial: { inicio: 0, ventas: 0 },
  };

  const [form, setForm] = useState(INITIAL_FORM);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriasData, gastosData, montoVentas, montoCajaInicial] = await Promise.all([
          getGastoCategorias(getClienteId()),
          registroDiarioId ? getGastosPorRegistro(registroDiarioId, getClienteId()) : Promise.resolve([]),
          registroDiarioId ? pedidoMontoTotalDiario(registroDiarioId, getClienteId()) : Promise.resolve({ sum: 0 }),
          registroDiarioId ? getCajaInicial(registroDiarioId, getClienteId()) : Promise.resolve({ sum: 0 }),
        ]);
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
  }, [registroDiarioId]);

  useEffect(() => {
    if (categoriasCompletas.length > 0) {
      const tipoId = TIPO_POR_SOLAPA[activeTab as keyof typeof TIPO_POR_SOLAPA];
      setCategoriasFiltradas(categoriasCompletas.filter((c: any) => c.categoria_tipo_id === tipoId));
    }
  }, [activeTab, categoriasCompletas]);

  const handleGuardarGastos = async (tipo: keyof typeof CATEGORIA_POR_TIPO) => {
    if (!registroDiarioId) { notifyError('No hay registro diario activo'); return; }
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
          categoria_salida_id: categoriaId, registro_diario_id: registroDiarioId,
          usuario_id, cliente_id: getClienteId(),
        }));
      } else if (tipo === 'sueldos') {
        payload = form.sueldos.filter((g: any) => g.empleado && g.monto).map((g: any) => ({
          descripcion: g.empleado, monto: g.monto,
          categoria_salida_id: categoriaId, registro_diario_id: registroDiarioId,
          usuario_id, cliente_id: getClienteId(),
        }));
      } else if (tipo === 'variables') {
        payload = form.variables.filter((g: any) => g.concepto && g.monto).map((g: any) => ({
          descripcion: g.concepto, monto: g.monto,
          categoria_salida_id: categoriaId, registro_diario_id: registroDiarioId,
          usuario_id, cliente_id: getClienteId(),
        }));
      }

      if (payload.length === 0) { notifyError('Ingresá al menos un gasto válido'); return; }
      await crearGasto(payload);
      notifySuccess('Gastos registrados correctamente');
      const nuevosGastos = await getGastosPorRegistro(registroDiarioId, getClienteId());
      setGastosExistentes(nuevosGastos);
      setForm(prev => ({ ...prev, [tipo]: [] }));
    } catch (error) {
      logError('Error al guardar gastos:', error);
      notifyError('Error al registrar los gastos');
    }
  };

  const handleGuardarSolapaActual = () => {
    if (activeTab === 'fijos')    return handleGuardarGastos('fijos');
    if (activeTab === 'sueldos')  return handleGuardarGastos('sueldos');
    if (activeTab === 'variables') return handleGuardarGastos('variables');
    notifyError('Esta solapa no tiene guardado');
  };

  if (!cajaAbierta) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-brand-300 text-sm mb-4">
          No hay operaciones diarias abiertas.
        </p>
        <button
          onClick={() => router.push('/dashboard/operaciones/empleado')}
          className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-brand hover:bg-brand-700 transition-colors"
        >
          Abrir operaciones
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Título */}
      <h1 className="font-display text-2xl text-brand-800">Flujo de caja</h1>

      {/* Tabs — scrollables en mobile */}
      <div className="flex gap-2 overflow-x-auto pb-1 border-b border-brand-200 scrollbar-hide">
        {tabs.map((tab) => (
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
          />
        )}
        {activeTab === "sueldos"     && (
          <PlanillaSueldos
            data={form.sueldos}
            onUpdate={(val) => setForm(p => ({ ...p, sueldos: val }))}
            categorias={categoriasFiltradas}
          />
        )}
        {activeTab === "variables"   && (
          <PlanillaVariables
            data={form.variables}
            onUpdate={(val) => setForm(p => ({ ...p, variables: val }))}
            categorias={categoriasFiltradas}
          />
        )}
        {activeTab === "resumen"     && (
          <ResumenGastos
            data={form}
            gastosExistentes={gastosExistentes}
            registroDiarioId={registroDiarioId}
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
      {activeTab !== 'resumen' && gastosExistentes.length > 0 && (
        <div className="rounded-xl border border-brand-100 bg-white p-4 shadow-card">
          <h3 className="mb-3 text-sm font-semibold text-brand-800">
            Gastos registrados hoy
          </h3>
          <ul className="divide-y divide-brand-100">
            {gastosExistentes.map((g: any, i: number) => (
              <li key={i} className="flex items-center justify-between py-2 text-sm">
                <span className="text-brand-700 truncate pr-3">
                  {g.descripcion}
                  {g.categoria_nombre && (
                    <span className="ml-1.5 rounded-full bg-brand-100 px-1.5 py-0.5 text-[10px] font-semibold text-brand-600">
                      {g.categoria_nombre}
                    </span>
                  )}
                </span>
                <span className="shrink-0 font-bold text-brand-800">${g.monto}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
