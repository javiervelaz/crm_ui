'use client'

import DynamicMenu from '@/app/lib/dynamicMenu';
import useAuthCheck from '@/app/lib/useAuthCheck';
import Wizard from '@/app/ui/dashboard/operaciones/admin/components/gastos/GastoWizard';



const Page = () => {
    useAuthCheck();
    return (
        <div className="min-h-screen bg-gray-100">
          <div className="flex">
            <DynamicMenu />
            <main className="flex-1 p-4">
              <Wizard />
            </main>
          </div>
        </div>
      );
  };
  
  export default Page;
