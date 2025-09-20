import DynamicMenu from '@/app/lib/dynamicMenu';
import CerrarCajaForm from './components/cerrarCajaForm';

const CreateAbrirCajaPage = () => {

  return (
    <div className="min-h-screen bg-gray-100">
          <div className="flex">
            <DynamicMenu />
            <main className="flex-1 p-4">
            <CerrarCajaForm />
            </main>
          </div>
        </div>
  );
};

export default CreateAbrirCajaPage;
