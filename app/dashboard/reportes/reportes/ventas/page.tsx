'use client'
import useAuthCheck from '@/app/lib/useAuthCheck';
import ReporteVentasPage from '@/app/ui/dashboard/operaciones/admin/components/reportes/reporteVentas';

const Page = () => {
  useAuthCheck();
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        <ReporteVentasPage />
        <main className="min-h-screen bg-gray-100">
       
        </main>
        
      </div>
    </div>
  );
};

export default Page;
