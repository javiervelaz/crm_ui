'use client'

import TipoProductosPage from '@/app/dashboard/tipo-producto/componentes/tipoProductoPage';
import DynamicMenu from '@/app/lib/dynamicMenu';
import useAuthCheck from '@/app/lib/useAuthCheck';

const Page = () => {
  useAuthCheck();
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        <DynamicMenu />
        
        <main className="flex-1 min-h-screen bg-gray-100 overflow-auto">
          <div className="w-full h-full">
            <TipoProductosPage />
          </div>
        </main>
        
      </div>
    </div>

    
  );
};

export default Page;