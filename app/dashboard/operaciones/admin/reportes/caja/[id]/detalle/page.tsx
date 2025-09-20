'use client'
import DynamicMenu from '@/app/lib/dynamicMenu';
import useAuthCheck from '@/app/lib/useAuthCheck';
import DetalleCajaPage from '@/app/ui/dashboard/operaciones/admin/components/reportes/detalleCaja';

const Page = () => {
  useAuthCheck();
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        <DynamicMenu />
        <DetalleCajaPage />
      </div>
    </div>
  );
};

export default Page;