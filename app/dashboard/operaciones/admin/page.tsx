'use client'

import DynamicMenu from '@/app/lib/dynamicMenu';
import useAuthCheck from '@/app/lib/useAuthCheck';
import ResumenCard from './components/ResumenCard';

const ventasData = [
  { label: 'Efectivo', value: 3500 },
  { label: 'Débito', value: 1800 },
  { label: 'Crédito', value: 2400 },
];

const gastosData = [
  { label: 'Insumos', value: 1200 },
  { label: 'Servicios', value: 800 },
  { label: 'Sueldos', value: 3000 },
];

const clientesData = [
  { label: 'Nuevos', value: 10 },
  { label: 'Recurrentes', value: 25 },
];

const Page = () => {
    const { loading } = useAuthCheck();
    if (loading) {
      return (
        <div className="min-h-screen bg-gray-100">
          <div className="flex">
            <div className="w-64 bg-gray-800 min-h-screen">
              {/* Loading skeleton */}
            </div>
            <main className="flex-1 p-6">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
              </div>
            </main>
          </div>
        </div>
      );
    }
    return (
      
      <div className="min-h-screen bg-gray-100">
        <div className="flex">
          <DynamicMenu />
          <main className="flex-1 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ResumenCard
                title="Resumen de Ventas"
                href="/dashboard/operaciones/admin/reportes/ventas"
                data={ventasData}
                color="#10b981" // verde
              />

              <ResumenCard
                title="Resumen de Gastos"
                href="/dashboard/operaciones/admin/reportes/gastos"
                data={gastosData}
                color="#ef4444" // rojo
              />

              <ResumenCard
                title="Clientes del Día"
                href="/dashboard/operaciones/admin/reportes/clientes"
                data={clientesData}
                color="#8b5cf6" // violeta
              />

              <ResumenCard
                title="Reporte Caja"
                href="/dashboard/operaciones/admin/reportes/caja"
                data={clientesData}
                color="#8b5cf6" // violeta
              />

              {/* Puedes agregar más cards aquí si lo deseas */}
            </div>
          </main>
        </div>
      </div>

    )
  };
  
  export default Page;
