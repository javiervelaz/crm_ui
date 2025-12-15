"use client";

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
  { id: "fijos", label: "Fijos" },
  { id: "sueldos", label: "Sueldos" },
  { id: "variables", label: "Insumos" },
  { id: "resumen", label: "Resumen" },
];

// Mapeo de tipos de categoría por solapa
const TIPO_POR_SOLAPA = {
  fijos: 1,
  sueldos: 3,
  variables: 2,
  cajaInicial: 4,
};

// Mapeo de categoría ID por tipo (ajusta según tu DB)
const CATEGORIA_POR_TIPO = {
  fijos: 1,      // ID de categoría "Fijos"
  sueldos: 3,    // ID de categoría "Sueldos"
  variables: 2   // ID de categoría "Variables"
};

export default function GastoWizard() {
  const [activeTab, setActiveTab] = useState("cajaInicial");
  const [categoriasCompletas, setCategoriasCompletas] = useState<any[]>([]);
  const [categoriasFiltradas, setCategoriasFiltradas] = useState<any[]>([]);
  const [gastosExistentes, setGastosExistentes] = useState([]);
  const { cajaAbierta, registroDiarioId } = useCajaAbierta();
  const [cajaInicio, setCajaInicio] = useState(0);
  const [ventasDia, setVentasDia] = useState(0);
  const router = useRouter();


  const INITIAL_FORM = {
    fijos: [] as { servicio: string; monto: number; descripcion?: string }[],
    sueldos: [] as { empleado: string; monto: number; descripcion?: string }[],
    variables: [] as { concepto: string; monto: number; descripcion?: string }[],
    cajaInicial: { inicio: 0, ventas: 0 },
  };
  
  const [form, setForm] = useState(INITIAL_FORM);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriasData, gastosData,montoVentas,montoCajaInicial] = await Promise.all([
          getGastoCategorias(getClienteId()),
          registroDiarioId ? getGastosPorRegistro(registroDiarioId,getClienteId()) : Promise.resolve([]),
          registroDiarioId ? pedidoMontoTotalDiario(registroDiarioId,getClienteId()) : Promise.resolve({ sum: 0 }),
          registroDiarioId ? getCajaInicial(registroDiarioId,getClienteId()) : Promise.resolve(0)
        ]);
        setCategoriasCompletas(categoriasData);
        setGastosExistentes(gastosData);
        setVentasDia(Number(montoVentas.sum) || 0);
        setCajaInicio(Number(montoCajaInicial.sum) || 0);
    
        // ✅ ACTUALIZAR EL FORM CON LOS VALORES OBTENIDOS
      setForm(prev => ({
        ...prev,
        cajaInicial: {
          inicio: Number(montoCajaInicial.sum) || 0,
          ventas: Number(montoVentas.sum) || 0
        }
      }));

        // Filtrar categorías para la solapa inicial
        const tipoId = TIPO_POR_SOLAPA[activeTab as keyof typeof TIPO_POR_SOLAPA];
        const filtradas = categoriasData.filter(cat => cat.categoria_tipo_id === tipoId);
        setCategoriasFiltradas(filtradas);
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    }; 
    fetchData(); 
  }, [registroDiarioId]);

  // Actualizar categorías filtradas cuando cambia la solapa
  useEffect(() => {
    if (categoriasCompletas.length > 0) {
      const tipoId = TIPO_POR_SOLAPA[activeTab as keyof typeof TIPO_POR_SOLAPA];
      const filtradas = categoriasCompletas.filter(cat => cat.categoria_tipo_id === tipoId);
      setCategoriasFiltradas(filtradas);
    }
  }, [activeTab, categoriasCompletas]);

  // Función para guardar gastos de una categoría específica
  const handleGuardarGastos = async (tipo: keyof typeof CATEGORIA_POR_TIPO) => {
    if (!registroDiarioId) {
      notifyError('No hay registro diario activo');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      notifyError('No hay sesión activa');
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const usuario_id = decoded.userId;
      const categoriaId = CATEGORIA_POR_TIPO[tipo];

      // Preparar payload según el tipo
      let payload: any[] = [];
      switch (tipo) {
        case 'fijos':
          payload = form.fijos
            .filter(g => g.servicio && g.monto)
            .map(g => ({
              descripcion: g.servicio,
              monto: g.monto,
              categoria_salida_id: categoriaId,
              registro_diario_id: registroDiarioId,
              usuario_id: usuario_id,
              cliente_id: getClienteId()
            }));
            console.log(payload); 
          break;
        
        case 'sueldos':
          payload = form.sueldos
            .filter(g => g.empleado && g.monto)
            .map(g => ({
              descripcion: g.empleado,
              monto: g.monto,
              categoria_salida_id: categoriaId,
              registro_diario_id: registroDiarioId,
              usuario_id: usuario_id,
              cliente_id: getClienteId()
            }));
            console.log(payload);
          break;
        
        case 'variables':
          payload = form.variables
            .filter(g => g.concepto && g.monto)
            .map(g => ({
              descripcion: g.concepto,
              monto: g.monto,
              categoria_salida_id: categoriaId,
              registro_diario_id: registroDiarioId,
              usuario_id: usuario_id,
              cliente_id: getClienteId()
            }));
          break;
      }

      if (payload.length === 0) {
        notifyError('Debe ingresar al menos un gasto válido');
        return;
      }

      await crearGasto(payload);
      notifySuccess('Gastos registrados correctamente');

      // Actualizar lista de gastos existentes
      const nuevosGastos = await getGastosPorRegistro(registroDiarioId,getClienteId());
      setGastosExistentes(nuevosGastos);

      // Limpiar el formulario de la categoría guardada
      setForm(prev => ({ ...prev, [tipo]: [] }));

    } catch (error) {
      console.error('Error al guardar gastos:', error);
      notifyError('Error al registrar los gastos');
    }
  };

  // Función para manejar guardado según la solapa activa
  const handleGuardarSolapaActual = () => {
    switch (activeTab) {
      case 'fijos':
        handleGuardarGastos('fijos');
        break;
      case 'sueldos':
        handleGuardarGastos('sueldos');
        break;
      case 'variables':
        handleGuardarGastos('variables');
        break;
      default:
        notifyError('Esta solapa no tiene funcionalidad de guardado');
    }
  };

  if (!cajaAbierta) {
    return (
      <div className="text-center p-6">
        <p className="text-red-600 font-semibold text-lg mb-4">
          Todavía no se registraron operaciones diarias
        </p>
        <button
          onClick={() => router.push('/dashboard/operaciones/empleado')}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          Abrir operaciones
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      {/* Navegación de pestañas */}
      <div className="flex space-x-2 border-b mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-t-lg font-medium ${
              activeTab === tab.id
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

     

      {/* Renderizado condicional de cada planilla */}
      <div>
        {activeTab === "cajaInicial" && (
          <PlanillaCajaInicial 
            data={form.cajaInicial}
          />
        )}
        {activeTab === "fijos" && (
          <PlanillaFijos 
            data={form.fijos}
            onUpdate={(val) => setForm((prev) => ({ ...prev, fijos: val }))}
            categorias={categoriasFiltradas}
          />
        )}
        {activeTab === "sueldos" && (
          <PlanillaSueldos 
            data={form.sueldos}
            onUpdate={(val) => setForm((prev) => ({ ...prev, sueldos: val }))}
            categorias={categoriasFiltradas}
          />
        )}
        {activeTab === "variables" && (
          <PlanillaVariables 
            data={form.variables}
            onUpdate={(val) => setForm((prev) => ({ ...prev, variables: val }))}
            categorias={categoriasFiltradas}
          />
        )}
        
        {activeTab === "resumen" && (
          <ResumenGastos 
            data={form} 
            gastosExistentes={gastosExistentes}
            registroDiarioId={registroDiarioId} // ← Aquí pasas el valor
          />
        )}
         {/* Botón de guardado para solapas con gastos */}
          {['fijos', 'sueldos', 'variables'].includes(activeTab) && (
            <div className="mb-4 flex justify-end">
              <button
                onClick={handleGuardarSolapaActual}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Guardar {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </button>
            </div>
          )}
      </div>

      {/* Mostrar gastos existentes en todas las solapas excepto resumen */}
      {activeTab !== 'resumen' && gastosExistentes.length > 0 && (
        <div className="mt-8 border-t pt-4">
          <h3 className="font-semibold mb-2 text-gray-700">Gastos registrados hoy</h3>
          <ul className="divide-y divide-gray-200">
            {gastosExistentes.map((g, i) => (
              <li key={i} className="py-1 flex justify-between">
                <span>
                  {g.descripcion} ({g.categoria_nombre})
                </span>
                <span className="font-mono">${g.monto}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}