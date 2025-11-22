'use client'
import CreateTipoSalidaForm from '@/app/dashboard/tipo-salida/componentes/createTipoSalidaForm';
import useAuthCheck from '@/app/lib/useAuthCheck';

const CreateTipoSalidaPage = () => {
  useAuthCheck();
  return (
    <div className="w-full p-6">
      <CreateTipoSalidaForm />
    </div>
  );
};

export default CreateTipoSalidaPage;
