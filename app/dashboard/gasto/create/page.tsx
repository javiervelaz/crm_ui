'use client'
import CreateTipoSalidaForm from '@/app/dashboard/tipo-salida/componentes/createTipoSalidaForm';
import useAuthCheck from '@/app/lib/useAuthCheck';

const CreateTipoSalidaPage = () => {
  useAuthCheck();
  return (
    <div className="w-full p-4 md:p-6">
      <CreateTipoSalidaForm />
    </div>
  );
};

export default CreateTipoSalidaPage;
