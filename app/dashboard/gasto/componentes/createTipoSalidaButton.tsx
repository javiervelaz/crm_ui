'use client'

import { useRouter } from 'next/navigation';

export const CreateTipoSalidaButton = () => {
  const router = useRouter();

  const handleCreateUsers = () => {
    router.push('/dashboard/tipo-salida/create');
  };

  return (
    <button
      onClick={handleCreateUsers}
      className="bg-blue-500 text-white px-4 py-2 rounded-md"
    >
      Agregar tipo de gastos
    </button>
  );
};
