'use client'
import Operaciones from '@/app/dashboard/operaciones/admin/reportes/componentes/operaciones_diarios';
import useAuthCheck from '@/app/lib/useAuthCheck';

const Page = () => {
  useAuthCheck();
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        
        <main className="min-h-screen bg-gray-100">
        <Operaciones />
        </main>
        
      </div>
    </div>
  );
};

export default Page;
