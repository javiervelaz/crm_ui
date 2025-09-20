'use client'
import CreateProductoForm from '@/app/dashboard/productos/componentes/createProductoForm';
import useAuthCheck from '@/app/lib/useAuthCheck';

const CreateProductoPage = () => {
  useAuthCheck();
  return (
    <div className="w-full p-6">
      <CreateProductoForm />
    </div>
  );
};

export default CreateProductoPage;
