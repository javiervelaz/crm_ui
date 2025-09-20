'use client'
import DynamicMenu from '@/app/lib/dynamicMenu';
import useAuthCheck from '@/app/lib/useAuthCheck';
import ReporteCajaPage from '@/app/ui/dashboard/operaciones/admin/components/reportes/reporteCaja';

const Page = () => {
  useAuthCheck();
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        <DynamicMenu />
        <ReporteCajaPage />
        <main className="min-h-screen bg-gray-100">
       
        </main>
        
      </div>
    </div>
  );
};

export default Page;