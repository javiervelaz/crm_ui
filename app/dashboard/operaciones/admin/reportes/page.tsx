'use client'
import Operaciones from '@/app/dashboard/operaciones/admin/reportes/componentes/operaciones_diarios';
import DynamicMenu from '@/app/lib/dynamicMenu';
import useAuthCheck from '@/app/lib/useAuthCheck';

const Page = () => {
  useAuthCheck();
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        <DynamicMenu />
        
        <main className="min-h-screen bg-gray-100">
        <Operaciones />
        </main>
        
      </div>
    </div>
  );
};

export default Page;
