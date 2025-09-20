'use client'
import UsuariosPage from '@/app/dashboard/usuarios/components/usuariosPage';
import useAuthCheck from '@/app/lib/useAuthCheck';

const Page = () => {
  useAuthCheck();
  return <UsuariosPage />;
};

export default Page;
