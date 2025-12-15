'use client'

import DashboardEmpleado from '@/app/dashboard/operaciones/empleado/caja/components/DashboardEmpleados';
import useAuthCheck from '@/app/lib/useAuthCheck';
import { ModalProvider } from '@/app/ui/ModalContext';

const Page = () => {
    const { loading } = useAuthCheck();
    if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="flex">
          <div className="p-4 md:p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-1/2 sm:w-1/4 mb-4" />
              <div className="h-4 bg-gray-300 rounded w-3/4 sm:w-1/2 mb-2" />
            </div>
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
            
            <main className="flex-1 p-4">
            <ModalProvider>
              <DashboardEmpleado />
            </ModalProvider>
            </main>
            
          </div>
        </div>
      );
  };
  
  export default Page;
