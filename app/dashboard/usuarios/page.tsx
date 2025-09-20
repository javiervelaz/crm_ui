'use client'
import UsuariosPage from '@/app/dashboard/usuarios/components/usuariosPage';
import DynamicMenu from '@/app/lib/dynamicMenu';
import useAuthCheck from '@/app/lib/useAuthCheck';

const Page = () => {
  useAuthCheck();
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        <DynamicMenu />
        
        <main className="min-h-screen bg-gray-100">
        <UsuariosPage />
        </main>
        
      </div>
    </div>
  );
};

export default Page;
