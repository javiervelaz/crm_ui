'use client';

import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/navigation';

export const CreateProductoButton = ({ disabled = false }: { disabled?: boolean }) => {
  const router = useRouter();

  const handleCreateUsers = () => {
    if (!disabled) {
      router.push('/dashboard/productos/create');
    }
  };

  return (
    <button
      onClick={handleCreateUsers}
      disabled={disabled}
      className={`w-full sm:w-auto whitespace-nowrap px-4 py-2 rounded-md text-white ${

        disabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
      }`}
    >
      <FontAwesomeIcon icon={faPlus} className="mr-2" /> Producto
    </button>
  );
};
