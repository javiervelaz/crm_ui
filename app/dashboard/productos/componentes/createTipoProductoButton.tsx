'use client'


import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/navigation';
import { faEdit, faPlus, faTrashAlt } from '@fortawesome/free-solid-svg-icons';


export const CreateTipoProductoButton = () => {
  const router = useRouter();

  const handleCreateUsers = () => {
    router.push('/dashboard/productos/tipo-producto');
  };

  return (
    <button
      onClick={handleCreateUsers}
      className="bg-blue-500 text-white px-4 py-2 rounded-md"
    >
      <FontAwesomeIcon icon={faPlus} className="mr-2" /> Categoria
    </button>
  );
};
