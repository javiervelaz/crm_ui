'use client'

import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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
      <FontAwesomeIcon icon={faPlus} className="mr-2" /> Categoria Gastos
    </button>
  );
};
